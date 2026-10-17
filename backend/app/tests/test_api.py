import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Shiridi Sai Enterprises" in data["service"]

def test_public_settings(client):
    response = client.get("/api/v1/settings/public")
    assert response.status_code == 200
    data = response.json()
    assert data["store_name"] == "Shiridi Sai Enterprises"
    assert data["currency_symbol"] == "₹"
    assert data["cod_enabled"] is True

def test_public_categories(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) > 0
    # Check that Sofas is present
    sofa_cat = next((c for c in categories if c["slug"] == "sofas"), None)
    assert sofa_cat is not None
    assert sofa_cat["name"] == "Sofas"

def test_public_products_and_search(client):
    # 1. List all published products
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] > 0
    
    # 2. Search for "Teak"
    res_search = client.get("/api/v1/products?search=Teak")
    assert res_search.status_code == 200
    search_data = res_search.json()
    assert search_data["total"] > 0
    
    # 3. Filter by category "sofas"
    res_cat = client.get("/api/v1/products?category=sofas")
    assert res_cat.status_code == 200
    cat_prods = res_cat.json()
    assert cat_prods["total"] > 0
    
    # 4. Filter by price range
    res_price = client.get("/api/v1/products?min_price=10000&max_price=40000")
    assert res_price.status_code == 200
    for p in res_price.json()["items"]:
        assert 10000 <= p["selling_price"] <= 40000

def test_public_banners(client):
    response = client.get("/api/v1/banners")
    assert response.status_code == 200
    banners = response.json()
    assert isinstance(banners, list)
    assert len(banners) > 0
    assert banners[0]["title"] is not None

def test_auth_and_rbac(client):
    # 1. Customer login
    cust_res = client.post("/api/v1/auth/login", json={
        "email": "customer@example.com",
        "password": "Customer@123"
    })
    assert cust_res.status_code == 200
    cust_token = cust_res.json()["access_token"]
    assert cust_token is not None
    
    # 2. Admin login
    admin_res = client.post("/api/v1/auth/login", json={
        "email": "admin@shiridisaienterprises.com",
        "password": "Admin@123456"
    })
    assert admin_res.status_code == 200
    admin_token = admin_res.json()["access_token"]
    assert admin_token is not None
    
    # 3. Test RBAC: Customer attempting to access admin endpoints must receive 403 Forbidden
    unauth_res = client.get(
        "/api/v1/admin/reports/overview",
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert unauth_res.status_code == 403
    
    # 4. Admin accessing admin overview must succeed
    auth_res = client.get(
        "/api/v1/admin/reports/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert auth_res.status_code == 200
    data = auth_res.json()
    assert "kpis" in data
    assert data["kpis"]["total_products"] > 0

def test_cart_and_cod_checkout(client):
    # 1. Get a product
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]
    prod_id = product["id"]
    
    # 2. Add to cart using a guest session id
    session_id = "test_cart_sess_999"
    headers = {"X-Cart-Session-Id": session_id}
    
    add_res = client.post("/api/v1/cart/items", json={
        "product_id": prod_id,
        "quantity": 2,
        "color": "Warm Walnut Brown"
    }, headers=headers)
    assert add_res.status_code == 200
    cart_data = add_res.json()
    assert cart_data["total_items"] == 2
    assert cart_data["subtotal"] > 0
    assert cart_data["final_total"] > 0
    
    # 3. Place Cash on Delivery (COD) order
    order_payload = {
        "customer_name": "Test Customer",
        "customer_email": "testcheckout@example.com",
        "customer_phone": "9876543210",
        "shipping_address": {
            "full_name": "Test Customer",
            "phone": "9876543210",
            "street_address": "Plot 45, Jubilee Hills Road No 36",
            "city": "Hyderabad",
            "state": "Telangana",
            "pincode": "500033",
            "is_default": True
        },
        "delivery_instructions": "Please call before arrival",
        "payment_method": "cod"
    }
    
    order_res = client.post("/api/v1/orders", json=order_payload, headers=headers)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["order_number"].startswith("SSE-")
    assert order_data["payment_method"] == "cod"
    assert order_data["payment_status"] == "pending"
    assert order_data["order_status"] == "placed"
    assert len(order_data["items"]) == 1
    
    # 4. Verify cart is cleared after order
    cart_check = client.get("/api/v1/cart", headers=headers)
    assert cart_check.status_code == 200
    assert cart_check.json()["total_items"] == 0

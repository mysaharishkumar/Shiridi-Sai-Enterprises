import asyncio
from datetime import datetime, timezone, timedelta
from app.db.mongodb import db_manager, connect_to_mongo, close_mongo_connection
from app.core.security import get_password_hash

CATEGORIES = [
    {
        "name": "Sofas",
        "slug": "sofas",
        "description": "Luxurious solid teak wood and premium fabric sofa sets engineered for timeless elegance and lasting comfort.",
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        "display_order": 1,
        "is_active": True,
        "subcategories": [
            {"id": "sub_sofa_1", "name": "L-Shape Sectional Sofas", "slug": "l-shape-sofas"},
            {"id": "sub_sofa_2", "name": "3-Seater Teak Wood Sofas", "slug": "3-seater-sofas"},
            {"id": "sub_sofa_3", "name": "Recliner Sofa Sets", "slug": "recliner-sofas"}
        ]
    },
    {
        "name": "Dining Tables",
        "slug": "dining-tables",
        "description": "Royal 6-seater and 4-seater dining sets handcrafted from solid Sheesham and Indian Teak wood.",
        "image_url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
        "display_order": 2,
        "is_active": True,
        "subcategories": [
            {"id": "sub_dining_1", "name": "6-Seater Dining Sets", "slug": "6-seater-dining"},
            {"id": "sub_dining_2", "name": "4-Seater Dining Sets", "slug": "4-seater-dining"},
            {"id": "sub_dining_3", "name": "Marble Top Dining Tables", "slug": "marble-top-dining"}
        ]
    },
    {
        "name": "Wardrobes / Bhirva",
        "slug": "wardrobes-bhirva",
        "description": "Spacious 3-door, 4-door wardrobes and traditional steel/teak Bhirva cupboards with locker vaults.",
        "image_url": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
        "display_order": 3,
        "is_active": True,
        "subcategories": [
            {"id": "sub_ward_1", "name": "4-Door Master Wardrobes", "slug": "4-door-wardrobes"},
            {"id": "sub_ward_2", "name": "3-Door Sliding Wardrobes", "slug": "3-door-sliding"},
            {"id": "sub_ward_3", "name": "Traditional Teak Bhirva", "slug": "traditional-bhirva"}
        ]
    },
    {
        "name": "Study Tables",
        "slug": "study-tables",
        "description": "Ergonomic study desks with bookshelf hutches, cable grommets and lockable drawers.",
        "image_url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
        "display_order": 4,
        "is_active": True,
        "subcategories": [
            {"id": "sub_study_1", "name": "Study Tables with Bookshelf", "slug": "study-tables-with-bookshelf"},
            {"id": "sub_study_2", "name": "Compact Laptop Desks", "slug": "compact-laptop-desks"}
        ]
    },
    {
        "name": "Beds",
        "slug": "beds",
        "description": "King and Queen size beds crafted with heavy-gauge hydraulic storage and solid wood headboards.",
        "image_url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "display_order": 5,
        "is_active": True,
        "subcategories": [
            {"id": "sub_bed_1", "name": "King Size Hydraulic Beds", "slug": "king-size-hydraulic-beds"},
            {"id": "sub_bed_2", "name": "Queen Size Teak Beds", "slug": "queen-size-teak-beds"}
        ]
    },
    {
        "name": "Mattresses",
        "slug": "mattresses",
        "description": "Orthopedic memory foam and pocket-spring mattresses for spine support and restorative sleep.",
        "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
        "display_order": 6,
        "is_active": True,
        "subcategories": [
            {"id": "sub_mat_1", "name": "Orthopedic Memory Foam", "slug": "orthopedic-memory-foam"},
            {"id": "sub_mat_2", "name": "Pocket Spring Mattresses", "slug": "pocket-spring-mattresses"}
        ]
    },
    {
        "name": "Chairs",
        "slug": "chairs",
        "description": "Ergonomic executive chairs, armchairs, rocking chairs, and solid wood visitor chairs.",
        "image_url": "https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80",
        "display_order": 7,
        "is_active": True,
        "subcategories": [
            {"id": "sub_chair_1", "name": "Lounge & Accent Chairs", "slug": "lounge-chairs"},
            {"id": "sub_chair_2", "name": "Traditional Easy Chairs", "slug": "easy-chairs"}
        ]
    },
    {
        "name": "Coffee Tables",
        "slug": "coffee-tables",
        "description": "Center tables and nesting stools with tempered glass tops and Sheesham wood frames.",
        "image_url": "https://images.unsplash.com/photo-1533779283484-84e12e9b45ac?auto=format&fit=crop&w=800&q=80",
        "display_order": 8,
        "is_active": True,
        "subcategories": [
            {"id": "sub_coffee_1", "name": "Glass Top Center Tables", "slug": "glass-top-tables"},
            {"id": "sub_coffee_2", "name": "Solid Wood Nesting Tables", "slug": "nesting-tables"}
        ]
    },
    {
        "name": "TV Units",
        "slug": "tv-units",
        "description": "Wall-mounted entertainment centers and floor console units with dedicated soundbar shelves.",
        "image_url": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80",
        "display_order": 9,
        "is_active": True,
        "subcategories": [
            {"id": "sub_tv_1", "name": "Wall Mount Entertainment Units", "slug": "wall-mount-tv-units"},
            {"id": "sub_tv_2", "name": "Floor Standing TV Consoles", "slug": "floor-standing-tv-consoles"}
        ]
    },
    {
        "name": "Dressing Tables",
        "slug": "dressing-tables",
        "description": "Modern vanity tables with full-length LED touch mirrors, cushioned stools and cosmetic organizers.",
        "image_url": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
        "display_order": 10,
        "is_active": True,
        "subcategories": [
            {"id": "sub_dress_1", "name": "Full Length Mirror Dressers", "slug": "full-length-dressers"}
        ]
    },
    {
        "name": "Office Furniture",
        "slug": "office-furniture",
        "description": "Executive desks, mesh ergonomic task chairs, filing cabinets and conference tables.",
        "image_url": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
        "display_order": 11,
        "is_active": True,
        "subcategories": [
            {"id": "sub_off_1", "name": "Executive Boss Desks", "slug": "boss-desks"},
            {"id": "sub_off_2", "name": "High Back Ergonomic Chairs", "slug": "high-back-chairs"}
        ]
    },
    {
        "name": "Other Furniture",
        "slug": "other-furniture",
        "description": "Pooja mandapams, shoe racks, bar cabinets, and accent home storage pieces.",
        "image_url": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
        "display_order": 12,
        "is_active": True,
        "subcategories": [
            {"id": "sub_oth_1", "name": "Teak Wood Pooja Mandirs", "slug": "pooja-mandirs"},
            {"id": "sub_oth_2", "name": "Multi-tier Shoe Cabinets", "slug": "shoe-cabinets"}
        ]
    }
]

BANNERS = [
    {
        "title": "Royal Teak Wood Living Room Collection",
        "subtitle": "Transform your home with handcrafted 100% genuine CP Teakwood furniture designed to last generations.",
        "badge_text": "Grand Festive Offer",
        "image_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
        "mobile_image_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        "cta_text": "Explore Sofas & Living",
        "link_url": "/category/sofas",
        "display_order": 1,
        "is_active": True
    },
    {
        "title": "Master Bedroom Sets with Hydraulic Storage",
        "subtitle": "Save up to 35% on King & Queen Size Storage Beds + Free Installation across Telangana & AP.",
        "badge_text": "Exclusive Savings",
        "image_url": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=85",
        "mobile_image_url": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
        "cta_text": "View Bedroom Sets",
        "link_url": "/category/beds",
        "display_order": 2,
        "is_active": True
    },
    {
        "title": "Handcrafted Solid Sheesham Dining Tables",
        "subtitle": "Gather your family around majestic 6-seater dining sets finished in rich natural walnut polish.",
        "badge_text": "Best Sellers",
        "image_url": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1600&q=85",
        "mobile_image_url": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
        "cta_text": "Shop Dining Collection",
        "link_url": "/category/dining-tables",
        "display_order": 3,
        "is_active": True
    }
]

PRODUCTS = [
    {
        "name": "Shiridi Royal Grand 7-Seater Teak Wood L-Shape Sofa Set",
        "slug": "royal-grand-7-seater-teak-wood-l-shape-sofa",
        "description": "Experience peak luxury and supreme durability with the Shiridi Royal Grand 7-Seater Sectional Sofa. Handcrafted using seasoned Grade-A Burma Teak wood framing, reinforced mortise-and-tenon joints, and high-density 40-D foam cushioning for extraordinary back support. Includes 5 complimentary contrast cushions and scotch-guarded stain-resistant velvet fabric.",
        "short_description": "Grade-A Burma Teak frame with high-density foam and stain-resistant fabric.",
        "category_slug": "sofas",
        "selling_price": 48999.0,
        "original_price": 69999.0,
        "sku": "SSE-SOFA-RG07",
        "brand": "Shiridi Sai Enterprises",
        "material": "Solid Burma Teak Wood & High GSM Linen Fabric",
        "finish": "Honey Teak Matte Lacquer",
        "total_stock": 8,
        "in_stock": True,
        "warranty_info": "10 Years Warranty on Teak Frame & 5 Years on High Density Foam",
        "assembly_required": False,
        "is_featured": True,
        "is_best_seller": True,
        "is_new_arrival": False,
        "is_special_offer": True,
        "is_published": True,
        "is_archived": False,
        "rating": 4.9,
        "review_count": 38,
        "images": [
            {"url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80", "alt": "Royal Grand Teak L-Shape Sofa Forest Green", "is_primary": True},
            {"url": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80", "alt": "Sofa Living Room Angle", "is_primary": False},
            {"url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80", "alt": "Teak Wood Armrest Detail", "is_primary": False}
        ],
        "colors": [
            {"name": "Warm Walnut Brown", "hex_code": "#5c3317"},
            {"name": "Royal Emerald Green", "hex_code": "#064e3b"},
            {"name": "Classic Slate Grey", "hex_code": "#475569"}
        ],
        "variants": [
            {"variant_id": "v_sofa_walnut", "sku": "SSE-SOFA-RG07-WAL", "color": "Warm Walnut Brown", "dimensions": "280 x 210 x 85 cm", "price_override": 48999.0, "stock_quantity": 4},
            {"variant_id": "v_sofa_green", "sku": "SSE-SOFA-RG07-GRN", "color": "Royal Emerald Green", "dimensions": "280 x 210 x 85 cm", "price_override": 49999.0, "stock_quantity": 3},
            {"variant_id": "v_sofa_grey", "sku": "SSE-SOFA-RG07-GRY", "color": "Classic Slate Grey", "dimensions": "280 x 210 x 85 cm", "price_override": 48999.0, "stock_quantity": 1}
        ],
        "specifications": [
            {"label": "Seating Capacity", "value": "7 Seater (L-Shape)"},
            {"label": "Primary Material", "value": "100% Solid Seasoned Teak Wood"},
            {"label": "Upholstery", "value": "Premium 380 GSM Suede-Velvet"},
            {"label": "Foam Density", "value": "40 High Resilient (HR) Foam"},
            {"label": "Dimensions (L x W x H)", "value": "280 cm x 210 cm x 85 cm"},
            {"label": "Country of Origin", "value": "India (Handcrafted in AP)"}
        ],
        "features": [
            "Heavy-duty internal seasoned teak structure",
            "Anti-sag zig-zag spring suspension",
            "Removable cushion covers for easy dry-cleaning",
            "Includes 5 complimentary designer throw pillows"
        ]
    },
    {
        "name": "Maharaja 6-Seater Solid Sheesham Wood Dining Set",
        "slug": "maharaja-6-seater-sheesham-wood-dining-set",
        "description": "Crafted from carefully seasoned Indian Rosewood (Sheesham), this 6-seater dining table brings timeless warmth to dinner conversations. Features a thick 32mm solid tabletop with chamfered edge profiling and 6 ergonomic cushioned chairs upholstered in cream stain-resistant fabric.",
        "short_description": "Seasoned Sheesham wood table with 6 cushioned chairs.",
        "category_slug": "dining-tables",
        "selling_price": 36499.0,
        "original_price": 52000.0,
        "sku": "SSE-DINE-MS06",
        "brand": "Shiridi Sai Enterprises",
        "material": "Solid Sheesham Wood (Rosewood)",
        "finish": "Natural Sheesham Gloss Polish",
        "total_stock": 6,
        "in_stock": True,
        "warranty_info": "7 Years Termite & Borer Warranty",
        "assembly_required": True,
        "is_featured": True,
        "is_best_seller": True,
        "is_new_arrival": False,
        "is_special_offer": True,
        "is_published": True,
        "is_archived": False,
        "rating": 4.8,
        "review_count": 29,
        "images": [
            {"url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80", "alt": "Maharaja 6 Seater Dining Set", "is_primary": True},
            {"url": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=80", "alt": "Dining Tabletop Grain Detail", "is_primary": False}
        ],
        "colors": [
            {"name": "Warm Honey Finish", "hex_code": "#b45309"},
            {"name": "Dark Walnut Polish", "hex_code": "#3e2723"}
        ],
        "variants": [
            {"variant_id": "v_dine_honey", "sku": "SSE-DINE-MS06-HNY", "color": "Warm Honey Finish", "dimensions": "175 x 90 x 76 cm", "price_override": 36499.0, "stock_quantity": 4},
            {"variant_id": "v_dine_walnut", "sku": "SSE-DINE-MS06-WAL", "color": "Dark Walnut Polish", "dimensions": "175 x 90 x 76 cm", "price_override": 37499.0, "stock_quantity": 2}
        ],
        "specifications": [
            {"label": "Table Dimensions", "value": "175 cm (L) x 90 cm (W) x 76 cm (H)"},
            {"label": "Chair Dimensions", "value": "45 cm (W) x 45 cm (D) x 95 cm (H)"},
            {"label": "Seating Capacity", "value": "6 Persons"},
            {"label": "Wood Species", "value": "100% Solid Indian Sheesham"}
        ],
        "features": [
            "Kiln-dried wood with <12% moisture content",
            "Cushioned curved backrest for supreme lumbar support",
            "Water and heat resistant polyurethane finish"
        ]
    },
    {
        "name": "Heritage 4-Door Teak Wood Wardrobe with Mirror & Lockers",
        "slug": "heritage-4-door-teak-wood-wardrobe",
        "description": "An opulent 4-door wardrobe featuring full-length mirror panels, interior security jewelry lockers with dual brass keys, heavy-duty stainless steel clothes hanging rods, and deep soft-closing organizer drawers.",
        "short_description": "4-door wardrobe with full-length mirror, secret vault and hanging rods.",
        "category_slug": "wardrobes-bhirva",
        "selling_price": 54999.0,
        "original_price": 75000.0,
        "sku": "SSE-WARD-H4D",
        "brand": "Shiridi Sai Enterprises",
        "material": "Solid Teak Wood & Commercial BWP Marine Ply",
        "finish": "Natural Teak Satin Finish",
        "total_stock": 4,
        "in_stock": True,
        "warranty_info": "10 Years Warranty on Hinges & Wood",
        "assembly_required": True,
        "is_featured": True,
        "is_best_seller": False,
        "is_new_arrival": True,
        "is_special_offer": False,
        "is_published": True,
        "is_archived": False,
        "rating": 4.9,
        "review_count": 17,
        "images": [
            {"url": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80", "alt": "Heritage 4-Door Teak Wardrobe", "is_primary": True},
            {"url": "https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=1000&q=80", "alt": "Wardrobe Shelves Interior", "is_primary": False}
        ],
        "colors": [
            {"name": "Natural Teak", "hex_code": "#8B4513"},
            {"name": "Espresso Dark Teak", "hex_code": "#2B1B17"}
        ],
        "variants": [
            {"variant_id": "v_ward_nat", "sku": "SSE-WARD-H4D-NAT", "color": "Natural Teak", "dimensions": "195 x 58 x 210 cm", "price_override": 54999.0, "stock_quantity": 3},
            {"variant_id": "v_ward_esp", "sku": "SSE-WARD-H4D-ESP", "color": "Espresso Dark Teak", "dimensions": "195 x 58 x 210 cm", "price_override": 56999.0, "stock_quantity": 1}
        ],
        "specifications": [
            {"label": "Dimensions", "value": "195 cm (W) x 58 cm (D) x 210 cm (H)"},
            {"label": "Doors", "value": "4 Hinged Doors with 2 Beveled Glass Mirrors"},
            {"label": "Locking Mechanism", "value": "Dual Brass Godrej-Type Key Locks"}
        ],
        "features": [
            "Concealed secret jewelry locker",
            "Heavy-gauge anti-rust telescopic soft-close drawer slides",
            "Moisture and termite protected internal surfaces"
        ]
    },
    {
        "name": "Crown King Size Hydraulic Storage Bed with Cushioned Headboard",
        "slug": "crown-king-size-hydraulic-storage-bed",
        "description": "Indulge in royal comfort with our Crown King Size Bed. Features effortless hydraulic lifting cylinders that open an expansive 1,200-litre dust-free underbed storage compartment. Padded with a button-tufted plush velvet headboard that offers comfortable back support while reading.",
        "short_description": "King size bed with 1200L easy-lift hydraulic storage and tufted headboard.",
        "category_slug": "beds",
        "selling_price": 42999.0,
        "original_price": 62000.0,
        "sku": "SSE-BED-CR01",
        "brand": "Shiridi Sai Enterprises",
        "material": "Solid Wood Skeleton & Moisture Resistant Engineered Hardwood",
        "finish": "Smoked Oak & Beige Velvet",
        "total_stock": 7,
        "in_stock": True,
        "warranty_info": "5 Years Warranty on Hydraulic Mechanism & Frame",
        "assembly_required": True,
        "is_featured": True,
        "is_best_seller": True,
        "is_new_arrival": True,
        "is_special_offer": True,
        "is_published": True,
        "is_archived": False,
        "rating": 4.9,
        "review_count": 45,
        "images": [
            {"url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80", "alt": "Crown King Hydraulic Bed", "is_primary": True},
            {"url": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80", "alt": "Bedroom Interior View", "is_primary": False}
        ],
        "colors": [
            {"name": "Royal Beige", "hex_code": "#e5d3b3"},
            {"name": "Charcoal Grey", "hex_code": "#334155"}
        ],
        "variants": [
            {"variant_id": "v_bed_beige_king", "sku": "SSE-BED-CR01-BG-K", "color": "Royal Beige", "dimensions": "King Size: 78 x 72 inches", "price_override": 42999.0, "stock_quantity": 4},
            {"variant_id": "v_bed_grey_king", "sku": "SSE-BED-CR01-GR-K", "color": "Charcoal Grey", "dimensions": "King Size: 78 x 72 inches", "price_override": 42999.0, "stock_quantity": 3}
        ],
        "specifications": [
            {"label": "Mattress Size Required", "value": "King Size: 78 in x 72 in (198 x 182 cm)"},
            {"label": "Storage Capacity", "value": "1200 Litres Hydraulic Lift"},
            {"label": "Headboard Height", "value": "125 cm"}
        ],
        "features": [
            "German engineered gas-spring lift cylinders for effortless lifting",
            "Floor-touching dustproof storage bottom",
            "Soundproof slat base eliminating squeaks"
        ]
    },
    {
        "name": "PostureCare 8-Inch Orthopedic Dual-Comfort Memory Foam Mattress",
        "slug": "posturecare-orthopedic-memory-foam-mattress",
        "description": "Doctor-recommended orthopedic mattress engineered with 7-zone active spine alignment, aerospace-grade breathable memory foam, and natural bamboo fiber quilted top for cool sweat-free nights in Indian climates.",
        "short_description": "8-inch memory foam orthopedic mattress with cooling bamboo cover.",
        "category_slug": "mattresses",
        "selling_price": 18499.0,
        "original_price": 28000.0,
        "sku": "SSE-MATT-PC08",
        "brand": "Shiridi Sai Enterprises",
        "material": "Gel Memory Foam & High Resilience PU Base",
        "finish": "Anti-Microbial Bamboo Fabric",
        "total_stock": 15,
        "in_stock": True,
        "warranty_info": "10 Years Limited Warranty",
        "assembly_required": False,
        "is_featured": False,
        "is_best_seller": True,
        "is_new_arrival": False,
        "is_special_offer": True,
        "is_published": True,
        "is_archived": False,
        "rating": 4.7,
        "review_count": 52,
        "images": [
            {"url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80", "alt": "PostureCare Orthopedic Mattress", "is_primary": True}
        ],
        "colors": [
            {"name": "Pure White & Grey Border", "hex_code": "#f1f5f9"}
        ],
        "variants": [
            {"variant_id": "v_mat_king", "sku": "SSE-MATT-PC08-K", "color": "Pure White", "dimensions": "78 x 72 x 8 inches", "price_override": 18499.0, "stock_quantity": 8},
            {"variant_id": "v_mat_queen", "sku": "SSE-MATT-PC08-Q", "color": "Pure White", "dimensions": "78 x 60 x 8 inches", "price_override": 15499.0, "stock_quantity": 7}
        ],
        "specifications": [
            {"label": "Thickness", "value": "8 Inches (20.3 cm)"},
            {"label": "Firmness", "value": "Medium-Firm (Orthopedic Support)"},
            {"label": "Fabric", "value": "350 GSM Breathable Bamboo Jacquard"}
        ],
        "features": [
            "Zero partner motion transfer",
            "Anti-dustmite and hypoallergenic certification",
            "Reversible dual-firmness design (Soft side & Firm side)"
        ]
    },
    {
        "name": "ErgoPro High-Back Mesh Executive Office Chair",
        "slug": "ergopro-high-back-mesh-executive-chair",
        "description": "Designed for all-day comfort during long work sessions. Features adaptive lumbar adjustment, 3D multi-directional armrests, synchro-tilt mechanism with 3 locking positions, and heavy chrome wheelbase.",
        "short_description": "Ergonomic executive mesh chair with 3D armrests and lumbar support.",
        "category_slug": "chairs",
        "selling_price": 11999.0,
        "original_price": 18500.0,
        "sku": "SSE-CHR-EP01",
        "brand": "Shiridi Sai Enterprises",
        "material": "Breathable Korean Nylon Mesh & Class 4 Gas Lift",
        "finish": "Chrome Base & Jet Black Mesh",
        "total_stock": 20,
        "in_stock": True,
        "warranty_info": "3 Years Comprehensive Warranty",
        "assembly_required": True,
        "is_featured": False,
        "is_best_seller": True,
        "is_new_arrival": True,
        "is_special_offer": False,
        "is_published": True,
        "is_archived": False,
        "rating": 4.8,
        "review_count": 61,
        "images": [
            {"url": "https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=1000&q=80", "alt": "ErgoPro Office Chair", "is_primary": True}
        ],
        "colors": [
            {"name": "Jet Black", "hex_code": "#0f172a"},
            {"name": "Cool Grey", "hex_code": "#64748b"}
        ],
        "variants": [
            {"variant_id": "v_chr_black", "sku": "SSE-CHR-EP01-BLK", "color": "Jet Black", "dimensions": "Standard Adjustable", "price_override": 11999.0, "stock_quantity": 15},
            {"variant_id": "v_chr_grey", "sku": "SSE-CHR-EP01-GRY", "color": "Cool Grey", "dimensions": "Standard Adjustable", "price_override": 12499.0, "stock_quantity": 5}
        ],
        "specifications": [
            {"label": "Weight Capacity", "value": "Up to 150 kg"},
            {"label": "Gas Lift", "value": "BIFMA Certified Class 4 Hydraulic"},
            {"label": "Base", "value": "Heavy Chrome Plated Steel"}
        ],
        "features": [
            "Adjustable headrest height and angle",
            "Molded seat cushion with waterfall front edge for blood circulation",
            "Smooth 60mm nylon dual castor wheels"
        ]
    },
    {
        "name": "Artisan Sheesham Wood Coffee Table with 4 Cushioned Nesting Stools",
        "slug": "artisan-sheesham-coffee-table-nesting-stools",
        "description": "Smart, space-saving living room centerpiece crafted from solid Sheesham wood. Comes with 4 upholstered cushioned square ottomans that tuck seamlessly underneath the tabletop when not in use.",
        "short_description": "Solid Sheesham center table with 4 pull-out nesting stools.",
        "category_slug": "coffee-tables",
        "selling_price": 14999.0,
        "original_price": 22000.0,
        "sku": "SSE-COFF-NS04",
        "brand": "Shiridi Sai Enterprises",
        "material": "100% Solid Sheesham Wood",
        "finish": "Warm Teak Polyurethane Polish",
        "total_stock": 9,
        "in_stock": True,
        "warranty_info": "5 Years Termite Protection Warranty",
        "assembly_required": False,
        "is_featured": False,
        "is_best_seller": True,
        "is_new_arrival": False,
        "is_special_offer": True,
        "is_published": True,
        "is_archived": False,
        "rating": 4.7,
        "review_count": 22,
        "images": [
            {"url": "https://images.unsplash.com/photo-1533779283484-84e12e9b45ac?auto=format&fit=crop&w=1000&q=80", "alt": "Artisan Sheesham Coffee Table", "is_primary": True}
        ],
        "colors": [
            {"name": "Warm Teak", "hex_code": "#854d0e"},
            {"name": "Walnut", "hex_code": "#451a03"}
        ],
        "variants": [
            {"variant_id": "v_coff_teak", "sku": "SSE-COFF-NS04-TK", "color": "Warm Teak", "dimensions": "90 x 90 x 45 cm", "price_override": 14999.0, "stock_quantity": 6},
            {"variant_id": "v_coff_wal", "sku": "SSE-COFF-NS04-WL", "color": "Walnut", "dimensions": "90 x 90 x 45 cm", "price_override": 15499.0, "stock_quantity": 3}
        ],
        "specifications": [
            {"label": "Table Dimensions", "value": "90 cm (L) x 90 cm (W) x 45 cm (H)"},
            {"label": "Stool Dimensions", "value": "38 cm (L) x 38 cm (W) x 35 cm (H)"},
            {"label": "Stool Capacity", "value": "110 kg per stool"}
        ],
        "features": [
            "4 pull-out nesting stools included in package",
            "Beveled anti-chip wooden perimeter",
            "Pre-assembled and ready to use"
        ]
    },
    {
        "name": "Infinity Floating Wall-Mounted TV Entertainment Unit",
        "slug": "infinity-floating-wall-mounted-tv-unit",
        "description": "Modern minimalist floating TV console suitable for TVs up to 75 inches. Features wire management channel cutouts, acoustic front speaker compartments, and push-to-open fluted storage doors.",
        "short_description": "Sleek wall-mounted TV console with fluted push-to-open doors.",
        "category_slug": "tv-units",
        "selling_price": 16999.0,
        "original_price": 24500.0,
        "sku": "SSE-TV-INF75",
        "brand": "Shiridi Sai Enterprises",
        "material": "Engineered Wood with Real Teak Veneer Overlay",
        "finish": "Natural Teak & Matte Black Accent",
        "total_stock": 11,
        "in_stock": True,
        "warranty_info": "3 Years Hardware & Finish Warranty",
        "assembly_required": True,
        "is_featured": True,
        "is_best_seller": False,
        "is_new_arrival": True,
        "is_special_offer": False,
        "is_published": True,
        "is_archived": False,
        "rating": 4.8,
        "review_count": 19,
        "images": [
            {"url": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1000&q=80", "alt": "Infinity Floating TV Unit", "is_primary": True}
        ],
        "colors": [
            {"name": "Teak & Charcoal", "hex_code": "#78350f"}
        ],
        "variants": [
            {"variant_id": "v_tv_75", "sku": "SSE-TV-INF75-TK", "color": "Teak & Charcoal", "dimensions": "180 x 30 x 25 cm", "price_override": 16999.0, "stock_quantity": 11}
        ],
        "specifications": [
            {"label": "Dimensions", "value": "180 cm (L) x 30 cm (D) x 25 cm (H)"},
            {"label": "Recommended TV Size", "value": "43 inches to 75 inches"},
            {"label": "Weight Bearing Capacity", "value": "Up to 60 kg"}
        ],
        "features": [
            "Concealed heavy-duty wall anchor brackets included",
            "Integrated cable pass-through grommets",
            "Elegant fluted wood texture on cabinet doors"
        ]
    },
    {
        "name": "Illumina LED Dressing Table with Cushioned Ottoman",
        "slug": "illumina-led-dressing-table-with-ottoman",
        "description": "A dream vanity station equipped with an oversized HD glass mirror ringed with 3-tone touch-dimmable LED lighting (Warm, Daylight, Cool White). Includes velvet-lined velvet drawer organizers for jewelry and cosmetics.",
        "short_description": "Vanity dressing table with touch 3-color LED mirror and velvet drawers.",
        "category_slug": "dressing-tables",
        "selling_price": 21999.0,
        "original_price": 31000.0,
        "sku": "SSE-DRS-IL01",
        "brand": "Shiridi Sai Enterprises",
        "material": "Moisture-Resistant MDF with Teak Frame & Tempered Glass",
        "finish": "Champagne Gold Accents & Teak Wood Texture",
        "total_stock": 5,
        "in_stock": True,
        "warranty_info": "2 Years Electrical & 5 Years Wood Warranty",
        "assembly_required": True,
        "is_featured": True,
        "is_best_seller": False,
        "is_new_arrival": True,
        "is_special_offer": True,
        "is_published": True,
        "is_archived": False,
        "rating": 4.9,
        "review_count": 31,
        "images": [
            {"url": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80", "alt": "Illumina LED Dressing Table", "is_primary": True}
        ],
        "colors": [
            {"name": "Warm Teak & Champagne Gold", "hex_code": "#d4af37"}
        ],
        "variants": [
            {"variant_id": "v_drs_gold", "sku": "SSE-DRS-IL01-GD", "color": "Warm Teak & Champagne Gold", "dimensions": "100 x 42 x 135 cm", "price_override": 21999.0, "stock_quantity": 5}
        ],
        "specifications": [
            {"label": "Table Dimensions", "value": "100 cm (W) x 42 cm (D) x 78 cm (H)"},
            {"label": "Mirror Height", "value": "57 cm Diameter Circular Mirror"},
            {"label": "Lighting Modes", "value": "3000K, 4500K, 6500K Touch Dimming"}
        ],
        "features": [
            "Smart touch sensor on mirror for power and brightness control",
            "Includes plush velvet storage ottoman stool",
            "Hidden USB charging outlet on the vanity panel"
        ]
    },
    {
        "name": "Scholar Pro Solid Teak Study Desk with Bookshelf",
        "slug": "scholar-pro-solid-teak-study-desk",
        "description": "Built for focused study and productive work-from-home sessions. Incorporates an integrated overhead bookshelf hutch, two smooth gliding document drawers, and a dedicated CPU/bag cubby.",
        "short_description": "Teak wood study table with overhead bookshelf and dual lockable drawers.",
        "category_slug": "study-tables",
        "selling_price": 19499.0,
        "original_price": 27500.0,
        "sku": "SSE-STD-SC02",
        "brand": "Shiridi Sai Enterprises",
        "material": "100% Solid Teak Wood",
        "finish": "Natural Honey Matte Polish",
        "total_stock": 8,
        "in_stock": True,
        "warranty_info": "7 Years Wood Borer & Termite Guarantee",
        "assembly_required": True,
        "is_featured": False,
        "is_best_seller": True,
        "is_new_arrival": False,
        "is_special_offer": False,
        "is_published": True,
        "is_archived": False,
        "rating": 4.8,
        "review_count": 27,
        "images": [
            {"url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80", "alt": "Scholar Pro Study Desk", "is_primary": True}
        ],
        "colors": [
            {"name": "Honey Teak", "hex_code": "#b45309"}
        ],
        "variants": [
            {"variant_id": "v_std_teak", "sku": "SSE-STD-SC02-HT", "color": "Honey Teak", "dimensions": "120 x 60 x 140 cm", "price_override": 19499.0, "stock_quantity": 8}
        ],
        "specifications": [
            {"label": "Desk Surface", "value": "120 cm (W) x 60 cm (D) x 75 cm (H)"},
            {"label": "Total Height with Hutch", "value": "140 cm"},
            {"label": "Wood", "value": "Grade-A Indian Teak"}
        ],
        "features": [
            "Upper hutch holds over 50 books comfortably",
            "Lockable drawer with brass key",
            "Wire grommet cutout for clean monitor & laptop cables"
        ]
    }
]

DEFAULT_SETTINGS = {
    "store_name": "Shiridi Sai Enterprises",
    "tagline": "Exquisite Craftsmanship & Timeless Home Luxury",
    "logo_url": "",
    "phone": "+91 98490 12345",
    "email": "contact@shiridisaienterprises.com",
    "whatsapp_number": "+91 98490 12345",
    "address": "Shop No. 12 & 13, Sai Complex, Main Furniture Road, Hyderabad, Telangana 500072",
    "currency_symbol": "₹",
    "currency_code": "INR",
    "standard_delivery_fee": 499.0,
    "free_delivery_threshold": 15000.0,
    "cod_enabled": True,
    "announcement_enabled": True,
    "announcement_text": "✨ Grand Festive Offer: Enjoy Flat 20% to 40% OFF on Solid Teak & Sheesham Furniture + Free Doorstep Delivery & Assembly across AP & Telangana on orders above ₹15,000!",
    "about_us": "Shiridi Sai Enterprises has been a trusted symbol of premium wood craftsmanship and contemporary home luxury for decades. We specialize in solid teak wood sofas, royal dining suites, hydraulic storage beds, and ergonomic workstations engineered for longevity.",
    "delivery_info": "We provide specialized furniture logistics with multi-layer bubble wrap, foam corner protectors, and free doorstep assembly by certified technicians.",
    "return_policy": "We offer a hassle-free 7-day replacement guarantee in case of transit damage or any manufacturing defects.",
    "privacy_policy": "Your personal privacy is of paramount importance to us. Your contact and delivery information is utilized strictly for order processing.",
    "terms_and_conditions": "All solid wood furniture pieces come with standard 5-to-10 year manufacturer warranties against termites and natural wood defects.",
    "social_links": [
        {"platform": "Facebook", "url": "https://facebook.com/shiridisaienterprises"},
        {"platform": "Instagram", "url": "https://instagram.com/shiridisaienterprises"},
        {"platform": "WhatsApp", "url": "https://wa.me/919849012345"}
    ]
}

async def seed_database():
    await connect_to_mongo()
    db = db_manager.db
    if db is None:
        print("Error: Could not connect to database for seeding.")
        return

    now = datetime.now(timezone.utc)
    print("Seeding database 'shiridi_sai_enterprises'...")

    # 1. Site Settings
    settings_count = await db.site_settings.count_documents({})
    if settings_count == 0:
        settings_doc = {**DEFAULT_SETTINGS, "created_at": now, "updated_at": now}
        await db.site_settings.insert_one(settings_doc)
        print("[OK] Site settings seeded.")
    else:
        print("[INFO] Site settings already exist.")

    # 2. Users (Admin + Customer)
    admin_user = await db.users.find_one({"email": "admin@shiridisaienterprises.com"})
    if not admin_user:
        admin_doc = {
            "name": "Super Admin",
            "email": "admin@shiridisaienterprises.com",
            "phone": "+91 98490 12345",
            "hashed_password": get_password_hash("Admin@123456"),
            "role": "super_admin",
            "is_active": True,
            "addresses": [],
            "created_at": now,
            "updated_at": now
        }
        await db.users.insert_one(admin_doc)
        print("[OK] Admin user created: admin@shiridisaienterprises.com (Admin@123456)")
    else:
        print("[INFO] Admin user already exists.")

    test_customer = await db.users.find_one({"email": "customer@example.com"})
    if not test_customer:
        customer_doc = {
            "name": "Venkatesh Rao",
            "email": "customer@example.com",
            "phone": "+91 94401 23456",
            "hashed_password": get_password_hash("Customer@123"),
            "role": "customer",
            "is_active": True,
            "addresses": [
                {
                    "id": "addr_seed_1",
                    "full_name": "Venkatesh Rao",
                    "phone": "+91 94401 23456",
                    "street_address": "Flat 402, Sai Balaji Residency, KPHB Colony",
                    "landmark": "Near Hanuman Temple",
                    "city": "Hyderabad",
                    "state": "Telangana",
                    "pincode": "500072",
                    "is_default": True
                }
            ],
            "created_at": now,
            "updated_at": now
        }
        await db.users.insert_one(customer_doc)
        print("[OK] Test customer created: customer@example.com (Customer@123)")

    # 3. Categories
    category_slug_to_id = {}
    for cat in CATEGORIES:
        existing = await db.categories.find_one({"slug": cat["slug"]})
        if not existing:
            cat_doc = {**cat, "created_at": now, "updated_at": now}
            res = await db.categories.insert_one(cat_doc)
            category_slug_to_id[cat["slug"]] = str(res.inserted_id)
        else:
            category_slug_to_id[cat["slug"]] = str(existing["_id"])
    print(f"[OK] Categories verified ({len(CATEGORIES)} categories).")

    # 4. Banners
    banner_count = await db.banners.count_documents({})
    if banner_count == 0:
        for b in BANNERS:
            b_doc = {**b, "created_at": now, "updated_at": now}
            await db.banners.insert_one(b_doc)
        print(f"[OK] Seeded {len(BANNERS)} promotional banners.")

    # 5. Products
    for p in PRODUCTS:
        existing = await db.products.find_one({"slug": p["slug"]})
        cat_slug = p.pop("category_slug", "sofas")
        cat_id = category_slug_to_id.get(cat_slug, cat_slug)
        
        # Calculate discount %
        original = p.get("original_price")
        selling = p.get("selling_price")
        discount_pct = round(((original - selling) / original) * 100) if (original and original > selling) else 0

        # Get category name
        cat_doc = await db.categories.find_one({"slug": cat_slug})
        cat_name = cat_doc["name"] if cat_doc else cat_slug.capitalize()

        prod_doc = {
            **p,
            "category_id": cat_id,
            "category_name": cat_name,
            "discount_percentage": discount_pct,
            "created_at": now,
            "updated_at": now
        }

        if not existing:
            await db.products.insert_one(prod_doc)
    print(f"[OK] Seeded authentic furniture products ({len(PRODUCTS)} products).")

    print("All seeding completed successfully!")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(seed_database())

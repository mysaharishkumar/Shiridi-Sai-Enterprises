import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Banner, SiteSettings } from '../types';
import { storeApi } from '../api/client';

interface StoreContextType {
  settings: SiteSettings | null;
  categories: Category[];
  banners: Banner[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshBanners: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  store_name: 'Shiridi Sai Enterprises',
  tagline: 'Exquisite Craftsmanship & Timeless Home Luxury',
  logo_url: '',
  phone: '+91 98490 12345',
  email: 'contact@shiridisaienterprises.com',
  whatsapp_number: '+91 98490 12345',
  address: 'Shop No. 12 & 13, Sai Complex, Main Furniture Road, Hyderabad, Telangana 500072',
  currency_symbol: '₹',
  currency_code: 'INR',
  standard_delivery_fee: 499,
  free_delivery_threshold: 15000,
  cod_enabled: true,
  announcement_enabled: false,
  announcement_text: '',
  about_us: 'Shiridi Sai Enterprises has been a trusted symbol of premium wood craftsmanship and contemporary home luxury for decades.',
  delivery_info: 'We provide dedicated furniture transport with specialized packaging, corner guards, and free doorstep assembly by certified technicians.',
  return_policy: 'We offer a hassle-free 7-day replacement guarantee in case of any in-transit damage or manufacturing flaw.',
  privacy_policy: 'We value your privacy. Your contact and delivery details are exclusively utilized for fulfilling your orders safely.',
  terms_and_conditions: 'All our solid wood furniture pieces come with standard 5-year termite and manufacturing warranties.',
  social_links: [
    { platform: 'Facebook', url: 'https://facebook.com/shiridisaienterprises' },
    { platform: 'Instagram', url: 'https://instagram.com/shiridisaienterprises' },
    { platform: 'WhatsApp', url: 'https://wa.me/919849012345' }
  ]
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const data = await storeApi.getSettings();
      if (data) setSettings(data);
    } catch (err) {
      console.warn('Failed to load settings, using fallback:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await storeApi.getCategories();
      if (data) setCategories(data);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }
  };

  const fetchBanners = async () => {
    try {
      const data = await storeApi.getBanners();
      if (data) setBanners(data);
    } catch (err) {
      console.warn('Failed to load banners:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchSettings(), fetchCategories(), fetchBanners()]);
      setIsLoading(false);
    };
    init();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        banners,
        isLoading,
        refreshSettings: fetchSettings,
        refreshCategories: fetchCategories,
        refreshBanners: fetchBanners,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

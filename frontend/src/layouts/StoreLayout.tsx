import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

export const StoreLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-[#1C1917]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

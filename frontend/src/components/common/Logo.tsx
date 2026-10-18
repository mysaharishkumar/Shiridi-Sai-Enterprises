import React from 'react';
import { Link } from 'react-router-dom';
import { Armchair } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface LogoProps {
  className?: string;
  admin?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', admin = false }) => {
  const { settings } = useStore();
  const storeName = settings?.store_name || 'Shiridi Sai Enterprises';
  const logoUrl = settings?.logo_url || '/logo.jpg';

  return (
    <Link
      to={admin ? '/admin' : '/'}
      className={`flex items-center gap-2.5 group transition-transform active:scale-95 ${className}`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={storeName}
          className="h-10 w-10 md:h-11 md:w-11 object-contain rounded-lg border border-stone-200/80 bg-white p-0.5 shadow-xs shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 text-amber-100 flex items-center justify-center shadow-md shadow-amber-950/20 group-hover:shadow-amber-900/30 transition-all border border-amber-600/30 shrink-0">
          <Armchair className="w-5 h-5 text-amber-200" />
        </div>
      )}

      <div className="flex flex-col text-left">
        <span className="font-bold text-lg md:text-xl tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors font-serif leading-none">
          {storeName}
        </span>
        <span className="text-[10px] md:text-[11px] font-medium tracking-widest text-amber-700 uppercase mt-0.5">
          {admin ? 'Management Portal' : 'Fine Furniture & Furnishings'}
        </span>
      </div>
    </Link>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
  limit?: number;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, limit }) => {
  const displayCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <section className="py-14 bg-stone-50/70 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mt-2 sm:mt-0">
            Handcrafted solid teak, rosewood, and contemporary furnishings tailored for every room in your home.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image Container with Consistent Aspect Ratio */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-50 flex items-center justify-center p-2">
                <img
                  src={
                    cat.image_url ||
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={cat.name}
                  className="max-h-full max-w-full w-auto h-auto object-contain mx-auto group-hover:scale-108 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Title & Product Count */}
              <div className="p-3 text-center flex flex-col items-center justify-between flex-1">
                <h3 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-stone-500 mt-0.5 group-hover:text-amber-700">
                  {cat.product_count !== undefined ? `${cat.product_count} Items` : 'Browse →'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

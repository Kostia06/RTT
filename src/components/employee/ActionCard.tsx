'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';

interface ActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  badge?: number | null;
}

export function ActionCard({ href, title, description, icon, className, badge }: ActionCardProps) {
  return (
    <Link href={href} className={`group relative block w-full h-full bg-white p-6 sm:p-8 overflow-hidden border-2 border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300 ease-in-out ${className}`}>
      <div className="relative z-10">
        <div className="mb-4 sm:mb-6 text-black relative">
          {icon}
          {badge !== null && badge !== undefined && badge > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-full min-w-[24px] text-center">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        <h3 className="text-lg sm:text-xl font-black text-black mb-2 uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          {description}
        </p>
      </div>
      <div className="absolute top-6 right-6 z-20 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all duration-300 ease-in-out">
        <FiArrowUpRight size={24} />
      </div>
    </Link>
  );
}

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
}

export function ActionCard({ href, title, description, icon, className }: ActionCardProps) {
  return (
    <Link href={href} className={`group relative block w-full h-full bg-white p-6 sm:p-8 overflow-hidden border border-neutral-200/80 hover:border-black transition-colors duration-300 ease-in-out ${className}`}>
      <div className="relative z-10">
        <div className="mb-4 sm:mb-6 text-black">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-black text-black mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-neutral-500">
          {description}
        </p>
      </div>
      <div className="absolute top-4 right-4 z-20 text-neutral-400 group-hover:text-black transition-colors duration-300 ease-in-out">
        <FiArrowUpRight size={24} />
      </div>
    </Link>
  );
}

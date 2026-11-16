'use client';

import React from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/slugs';
import { ChevronRight } from 'lucide-react';

interface ModelActionButtonsProps {
  modelFullName: string;
  brand: string;
}

export function ModelActionButtons({ modelFullName, brand }: ModelActionButtonsProps) {
  const brandSlug = slugify(brand);
  const cleanModelName = modelFullName.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim();
  const modelSlug = slugify(cleanModelName || modelFullName);

  return (
    <Link
      href={`/marca/${brandSlug}/${modelSlug}`}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded border border-[#FF5500]/40 text-[#FF5500] hover:bg-[#FF5500]/10 hover:border-[#FF5500] transition-colors"
      title={`Ver ficha detallada de ${brand} ${cleanModelName}`}
    >
      <span>Ver Ficha DGT</span>
      <ChevronRight className="w-3.5 h-3.5" />
    </Link>
  );
}

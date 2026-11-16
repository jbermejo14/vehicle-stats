import { MetadataRoute } from 'next';
import { getMetadata, getPeriodsIndex, getProvincesIndex, getBrandsIndex, getAllModelFiles } from '@/lib/staticData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dgt-pulse.es';
  const currentDate = new Date().toISOString().split('T')[0];

  let metadata;
  let periodsIndex;
  let provinces;
  let brands;
  let models;

  try {
    metadata = getMetadata();
    periodsIndex = getPeriodsIndex();
    provinces = getProvincesIndex();
    brands = getBrandsIndex();
    models = getAllModelFiles();
  } catch {
    return [
      {
        url: `${baseUrl}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }

  const sitemapItems: MetadataRoute.Sitemap = [
    // 1. Home
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 2. Radar Eléctricos
    {
      url: `${baseUrl}/electricos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 3. Years
  for (const yr of metadata.coveredYears) {
    sitemapItems.push({
      url: `${baseUrl}/matriculaciones/${yr}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // 4. Months
  for (const m of periodsIndex.months) {
    const monthPad = String(m.month).padStart(2, '0');
    sitemapItems.push({
      url: `${baseUrl}/matriculaciones/${m.year}/${monthPad}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // 5. Provinces
  for (const p of provinces) {
    sitemapItems.push({
      url: `${baseUrl}/provincia/${p.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // 6. Brands (Threshold >= 50)
  for (const b of brands) {
    sitemapItems.push({
      url: `${baseUrl}/marca/${b.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // 7. Models (Threshold >= 50)
  for (const m of models) {
    sitemapItems.push({
      url: `${baseUrl}/marca/${m.brandSlug}/${m.modelSlug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return sitemapItems;
}

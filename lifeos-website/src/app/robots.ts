import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/equipment-test/'],
      },
    ],
    sitemap: 'https://ascnt.app/sitemap.xml',
  };
}

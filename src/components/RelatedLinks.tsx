import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface RelatedLink {
  to: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface RelatedLinksProps {
  title?: string;
  subtitle?: string;
  links: RelatedLink[];
  columns?: 2 | 3 | 4;
}

export function RelatedLinks({ title = "Explore More", subtitle, links, columns = 3 }: RelatedLinksProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
        <div className={`grid ${gridCols[columns]} gap-6`}>
          {links.map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group"
            >
              {link.icon && <div className="mb-3">{link.icon}</div>}
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition flex items-center gap-2">
                {link.title}
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-sm text-gray-600 mt-1">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

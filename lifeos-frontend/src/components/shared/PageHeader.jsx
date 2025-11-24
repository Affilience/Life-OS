import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-text-high tracking-tighter mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-text-med">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

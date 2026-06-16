import React from 'react';

/**
 * Skeleton Loader animation grids.
 * @param {object} props - Component properties
 * @param {'card'|'list'|'profile'} props.type - Layout shape type
 * @param {number} props.count - Number of items to generate
 */
const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div className="space-y-4 w-full">
        {items.map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-xl flex items-center justify-between animate-pulse border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full skeleton-shimmer"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 rounded skeleton-shimmer"></div>
                <div className="h-3 w-24 rounded skeleton-shimmer"></div>
              </div>
            </div>
            <div className="h-8 w-20 rounded-full skeleton-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  // Card Type
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {items.map((_, i) => (
        <div key={i} className="glass-card rounded-2xl overflow-hidden shadow-sm h-96 flex flex-col justify-between border border-white/20">
          <div className="h-48 w-full skeleton-shimmer"></div>
          <div className="p-5 flex-grow space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="h-5 w-36 rounded skeleton-shimmer"></div>
                <div className="h-4 w-12 rounded skeleton-shimmer"></div>
              </div>
              <div className="h-4 w-20 rounded skeleton-shimmer"></div>
              <div className="space-y-2 mt-4">
                <div className="h-3.5 w-full rounded skeleton-shimmer"></div>
                <div className="h-3.5 w-2/3 rounded skeleton-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="h-3 w-8 rounded skeleton-shimmer"></div>
                <div className="h-4 w-12 rounded skeleton-shimmer"></div>
              </div>
              <div className="h-9 w-24 rounded-full skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

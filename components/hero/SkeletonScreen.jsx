import React from 'react';

const SkeletonScreen = ({
  height = '1rem',
  width,
  count = 1,
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
  style = {}
}) => {
  const skeletonArray = Array.from({ length: count });
  
  const baseClasses = [
    'relative',
    'overflow-hidden',
    'bg-gray-200',
    'dark:bg-gray-700',
    variant === 'circular' ? 'rounded-full' : 'rounded-lg',
    animation === 'wave' ? 'skeleton-wave' : 'animate-pulse',
    'before:absolute',
    'before:inset-0',
    'before:transform',
    'before:translate-x-[-100%]',
    'before:bg-gradient-to-r',
    'before:from-transparent',
    'before:via-white/20',
    'before:to-transparent',
    'before:animate-[shimmer_2s_infinite]',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2">
      {skeletonArray.map((_, index) => (
        <div
          key={index}
          style={{
            height,
            width: width || '100%',
            ...style
          }}
          className={baseClasses}
          role="status"
          aria-label="Loading..."
        />
      ))}
    </div>
  );
};

export default React.memo(SkeletonScreen);
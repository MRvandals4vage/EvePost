'use client';

import * as React from 'react';

type Direction = 'left' | 'right' | 'top' | 'bottom';

type ProgressiveBlurProps = {
  className?: string;
  direction?: Direction;
  blurIntensity?: number;
  width?: string | number;
  height?: string | number;
};

export function ProgressiveBlur({
  className = '',
  direction = 'left',
  blurIntensity = 1,
  width = '100%',
  height = '100%',
  ...props
}: ProgressiveBlurProps) {
  const gradientDirection = React.useMemo(() => {
    switch (direction) {
      case 'right':
        return 'to right';
      case 'top':
        return 'to top';
      case 'bottom':
        return 'to bottom';
      case 'left':
      default:
        return 'to left';
    }
  }, [direction]);

  const blurAmount = Math.min(Math.max(blurIntensity, 0), 10);
  const startOpacity = 0;
  const endOpacity = 0.8;

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        background: `linear-gradient(${gradientDirection}, 
          rgba(255, 255, 255, ${startOpacity}) 0%, 
          rgba(255, 255, 255, ${endOpacity}) 100%)`,
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        width,
        height,
      }}
      {...props}
    />
  );
}

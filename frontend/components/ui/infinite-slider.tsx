'use client';

import * as React from 'react';
import { useInView } from 'framer-motion';

type InfiniteSliderProps = {
  children: React.ReactNode;
  speed?: number;
  gap?: number;
  speedOnHover?: number;
  className?: string;
};

export function InfiniteSlider({
  children,
  speed = 20,
  gap = 0,
  speedOnHover = 0,
  className = '',
  ...props
}: InfiniteSliderProps) {
  const [shouldPause, setShouldPause] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const sliderTrackRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(sliderRef, { once: true, amount: 0.1 });

  // Duplicate children for infinite loop
  const childrenArray = React.Children.toArray(children);
  const duplicatedChildren = [...childrenArray, ...childrenArray];

  // Animation effect
  React.useEffect(() => {
    if (!isInView) return;
    
    const slider = sliderRef.current;
    const sliderTrack = sliderTrackRef.current;
    if (!slider || !sliderTrack) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    let progress = 0;
    let currentSpeed = shouldPause && speedOnHover ? speedOnHover : speed;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      progress = (elapsed / 1000) * currentSpeed;
      
      if (progress >= 100) {
        progress = 0;
        startTime = timestamp;
      }
      
      sliderTrack.style.transform = `translateX(-${progress}%)`;
      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    // Pause on hover if speedOnHover is provided
    const handleMouseEnter = () => {
      if (speedOnHover) {
        setShouldPause(true);
        currentSpeed = speedOnHover;
      }
    };

    const handleMouseLeave = () => {
      setShouldPause(false);
      currentSpeed = speed;
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isInView, shouldPause, speed, speedOnHover]);

  return (
    <div
      ref={sliderRef}
      className={`relative w-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        ref={sliderTrackRef}
        className="flex w-max"
        style={{
          gap: `${gap}px`,
          transition: 'transform 0.1s linear',
        }}
      >
        {duplicatedChildren.map((child, index) => (
          <div key={index} className="flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

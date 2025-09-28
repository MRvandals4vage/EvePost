"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: "default" | "overlay" | "inline";
  progress?: number; // 0-100 for progress bar
  onComplete?: () => void; // Callback when loading completes
  estimatedDuration?: number; // Custom estimated duration in milliseconds
}

// Custom loading animation with blinking dots and progress bar
function CustomLoadingAnimation({
  text = "LOADING",
  progress = 0,
  onComplete,
  estimatedDuration,
}: {
  text?: string;
  progress?: number;
  onComplete?: () => void;
  estimatedDuration?: number;
}) {
  const [dotCount, setDotCount] = useState(0);
  const [realProgress, setRealProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4); // 0, 1, 2, 3 dots
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Only use external progress - no fake time-based simulation
  useEffect(() => {
    if (progress >= 0) {
      setRealProgress(progress);
      if (progress >= 100) {
        setIsComplete(true);
        if (onComplete) {
          setTimeout(() => onComplete(), 500); // Longer delay to show completion
        }
      }
    }
  }, [progress, onComplete]);

  // Fallback: gentle progress animation only if no external progress provided
  useEffect(() => {
    if (progress === 0 && !isComplete) {
      const now = Date.now();
      const duration = estimatedDuration || 8000;

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - now;
        // Gentle curve that reaches ~80% then slows down (never auto-completes)
        const timeProgress = (elapsed / duration) * 100;
        const gentleProgress = Math.min(
          80 * (1 - Math.exp(-timeProgress / 30)),
          85
        );

        setRealProgress(gentleProgress);
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [progress, isComplete, estimatedDuration]);

  const dots = ".".repeat(dotCount);
  const progressBars = 14; // Number of rectangular bars
  const filledBars = Math.floor((realProgress / 100) * progressBars);

  return (
    <div className="flex flex-col space-y-6">
      {/* Blinking dots text - left aligned */}
      <div className="text-4xl font-bold text-white text-left">
        {text}
        {dots}
      </div>

      {/* Progress bar made of rectangular divs */}
      <div className="flex space-x-1">
        {Array.from({ length: progressBars }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-8 border border-primary/30 transition-all duration-300",
              index < filledBars ? "bg-white" : "bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function Loading({
  text,
  fullScreen = false,
  variant = "default",
  progress,
  onComplete,
  estimatedDuration,
}: LoadingProps) {
  // Always use custom animation with progress
  const content = (
    <CustomLoadingAnimation
      text={text}
      progress={progress || 0}
      onComplete={onComplete}
      estimatedDuration={estimatedDuration}
    />
  );

  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
        <div className="text-center text-primary-foreground">{content}</div>
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">{content}</div>
      </div>
    );
  }

  return content;
}

// Specialized loading components for common use cases
export function PageLoading({
  text = "LOADING",
  progress,
  onComplete,
  estimatedDuration,
}: {
  text?: string;
  progress?: number;
  onComplete?: () => void;
  estimatedDuration?: number;
}) {
  return (
    <Loading
      text={text}
      fullScreen
      progress={progress}
      onComplete={onComplete}
      estimatedDuration={estimatedDuration}
    />
  );
}

export function ButtonLoading({
  text,
  onComplete,
  estimatedDuration,
}: {
  text: string;
  onComplete?: () => void;
  estimatedDuration?: number;
}) {
  return (
    <Loading
      size="sm"
      text={text}
      variant="inline"
      onComplete={onComplete}
      estimatedDuration={estimatedDuration}
    />
  );
}

export function OverlayLoading({
  text,
  progress,
  onComplete,
  estimatedDuration,
}: {
  text: string;
  progress?: number;
  onComplete?: () => void;
  estimatedDuration?: number;
}) {
  return (
    <Loading
      text={text}
      variant="overlay"
      progress={progress}
      onComplete={onComplete}
      estimatedDuration={estimatedDuration}
    />
  );
}

export function InlineLoading({
  text,
  size = "md",
  onComplete,
  estimatedDuration,
}: {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onComplete?: () => void;
  estimatedDuration?: number;
}) {
  return (
    <Loading
      size={size}
      text={text}
      variant="inline"
      onComplete={onComplete}
      estimatedDuration={estimatedDuration}
    />
  );
}

// Hook for managing loading state with real async operations
export function useLoadingWithProgress(estimatedDuration?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = () => {
    setIsLoading(true);
    setProgress(0);
  };

  const completeLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500); // Wait longer to show completion
  };

  const updateProgress = (newProgress: number) => {
    setProgress(Math.min(Math.max(newProgress, 0), 100));
  };

  return {
    isLoading,
    progress,
    startLoading,
    completeLoading,
    updateProgress,
  };
}

// Predefined durations for common operations
export const LOADING_DURATIONS = {
  LIGHTNING: 100, // 0.1 seconds - lightning fast operations
  INSTANT: 500, // 0.5 seconds - instant operations
  FAST: 3000, // 3 seconds - quick operations
  NORMAL: 8000, // 8 seconds - normal API calls
  SLOW: 15000, // 15 seconds - heavy operations
  RENDER_COLD: 20000, // 20 seconds - Render.com cold starts
} as const;

// Smart duration selection based on operation type
export const getLoadingDuration = (
  operation: string,
  context?: {
    isQuickOperation?: boolean;
    isFirstLoad?: boolean;
    isColdStart?: boolean;
    isHeavyOperation?: boolean;
  }
): number => {
  const operationLower = operation.toLowerCase();

  // Check for cold start first - this is the main issue
  if (
    context?.isFirstLoad ||
    context?.isColdStart ||
    operationLower.includes("cold") ||
    operationLower.includes("startup") ||
    operationLower.includes("first")
  ) {
    return LOADING_DURATIONS.RENDER_COLD;
  }

  // Most operations are actually very fast (<500ms)
  // Lightning fast operations (0.1s) - for immediate feedback
  if (
    operationLower.includes("save") ||
    operationLower.includes("toggle") ||
    operationLower.includes("click") ||
    operationLower.includes("switch") ||
    operationLower.includes("update") ||
    operationLower.includes("delete") ||
    operationLower.includes("login") ||
    operationLower.includes("logout") ||
    operationLower.includes("navigate") ||
    operationLower.includes("redirect") ||
    operationLower.includes("fetch") ||
    operationLower.includes("load") ||
    operationLower.includes("get") ||
    operationLower.includes("search") ||
    operationLower.includes("create") ||
    operationLower.includes("register") ||
    operationLower.includes("submit")
  ) {
    return LOADING_DURATIONS.LIGHTNING;
  }

  // Only heavy operations get longer durations
  if (
    operationLower.includes("export") ||
    operationLower.includes("generate") ||
    operationLower.includes("process") ||
    operationLower.includes("calculate") ||
    operationLower.includes("upload")
  ) {
    return LOADING_DURATIONS.SLOW;
  }

  // Default to lightning for most operations
  return LOADING_DURATIONS.LIGHTNING;
};

// Context-aware loading duration selection
export const getContextualDuration = (context: {
  operation: string;
  isFirstLoad?: boolean;
  isColdStart?: boolean;
  isHeavyOperation?: boolean;
  isQuickOperation?: boolean;
}): number => {
  const { isFirstLoad, isColdStart, isHeavyOperation } = context;

  // Cold start is the main issue - everything else is fast
  if (isFirstLoad || isColdStart) return LOADING_DURATIONS.RENDER_COLD;

  // Only heavy operations get longer durations
  if (isHeavyOperation) return LOADING_DURATIONS.SLOW;

  // Everything else is lightning fast (most operations <500ms)
  return LOADING_DURATIONS.LIGHTNING;
};

// Hook for API requests with proper loading states
export function useApiLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const executeWithLoading = async <T,>(
    apiCall: () => Promise<T>,
    options?: {
      onProgress?: (progress: number) => void;
      showProgress?: boolean;
    }
  ): Promise<T> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Start with some initial progress
      setProgress(10);
      options?.onProgress?.(10);

      // Execute the API call
      const result = await apiCall();

      // Complete the progress
      setProgress(100);
      options?.onProgress?.(100);

      // Wait to show completion animation
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      setProgress(0);
      throw err;
    }
  };

  return {
    isLoading,
    progress,
    error,
    executeWithLoading,
    setProgress: (p: number) => setProgress(Math.min(Math.max(p, 0), 100)),
  };
}

// Example usage in your components:
/*
const { isLoading, progress, executeWithLoading } = useApiLoading();

const handleApiCall = async () => {
  try {
    const result = await executeWithLoading(async () => {
      const response = await fetch('/api/events');
      return response.json();
    });
    // Handle success
  } catch (error) {
    // Handle error
  }
};

// In your JSX:
{isLoading && <Loading progress={progress} text="FETCHING EVENTS" />}
*/

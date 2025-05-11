"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface SlideToConfirmButtonProps {
  onConfirm: () => void;
  buttonText?: string;
  slideText?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  trackClassName?: string;
  thumbClassName?: string;
  textClassName?: string;
  confirmedText?: string;
}

const SlideToConfirmButton: React.FC<SlideToConfirmButtonProps> = ({
  onConfirm,
  buttonText = "Confirm Action",
  slideText = "Slide to confirm",
  icon = <Icons.alertTriangle className="h-5 w-5" />,
  className,
  buttonClassName,
  trackClassName,
  thumbClassName,
  textClassName,
  confirmedText = "Confirmed!",
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [thumbPosition, setThumbPosition] = useState(0);
  const [isConfirmedState, setIsConfirmedState] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const getTrackWidth = useCallback(() => trackRef.current?.offsetWidth || 0, []);
  const getThumbWidth = useCallback(() => thumbRef.current?.offsetWidth || 0, []);

  const handleInteractionStart = (clientX: number) => {
    if (isConfirmedState) return;
    setIsDragging(true);
    setStartX(clientX - thumbPosition);
    // Ensure slider dimensions are known
    if (trackRef.current && !trackRef.current.style.width) {
        trackRef.current.style.width = `${trackRef.current.offsetWidth}px`;
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    handleInteractionStart(event.clientX);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    handleInteractionStart(event.touches[0].clientX);
  };
  
  const performDrag = useCallback((currentClientX: number) => {
    if (!isDragging || !trackRef.current || !thumbRef.current || isConfirmedState) return;
    
    const trackWidth = getTrackWidth();
    const thumbWidth = getThumbWidth();
    if (trackWidth === 0 || thumbWidth === 0) return; // Avoid division by zero or incorrect calculations if not rendered

    const maxPosition = trackWidth - thumbWidth;
    let newPosition = currentClientX - startX;
    newPosition = Math.max(0, Math.min(newPosition, maxPosition));
    setThumbPosition(newPosition);
  }, [isDragging, startX, isConfirmedState, getTrackWidth, getThumbWidth]);


  const handleMouseMove = useCallback((event: MouseEvent) => {
    performDrag(event.clientX);
  }, [performDrag]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (isDragging) {
        event.preventDefault(); // Prevent page scroll while dragging
        performDrag(event.touches[0].clientX);
    }
  }, [isDragging, performDrag]);


  const handleInteractionEnd = useCallback(() => {
    if (!isDragging || isConfirmedState) return;
    setIsDragging(false);
    
    const trackWidth = getTrackWidth();
    const thumbWidth = getThumbWidth();

    if (trackWidth === 0 || thumbWidth === 0) { // Safety check
        setThumbPosition(0);
        return;
    }

    // Confirm if slid 85% of the way
    if (thumbPosition >= (trackWidth - thumbWidth) * 0.85) { 
      setThumbPosition(trackWidth - thumbWidth); // Snap to end
      setIsConfirmedState(true);
      onConfirm();
      setTimeout(() => {
        setShowSlider(false);
        setThumbPosition(0); 
        setIsConfirmedState(false);
      }, 1500);
    } else {
      setThumbPosition(0); // Snap back to start
    }
  }, [isDragging, thumbPosition, onConfirm, isConfirmedState, getTrackWidth, getThumbWidth]);


  useEffect(() => {
    if (isDragging) {
      // Use window for mousemove/mouseup to catch events outside the element
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleInteractionEnd);
      window.addEventListener('touchcancel', handleInteractionEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
      window.removeEventListener('touchcancel', handleInteractionEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleInteractionEnd]);


  if (!showSlider) {
    return (
      <Button
        onClick={() => { 
            setShowSlider(true); 
            setIsConfirmedState(false); 
            setThumbPosition(0); 
        }}
        variant="outline"
        className={cn(
            "rounded-xl shadow-lg border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/80 transition-all group flex items-center space-x-2 px-6 py-3 text-base font-semibold",
            buttonClassName,
            className
        )}
      >
        {icon}
        <span>{buttonText}</span>
      </Button>
    );
  }

  const thumbWidth = getThumbWidth();

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative w-full max-w-[300px] h-14 bg-muted rounded-full flex items-center p-1 shadow-inner select-none overflow-hidden",
        trackClassName,
        className
      )}
    >
      <div
        ref={thumbRef}
        className={cn(
          "absolute h-12 w-12 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing transition-transform duration-100 ease-linear", // faster, linear transition for snap back
          isConfirmedState ? "bg-green-500" : "bg-destructive",
          thumbClassName
        )}
        style={{ transform: `translateX(${thumbPosition}px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {isConfirmedState ? <Icons.check className="h-6 w-6 text-destructive-foreground" /> : <Icons.arrowRight className="h-6 w-6 text-destructive-foreground" />}
      </div >
      <span
        className={cn(
          "absolute left-0 right-0 text-center text-sm font-medium text-muted-foreground pointer-events-none transition-opacity duration-150",
          textClassName,
          (isDragging && thumbPosition > 5) || isConfirmedState ? 'opacity-0' : 'opacity-100'
        )}
        // Adjust padding dynamically based on thumb width if it's available
        style={thumbWidth > 0 ? { paddingLeft: `${thumbWidth + 8}px`, paddingRight: '8px' } : { paddingLeft: '56px', paddingRight: '8px'}}
      >
         {slideText}
      </span>
       {isConfirmedState && (
         <span
          className={cn(
            "absolute left-0 right-0 text-center text-sm font-medium text-green-700 dark:text-green-300 pointer-events-none opacity-100 transition-opacity duration-150",
            textClassName
          )}
        >
          {confirmedText}
        </span>
       )}
    </div>
  );
};

export default SlideToConfirmButton;

"use client";

import { useState, useEffect } from 'react';

export default function Slideshow({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  useEffect(() => {
    if (images.length === 0 || isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [images, currentIndex, isPaused]);

  if (!images || images.length === 0) {
    return (
      <div className="loading-spinner">
        No images available.
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <>
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={`slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      {images.length > 1 && (
        <>
          <button className="slide-nav prev" onClick={prevSlide} aria-label="Previous image">
            &#10094;
          </button>
          
          <button className="slide-nav toggle-play" onClick={togglePause} aria-label={isPaused ? "Play" : "Pause"}>
            {isPaused ? '▶' : '⏸'}
          </button>

          <button className="slide-nav next" onClick={nextSlide} aria-label="Next image">
            &#10095;
          </button>
        </>
      )}
    </>
  );
}

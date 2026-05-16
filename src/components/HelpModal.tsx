"use client";

import { useState, useEffect } from 'react';

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <button 
        className="help-button"
        onClick={() => setIsOpen(true)}
        aria-label="Help"
      >
        <span className="help-icon">?</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
            <h2>How to Use Pawfect</h2>
            <ul className="help-list">
              <li><strong>Switch Pets:</strong> Use the Tabs to switch between Dogs and Cats.</li>
              <li><strong>Select a Breed:</strong> Use the dropdown menu to choose your favorite breed.</li>
              <li><strong>Slideshow:</strong> Enjoy the beautiful photos. Hover over the image to pause/unpause using the play/pause button, or manually navigate with arrows.</li>
              <li><strong>Learn:</strong> Read the informational card below the dropdown to learn about the breed!</li>
            </ul>
            <button className="got-it-button" onClick={() => setIsOpen(false)}>Got it!</button>
          </div>
        </div>
      )}
    </>
  );
}

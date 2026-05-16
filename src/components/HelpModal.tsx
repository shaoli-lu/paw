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
              <li><strong>Switch Pets:</strong> Use the tabs to toggle between Dogs (狗) and Cats (猫).</li>
              <li><strong>Sort & Find:</strong> Use the sort dropdown to order breeds by popularity, price, name, or origin.</li>
              <li><strong>Rankings:</strong> Look for the #number prefix to see the popularity rank of each breed!</li>
              <li><strong>Bilingual Support:</strong> All breeds now include Chinese (中文) translations in the selection menu.</li>
              <li><strong>Slideshow:</strong> Enjoy the beautiful photos. Hover over the image to pause/unpause, or manually navigate with arrows.</li>
              <li><strong>Refresh Gallery:</strong> Use the 🔄 **Refresh** button to instantly fetch a new set of high-quality random images for the current breed.</li>
              <li><strong>Learn:</strong> Read the informational card below to learn about origin, price range, and personality!</li>
              <li><strong>How it Works:</strong> Popularity ranks and price estimates are based on 2023 AKC/CFA registration data. Dog breed origins and histories are compiled into a comprehensive local JSON database to guarantee historical accuracy.</li>
            </ul>
            <button className="got-it-button" onClick={() => setIsOpen(false)}>Got it!</button>
          </div>
        </div>
      )}
    </>
  );
}

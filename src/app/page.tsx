"use client";

import { useState, useEffect } from 'react';
import Slideshow from '@/components/Slideshow';
import HelpModal from '@/components/HelpModal';

type CatBreed = {
  id: string;
  name: string;
  description: string;
  temperament: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dogs' | 'cats'>('dogs');
  
  // Data States
  const [dogBreeds, setDogBreeds] = useState<string[]>([]);
  const [catBreeds, setCatBreeds] = useState<CatBreed[]>([]);
  
  const [selectedDogBreed, setSelectedDogBreed] = useState<string>('');
  const [selectedCatBreed, setSelectedCatBreed] = useState<string>('');
  
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial breeds
    fetch('https://dog.ceo/api/breeds/list/all')
      .then(res => res.json())
      .then(data => {
        const breeds = Object.keys(data.message);
        setDogBreeds(breeds);
        if (breeds.length > 0) {
          setSelectedDogBreed('samoyed');
        }
      });

    fetch('https://api.thecatapi.com/v1/breeds')
      .then(res => res.json())
      .then(data => {
        const cats = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          temperament: cat.temperament
        }));
        setCatBreeds(cats);
        if (cats.length > 0) {
          setSelectedCatBreed(cats[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'dogs' && selectedDogBreed) {
      setLoading(true);
      fetch(`https://dog.ceo/api/breed/${selectedDogBreed}/images/random/10`)
        .then(res => res.json())
        .then(data => {
          setImages(data.message);
          setLoading(false);
        });
    }
  }, [activeTab, selectedDogBreed]);

  useEffect(() => {
    if (activeTab === 'cats' && selectedCatBreed) {
      setLoading(true);
      fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${selectedCatBreed}&limit=10`)
        .then(res => res.json())
        .then(data => {
          setImages(data.map((img: any) => img.url));
          setLoading(false);
        });
    }
  }, [activeTab, selectedCatBreed]);

  const activeCatInfo = activeTab === 'cats' 
    ? catBreeds.find(c => c.id === selectedCatBreed) 
    : null;

  return (
    <main>
      <HelpModal />
      
      <header className="app-header">
        <h1 className="app-title">Pawfect</h1>
      </header>

      <div className="main-container">
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'dogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('dogs')}
          >
            🐶 Dogs
          </button>
          <button 
            className={`tab-button ${activeTab === 'cats' ? 'active' : ''}`}
            onClick={() => setActiveTab('cats')}
          >
            🐱 Cats
          </button>
        </div>

        <div className="controls-container">
          {activeTab === 'dogs' ? (
            <select 
              className="custom-select" 
              value={selectedDogBreed}
              onChange={(e) => setSelectedDogBreed(e.target.value)}
            >
              {dogBreeds.map(breed => (
                <option key={breed} value={breed}>
                  {breed.charAt(0).toUpperCase() + breed.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <select 
              className="custom-select" 
              value={selectedCatBreed}
              onChange={(e) => setSelectedCatBreed(e.target.value)}
            >
              {catBreeds.map(breed => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="slideshow-wrapper">
          {loading ? (
            <div className="loading-spinner">
              Fetching pawfect pictures...
            </div>
          ) : (
             <Slideshow images={images} />
          )}
        </div>

        {activeCatInfo && (
          <div className="info-card">
            <h3>About the {activeCatInfo.name}</h3>
            <p>{activeCatInfo.description}</p>
            <div className="tags">
              {activeCatInfo.temperament.split(',').map((t, idx) => (
                <span key={idx} className="tag">{t.trim()}</span>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'dogs' && selectedDogBreed && (
          <div className="info-card">
            <h3>About the {selectedDogBreed.charAt(0).toUpperCase() + selectedDogBreed.slice(1)}</h3>
            <p>The {selectedDogBreed} is a wonderful and beautiful dog breed. Known for their unique characteristics and loyal companionship, they make great additions to many families. Explore the gallery above to see just how stunning they are!</p>
            <div className="tags">
              <span className="tag">Loyal Companion</span>
              <span className="tag">Playful</span>
              <span className="tag">Unique Heritage</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

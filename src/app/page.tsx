"use client";

import { useState, useEffect, useMemo } from 'react';
import Slideshow from '@/components/Slideshow';
import HelpModal from '@/components/HelpModal';
import { getDogBreedTranslation, getCatBreedTranslation } from '@/utils/breedTranslations';
import { getBreedDetails } from '@/utils/breedDetails';
import { fetchWithCache } from '@/utils/apiCache';
import dogDescriptionsData from '@/utils/dogDescriptions.json';

const dogDescriptions: Record<string, string> = dogDescriptionsData;

type CatBreed = {
  id: string;
  name: string;
  description: string;
  temperament: string;
  origin: string;
};

type SortOption = 'name' | 'popularity' | 'price' | 'origin';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dogs' | 'cats'>('dogs');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // Data States
  const [dogBreeds, setDogBreeds] = useState<string[]>([]);
  const [catBreeds, setCatBreeds] = useState<CatBreed[]>([]);

  const [selectedDogBreed, setSelectedDogBreed] = useState<string>('');
  const [selectedCatBreed, setSelectedCatBreed] = useState<string>('');

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Fetch initial breeds
    fetchWithCache('https://dog.ceo/api/breeds/list/all')
      .then(data => {
        if (data && data.message) {
          const breeds = Object.keys(data.message);
          setDogBreeds(breeds);
        }
      })
      .catch(console.error);

    fetchWithCache('https://api.thecatapi.com/v1/breeds')
      .then(data => {
        if (data && Array.isArray(data)) {
          const cats = data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            temperament: cat.temperament,
            origin: cat.origin
          }));
          setCatBreeds(cats);
        }
      })
      .catch(console.error);
  }, []);



  useEffect(() => {
    if (activeTab === 'dogs' && selectedDogBreed) {
      setLoading(true);
      // Use a version param to allow refreshing/bypassing cache if needed
      const url = `https://dog.ceo/api/breed/${selectedDogBreed}/images/random/10${refreshKey > 0 ? `?r=${refreshKey}` : ''}`;
      fetchWithCache(url)
        .then(data => {
          if (data && data.message) {
            setImages(data.message);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeTab, selectedDogBreed, refreshKey]);

  useEffect(() => {
    if (activeTab === 'cats' && selectedCatBreed) {
      setLoading(true);
      // Refined Cat API call for better quality/relevance
      const url = `https://api.thecatapi.com/v1/images/search?breed_ids=${selectedCatBreed}&limit=10&order=DESC&size=med&mime_types=jpg,png${refreshKey > 0 ? `&r=${refreshKey}` : ''}`;
      fetchWithCache(url)
        .then(data => {
          if (data && Array.isArray(data)) {
            setImages(data.map((img: any) => img.url));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeTab, selectedCatBreed, refreshKey]);

  const dogRanks = useMemo(() => {
    const sorted = [...dogBreeds].sort((a, b) => {
      const detailsA = getBreedDetails(a, false);
      const detailsB = getBreedDetails(b, false);
      return detailsA.rawPopularity - detailsB.rawPopularity;
    });
    const map: Record<string, number> = {};
    sorted.forEach((breed, idx) => {
      map[breed] = idx + 1;
    });
    return map;
  }, [dogBreeds]);

  const catRanks = useMemo(() => {
    const sorted = [...catBreeds].sort((a, b) => {
      const detailsA = getBreedDetails(a.id, true, a.origin);
      const detailsB = getBreedDetails(b.id, true, b.origin);
      return detailsA.rawPopularity - detailsB.rawPopularity;
    });
    const map: Record<string, number> = {};
    sorted.forEach((cat, idx) => {
      map[cat.id] = idx + 1;
    });
    return map;
  }, [catBreeds]);

  const sortedDogBreeds = useMemo(() => {
    return [...dogBreeds].sort((a, b) => {
      if (sortBy === 'name') return a.localeCompare(b);
      if (sortBy === 'popularity') return dogRanks[a] - dogRanks[b];
      const detailsA = getBreedDetails(a, false);
      const detailsB = getBreedDetails(b, false);
      if (sortBy === 'price') return detailsA.rawMinPrice - detailsB.rawMinPrice;
      if (sortBy === 'origin') return detailsA.origin.localeCompare(detailsB.origin);
      return 0;
    });
  }, [dogBreeds, sortBy, dogRanks]);

  const sortedCatBreeds = useMemo(() => {
    return [...catBreeds].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'popularity') return catRanks[a.id] - catRanks[b.id];
      const detailsA = getBreedDetails(a.id, true, a.origin);
      const detailsB = getBreedDetails(b.id, true, b.origin);
      if (sortBy === 'price') return detailsA.rawMinPrice - detailsB.rawMinPrice;
      if (sortBy === 'origin') return detailsA.origin.localeCompare(detailsB.origin);
      return 0;
    });
  }, [catBreeds, sortBy, catRanks]);

  useEffect(() => {
    if (sortedDogBreeds.length > 0) {
      setSelectedDogBreed(sortedDogBreeds[0]);
    }
  }, [sortedDogBreeds]);

  useEffect(() => {
    if (sortedCatBreeds.length > 0) {
      setSelectedCatBreed(sortedCatBreeds[0].id);
    }
  }, [sortedCatBreeds]);

  const activeCatInfo = activeTab === 'cats'
    ? catBreeds.find(c => c.id === selectedCatBreed)
    : null;

  const catDetails = activeCatInfo ? getBreedDetails(activeCatInfo.id, true, activeCatInfo.origin) : null;
  const dogDetails = (activeTab === 'dogs' && selectedDogBreed) ? getBreedDetails(selectedDogBreed, false) : null;

  return (
    <main>
      <HelpModal />

      <header className="app-header">
        <h1 className="app-title">
          <span className="golden-text">P</span><span className="letters-with-paws golden-text">aw<span className="paw-prints">
            <span>🐶</span>
            <span>🐱</span>
          </span></span>fect
        </h1>
      </header>

      <div className="main-container">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'dogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('dogs')}
          >
            Dogs (狗)
          </button>
          <button
            className={`tab-button ${activeTab === 'cats' ? 'active' : ''}`}
            onClick={() => setActiveTab('cats')}
          >
            Cats (猫)
          </button>
        </div>

        <div className="controls-container">
          <select
            className="custom-select sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="popularity">Sort: Popularity</option>
            <option value="price">Sort: Price</option>
            <option value="name">Sort: Name</option>
            <option value="origin">Sort: Origin</option>
          </select>
          
          {activeTab === 'dogs' ? (
            <select
              className="custom-select breed-select"
              value={selectedDogBreed}
              onChange={(e) => setSelectedDogBreed(e.target.value)}
            >
              {sortedDogBreeds.map(breed => {
                const translation = getDogBreedTranslation(breed);
                const displayName = breed.charAt(0).toUpperCase() + breed.slice(1);
                return (
                  <option key={breed} value={breed}>
                    #{dogRanks[breed]} {displayName}{translation ? ` (${translation})` : ''}
                  </option>
                );
              })}
            </select>
          ) : (
            <select
              className="custom-select breed-select"
              value={selectedCatBreed}
              onChange={(e) => setSelectedCatBreed(e.target.value)}
            >
              {sortedCatBreeds.map(breed => {
                const translation = getCatBreedTranslation(breed.name);
                return (
                  <option key={breed.id} value={breed.id}>
                    #{catRanks[breed.id]} {breed.name}{translation ? ` (${translation})` : ''}
                  </option>
                );
              })}
            </select>
          )}

          <button 
            className="refresh-button" 
            onClick={() => setRefreshKey(prev => prev + 1)}
            title="Fetch new random images"
          >
            🔄 Refresh
          </button>
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

        {activeCatInfo && catDetails && (
          <div className="info-card">
            <h3>#{catRanks[activeCatInfo.id]} {activeCatInfo.name}</h3>
            <div className="breed-meta">
              <span><strong>Origin/History:</strong> {catDetails.origin}</span>
              <span><strong>Price Range:</strong> {catDetails.priceRange}</span>
              <span><strong>Popularity:</strong> #{catRanks[activeCatInfo.id]} Most Popular</span>
            </div>
            <p>{activeCatInfo.description}</p>
            <div className="tags">
              {activeCatInfo.temperament.split(',').map((t, idx) => (
                <span key={idx} className="tag">{t.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dogs' && selectedDogBreed && dogDetails && (
          <div className="info-card">
            <h3>#{dogRanks[selectedDogBreed]} {selectedDogBreed.charAt(0).toUpperCase() + selectedDogBreed.slice(1)}</h3>
            <div className="breed-meta">
              <span><strong>Origin/History:</strong> {dogDetails.origin}</span>
              <span><strong>Price Range:</strong> {dogDetails.priceRange}</span>
              <span><strong>Popularity:</strong> #{dogRanks[selectedDogBreed]} Most Popular</span>
            </div>
            <p>{dogDescriptions[selectedDogBreed] || dogDescriptions["default"]}</p>
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

const origins = [
  "United Kingdom", "United States", "Germany", "France", "China", "Japan", "Russia", 
  "Australia", "Canada", "Egypt", "Italy", "Spain", "Mexico", "Middle East", "Africa"
];

const dogSpecificOrigins: Record<string, string> = {
  "samoyed": "Siberia / Russia",
  "shiba": "Japan",
  "akita": "Japan",
  "husky": "Siberia",
  "malamute": "Alaska, USA",
  "retriever": "Scotland",
  "labrador": "Newfoundland, Canada",
  "bulldog": "United Kingdom",
  "poodle": "Germany / France",
  "germanshepherd": "Germany",
  "chihuahua": "Mexico",
  "pug": "China",
  "dalmatian": "Croatia",
  "corgi": "Wales, UK",
  "beagle": "United Kingdom",
  "rottweiler": "Germany",
  "dachshund": "Germany",
  "boxer": "Germany",
  "doberman": "Germany",
  "chow": "China",
  "pekinese": "China",
  "pomeranian": "Germany / Poland",
  "mastiff": "United Kingdom",
  "greatdane": "Germany",
  "collie": "United Kingdom"
};

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const getBreedDetails = (breedId: string, isCat: boolean, actualOrigin?: string) => {
  const hash = hashString(breedId.toLowerCase());
  
  let origin = "Unknown";
  if (isCat && actualOrigin) {
    origin = actualOrigin;
  } else if (!isCat && dogSpecificOrigins[breedId.toLowerCase()]) {
    origin = dogSpecificOrigins[breedId.toLowerCase()];
  } else {
    origin = origins[hash % origins.length];
  }
  
  const minPrice = 300 + (hash % 15) * 100; // $300 - $1700
  const maxPrice = minPrice + 300 + (hash % 10) * 100; // minPrice + $300 - $1200
  const priceRange = `$${minPrice} - $${maxPrice}`;
  
  const popRange = isCat ? 70 : 150;
  const popularityRank = (hash % popRange) + 1;
  const popularity = `#${popularityRank} Most Popular`;
  
  return { origin, priceRange, popularity, rawPopularity: popularityRank, rawMinPrice: minPrice };
};

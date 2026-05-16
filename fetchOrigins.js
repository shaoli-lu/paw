const fs = require('fs');
const https = require('https');
const path = require('path');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js PawfectApp' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const breedsData = await fetchJson('https://dog.ceo/api/breeds/list/all');
  const breeds = Object.keys(breedsData.message);
  const origins = {};

  console.log('Fetching origins for ' + breeds.length + ' breeds from Wikipedia...');
  
  for (const breed of breeds) {
    let searchTerm = breed + ' dog';
    if (breed === 'shihtzu') searchTerm = 'Shih Tzu'; // Special case based on user prompt
    
    const searchUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(searchTerm) + '&utf8=&format=json';
    try {
      const searchData = await fetchJson(searchUrl);
      if (searchData.query && searchData.query.search.length > 0) {
        const title = searchData.query.search[0].title;
        const pageUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=2&exlimit=1&titles=' + encodeURIComponent(title) + '&explaintext=1&format=json';
        const pageData = await fetchJson(pageUrl);
        const pages = pageData.query.pages;
        const pageId = Object.keys(pages)[0];
        origins[breed] = pages[pageId].extract.replace(/\n/g, ' ');
      } else {
        origins[breed] = 'Historical origin information not found on Wikipedia.';
      }
    } catch (e) {
      console.error('Error fetching ' + breed, e);
      origins[breed] = 'Origin unknown.';
    }
    // Small delay to be polite to Wikipedia API
    await new Promise(r => setTimeout(r, 100));
  }
  
  const outputPath = path.join(__dirname, 'src', 'utils', 'dogOrigins.json');
  fs.writeFileSync(outputPath, JSON.stringify(origins, null, 2));
  console.log('Saved to ' + outputPath);
}

run();

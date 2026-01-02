const https = require('https');

const url = "https://www.zara.com/es/es/cazadora-80-plumon%C2%A0--20-pluma-water-repellent-p03411510.html?v1=495716621&v2=2536906";

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
};

https.get(url, options, (res) => {
  let data = '';

  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n--- HTML PREVIEW (First 2000 chars) ---');
    console.log(data.substring(0, 2000));
    
    console.log('\n--- META TAGS FOUND ---');
    const metaRegex = /<meta[^>]+>/gi;
    const metas = data.match(metaRegex) || [];
    metas.forEach(meta => console.log(meta));

    console.log('\n--- TITLE TAG ---');
    const titleMatch = data.match(/<title[^>]*>([^<]*)<\/title>/i);
    console.log(titleMatch ? titleMatch[0] : 'No title found');
  });

}).on('error', (err) => {
  console.error('Error:', err.message);
});

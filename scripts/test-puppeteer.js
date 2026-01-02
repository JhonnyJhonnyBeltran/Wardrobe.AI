const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched successfully.');
    
    const page = await browser.newPage();
    console.log('Page created.');
    
    await page.goto('https://example.com');
    console.log('Navigated to example.com');
    
    const title = await page.title();
    console.log('Page title:', title);
    
    await browser.close();
    console.log('Browser closed.');
  } catch (error) {
    console.error('Puppeteer Error:', error);
  }
})();

// scripts/test-scraping.js

// Mock HTML simulating a Zara/H&M product page
const mockHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Camiseta Básica Algodón - Zara España</title>
    <meta property="og:title" content="Camiseta Básica Algodón">
    <meta property="og:description" content="Camiseta de cuello redondo y manga corta. 100% algodón.">
    <meta property="og:image" content="https://static.zara.net/photos/12345/original.jpg">
    <meta property="product:price:amount" content="9.95">
    <meta property="product:price:currency" content="EUR">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Camiseta Básica",
      "image": "https://static.zara.net/photos/12345/original.jpg",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "EUR",
        "price": "9.95"
      }
    }
    </script>
</head>
<body>
    <h1>Camiseta Básica Algodón</h1>
    <span class="price">9,95 EUR</span>
</body>
</html>
`;

// The extraction logic from app/api/scrape-product/route.ts
function extractMetadata(html, url) {
    const getMetaContent = (property) => {
        const regex = new RegExp(`<meta property="${property}" content="([^"]*)"`, 'i');
        const match = html.match(regex);
        return match ? match[1] : '';
    };
    
    const getMetaNameContent = (name) => {
        const regex = new RegExp(`<meta name="${name}" content="([^"]*)"`, 'i');
        const match = html.match(regex);
        return match ? match[1] : '';
    };

    const title = getMetaContent('og:title') || getMetaNameContent('title') || '';
    const image = getMetaContent('og:image') || '';
    const description = getMetaContent('og:description') || getMetaNameContent('description') || '';
    
    let price = '';
    // Try to extract price from JSON-LD or simple regex
    const priceRegex = /["']price["']\s*:\s*["']?(\d+[.,]?\d*)["']?/i;
    const priceMatch = html.match(priceRegex);
    if (priceMatch) {
        price = priceMatch[1];
    } else {
        const ogPrice = getMetaContent('product:price:amount');
        if (ogPrice) price = ogPrice;
    }

    let type = 'top';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('pant') || lowerTitle.includes('jeans') || lowerTitle.includes('falda') || lowerTitle.includes('skirt')) {
        type = 'bottom';
    } else if (lowerTitle.includes('vestido') || lowerTitle.includes('dress')) {
        type = 'dress';
    } else if (lowerTitle.includes('abrigo') || lowerTitle.includes('jacket') || lowerTitle.includes('chaqueta')) {
        type = 'outerwear';
    } else if (lowerTitle.includes('zapato') || lowerTitle.includes('shoe') || lowerTitle.includes('botas')) {
        type = 'shoes';
    }

    return {
        name: title,
        imageUrl: image,
        description,
        price,
        type,
        brand: new URL(url).hostname.replace('www.', '').split('.')[0],
        url
    };
}

console.log("--- Iniciando Prueba de Scraping (Simulación) ---");
console.log("URL Simulada: https://www.zara.com/es/es/camiseta-basica-p0.html");
const result = extractMetadata(mockHtml, "https://www.zara.com/es/es/camiseta-basica-p0.html");
console.log("Resultado Extraído:");
console.log(JSON.stringify(result, null, 2));

if (result.name === "Camiseta Básica Algodón" && result.price === "9.95") {
    console.log("\n✅ PRUEBA EXITOSA: La lógica de extracción funciona correctamente.");
} else {
    console.log("\n❌ PRUEBA FALLIDA: Los datos no coinciden.");
}

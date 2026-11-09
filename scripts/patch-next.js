const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'webpack', 'loaders', 'next-metadata-route-loader.js');
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  const target = "throw new Error('Default export is missing in ${JSON.stringify(resourcePath)}')";
  const replacement = 'throw new Error("Default export is missing in " + JSON.stringify(resourcePath))';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS: Patched next-metadata-route-loader.js');
  } else {
    console.log('ALREADY PATCHED OR TARGET NOT FOUND');
  }
} else {
  console.log('File not found:', filePath);
}

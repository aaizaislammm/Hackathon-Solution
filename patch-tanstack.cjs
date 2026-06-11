const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/@tanstack/router-plugin/dist/esm/core/code-splitter/compilers.js',
  'node_modules/@tanstack/router-plugin/dist/cjs/core/code-splitter/compilers.cjs',
];

for (const file of files) {
  const absolutePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(absolutePath)) {
    let content = fs.readFileSync(absolutePath, 'utf8');
    
    // Replace import('${splitUrl}') with import(${JSON.stringify(splitUrl)})
    // Look for: import('${splitUrl}')
    content = content.replace(/import\('\$\{splitUrl\}'\)/g, 'import(${JSON.stringify(splitUrl)})');
    
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log('Patched', file);
  } else {
    console.log('File not found', file);
  }
}

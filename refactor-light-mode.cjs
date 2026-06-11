const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace white/5 with black/5
  content = content.replace(/white\/5/g, 'black/5');
  // Replace white/10 with black/10
  content = content.replace(/white\/10/g, 'black/10');
  // Replace white/20 with black/20
  content = content.replace(/white\/20/g, 'black/20');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('UI refactored for Light Mode');

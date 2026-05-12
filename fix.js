const fs = require('fs');
const path = require('path');
function fixImages(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImages(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const newContent = content.replace(/src=\{(img[a-zA-Z0-9_]+)\}/g, 'src={$1.src}');
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Fixed', fullPath);
      }
    }
  }
}
fixImages('c:\\CoastalTutor\\components\\imports');

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const files = execSync('git ls-files').toString().trim().split('\n');

for (const file of files) {
  if (file === 'migrate.js' || file.startsWith('.git')) continue;
  try {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(/OpenMAIC/g, 'CoastalTutor');
    content = content.replace(/openmaic/g, 'coastaltutor');
    content = content.replace(/OPENMAIC/g, 'COASTALTUTOR');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated ' + file);
    }
  } catch (e) {}
}

const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. First, remove the "Specific Plant Upload Box" from inside the currentPlants.map()
const uploadBoxRegex = /\{\/\* Specific Plant Upload Box \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
// Wait, regex might be tricky if indentation varies. I'll use a safer string replacement.

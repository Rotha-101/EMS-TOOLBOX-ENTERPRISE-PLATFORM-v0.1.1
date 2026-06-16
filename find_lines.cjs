const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes("activeTab === 'jscript'")) {
        console.log(`Line ${i + 1}: ${l}`);
    }
});

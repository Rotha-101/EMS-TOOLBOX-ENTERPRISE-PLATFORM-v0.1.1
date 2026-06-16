const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<Upload size=\{24\} className="mb-2 text-accent-blue opacity-70 pointer-events-none" \/>[\s\S]*?<div className="text-\[10px\] uppercase font-bold text-foreground\/70 pointer-events-none mb-3">Drop Archive Here<\/div>/, "");
content = content.replace(/onClick=\{\(\) => archiveInputRef\.current\?\.click\(\)\}\s*>\s*\)\}/, "onClick={() => archiveInputRef.current?.click()}\n              >\n              </div>");

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');

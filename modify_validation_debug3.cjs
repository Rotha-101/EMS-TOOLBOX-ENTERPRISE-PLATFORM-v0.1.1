const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("onClick={() => archiveInputRef.current?.click()}\n              >\n                \n                )}", "onClick={() => archiveInputRef.current?.click()}\n              >\n                {/* Drop Zone Area */}\n                <Upload size={24} className=\"mb-2 text-accent-blue opacity-70 pointer-events-none\" />\n                <div className=\"text-[10px] uppercase font-bold text-foreground/70 pointer-events-none mb-3\">Drop Archive Here</div>");

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');

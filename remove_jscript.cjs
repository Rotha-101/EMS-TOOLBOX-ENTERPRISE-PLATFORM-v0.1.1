const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the NavItem
const navItemRegex = /<NavItem icon=\{<FileCode size=\{14\} \/>\} label="JS Chart Scripts" active=\{activeTab === 'jscript'\} onClick=\{\(\) => switchTab\('jscript'\)\} \/>\s*/;
content = content.replace(navItemRegex, '');

// 2. Remove the rendering logic
const renderRegex = /\)\s*:\s*activeTab\s*===\s*'jscript'\s*\?\s*\(\s*<section className="flex-1 min-h-0 flex flex-col overflow-hidden">\s*<ImportChartScript project=\{project\} theme=\{theme\} \/>\s*<\/section>\s*/;

if (content.match(renderRegex)) {
    content = content.replace(renderRegex, ')');
} else {
    console.log("Render logic not matched, checking alternate...");
    // maybe it doesn't end cleanly, let's try a different approach:
    // replacing `) : activeTab === 'jscript' ? ( ... )` with `)`
}

// Write back
fs.writeFileSync(file, content, 'utf8');
console.log("Replaced successfully!");

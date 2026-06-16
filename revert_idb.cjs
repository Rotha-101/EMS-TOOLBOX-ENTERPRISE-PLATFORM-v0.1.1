const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/lib/audit-engine.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/async function saveProjectValidationData[\s\S]*?async function loadProjectValidationData[^{]*\{[\s\S]*?return null;\s*\}/, `
  async function saveProjectValidationData(projectId) {
    // DISABLED AGAIN: Storing the parsed gigabyte-scale data into IndexedDB causes 
    // V8 Out-Of-Memory crashes ("App closed by itself"). 
    // Structured clone cannot handle massive object graphs in browser RAM safely.
    return Promise.resolve();
  }

  async function loadProjectValidationData(projectId) {
    return null;
  }
`);

fs.writeFileSync(file, content, 'utf8');
console.log('Reverted successfully');

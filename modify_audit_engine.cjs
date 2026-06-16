const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/lib/audit-engine.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("async function hcBulkImport(rawList) {", "async function hcBulkImport(rawList, targetPlantId = null) {");
content = content.replace("await hcBulkImportInner(rawList);", "await hcBulkImportInner(rawList, targetPlantId);");
content = content.replace("async function hcBulkImportInner(rawList) {", "async function hcBulkImportInner(rawList, targetPlantId = null) {");

content = content.replace("const plantId = extractPlantId(o.path, o.file);", "const plantId = targetPlantId || extractPlantId(o.path, o.file);");

content = content.replace("async function hcCheckFile(o) {", "async function hcCheckFile(o, targetPlantId = null) {");
content = content.replace("plantId = extractPlantId(o.path, o.file);", "plantId = targetPlantId || extractPlantId(o.path, o.file);");
content = content.replace("const report  = await hcCheckFile(o); // probe result already cached", "const report  = await hcCheckFile(o, targetPlantId); // probe result already cached");

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');

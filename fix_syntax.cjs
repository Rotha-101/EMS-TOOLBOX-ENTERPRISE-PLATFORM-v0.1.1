const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/lib/audit-engine.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("  async function loadProjectValidationData(projectId) {\r\n    return null;\r\n  }\r\n\r\n  }\r\n\r\n\r\nasync function hcInitProjectsAsync() {", "  async function loadProjectValidationData(projectId) {\r\n    return null;\r\n  }\r\n\r\nasync function hcInitProjectsAsync() {");

content = content.replace("  async function loadProjectValidationData(projectId) {\n    return null;\n  }\n\n  }\n\n\nasync function hcInitProjectsAsync() {", "  async function loadProjectValidationData(projectId) {\n    return null;\n  }\n\nasync function hcInitProjectsAsync() {");

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');

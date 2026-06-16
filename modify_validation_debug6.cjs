const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("        </div>\n      </section>", "      </section>");

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');

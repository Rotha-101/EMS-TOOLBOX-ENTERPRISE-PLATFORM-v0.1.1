const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

let w96Index = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('w-96 border-r')) {
    w96Index = i;
    break;
  }
}

if (w96Index !== -1) {
  let divCount = 0;
  for (let i = w96Index; i < lines.length; i++) {
    let opens = (lines[i].match(/<div/g) || []).length;
    let closes = (lines[i].match(/<\/div>/g) || []).length;
    divCount += opens - closes;
    if (divCount === 0) {
      console.log(`w-96 div closes at line ${i}`);
      break;
    }
  }
}

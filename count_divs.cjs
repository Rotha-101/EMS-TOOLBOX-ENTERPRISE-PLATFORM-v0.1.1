const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

// A very naive script to count opening and closing div tags inside the return statement
let inReturn = false;
let divCount = 0;
let sectionCount = 0;

let lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('return (')) {
    inReturn = true;
  }
  if (inReturn) {
    let openDivs = (lines[i].match(/<div/g) || []).length;
    let closeDivs = (lines[i].match(/<\/div>/g) || []).length;
    divCount += openDivs - closeDivs;
    
    let openSec = (lines[i].match(/<section/g) || []).length;
    let closeSec = (lines[i].match(/<\/section>/g) || []).length;
    sectionCount += openSec - closeSec;
    
    if (lines[i].includes('</section>')) {
      console.log(`Line ${i+1}: div count is ${divCount}, section count is ${sectionCount}`);
    }
  }
}

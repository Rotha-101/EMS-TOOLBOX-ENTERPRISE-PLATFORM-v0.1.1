const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

// The problematic block:
//               })()}
//             </div>
//
//
//          </div>
//          
//          {/* Right area for Plant Category Grid */}

// We want to remove the extra closing </div> before Right area.
content = content.replace(
    /\s*\}\)\(\)\}\s*<\/div>\s*<\/div>\s*\{\/\* Right area for Plant Category Grid \*\/\}/,
    `
              })()}
            </div>
         
         {/* Right area for Plant Category Grid */}`
);

// Now we need to add the </div> back at the end of the file before </section>
content = content.replace(
    /\s*<\/section>\s*\);\s*\}/,
    `
         </div>
      </section>
  );
}`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed layout");

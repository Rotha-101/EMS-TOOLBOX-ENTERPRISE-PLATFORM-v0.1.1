const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the end of the file to remove the extra </div>
const oldStr = `           </div>\n        </div>\n      </section>\n    );\n  }\n`;
const newStr = `           </div>\n      </section>\n    );\n  }\n`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Replaced using standard \n");
} else {
  const oldStr2 = `           </div>\r\n        </div>\r\n      </section>\r\n    );\r\n  }\r\n`;
  const newStr2 = `           </div>\r\n      </section>\r\n    );\r\n  }\r\n`;
  if (content.includes(oldStr2)) {
    content = content.replace(oldStr2, newStr2);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Replaced using \r\n");
  } else {
    // Just regex it
    content = content.replace(/<\/div>\s*<\/div>\s*<\/section>/g, '</div>\n      </section>');
    fs.writeFileSync(file, content, 'utf8');
    console.log("Replaced using regex fallback");
  }
}

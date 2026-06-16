const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

const plantBoxCode = `
                      {/* Specific Plant Upload Box */}
                      <div className="border border-border-v border-dashed bg-background/20 rounded-md p-3 flex flex-col justify-center items-center min-h-[100px] hover:bg-background/40 hover:border-border-v/80 transition-colors">
                        <Upload size={24} className="mb-2 text-accent-blue opacity-70" />
                        <div className="text-[10px] uppercase font-bold text-foreground/70 mb-3">UPLOAD ARCHIVE</div>
                        <div className="flex gap-2 w-full">
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handlePlantUpload(plant.id, 'file'); }}
                            className="bg-accent-blue text-foreground hover:bg-blue-600 h-7 text-[9px] flex-1 font-bold px-0"
                            disabled={getHcBusy()}
                          >
                            File
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handlePlantUpload(plant.id, 'folder'); }}
                            variant="outline" 
                            className="border-border-v hover:bg-foreground/10 h-7 text-[9px] flex-1 text-foreground bg-transparent font-bold px-0"
                            disabled={getHcBusy()}
                          >
                            Folder
                          </Button>
                        </div>
                      </div>
                    </div>
`;

// It currently ends with:
//                          </div>
//                        );
//                      })}
//                    </div>

content = content.replace(/<\/div>\s*\);\s*\}\)\}\s*<\/div>/, "</div>\n                        );\n                      })}\n" + plantBoxCode);

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');

const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert handlePlantUpload
const handleUploadCode = `
  const handlePlantUpload = (plantId: string, type: 'file' | 'folder') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'hidden';
    if (type === 'folder') {
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
    } else {
      input.multiple = true;
      input.accept = '.zip,.rar,.7z,.xlsx,.csv';
    }
    input.onchange = async (e: any) => {
      const rawFiles = [...(e.target.files || [])];
      if (rawFiles.length === 0) return;
      const files = rawFiles.map(f => ({ file: f, path: f.webkitRelativePath || f.name }));
      
      const tStart = Date.now();
      try {
        setUploadMessage('');
        await hcBulkImport(files, plantId);
        const duration = ((Date.now() - tStart) / 1000).toFixed(1);
        setUploadMessage(\`Audit complete for \${plantId} in \${duration}s!\`);
        setTimeout(() => setUploadMessage(''), 8000);
      } catch (err: any) {
        setUploadMessage(\`Error: \${err.message || String(err)}\`);
      }
    };
    input.click();
  };
`;

content = content.replace("const formatHHMMSS = (secs: number) => {", handleUploadCode + "\n  const formatHHMMSS = (secs: number) => {");

// Remove the left sidebar upload block
content = content.replace(/<input \s*type="file"\s*ref=\{archiveInputRef\}[\s\S]*?<Upload size=\{24\} className="mb-2 text-accent-blue opacity-70 pointer-events-none" \/>\s*<div className="text-\[10px\] uppercase font-bold text-foreground\/70 pointer-events-none mb-3">Upload Archive<\/div>\s*<div className="flex gap-2 w-full pointer-events-auto">[\s\S]*?<\/div>\s*<\/div>/, "");

// Add the box at the end of HC_CATS.map
const plantBoxCode = `
                          </div>
                        );
                      })}
                      
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
`;

content = content.replace("</div>\n                        );\n                      })}", plantBoxCode);

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');

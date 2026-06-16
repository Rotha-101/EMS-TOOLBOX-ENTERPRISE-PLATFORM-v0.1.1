const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update handlePlantUpload signature
content = content.replace(
  `const handlePlantUpload = (plantId: string, type: 'file' | 'folder') => {`,
  `const handlePlantUpload = (plantId: string | null, type: 'file' | 'folder') => {`
);

// 2. Extract Specific Plant Upload Box block and remove it from inside the loop
const uploadBoxStr = `
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
                        </div>`;

const uploadBoxRegex = /\s*\{\/\* Specific Plant Upload Box \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
if(uploadBoxRegex.test(content)) {
    content = content.replace(uploadBoxRegex, '');
    console.log("Removed upload box from map loop.");
} else {
    console.log("Could not find upload box to remove using regex. Will try string matching.");
    if(content.includes(uploadBoxStr)) {
      content = content.replace(uploadBoxStr, '');
      console.log("Removed upload box using string matching.");
    }
}

// 3. Replace the Drag & Drop area with the global UPLOAD ARCHIVE box
const dragDropRegex = /\s*\{\/\* Left sidebar Drag & Drop \*\/\}[\s\S]*?<div[\s\S]*?archiveInputRef\.current\?\.click\(\)\}[\s\S]*?>\s*<\/div>/;

const newGlobalUploadBox = `
              {/* Global Upload Box */}
              <div 
                className={cn(
                  "mt-4 border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center transition-colors text-center shrink-0",
                  isDragging ? "bg-accent-blue/10 border-accent-blue/50" : "bg-background/20 hover:bg-background/40 border-border-v hover:border-border-v/80"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
              >
                <Upload size={24} className="mb-2 text-accent-blue opacity-70" />
                <div className="text-[10px] uppercase font-bold text-foreground/70 mb-3">UPLOAD ARCHIVE</div>
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={(e) => { e.stopPropagation(); handlePlantUpload(null, 'file'); }}
                    className="bg-accent-blue text-foreground hover:bg-blue-600 h-7 text-[9px] flex-1 font-bold px-0"
                    disabled={getHcBusy()}
                  >
                    File
                  </Button>
                  <Button 
                    onClick={(e) => { e.stopPropagation(); handlePlantUpload(null, 'folder'); }}
                    variant="outline" 
                    className="border-border-v hover:bg-foreground/10 h-7 text-[9px] flex-1 text-foreground bg-transparent font-bold px-0"
                    disabled={getHcBusy()}
                  >
                    Folder
                  </Button>
                </div>
              </div>`;

if(dragDropRegex.test(content)) {
    content = content.replace(dragDropRegex, newGlobalUploadBox);
    console.log("Replaced drag & drop area with global upload box.");
} else {
    console.log("Could not find drag & drop area with regex. Please investigate.");
}

fs.writeFileSync(file, content, 'utf8');
console.log("Done");

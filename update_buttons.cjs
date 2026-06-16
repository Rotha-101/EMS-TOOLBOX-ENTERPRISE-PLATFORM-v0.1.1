const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update handleDrop
const oldHandleDropStr = `    setUploadMessage('Files dropped successfully! Click RUN to start audit.');
    setTimeout(() => setUploadMessage(''), 5000);
  };`;

const newHandleDropStr = `    setUploadMessage('Processing dropped files...');
    const tStart = Date.now();
    try {
      await hcBulkImport(filesArray);
      const duration = ((Date.now() - tStart) / 1000).toFixed(1);
      setUploadMessage(\`Audit complete in \${duration}s! Preview all plants below.\`);
      setTimeout(() => setUploadMessage(''), 8000);
    } catch (err: any) {
      console.error('Drop import error:', err);
      setUploadMessage(\`Error: \${err.message || String(err)}\`);
    }
  };`;

content = content.replace(oldHandleDropStr, newHandleDropStr);

// 2. Remove RUN button and update button classes
// We will replace the whole `<div className="flex items-center gap-2">...</div>` block in the header.

const headerStart = `<div className="flex items-center gap-2">`;
const headerEndStr = `              CLEAR ALL DATA
            </Button>
        </div>`;

// Regex to capture from `<div className="flex items-center gap-2">` to `</Button>\n        </div>` inside the header
const headerRegex = /<div className="flex items-center gap-2">[\s\S]*?CLEAR ALL DATA\s*<\/Button>\s*<\/div>/;

const newHeaderHtml = `<div className="flex items-center gap-2">
          <Button 
            onClick={(e) => { e.stopPropagation(); handlePlantUpload(null, 'file'); }}
            className="bg-accent-blue text-foreground hover:bg-blue-600 h-7 text-[10px] font-bold px-6 shadow-none rounded-md"
            disabled={getHcBusy()}
          >
            File
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); handlePlantUpload(null, 'folder'); }}
            variant="outline" 
            className="border border-border-v bg-surface hover:bg-foreground/10 h-7 text-[10px] text-foreground font-bold px-6 shadow-none rounded-md"
            disabled={getHcBusy()}
          >
            Folder
          </Button>
          <Button 
            className="bg-red-600 text-white hover:bg-red-500 h-7 text-[10px] font-bold px-6 shadow-none rounded-md border-none"
            onClick={() => {
              hcForceStop();
              setProgress({ active: false, label: '', pct: 0 });
              setUploadMessage('Processing stopped by user.');
              setTimeout(() => setUploadMessage(''), 3000);
            }}
          >
            STOP
          </Button>
          <div className="w-[1px] h-4 bg-border-v mx-1"></div>
          <Button 
            className="bg-red-600 text-white hover:bg-red-500 h-7 text-[10px] font-bold px-6 shadow-none rounded-md border-none"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear ALL data for ALL plants?")) {
                hcClearPlantData(null, true);
                setUploadedFiles([]);
                setPendingFiles([]);
              }
            }}
          >
            CLEAR ALL DATA
          </Button>
        </div>`;

content = content.replace(headerRegex, newHeaderHtml);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated buttons successfully");

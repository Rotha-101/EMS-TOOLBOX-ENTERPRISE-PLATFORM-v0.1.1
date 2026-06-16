const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/components/ValidationDebug.tsx';
let content = fs.readFileSync(file, 'utf8');

let headerStart = content.indexOf('<div className="flex items-center gap-2">');
let clearAllDataIndex = content.indexOf('CLEAR ALL DATA', headerStart);

if (headerStart !== -1 && clearAllDataIndex !== -1) {
    let divEnd = content.indexOf('</div>', clearAllDataIndex);
    if (divEnd !== -1) {
        let beforeHeader = content.substring(0, headerStart);
        let afterHeader = content.substring(divEnd + 6); // +6 for '</div>'
        
        let newHeader = `<div className="flex items-center gap-2">
          <Button 
            onClick={(e) => { e.stopPropagation(); handlePlantUpload(null, 'file'); }}
            className="bg-accent-blue text-foreground hover:bg-blue-600 h-7 text-[10px] font-bold px-6 shadow-none rounded-sm border-none"
            disabled={getHcBusy()}
          >
            File
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); handlePlantUpload(null, 'folder'); }}
            className="border border-border-v bg-surface hover:bg-foreground/10 h-7 text-[10px] text-foreground font-bold px-6 shadow-none rounded-sm"
            disabled={getHcBusy()}
          >
            Folder
          </Button>
          <div className="w-px h-5 bg-border-v mx-1"></div>
          <Button 
            className="bg-red-600 text-white hover:bg-red-500 h-7 text-[10px] font-bold px-6 shadow-none rounded-sm border-none uppercase"
            onClick={() => {
              if (confirm('Are you sure you want to clear data for all plants?')) {
                currentPlants.forEach((plant: any) => hcClearPlantData(plant.id, true));
              }
            }}
          >
            CLEAR ALL DATA
          </Button>
        </div>`;
        
        content = beforeHeader + newHeader + afterHeader;
        fs.writeFileSync(file, content, 'utf8');
        console.log("Header replaced successfully, STOP button removed!");
    }
}

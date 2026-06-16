const fs = require('fs');
const file = 'c:/Users/USER/Desktop/0. CHEA Rotha/ESS_Project_V0.1-main - Copy/src/lib/audit-engine.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/async function saveProjectValidationData[\s\S]*?async function loadProjectValidationData[^{]*\{[\s\S]*?return null;\s*\}/, `
  async function saveProjectValidationData(projectId) {
    try {
      const db = await initValidationDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      // Strip raw File objects before saving to prevent IndexedDB quota/clone crashes
      // We keep file names and parsed reports so the UI and charts work perfectly on reload.
      const plants = hcByProject[projectId] || [];
      const serializablePlants = plants.map(p => {
        const safeFiles = {};
        for (const cat of HC_CATS) {
          safeFiles[cat.key] = (p.files[cat.key] || []).map(item => ({
            path: item.path,
            report: item.report,
            fileName: item.file ? item.file.name : (item.fileName || 'unknown.xlsx')
          }));
        }
        return {
          id: p.id,
          name: p.name,
          expected: p.expected,
          files: safeFiles
        };
      });
      
      store.put(serializablePlants, projectId);
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Failed to save project data to IndexedDB:', e);
    }
  }

  async function loadProjectValidationData(projectId) {
    try {
      const db = await initValidationDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(projectId);
      
      return new Promise((resolve, reject) => {
        req.onsuccess = () => {
          if (!req.result) return resolve(null);
          // Restore the data structure, inserting a dummy file object just in case
          const plants = req.result.map(p => {
            const restoredFiles = {};
            for (const cat of HC_CATS) {
              restoredFiles[cat.key] = (p.files[cat.key] || []).map(item => ({
                path: item.path,
                report: item.report,
                fileName: item.fileName,
                // Provide a dummy File object so destructuring doesn't crash, 
                // but raw zip export will not be able to read the arrayBuffer
                file: new File(["restored"], item.fileName || 'restored.xlsx')
              }));
            }
            return {
              id: p.id,
              name: p.name,
              expected: p.expected,
              files: restoredFiles
            };
          });
          resolve(plants);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to load project data from IndexedDB:', e);
      return null;
    }
  }
`);

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');


![Project Cover](./cover.png)
# DATA Visualization in ESS

This project is a standalone React + Vite application for ESS data visualization and analysis. It is no longer managed or deployed through AI Studio.

## Requirements

- Node.js 18+
- npm

# Project Architecture: ESS Toolbox V1

This document provides a detailed breakdown of the ESS Toolbox application architecture, detailing its component stack, data flow, and core systems.

## 1. High-Level Architecture

The ESS Toolbox is a cross-platform desktop application built using the **Electron** framework. It acts as a wrapper around a modern Single Page Application (SPA) built with **React**. 

- **Frontend Framework**: React 19 with TypeScript.
- **Build Tool**: Vite 6.
- **Desktop Environment**: Electron 42.
- **Styling**: Tailwind CSS v4, utilizing shadcn/ui components and Lucide React icons.

## 2. Directory Structure

- `electron/`: Contains the Electron main process code (`main.cjs`), preload scripts (`preload.cjs`), and native desktop integrations like MATLAB export (`matlabExport.cjs`).
- `src/`: Contains the React frontend application.
  - `components/`: UI components, including complex views like `DailyEvaluationGraph`, `CycleCalculation`, and `SmartReport`.
  - `lib/`: Core utilities, including the data ingestion engine (`audit-engine.js`), export utilities (`exportGraphs.ts`, `exportMatlab.ts`), and AI context providers.
  - `store/`: Zustand state management stores.
- `Mat code/`: Contains MATLAB scripts used for external data processing and `.fig` generation.

## 3. Core Modules and Data Flow

### State Management
The application uses **Zustand** (`src/store/useAppStore.ts`) for global state management. The state is persisted using `localStorage` (via Zustand's persist middleware) to maintain user preferences, active project settings, and UI states across sessions.

### Data Storage & Caching
- **IndexedDB**: Large evaluation datasets are stored in IndexedDB (Database: `ESS_Toolbox`, Store: `eval_data`) to prevent blocking the main thread and handling large data efficiently.
- **RAM Cache**: The application employs an in-memory cache (`evalDataCache` in Zustand) to bypass IndexedDB for instant data access when repeatedly viewing the same project.

### Data Ingestion and Processing
The `audit-engine.js` serves as the core ingestion engine.
- It parses raw data from XLSX, ZIP, RAR, and 7Z formats.
- It uses libraries like `xlsx`, `fflate`, and WebAssembly decoders for archiving.
- It converts the raw data into structured evaluation data and even formats it for MAT v5 file writing.

### Data Visualization
Data visualization is heavily reliant on **Plotly.js** (`react-plotly.js`). Components like `DailyEvaluationGraph.tsx` and `DynamicPlot.tsx` consume the processed evaluation data to render complex, multi-axis charts.

## 4. Key Integrations

### MATLAB Integration
The application bridges web technologies with MATLAB. 
- `src/lib/exportMatlab.ts` generates raw MATLAB scripts dynamically based on user data.
- Through Electron IPC (`ipcMain.handle('save-matlab-figures')`), the app interfaces with `matlabExport.cjs` to potentially invoke a local MATLAB installation and export native `.fig` files or ZIP bundles containing `.m` scripts and `.json` data.

### AI Agent
The application features an integrated AI assistant powered by the `@google/genai` SDK. 
- Context is managed via `src/lib/ai-context.tsx`.
- The AI has access to a set of defined tools (`src/lib/defaultTools.ts`) allowing it to interact with the dashboard, read KPIs, and provide insights.

## 5. Build and Distribution

The build process is orchestrated via Vite and Electron Builder.
- `npm run dev`: Starts Vite dev server.
- `npm run electron:dev`: Runs concurrently the Vite server and the Electron app.
- `npm run electron:build`: Builds the Vite app into `dist/` and runs `electron-builder` to package the app into a Windows NSIS installer, outputting to `dist-electron-v2/`.


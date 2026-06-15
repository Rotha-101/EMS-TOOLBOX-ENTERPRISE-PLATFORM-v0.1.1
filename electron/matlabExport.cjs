const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const os = require('os');

function toMatlabPath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/'/g, "''");
}

function findMatlabExecutable() {
  const candidates = [];

  if (process.env.MATLAB_ROOT) {
    candidates.push(path.join(process.env.MATLAB_ROOT, 'bin', process.platform === 'win32' ? 'matlab.exe' : 'matlab'));
  }

  if (process.platform === 'win32') {
    const programFiles = [
      process.env['ProgramFiles'],
      process.env['ProgramFiles(x86)'],
      'C:\\Program Files',
      'C:\\Program Files (x86)',
    ].filter(Boolean);

    for (const root of programFiles) {
      const matlabRoot = path.join(root, 'MATLAB');
      if (!fs.existsSync(matlabRoot)) continue;
      const releases = fs.readdirSync(matlabRoot)
        .filter((name) => /^R\d{4}[ab]$/.test(name))
        .sort()
        .reverse();
      for (const release of releases) {
        candidates.push(path.join(matlabRoot, release, 'bin', 'matlab.exe'));
      }
    }
  } else if (process.platform === 'darwin') {
    const appRoot = '/Applications';
    if (fs.existsSync(appRoot)) {
      const apps = fs.readdirSync(appRoot).filter((name) => name.startsWith('MATLAB_R'));
      for (const app of apps.sort().reverse()) {
        candidates.push(path.join(appRoot, app, 'bin', 'matlab'));
      }
    }
  } else {
    candidates.push('/usr/local/MATLAB/current/bin/matlab', '/usr/local/bin/matlab');
  }

  candidates.push('matlab');

  const seen = new Set();
  for (const candidate of candidates) {
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    if (candidate === 'matlab') return candidate;
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function getPlantsForProject(project) {
  return project === 'SNTL400' ? ['plant1', 'plant2'] : ['plant1', 'plant2', 'plant3'];
}

function plantLabel(pk) {
  if (pk === 'plant1') return 'SWG01';
  if (pk === 'plant2') return 'SWG02';
  return 'SWG03';
}

function buildPowerflowSection(pk, outFolder) {
  const label = plantLabel(pk);
  return `
    figPF_${pk} = figure('Name', '${label} | Powerflow Check', 'Visible', 'off', 'Color', 'w', 'Position', [100, 100, 1200, 800]);
    tlo_${pk} = tiledlayout(3, 1, 'TileSpacing', 'compact', 'Padding', 'compact');
    title(tlo_${pk}, '${label} | Powerflow Check', 'FontWeight', 'bold', 'FontSize', 12);

    ax1 = nexttile;
    yyaxis left; ax1.YColor = [0 0.4471 0.7412];
    plot(t, data.pTotal.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    ylabel('P (MW)'); grid on;
    yyaxis right; ax1.YColor = [0.851 0.3255 0.098];
    plot(t, data.freq.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.6);
    ylabel('F (Hz)');
    title('Frequency & Active Power');
    legend({'P total', 'Frequency'}, 'Location', 'northwest');
    xlim(ax1, [min(t) max(t)]);

    ax2 = nexttile;
    yyaxis left; ax2.YColor = [0 0.4471 0.7412];
    hold on;
    plot(t, data.pTotal.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    plot(t, data.remoteP.${pk}, 'Color', [0.451 0.1804 0.4], 'LineWidth', 1.6);
    ylabel('P (MW)'); grid on;
    yyaxis right; ax2.YColor = [0.851 0.3255 0.098];
    plot(t, data.soc.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.8);
    ylabel('SOC (%)');
    title('SOC & Active Power');
    legend({'P total', 'Remote Active Power', 'SOC'}, 'Location', 'northwest');
    xlim(ax2, [min(t) max(t)]);

    ax3 = nexttile;
    yyaxis left; ax3.YColor = [0 0.4471 0.7412];
    hold on;
    plot(t, data.vab.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    plot(t, data.vbc.${pk}, 'Color', [0.4667 0.6745 0.1882], 'LineWidth', 1.6);
    plot(t, data.vca.${pk}, 'Color', [0.4941 0.1843 0.5569], 'LineWidth', 1.6);
    ylabel('V (kV)'); grid on;
    yyaxis right; ax3.YColor = [0.851 0.3255 0.098];
    plot(t, data.qTotal.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.8);
    stairs(t, data.cmdQ.${pk}, 'Color', [0 0 0], 'LineWidth', 1.2, 'LineStyle', '--');
    ylabel('Q (MVar)');
    title('Reactive Power & Voltage');
    legend({'Vab', 'Vbc', 'Vca', 'Q total', 'Q cmd'}, 'Location', 'northwest');
    formatAxis(ax1, t, false); formatAxis(ax2, t, false); formatAxis(ax3, t, true);

    linkaxes([ax1, ax2, ax3], 'x');
    set(figPF_${pk}, 'Visible', 'on');
    savefig(figPF_${pk}, fullfile(outFolder, '${label}_Powerflow_Check.fig'));
    close(figPF_${pk});
`;
}

function buildAllPlantsSection(plants, metric, outFolder) {
  const isSoc = metric === 'soc_p' || metric === 'fig5';
  const title = isSoc ? 'Active Power & SOC (All Plants)' : 'Volt & Reactive Power (All Plants)';
  const figVar = isSoc ? 'figSOC_All' : 'figVQ_All';
  const axVar = isSoc ? 'axsSOC' : 'axsVQ';
  const figFile = isSoc ? 'Active_Power_SOC_All_Plants.fig' : 'Volt_Reactive_Power_All_Plants.fig';

  let section = `
    ${figVar} = figure('Name', '${title}', 'Visible', 'off', 'Color', 'w', 'Position', [100, 100, 1200, 800]);
    tlo = tiledlayout(${plants.length}, 1, 'TileSpacing', 'compact', 'Padding', 'compact');
    title(tlo, '${title}', 'FontWeight', 'bold', 'FontSize', 12);
    ${axVar} = [];
`;

  plants.forEach((pk, i) => {
    if (isSoc) {
      section += `
    ax = nexttile; ${axVar} = [${axVar}, ax];
    yyaxis left; ax.YColor = [0 0.4471 0.7412]; hold on;
    plot(t, data.pTotal.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    plot(t, data.remoteP.${pk}, 'Color', [0.451 0.1804 0.4], 'LineWidth', 1.6);
    ylabel('P (MW)');
    yyaxis right; ax.YColor = [0.851 0.3255 0.098];
    plot(t, data.soc.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.8);
    ylabel('SOC (%)');
    legend({'P total', 'Remote Active Power', 'SOC'}, 'Location', 'northwest');
    grid on; title('Plant: ${pk}');
    formatAxis(ax, t, ${i === plants.length - 1 ? 'true' : 'false'});
`;
    } else {
      section += `
    ax = nexttile; ${axVar} = [${axVar}, ax];
    yyaxis left; hold on;
    plot(t, data.vab.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    plot(t, data.vbc.${pk}, 'Color', [0.4667 0.6745 0.1882], 'LineWidth', 1.6);
    plot(t, data.vca.${pk}, 'Color', [0.4941 0.1843 0.5569], 'LineWidth', 1.6);
    ylabel('V (kV)');
    yyaxis right;
    plot(t, data.qTotal.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.8);
    stairs(t, data.cmdQ.${pk}, 'Color', [0 0 0], 'LineWidth', 1.2);
    ylabel('Q (MVar)');
    legend({'Vab', 'Vbc', 'Vca', 'Q total', 'Q cmd'}, 'Location', 'northeastoutside');
    grid on; title('Plant: ${pk}');
    formatAxis(ax, t, ${i === plants.length - 1 ? 'true' : 'false'});
`;
    }
  });

  section += `
    linkaxes(${axVar}, 'x');
    set(${figVar}, 'Visible', 'on');
    savefig(${figVar}, fullfile(outFolder, '${figFile}'));
    close(${figVar});
`;
  return section;
}

function buildGenericAllPlantsSection(plants, metric, outFolder) {
  const titles = {
    f_p: ['Frequency & Active Power All Plants', 'Freq_Active_Power_All_Plants.fig'],
    soc_p: ['SOC & Active Power All Plants', 'SOC_Active_Power_All_Plants.fig'],
    v_q: ['Reactive Power & Voltage All Plants', 'Reactive_Power_Voltage_All_Plants.fig'],
  };
  const [title, figFile] = titles[metric];
  const figVar = `fig_${metric}`;
  const axVar = `axs_${metric}`;

  let section = `
    ${figVar} = figure('Name', '${title}', 'Visible', 'off', 'Color', 'w', 'Position', [100, 100, 1200, 800]);
    tlo = tiledlayout(${plants.length}, 1, 'TileSpacing', 'compact', 'Padding', 'compact');
    title(tlo, '${title}', 'FontWeight', 'bold', 'FontSize', 12);
    ${axVar} = [];
`;

  plants.forEach((pk, i) => {
    if (metric === 'f_p') {
      section += `
    ax = nexttile; ${axVar} = [${axVar}, ax];
    yyaxis left; ax.YColor = [0 0.4471 0.7412]; hold on;
    plot(t, data.pTotal.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    ylabel('P (MW)');
    yyaxis right; ax.YColor = [0.851 0.3255 0.098];
    plot(t, data.freq.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.6);
    ylabel('F (Hz)');
    legend({'P total', 'Freq'}, 'Location', 'northwest');
    grid on; title('Plant: ${pk}');
    formatAxis(ax, t, ${i === plants.length - 1 ? 'true' : 'false'});
`;
    } else if (metric === 'soc_p') {
      section += `
    ax = nexttile; ${axVar} = [${axVar}, ax];
    yyaxis left; ax.YColor = [0 0.4471 0.7412]; hold on;
    plot(t, data.pTotal.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    plot(t, data.remoteP.${pk}, 'Color', [0.451 0.1804 0.4], 'LineWidth', 1.6);
    ylabel('P (MW)');
    yyaxis right; ax.YColor = [0.851 0.3255 0.098];
    plot(t, data.soc.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.8);
    ylabel('SOC (%)');
    legend({'P total', 'Remote Active Power', 'SOC'}, 'Location', 'northwest');
    grid on; title('Plant: ${pk}');
    formatAxis(ax, t, ${i === plants.length - 1 ? 'true' : 'false'});
`;
    } else {
      section += `
    ax = nexttile; ${axVar} = [${axVar}, ax];
    yyaxis left; ax.YColor = [0 0.4471 0.7412]; hold on;
    plot(t, data.vab.${pk}, 'Color', [0 0.4471 0.7412], 'LineWidth', 2);
    plot(t, data.vbc.${pk}, 'Color', [0.4667 0.6745 0.1882], 'LineWidth', 1.6);
    plot(t, data.vca.${pk}, 'Color', [0.4941 0.1843 0.5569], 'LineWidth', 1.6);
    ylabel('V (kV)');
    yyaxis right; ax.YColor = [0.851 0.3255 0.098];
    plot(t, data.qTotal.${pk}, 'Color', [0.851 0.3255 0.098], 'LineWidth', 1.8);
    stairs(t, data.cmdQ.${pk}, 'Color', [0 0 0], 'LineWidth', 1.2, 'LineStyle', '--');
    ylabel('Q (MVar)');
    legend({'Vab', 'Vbc', 'Vca', 'Q total', 'Q cmd'}, 'Location', 'northwest');
    grid on; title('Plant: ${pk}');
    formatAxis(ax, t, ${i === plants.length - 1 ? 'true' : 'false'});
`;
    }
  });

  section += `
    linkaxes(${axVar}, 'x');
    set(${figVar}, 'Visible', 'on');
    savefig(${figVar}, fullfile(outFolder, '${figFile}'));
    close(${figVar});
`;
  return section;
}

function getExpectedFigFiles(project) {
  const plants = getPlantsForProject(project);
  const files = plants.map((pk) => `${plantLabel(pk)}_Powerflow_Check.fig`);

  if (project === 'SNTL400' || project === 'SNTL600') {
    files.push('Active_Power_SOC_All_Plants.fig', 'Volt_Reactive_Power_All_Plants.fig');
  } else {
    files.push(
      'Freq_Active_Power_All_Plants.fig',
      'SOC_Active_Power_All_Plants.fig',
      'Reactive_Power_Voltage_All_Plants.fig',
      ...plants.map((pk) => `${plantLabel(pk)}_Powerflow_Check.fig`)
    );
  }

  return [...new Set(files)];
}

function buildMatlabScript(project, jsonPath, outputFolder) {
  const plants = getPlantsForProject(project);
  const outFolder = toMatlabPath(outputFolder);
  const dataFile = toMatlabPath(jsonPath);

  let body = `
dataFilename = '${dataFile}';
fid = fopen(dataFilename, 'r');
if fid < 0
    error('Could not open evalData.json at %s', dataFilename);
end
raw = fread(fid, '*char')';
fclose(fid);
data = jsondecode(raw);

if ~isfield(data, 'timestamps')
    error('evalData.json is missing timestamps.');
end

t = datetime(data.timestamps, 'InputFormat', 'yyyy-MM-dd''T''HH:mm:ss.SSSZ', 'TimeZone', 'UTC');
t.TimeZone = 'local';
outFolder = '${outFolder}';
if ~exist(outFolder, 'dir')
    mkdir(outFolder);
end
`;

  if (project === 'SNTL400' || project === 'SNTL600') {
    for (const pk of plants) {
      body += buildPowerflowSection(pk, outFolder);
    }
    body += buildAllPlantsSection(plants, 'fig5', outFolder);
    body += buildAllPlantsSection(plants, 'fig6', outFolder);
  } else {
    body += buildGenericAllPlantsSection(plants, 'f_p', outFolder);
    body += buildGenericAllPlantsSection(plants, 'soc_p', outFolder);
    body += buildGenericAllPlantsSection(plants, 'v_q', outFolder);
    for (const pk of plants) {
      body += buildPowerflowSection(pk, outFolder);
    }
  }

  return `${body}
disp('ESS Toolbox MATLAB export completed successfully.');

% Helper function to format axes
function formatAxis(ax, t, showLabels)
    xlim(ax, [min(t) max(t)]);
    try
        ax.XTick = dateshift(min(t), 'start', 'minute', 0) : minutes(30) : max(t);
    catch
    end
    if showLabels
        xtickformat(ax, 'HH:mm');
        xtickangle(ax, 45);
    else
        xticklabels(ax, {});
    end
end
`;
}

function runMatlabBatch(matlabExe, scriptPath) {
  const matlabPath = toMatlabPath(scriptPath);
  const args = ['-batch', `try; run('${matlabPath}'); catch ME; disp(getReport(ME)); exit(1); end; exit(0);`];

  return new Promise((resolve) => {
    execFile(matlabExe, args, {
      windowsHide: true,
      timeout: 10 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? (error.message || String(error)) : null,
      });
    });
  });
}

async function exportMatlabFigures({ outputZip, project, evalData }) {
  if (!outputZip) {
    return { success: false, error: 'Invalid or missing output ZIP path.' };
  }
  if (!evalData || !evalData.timestamps) {
    return { success: false, error: 'No evaluation data available for MATLAB export.' };
  }

  const matlabExe = findMatlabExecutable();
  if (!matlabExe) {
    return {
      success: false,
      error: 'MATLAB was not found. Install MATLAB or set MATLAB_ROOT, then rebuild/relaunch the desktop app.',
    };
  }

  const tmpDir = path.join(os.tmpdir(), 'ess_toolbox_matlab_export_' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const jsonPath = path.join(tmpDir, 'evalData.json');
  const scriptPath = path.join(tmpDir, 'export_figures.m');

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(evalData, null, 2));
    fs.writeFileSync(scriptPath, buildMatlabScript(project, jsonPath, tmpDir), 'utf8');

    const result = await runMatlabBatch(matlabExe, scriptPath);
    const expectedFiles = getExpectedFigFiles(project);
    const createdFiles = expectedFiles.filter((name) => fs.existsSync(path.join(tmpDir, name)));

    if (!result.ok) {
      return {
        success: false,
        error: [
          'MATLAB export failed.',
          `MATLAB: ${matlabExe}`,
          result.stderr || result.error || 'Unknown MATLAB execution error.',
          result.stdout ? `Output:\n${result.stdout.trim()}` : '',
        ].filter(Boolean).join('\n\n'),
      };
    }

    if (createdFiles.length === 0) {
      return {
        success: false,
        error: [
          'MATLAB finished but no .fig files were created.',
          `MATLAB: ${matlabExe}`,
          result.stdout ? `Output:\n${result.stdout.trim()}` : 'No MATLAB output was captured.',
        ].join('\n\n'),
      };
    }

    // Zip everything in tmpDir
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    zip.addLocalFolder(tmpDir);
    zip.writeZip(outputZip);

    return {
      success: true,
      matlabExe,
      files: createdFiles,
      outputFolder: outputZip,
      output: result.stdout.trim(),
    };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

module.exports = {
  exportMatlabFigures,
  findMatlabExecutable,
  getExpectedFigFiles,
};

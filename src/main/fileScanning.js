const { ipcMain, dialog, app } = require('electron');
const { VirusTotalService } = require('./virusTotal.js');
const fs = require('fs');
const path = require('path');

const virusTotal = new VirusTotalService();

// Path for storing scan history
const historyFilePath = path.join(app.getPath('userData'), 'scan-history.json');

// Load scan history from file or initialize empty array
function loadScanHistory() {
    try {
        if (fs.existsSync(historyFilePath)) {
            const historyData = fs.readFileSync(historyFilePath, 'utf8');
            return JSON.parse(historyData);
        }
    } catch (error) {
        console.error('Error loading scan history:', error);
    }
    return [];
}

// Save scan history to file
function saveScanHistory(history) {
    try {
        const historyDir = path.dirname(historyFilePath);
        if (!fs.existsSync(historyDir)) {
            fs.mkdirSync(historyDir, { recursive: true });
        }
        fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving scan history:', error);
    }
}

let scanHistory = loadScanHistory();

function setupFileScanningHandlers() {
    // Handle file selection
    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });

    // Handle file scanning
    ipcMain.handle('scan-file', async (_, filePath) => {
        try {
            console.log('Starting scan for file:', filePath);
            const scanResults = await virusTotal.scanFile(filePath);
            const analysis = virusTotal.analyzeScanResults(scanResults);
            
            const fileName = path.basename(filePath);
            
            const scanResult = {
                ...analysis,
                permalink: scanResults.permalink,
                scan_date: scanResults.scan_date,
                sha256: scanResults.sha256,
                file_name: fileName
            };
            
            // Add to scan history and save
            scanHistory.unshift(scanResult);
            // Keep only the last 50 entries
            if (scanHistory.length > 50) {
                scanHistory = scanHistory.slice(0, 50);
            }
            saveScanHistory(scanHistory);
            
            console.log('Scan complete, results saved to history');
            
            return {
                success: true,
                data: scanResult
            };
        } catch (error) {
            console.error('Error scanning file:', error);
            return {
                success: false,
                error: error.message || 'Failed to scan file'
            };
        }
    });

    // Get scan history
    ipcMain.handle('get-scan-history', async () => {
        return scanHistory;
    });
}

module.exports = { setupFileScanningHandlers };
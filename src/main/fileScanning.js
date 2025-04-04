const { ipcMain, dialog } = require('electron');
const { VirusTotalService } = require('./virusTotal.js');

const virusTotal = new VirusTotalService();

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
            const scanResults = await virusTotal.scanFile(filePath);
            const analysis = virusTotal.analyzeScanResults(scanResults);
            
            return {
                success: true,
                data: {
                    ...analysis,
                    permalink: scanResults.permalink,
                    scan_date: scanResults.scan_date,
                    sha256: scanResults.sha256,
                    file_name: filePath.split('/').pop()
                }
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
        // TODO: Implement scan history persistence
        return [];
    });
}

module.exports = { setupFileScanningHandlers };
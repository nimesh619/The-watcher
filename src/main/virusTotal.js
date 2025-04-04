const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const FormData = require('form-data');

const VIRUSTOTAL_API_KEY = 'ff94a0661c30f80e1c59c7ca4453d49e7fc72dad368df9a307e3ab5b495cfc5f';
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/vtapi/v2';

class VirusTotalService {
    async getFileHash(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', error => reject(error));
        });
    }

    async scanFile(filePath) {
        try {
            console.log('Starting file scan:', filePath);
            // First check if file has been scanned before
            const fileHash = await this.getFileHash(filePath);
            console.log('File hash:', fileHash);
            
            const existingReport = await this.getReport(fileHash);
            console.log('Existing report status:', existingReport.response_code);
            
            if (existingReport.response_code === 1) {
                console.log('Found existing scan results');
                return existingReport;
            }

            // If not scanned before, upload for scanning
            console.log('Uploading file for scanning...');
            const formData = new FormData();
            formData.append('apikey', VIRUSTOTAL_API_KEY);
            formData.append('file', fs.createReadStream(filePath));

            const uploadResponse = await axios.post(`${VIRUSTOTAL_API_URL}/file/scan`, formData, {
                headers: {
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity,
                timeout: 30000 // 30 seconds for upload
            });

            console.log('File uploaded, scan ID:', uploadResponse.data.scan_id);

            // Wait for scan to complete
            return await this.pollResults(uploadResponse.data.scan_id);
        } catch (error) {
            console.error('Error in scanFile:', error.message);
            if (error.response) {
                console.error('API Response:', error.response.data);
            }
            throw error;
        }
    }

    async getReport(fileHash) {
        try {
            const response = await axios.get(`${VIRUSTOTAL_API_URL}/file/report`, {
                params: {
                    apikey: VIRUSTOTAL_API_KEY,
                    resource: fileHash
                },
                timeout: 10000 // 10 seconds timeout
            });
            return response.data;
        } catch (error) {
            console.error('Error getting report:', error.message);
            throw error;
        }
    }

    async pollResults(scanId, maxAttempts = 20, delaySeconds = 10) {
        console.log('Polling for results...');
        for (let i = 0; i < maxAttempts; i++) {
            try {
                console.log(`Polling attempt ${i + 1}/${maxAttempts}`);
                const report = await this.getReport(scanId);
                
                if (report.response_code === 1) {
                    console.log('Scan completed');
                    return report;
                }
                
                // Wait between attempts
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            } catch (error) {
                console.error(`Error in polling attempt ${i + 1}:`, error.message);
                if (i === maxAttempts - 1) throw error;
            }
        }
        throw new Error(`Scan timed out after ${maxAttempts} attempts`);
    }

    analyzeScanResults(results) {
        const detectedBy = [];
        let detections = 0;
        const total = Object.keys(results.scans).length;

        for (const [scanner, result] of Object.entries(results.scans)) {
            if (result.detected) {
                detections++;
                detectedBy.push(`${scanner} (${result.result})`);
            }
        }

        // Determine threat level based on detection ratio
        let threatLevel = 'normal';
        const detectionRatio = detections / total;

        if (detectionRatio > 0.7) {
            threatLevel = 'danger';
        } else if (detectionRatio > 0.3) {
            threatLevel = 'warning';
        }

        return {
            threatLevel,
            detections,
            total,
            detectedBy
        };
    }
}

module.exports = { VirusTotalService };
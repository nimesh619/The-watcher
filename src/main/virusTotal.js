const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const FormData = require('form-data');

const VIRUSTOTAL_API_KEY = 'ff94a0661c30f80e1c59c7ca4453d49e7fc72dad368df9a307e3ab5b495cfc5f';
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';

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
            
            // Check if file has been analyzed before
            const existingReport = await this.getReport(fileHash);
            
            if (existingReport) {
                console.log('Found existing scan results');
                return existingReport;
            }

            // If not scanned before, upload for scanning
            console.log('Uploading file for scanning...');
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const uploadResponse = await axios.post(`${VIRUSTOTAL_API_URL}/files`, formData, {
                headers: {
                    'x-apikey': VIRUSTOTAL_API_KEY,
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity,
                timeout: 60000 // 60 seconds for upload
            });

            const analysisId = uploadResponse.data.data.id;
            console.log('File uploaded, analysis ID:', analysisId);

            // Get the analysis link from the response
            if (uploadResponse.data.data.type === 'analysis') {
                return await this.pollAnalysisResults(analysisId, fileHash);
            } else {
                // If we didn't get an analysis object directly, check if there's a link to it
                if (uploadResponse.data.data.links && uploadResponse.data.data.links.self) {
                    // Extract the analysis ID from the URL
                    const analysisUrl = uploadResponse.data.data.links.self;
                    const urlAnalysisId = analysisUrl.split('/').pop();
                    return await this.pollAnalysisResults(urlAnalysisId, fileHash);
                }
            }
            
            // Fallback to polling by file hash if we couldn't get a specific analysis ID
            return await this.pollResults(fileHash);
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
            const response = await axios.get(`${VIRUSTOTAL_API_URL}/files/${fileHash}`, {
                headers: {
                    'x-apikey': VIRUSTOTAL_API_KEY
                },
                timeout: 10000 // 10 seconds timeout
            });
            
            // Check if the analysis is complete
            if (response.data.data.attributes.last_analysis_results) {
                return this.formatReport(response.data);
            }
            return null;
        } catch (error) {
            // If file not found (404), return null instead of throwing
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error('Error getting report:', error.message);
            throw error;
        }
    }

    async pollResults(fileHash, maxAttempts = 20, delaySeconds = 15) {
        console.log('Polling for analysis results...');
        for (let i = 0; i < maxAttempts; i++) {
            try {
                console.log(`Polling attempt ${i + 1}/${maxAttempts}`);
                
                // Get the current analysis status
                const response = await axios.get(`${VIRUSTOTAL_API_URL}/analyses/${fileHash}`, {
                    headers: {
                        'x-apikey': VIRUSTOTAL_API_KEY
                    }
                });
                
                const status = response.data.data.attributes.status;
                
                if (status === 'completed') {
                    console.log('Analysis completed');
                    // Now get the full file report
                    const fileReport = await this.getReport(fileHash);
                    if (fileReport) {
                        return fileReport;
                    }
                } else if (status === 'queued' || status === 'in-progress') {
                    console.log(`Analysis ${status}, waiting...`);
                } else {
                    console.log(`Unknown status: ${status}`);
                    break;
                }
                
                // Wait between attempts
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            } catch (error) {
                console.error(`Error in polling attempt ${i + 1}:`, error.message);
                if (error.response) {
                    console.error('API Response:', error.response.data);
                }
                
                if (i === maxAttempts - 1) throw error;
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            }
        }
        
        // After max attempts, try to get whatever results are available
        const finalReport = await this.getReport(fileHash);
        if (finalReport) return finalReport;
        
        throw new Error(`Analysis timed out after ${maxAttempts} attempts`);
    }

    async pollAnalysisResults(analysisId, fileHash, maxAttempts = 20, delaySeconds = 15) {
        console.log('Polling for analysis results with analysis ID:', analysisId);
        
        for (let i = 0; i < maxAttempts; i++) {
            try {
                console.log(`Polling attempt ${i + 1}/${maxAttempts}`);
                
                // Get the current analysis status using the analysis ID
                const response = await axios.get(`${VIRUSTOTAL_API_URL}/analyses/${analysisId}`, {
                    headers: {
                        'x-apikey': VIRUSTOTAL_API_KEY
                    }
                });
                
                const status = response.data.data.attributes.status;
                
                if (status === 'completed') {
                    console.log('Analysis completed');
                    
                    // If the response contains a link to the file, use that to get the full report
                    if (response.data.meta && response.data.meta.file_info) {
                        const resultFileHash = response.data.meta.file_info.sha256;
                        console.log('Analysis linked to file hash:', resultFileHash);
                        
                        // Get the full report using the file hash
                        const fileReport = await this.getReport(resultFileHash || fileHash);
                        if (fileReport) {
                            return fileReport;
                        }
                    } else {
                        // Get the full report using the original file hash
                        const fileReport = await this.getReport(fileHash);
                        if (fileReport) {
                            return fileReport;
                        }
                    }
                } else if (status === 'queued' || status === 'in-progress') {
                    console.log(`Analysis ${status}, waiting...`);
                } else {
                    console.log(`Unknown status: ${status}`);
                    break;
                }
                
                // Wait between attempts
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            } catch (error) {
                console.error(`Error in polling attempt ${i + 1}:`, error.message);
                if (error.response) {
                    console.error('API Response:', error.response.data);
                }
                
                if (i === maxAttempts - 1) throw error;
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            }
        }
        
        // After max attempts, try to get whatever results are available
        const finalReport = await this.getReport(fileHash);
        if (finalReport) return finalReport;
        
        throw new Error(`Analysis timed out after ${maxAttempts} attempts`);
    }

    formatReport(apiResponse) {
        const data = apiResponse.data;
        const attributes = data.attributes;
        const analysisResults = attributes.last_analysis_results;
        
        // Format the results to match the expected structure
        // Handle possible invalid date by using current date if analysis_date is invalid
        let scanDate;
        try {
            // Check if the timestamp is valid
            if (attributes.last_analysis_date && !isNaN(attributes.last_analysis_date)) {
                scanDate = new Date(attributes.last_analysis_date * 1000).toISOString();
            } else {
                console.log('Invalid analysis date, using current date');
                scanDate = new Date().toISOString();
            }
        } catch (error) {
            console.log('Error parsing date, using current date:', error);
            scanDate = new Date().toISOString();
        }
        
        return {
            scan_id: data.id,
            sha256: data.id,
            resource: data.id,
            response_code: 1, // VirusTotal v2 compatibility
            scan_date: scanDate,
            permalink: `https://www.virustotal.com/gui/file/${data.id}`,
            verbose_msg: 'Scan finished',
            total: Object.keys(analysisResults).length,
            positives: Object.values(analysisResults).filter(r => r.category === 'malicious').length,
            scans: Object.entries(analysisResults).reduce((acc, [name, result]) => {
                acc[name] = {
                    detected: result.category === 'malicious',
                    version: result.engine_version || '',
                    result: result.result || 'clean',
                    update: result.engine_update || ''
                };
                return acc;
            }, {})
        };
    }

    analyzeScanResults(results) {
        const detectedBy = [];
        const detections = results.positives;
        const total = results.total;

        for (const [scanner, result] of Object.entries(results.scans)) {
            if (result.detected) {
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
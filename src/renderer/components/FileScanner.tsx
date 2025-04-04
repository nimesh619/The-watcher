import React, { useState } from 'react';

interface ScanResult {
    threatLevel: 'normal' | 'warning' | 'danger';
    detections: number;
    total: number;
    detectedBy: string[];
    permalink: string;
    scan_date: string;
    sha256: string;
    file_name: string;
}

interface FileScannerProps {
    onScanComplete: (result: ScanResult) => void;
}

const FileScanner: React.FC<FileScannerProps> = ({ onScanComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [progressStage, setProgressStage] = useState<string>('');

    const handleFileSelect = async () => {
        try {
            const filePath = await window.api.selectFile();
            if (filePath) {
                setCurrentFile(filePath);
                await scanFile(filePath);
            }
        } catch (err) {
            setError('Failed to select file');
            console.error('File selection error:', err);
        }
    };

    const scanFile = async (filePath: string) => {
        try {
            setIsScanning(true);
            setError(null);
            setProgress(0);
            setProgressStage('Calculating file hash...');
            
            // Simulate progress updates (in a real app, these would come from the main process)
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 95) {
                        // Update the stage based on progress
                        if (prev === 10) setProgressStage('Uploading file to VirusTotal...');
                        if (prev === 40) setProgressStage('Analyzing file...');
                        if (prev === 70) setProgressStage('Getting results...');
                        return prev + 1;
                    }
                    return prev;
                });
            }, 500);

            const result = await window.api.scanFile(filePath);
            
            clearInterval(progressInterval);
            setProgress(100);
            setProgressStage('Scan completed');
            
            if (result.success && result.data) {
                onScanComplete(result.data);
            } else {
                setError(result.error || 'Scan failed');
            }
        } catch (err: any) {
            setError(`Failed to scan file: ${err.message || 'Unknown error'}`);
            console.error('Scanning error:', err);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="file-scanner">
            <div className="flex-row gap-2 mb-4">
                <button 
                    className="control-button primary-button"
                    onClick={handleFileSelect}
                    disabled={isScanning}
                >
                    <i className="fa fa-upload mr-2"></i>
                    Select File for Scanning
                </button>
            </div>

            {currentFile && (
                <div className="flex-col gap-2">
                    <div className="file-info">
                        <i className="fa fa-file mr-2"></i>
                        {currentFile.split('\\').pop()}
                    </div>

                    {isScanning && (
                        <div className="scanning-indicator">
                            <div className="flex-col w-full gap-1">
                                <div className="flex-row justify-between">
                                    <span>{progressStage}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="error-message">
                    <i className="fa fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            )}

            {!currentFile && !error && (
                <div className="text-center py-4">
                    <i className="fa fa-cloud-upload-alt text-4xl mb-2"></i>
                    <div>Select a file to scan it for potential threats</div>
                </div>
            )}
        </div>
    );
};

export default FileScanner;
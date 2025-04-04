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

            const result = await window.api.scanFile(filePath);
            
            if (result.success && result.data) {
                onScanComplete(result.data);
            } else {
                setError(result.error || 'Scan failed');
            }
        } catch (err) {
            setError('Failed to scan file');
            console.error('Scanning error:', err);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div>
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
                        {currentFile.split('/').pop()}
                    </div>

                    {isScanning && (
                        <div className="scanning-indicator">
                            <div className="spinner"></div>
                            <span>Scanning file... This may take a few minutes</span>
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
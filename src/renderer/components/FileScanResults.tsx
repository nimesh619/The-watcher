import React from 'react';

interface ScanResult {
  fileName: string;
  fileSize: number;
  hash: string;
  threatLevel: 'clean' | 'suspicious' | 'malicious' | 'unknown';
  detectionRatio?: string;
  scanDate: Date;
  reportLink?: string;
}

interface FileScanResultsProps {
  result: ScanResult | null;
}

const FileScanResults: React.FC<FileScanResultsProps> = ({ result }) => {
  if (!result) return null;

  const getThreatLevelClass = () => {
    switch (result.threatLevel) {
      case 'clean':
        return 'active';
      case 'suspicious':
        return 'warning';
      case 'malicious':
        return 'danger';
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openExternalLink = (url: string) => {
    // In a real app, this would use Electron's shell to open URLs
    window.open(url, '_blank');
  };

  return (
    <div className="panel mb-2">
      <div className="panel-header">
        <div className="panel-title">File Scan Results</div>
        <div className="flex-row gap-1">
          <span className={`status-indicator ${getThreatLevelClass()}`}></span>
          <span className="text-uppercase">
            {result.threatLevel === 'clean' && 'Safe'}
            {result.threatLevel === 'suspicious' && 'Suspicious'}
            {result.threatLevel === 'malicious' && 'Malicious'}
            {result.threatLevel === 'unknown' && 'Unknown'}
          </span>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="flex-col gap-1">
          <div className="flex-row mb-1">
            <strong className="mr-2">File Name:</strong>
            <span>{result.fileName}</span>
          </div>
          
          <div className="flex-row mb-1">
            <strong className="mr-2">File Size:</strong>
            <span>{formatFileSize(result.fileSize)}</span>
          </div>
          
          <div className="flex-row mb-1">
            <strong className="mr-2">SHA-256 Hash:</strong>
            <span className="hash-value">{result.hash}</span>
          </div>
          
          {result.detectionRatio && (
            <div className="flex-row mb-1">
              <strong className="mr-2">Detection Ratio:</strong>
              <span>{result.detectionRatio}</span>
            </div>
          )}
          
          <div className="flex-row mb-1">
            <strong className="mr-2">Scan Date:</strong>
            <span>{result.scanDate.toLocaleString()}</span>
          </div>
          
          {result.reportLink && (
            <div className="flex-row mt-3">
              <button 
                className="control-button" 
                onClick={() => openExternalLink(result.reportLink as string)}
              >
                <i className="fa fa-external-link-alt"></i>
                View Full Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileScanResults;
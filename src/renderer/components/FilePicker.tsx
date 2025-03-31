import React, { useState } from "react";
import FileScanner from "./FileScanner";
import FileScanResults from "./FileScanResults";

interface ScanResult {
  fileName: string;
  fileSize: number;
  hash: string;
  threatLevel: 'clean' | 'suspicious' | 'malicious' | 'unknown';
  detectionRatio?: string;
  scanDate: Date;
  reportLink?: string;
}

const FilePicker: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setScanResult(null); // Reset previous results
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setScanResult(null); // Reset previous results
    }
  };

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
  };

  return (
    <div className="panel mb-2">
      <div className="panel-header">
        <div className="panel-title">File Scanner</div>
        <div className="flex-row gap-1">
          <i className="fa fa-file-medical-alt"></i>
          <span>VirusTotal Analysis</span>
        </div>
      </div>
      
      <div className="panel-content">
        <div 
          className={`file-drop-zone ${isDragging ? 'dragging' : ''}`} 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-drop-content">
            <i className="fa fa-file-upload fa-2x mb-1"></i>
            <p>Drag & drop a file here, or</p>
            <label className="file-select-button">
              <span className="control-button">
                <i className="fa fa-folder-open"></i>
                Browse Files
              </span>
              <input 
                type="file" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
          
          {selectedFile && (
            <div className="selected-file">
              <div className="file-info">
                <i className="fa fa-file"></i>
                <span>{selectedFile.name}</span>
              </div>
              <button 
                className="control-button"
                onClick={() => setSelectedFile(null)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
          )}
        </div>
        
        {selectedFile && <FileScanner fileToScan={selectedFile} onScanComplete={handleScanComplete} />}
        
        {scanResult && <FileScanResults result={scanResult} />}
      </div>
    </div>
  );
};

export default FilePicker;


import React from 'react';

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

interface ScanResultsProps {
    result: ScanResult;
}

const ScanResults: React.FC<ScanResultsProps> = ({ result }) => {
    return (
        <div className="scan-results">
            <div className="scan-results-header">
                <div className={`detection-count ${result.threatLevel}`}>
                    <i className={`fa ${
                        result.threatLevel === 'normal' ? 'fa-shield-alt' :
                        result.threatLevel === 'warning' ? 'fa-exclamation-triangle' :
                        'fa-skull-crossbones'
                    } mr-2`}></i>
                    {result.detections} / {result.total} Detections
                </div>
            </div>

            <div className="scan-details">
                <div className="scan-detail-item">
                    <div className="scan-detail-label">File Name</div>
                    <div>{result.file_name}</div>
                </div>

                <div className="scan-detail-item">
                    <div className="scan-detail-label">Scan Date</div>
                    <div>{new Date(result.scan_date).toLocaleString()}</div>
                </div>

                <div className="scan-detail-item">
                    <div className="scan-detail-label">SHA256</div>
                    <div className="text-sm font-mono">{result.sha256}</div>
                </div>

                <div className="scan-detail-item">
                    <div className="scan-detail-label">VirusTotal Link</div>
                    <a 
                        href={result.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                    >
                        View Full Report
                    </a>
                </div>
            </div>

            {result.detections > 0 && (
                <div>
                    <div className="text-lg mb-2">Detections</div>
                    <div className="detections-list">
                        {result.detectedBy.map((detection, index) => (
                            <div key={index} className="detection-item">
                                {detection}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanResults;
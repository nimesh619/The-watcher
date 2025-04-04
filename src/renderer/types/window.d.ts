export {};

declare global {
    interface Window {
        api: {
            // Window controls
            minimizeWindow: () => void;
            maximizeWindow: () => void;
            closeWindow: () => void;

            // File scanning
            selectFile: () => Promise<string | null>;
            scanFile: (filePath: string) => Promise<{
                success: boolean;
                data?: {
                    threatLevel: 'normal' | 'warning' | 'danger';
                    detections: number;
                    total: number;
                    detectedBy: string[];
                    permalink: string;
                    scan_date: string;
                    sha256: string;
                    file_name: string;
                };
                error?: string;
            }>;
            getScanHistory: () => Promise<any[]>;
        };
    }
}
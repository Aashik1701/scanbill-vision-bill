
import React from 'react';
import { DetectedObject } from '@/types';

interface DetectionOverlayProps {
  detections: DetectedObject[];
}

const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ detections }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {detections.map((detection) => {
        // Convert normalized coordinates to percentages
        const [x1, y1, x2, y2] = detection.bbox;
        const left = `${x1 * 100}%`;
        const top = `${y1 * 100}%`;
        const width = `${(x2 - x1) * 100}%`;
        const height = `${(y2 - y1) * 100}%`;
        
        const confidencePercent = Math.round(detection.confidence * 100);
        
        return (
          <div
            key={detection.id}
            className="absolute border-2 border-scangreen-400"
            style={{ left, top, width, height }}
          >
            <div className="absolute -top-6 left-0 bg-scangreen-400 text-white text-xs px-2 py-1 rounded-t-md whitespace-nowrap">
              {detection.class} ({confidencePercent}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DetectionOverlay;

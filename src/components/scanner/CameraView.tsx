
import React, { useRef, useEffect, useState } from 'react';
import { startCamera, stopCamera } from '@/utils/camera';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DetectionOverlay from './DetectionOverlay';
import { DetectedObject } from '@/types';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  onProductDetected?: (detectedObject: DetectedObject) => void;
  className?: string;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  onProductDetected,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock detections - to be replaced with actual YOLOv8 model
  const [mockDetections, setMockDetections] = useState<DetectedObject[]>([]);
  
  const simulateDetection = () => {
    // Mock detection of random products
    const products = ['apple', 'banana', 'orange', 'milk', 'bread'];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    const newDetection: DetectedObject = {
      id: Math.random().toString(36).substring(7),
      class: randomProduct,
      confidence: 0.7 + Math.random() * 0.3,
      bbox: [
        Math.random() * 0.4, 
        Math.random() * 0.4, 
        0.6 + Math.random() * 0.4, 
        0.6 + Math.random() * 0.4
      ]
    };
    
    setMockDetections(prev => [...prev.slice(-4), newDetection]);
    
    if (onProductDetected) {
      onProductDetected(newDetection);
    }
  };
  
  useEffect(() => {
    let detectionInterval: number | null = null;
    
    if (isActive) {
      // Simulating detections every 3 seconds
      detectionInterval = window.setInterval(simulateDetection, 3000) as unknown as number;
    }
    
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isActive, onProductDetected]);
  
  const handleStartCamera = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newStream = await startCamera(videoRef.current);
      if (newStream) {
        setStream(newStream);
        setIsActive(true);
      } else {
        setError('Could not start camera stream');
      }
    } catch (err) {
      setError('Error accessing camera: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopCamera = () => {
    stopCamera(stream);
    setStream(null);
    setIsActive(false);
    setMockDetections([]);
  };
  
  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopCamera(stream);
    };
  }, [stream]);

  return (
    <div className={cn("relative rounded-md overflow-hidden bg-black flex items-center justify-center", className)}>
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <DetectionOverlay detections={mockDetections} />
          
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button 
              onClick={handleStopCamera}
              variant="destructive"
              size="icon"
              className="rounded-full"
            >
              <CameraOff className="h-5 w-5" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          {error ? (
            <div className="text-destructive mb-4">{error}</div>
          ) : (
            <div className="text-muted-foreground mb-4">
              Camera is currently disabled
            </div>
          )}
          
          <Button
            onClick={handleStartCamera}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Camera className="h-5 w-5 mr-2" />
            )}
            {isLoading ? "Starting Camera..." : "Start Camera"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraView;

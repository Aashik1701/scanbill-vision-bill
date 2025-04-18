import React, { useRef, useEffect, useState } from 'react';
import { startCamera, stopCamera, takeSnapshot } from '@/utils/camera';
import { loadModel, detectObjects } from '@/services/modelService';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  
  // Load YOLOv8 model
  useEffect(() => {
    const initModel = async () => {
      const success = await loadModel();
      setIsModelLoaded(success);
      if (!success) {
        setError('Failed to load object detection model');
      }
    };
    
    initModel();
  }, []);
  
  // Run detection on video frames
  useEffect(() => {
    if (!isActive || !isModelLoaded || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    
    const detectFrame = async () => {
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detect objects
      const newDetections = await detectObjects(imageData);
      setDetections(newDetections);
      
      // If we have a new detection with high confidence, notify parent
      if (newDetections.length > 0 && onProductDetected) {
        // Find detection with highest confidence
        const bestDetection = newDetections.reduce((best, current) => 
          current.confidence > best.confidence ? current : best, newDetections[0]);
        
        if (bestDetection.confidence > 0.7) {
          onProductDetected(bestDetection);
        }
      }
      
      // Continue detection loop
      animationFrameId = requestAnimationFrame(detectFrame);
    };
    
    // Start detection loop
    animationFrameId = requestAnimationFrame(detectFrame);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, isModelLoaded, onProductDetected]);
  
  const handleStartCamera = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newStream = await startCamera(videoRef.current);
      if (newStream) {
        setStream(newStream);
        setIsActive(true);
        
        // Set canvas dimensions to match video
        if (canvasRef.current && videoRef.current) {
          const { videoWidth, videoHeight } = videoRef.current;
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
        }
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
    setDetections([]);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera(stream);
    };
  }, [stream]);

  return (
    <div className={cn("relative rounded-md overflow-hidden bg-black flex items-center justify-center", className)}>
      {/* Video element for camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${!isActive ? 'hidden' : ''}`}
      />
      
      {/* Canvas for processing (hidden) */}
      <canvas 
        ref={canvasRef}
        className="hidden" 
      />
      
      {isActive ? (
        <>
          <DetectionOverlay detections={detections} />
          
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
              {isModelLoaded ? " (Model loaded)" : " (Loading model...)"}
            </div>
          )}
          
          <Button
            onClick={handleStartCamera}
            disabled={isLoading || !isModelLoaded}
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

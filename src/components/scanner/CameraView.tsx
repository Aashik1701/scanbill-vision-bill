
import React, { useRef, useEffect, useState } from 'react';
import { startCamera, stopCamera, takeSnapshot } from '@/utils/camera';
import { loadModel, detectObjects } from '@/services/modelService';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DetectionOverlay from './DetectionOverlay';
import { DetectedObject } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

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
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const { toast } = useToast();
  
  // Detection cooldown in milliseconds (to prevent duplicate detections)
  const DETECTION_COOLDOWN = 1500;
  
  // Load YOLOv8 model
  useEffect(() => {
    const initModel = async () => {
      try {
        const success = await loadModel();
        setIsModelLoaded(success);
        if (!success) {
          setError('Failed to load object detection model');
        } else {
          toast({
            title: "Model Loaded",
            description: "Object detection model is ready",
          });
        }
      } catch (err) {
        console.error("Model loading error:", err);
        setError('Failed to load model: ' + (err as Error).message);
        setIsModelLoaded(false);
      }
    };
    
    initModel();
  }, [toast]);
  
  // Run detection on video frames
  useEffect(() => {
    if (!isActive || !isModelLoaded || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let lastProcessedTime = 0;
    const PROCESSING_INTERVAL = 100; // Process every 100ms for efficiency
    
    const detectFrame = async (timestamp: number) => {
      // Throttle processing to improve performance
      if (timestamp - lastProcessedTime > PROCESSING_INTERVAL) {
        lastProcessedTime = timestamp;
        
        // Ensure video is playing and has valid dimensions
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
          // Set canvas dimensions to match video
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          
          // Draw current video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            // Get image data for processing
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Detect objects
            const newDetections = await detectObjects(imageData);
            setDetections(newDetections);
            
            // Notify parent component of high-confidence detections
            const currentTime = Date.now();
            if (newDetections.length > 0 && onProductDetected && currentTime - lastDetectionTime > DETECTION_COOLDOWN) {
              // Find detection with highest confidence
              const bestDetection = newDetections.reduce((best, current) => 
                current.confidence > best.confidence ? current : best, newDetections[0]);
              
              if (bestDetection.confidence > 0.5) {
                onProductDetected(bestDetection);
                setLastDetectionTime(currentTime);
              }
            }
          } catch (err) {
            console.error("Detection error:", err);
          }
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
  }, [isActive, isModelLoaded, onProductDetected, lastDetectionTime]);
  
  const handleStartCamera = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newStream = await startCamera(videoRef.current);
      if (newStream) {
        setStream(newStream);
        setIsActive(true);
        
        toast({
          title: "Camera Active",
          description: "Point your camera at products to scan them",
        });
        
        // Set canvas dimensions to match video once video metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        };
      } else {
        setError('Could not start camera stream');
        toast({
          title: "Camera Error",
          description: "Could not access camera",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Error accessing camera: ' + (err as Error).message);
      toast({
        title: "Camera Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopCamera = () => {
    stopCamera(stream);
    setStream(null);
    setIsActive(false);
    setDetections([]);
    toast({
      title: "Camera Stopped",
      description: "Camera has been turned off",
    });
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
      
      {/* Canvas for processing */}
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

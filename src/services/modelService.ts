// Mock implementation of ONNX runtime
import { DetectedObject } from '@/types';

export async function loadModel() {
  console.log('Mock model loaded successfully');
  return true;
}

export async function detectObjects(imageData: ImageData): Promise<DetectedObject[]> {
  // Generate random detections for testing
  const mockClasses = ['apple', 'banana', 'orange', 'milk', 'bread'];
  const randomClass = mockClasses[Math.floor(Math.random() * mockClasses.length)];
  
  return [{
    id: Math.random().toString(36).substring(7),
    class: randomClass,
    confidence: 0.7 + Math.random() * 0.3,
    bbox: [0.2, 0.2, 0.8, 0.8]
  }];
}
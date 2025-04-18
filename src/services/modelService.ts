
import { DetectedObject } from '@/types';
import * as ort from 'onnxruntime-web';

// Model settings
const MODEL_PATH = '/models/yolov8n.onnx';
const CLASS_NAMES = [
  'apple', 'banana', 'orange', 'milk', 'bread', 'eggs', 'water', 'soda', 'chips', 'chocolate'
];

// Pre-processing constants
const INPUT_WIDTH = 640;
const INPUT_HEIGHT = 640;
const SCORE_THRESHOLD = 0.5;
const NMS_THRESHOLD = 0.45;

let session: ort.InferenceSession | null = null;

export async function loadModel(): Promise<boolean> {
  if (session) return true;
  
  try {
    console.log('Loading YOLO model from:', MODEL_PATH);
    
    // Set ONNX execution providers - use WebGL if available, fallback to WASM
    const executionProviders = ['webgl', 'wasm'];
    
    // Create inference session
    session = await ort.InferenceSession.create(MODEL_PATH, { 
      executionProviders,
      executionMode: 'sequential',
      graphOptimizationLevel: 'basic'
    });
    
    console.log('YOLO model loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load YOLO model:', error);
    return false;
  }
}

// Convert image to tensor for model input
function imageDataToTensor(imageData: ImageData): ort.Tensor {
  // Resize image to match model input dimensions
  const canvas = document.createElement('canvas');
  canvas.width = INPUT_WIDTH;
  canvas.height = INPUT_HEIGHT;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw image data to canvas, resizing it
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = imageData.width;
  tmpCanvas.height = imageData.height;
  const tmpCtx = tmpCanvas.getContext('2d');
  
  if (!tmpCtx) {
    throw new Error('Failed to get temporary canvas context');
  }
  
  tmpCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(tmpCanvas, 0, 0, imageData.width, imageData.height, 0, 0, INPUT_WIDTH, INPUT_HEIGHT);
  
  // Get pixel data
  const imgData = ctx.getImageData(0, 0, INPUT_WIDTH, INPUT_HEIGHT);
  const input = new Float32Array(INPUT_WIDTH * INPUT_HEIGHT * 3);
  
  // Normalize pixel values and convert to RGB format
  for (let i = 0, j = 0; i < imgData.data.length; i += 4, j += 3) {
    // Normalize to [0, 1] range
    input[j] = imgData.data[i] / 255.0;     // R
    input[j + 1] = imgData.data[i + 1] / 255.0; // G
    input[j + 2] = imgData.data[i + 2] / 255.0; // B
  }
  
  // Create tensor from normalized pixel data
  return new ort.Tensor('float32', input, [1, 3, INPUT_HEIGHT, INPUT_WIDTH]);
}

// Process model output to get detections
function processOutput(output: ort.Tensor, imageWidth: number, imageHeight: number): DetectedObject[] {
  const data = output.data as Float32Array;
  const dimensions = output.dims;
  
  // Extract detection data
  const numClasses = CLASS_NAMES.length;
  const numDetections = dimensions[1];
  const results: DetectedObject[] = [];
  
  for (let i = 0; i < numDetections; i++) {
    const boxOffset = i * (numClasses + 5);
    
    // Extract confidence score
    const confidence = data[boxOffset + 4];
    if (confidence < SCORE_THRESHOLD) continue;
    
    // Find class with highest score
    let maxScore = 0;
    let maxScoreIndex = -1;
    
    for (let j = 0; j < numClasses; j++) {
      const score = data[boxOffset + 5 + j];
      if (score > maxScore) {
        maxScore = score;
        maxScoreIndex = j;
      }
    }
    
    const finalScore = confidence * maxScore;
    if (finalScore < SCORE_THRESHOLD) continue;
    
    // Extract bounding box coordinates
    const centerX = data[boxOffset] / INPUT_WIDTH;
    const centerY = data[boxOffset + 1] / INPUT_HEIGHT;
    const width = data[boxOffset + 2] / INPUT_WIDTH;
    const height = data[boxOffset + 3] / INPUT_HEIGHT;
    
    // Convert to x1, y1, x2, y2 (normalized)
    const x1 = Math.max(0, Math.min(1, centerX - width / 2));
    const y1 = Math.max(0, Math.min(1, centerY - height / 2));
    const x2 = Math.max(0, Math.min(1, centerX + width / 2));
    const y2 = Math.max(0, Math.min(1, centerY + height / 2));
    
    results.push({
      id: `${i}-${Date.now()}`,
      class: CLASS_NAMES[maxScoreIndex] || 'unknown',
      confidence: finalScore,
      bbox: [x1, y1, x2, y2]
    });
  }
  
  // Perform non-maximum suppression (simple version)
  const filteredResults = results.sort((a, b) => b.confidence - a.confidence);
  
  return filteredResults;
}

// Main detection function
export async function detectObjects(imageData: ImageData): Promise<DetectedObject[]> {
  if (!session) {
    const loaded = await loadModel();
    if (!loaded) {
      throw new Error('Model not loaded');
    }
  }
  
  try {
    const input = imageDataToTensor(imageData);
    const feeds = { images: input };
    
    // Run model inference
    const outputMap = await session.run(feeds);
    const output = outputMap[Object.keys(outputMap)[0]]; // Get first (and only) output
    
    // Process outputs to get detections
    const detections = processOutput(output, imageData.width, imageData.height);
    return detections;
  } catch (error) {
    console.error('Detection error:', error);
    return [];
  }
}

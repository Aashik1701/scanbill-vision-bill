// Camera utility functions
export const startCamera = async (videoEl: HTMLVideoElement): Promise<MediaStream | null> => {
  try {
    console.log('Attempting to access camera...');
    
    // Try multiple constraint options
    const constraintOptions = [
      { video: true },
      { video: { facingMode: 'user' } },
      { video: { facingMode: 'environment' } },
      { video: { width: 640, height: 480 } }
    ];
    
    let stream = null;
    let lastError = null;
    
    // Try each constraint until one works
    for (const constraints of constraintOptions) {
      try {
        console.log('Trying constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Success with constraints:', constraints);
        break;
      } catch (error) {
        console.log('Failed with constraints:', constraints, error);
        lastError = error;
      }
    }
    
    if (!stream) {
      throw lastError || new Error("All camera constraint options failed");
    }
    
    console.log('Camera access granted!', stream);
    videoEl.srcObject = stream;
    return stream;
  } catch (error) {
    console.error('Detailed camera error:', error);
    return null;
  }
};

export const stopCamera = (stream: MediaStream | null): void => {
  if (!stream) return;
  
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
};

export const takeSnapshot = (videoEl: HTMLVideoElement): string | null => {
  if (!videoEl) return null;
  
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg');
};

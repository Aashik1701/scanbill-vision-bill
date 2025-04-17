
// Camera utility functions
export const startCamera = async (videoEl: HTMLVideoElement): Promise<MediaStream | null> => {
  try {
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment'
      }
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.srcObject = stream;
    return stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
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

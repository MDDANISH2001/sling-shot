import { useState } from 'react';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

export interface CameraState {
  photo: string | null;
  isCapturing: boolean;
  error: string | null;
}

export const useCamera = () => {
  const [state, setState] = useState<CameraState>({
    photo: null,
    isCapturing: false,
    error: null,
  });

  const capturePhoto = async () => {
    setState(prev => ({ ...prev, isCapturing: true, error: null }));

    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        direction: CameraDirection.Front, // Front-facing camera for selfie
        saveToGallery: false,
      });

      const base64Image = `data:image/${photo.format};base64,${photo.base64String}`;

      setState({
        photo: base64Image,
        isCapturing: false,
        error: null,
      });

      return base64Image;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture photo';
      setState({
        photo: null,
        isCapturing: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const clearPhoto = () => {
    setState({
      photo: null,
      isCapturing: false,
      error: null,
    });
  };

  const retakePhoto = async () => {
    clearPhoto();
    return await capturePhoto();
  };

  return {
    ...state,
    capturePhoto,
    clearPhoto,
    retakePhoto,
  };
};

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";
import "./Registration.css";

export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCheckingIP, setIsCheckingIP] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkIPConfiguration = async () => {
    try {
      const { value: savedIP } = await Preferences.get({ key: "socket_ip" });
      
      if (!savedIP) {
        // No IP configured, redirect to settings
        navigate('/ip-settings');
        return;
      }
    } catch (error) {
      console.error("Error checking IP configuration:", error);
    } finally {
      setIsCheckingIP(false);
    }
  };

  useEffect(() => {
    checkIPConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!photo && !isCheckingIP) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [photo, isCheckingIP]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1080, height: 1080 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const x = (video.videoWidth - size) / 2;
    const y = (video.videoHeight - size) / 2;
    ctx.drawImage(video, x, y, size, size, 0, 0, 1080, 1080);

    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
  };

  const handleCapturePhoto = async () => {
    setIsCapturing(true);
    try {
      if (videoRef.current && streamRef.current) {
        captureFromVideo();
      } else {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          width: 1080,
          height: 1080,
        });
        setPhoto(image.dataUrl || null);
      }
    } catch (err) {
      console.error("Photo capture error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => setPhoto(null);

  const handleContinue = () => {
    if (!photo) return;
    navigate("/user-info", { state: { selfie: photo } });
  };

  if (isCheckingIP) {
    return (
      <div className="registration-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <button 
        className="settings-icon-button" 
        onClick={() => navigate('/ip-settings')}
        title="Server Settings"
      >
        ⚙️
      </button>
      
      <img src="/logo.png" alt="Logo" className="logo" />
      
      {!photo && (
        <h2 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '20px',
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          📸 Smile for the Camera!
        </h2>
      )}
      
      <div className="camera-section">
        {!photo ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
            <button
              onClick={handleCapturePhoto}
              disabled={isCapturing}
              className="capture-button"
            >
              {isCapturing ? "..." : "●"}
            </button>
          </>
        ) : (
          <>
            <img src={photo} alt="Selfie" className="photo-preview" />
            <div className="button-group">
              <button onClick={retakePhoto} className="retake-button">
                🔄 Retake
              </button>
              <button onClick={handleContinue} className="continue-button">
                Continue 🎯
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

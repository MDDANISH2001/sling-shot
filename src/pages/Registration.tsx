import React, { useState, useRef, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initializeSocket } from '../utils/socket';

export const Registration: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastThrowTime = useRef(0);
  const socket = useRef(initializeSocket());

  // Auto-enable motion for Android
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS && typeof DeviceMotionEvent !== 'undefined') {
      setMotionEnabled(true);
      toast.info('Motion sensors ready! 📱');
    }
  }, []);

  // Request motion permission (iOS)
  const requestMotionPermission = async () => {
    console.log('Requesting motion permission...');
    try {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setMotionEnabled(true);
          toast.success('Motion enabled! 🎯');
        } else {
          toast.error('Permission denied');
        }
      } else {
        setMotionEnabled(true);
        toast.success('Motion enabled! 🎯');
      }
    } catch (error) {
      console.error('Permission error:', error);
      toast.error('Error: ' + String(error));
    }
  };

  // Motion detection
  useEffect(() => {
    if (!motionEnabled) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;

      const { x = 0, y = 0, z = 0 } = accel;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      // Pull back
      if (y < -8 && !isCharging && (now - lastThrowTime.current) > 2000) {
        setIsCharging(true);
        toast.info('🎯 Release to launch!', { autoClose: 1000 });
      }

      // Throw
      if (magnitude > 20 && y > 5 && isCharging) {
        handleThrow();
        setIsCharging(false);
        lastThrowTime.current = now;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [motionEnabled, isCharging]);

  // Send message
  const handleThrow = async () => {
    if (!photo || !name.trim() || !message.trim()) {
      toast.warning('Complete all fields! 📝');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    toast.info('🚀 Launching...');

    try {
      socket.current.emit('send-message', {
        image: photo,
        userName: name.trim(),
        message: message.trim(),
      });

      socket.current.once('message-sent', () => {
        toast.success('Launched! 🎉');
        setTimeout(() => {
          setName('');
          setMessage('');
          setPhoto(null);
          setIsSubmitting(false);
        }, 1500);
      });

      socket.current.once('error', (err: { message: string }) => {
        toast.error('Failed: ' + err.message);
        setIsSubmitting(false);
      });
    } catch (error) {
      toast.error('Error sending');
      setIsSubmitting(false);
    }
  };

  // Camera
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Camera not supported');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        toast.success('Camera ready! 📸');
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied');
      } else {
        toast.error('Camera error');
      }
      console.error(error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    setPhoto(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
    toast.success('Captured! 📸');
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsCameraOn(false);
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleThrow();
  };

  return (
    <>
      <ToastContainer position="top-center" theme="colored" />
      
      <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
        isCharging ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
        isSubmitting ? 'bg-gradient-to-br from-green-400 to-blue-500' :
        'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">🎯 Sling Shot</h1>
          <p className="text-center text-gray-600 mb-6">Capture, compose, and throw!</p>

          {/* Debug Info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs space-y-1">
            <p>Device: {isMobile ? 'Mobile ✅' : 'Desktop 💻'}</p>
            <p>Motion: {motionEnabled ? 'Enabled ✅' : 'Disabled ❌'}</p>
            <p>HTTPS: {window.location.protocol === 'https:' ? 'Yes ✅' : 'No ❌'}</p>
          </div>

          {/* Motion Permission */}
          {isMobile && !motionEnabled && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-800 mb-3 text-center">
                📱 Tap to enable throw gesture
              </p>
              <button
                onClick={requestMotionPermission}
                type="button"
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 font-semibold"
              >
                Enable Motion Sensors
              </button>
            </div>
          )}

          {/* Motion Status */}
          {motionEnabled && isMobile && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-sm text-green-800 text-center font-medium">
                ✅ Motion sensors active
              </p>
            </div>
          )}

          {/* Photo Section */}
          <div className="mb-6">
            {!photo && !isCameraOn && (
              <button
                onClick={startCamera}
                className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2"
              >
                <span>📷</span> Take Photo
              </button>
            )}

            {isCameraOn && (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg mb-3 bg-black"
                />
                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                  >
                    📸 Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {photo && (
              <div>
                <img src={photo} alt="Captured" className="w-full rounded-lg mb-3" />
                <button
                  onClick={retakePhoto}
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                  disabled={isSubmitting}
                >
                  🔄 Retake Photo
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Instructions */}
            {isMobile && motionEnabled && photo && name && message && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">🎯 Ready to Launch!</h3>
                <ol className="text-sm text-blue-800 space-y-1 pl-5 list-decimal">
                  <li>Pull phone <strong>backward</strong></li>
                  <li>Throw <strong>forward</strong> rapidly! 🚀</li>
                </ol>
              </div>
            )}

            {/* Manual Submit for Desktop */}
            {!isMobile && (
              <button
                type="submit"
                disabled={!photo || !name.trim() || !message.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Sending...' : '🚀 Send Message'}
              </button>
            )}
          </form>
        </div>

        {/* Charging Indicator */}
        {isCharging && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-9xl animate-pulse">🎯</div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

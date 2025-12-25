import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import './Registration.css';

export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { photo, isCapturing, error, capturePhoto, retakePhoto } = useCamera();
  
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCapturePhoto = async () => {
    try {
      await capturePhoto();
    } catch (err) {
      console.error('Photo capture error:', err);
    }
  };

  const handleStartSlingshot = () => {
    // Validate inputs
    if (!name.trim()) {
      setValidationError('Please enter your name');
      return;
    }
    if (!message.trim()) {
      setValidationError('Please enter a message');
      return;
    }
    if (!photo) {
      setValidationError('Please capture a selfie');
      return;
    }

    // Navigate to slingshot screen with user data
    navigate('/slingshot', {
      state: {
        name: name.trim(),
        message: message.trim(),
        selfie: photo,
      },
    });
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="header">
          <h1 className="title">🎯 Slingshot</h1>
          <p className="subtitle">Get ready to shoot your message!</p>
        </div>

        {/* Selfie Section */}
        <div className="photo-section">
          {!photo ? (
            <button
              onClick={handleCapturePhoto}
              disabled={isCapturing}
              className="photo-button"
            >
              {isCapturing ? (
                <>
                  <span className="spinner"></span>
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <span className="icon">📷</span>
                  <span>Take Selfie</span>
                </>
              )}
            </button>
          ) : (
            <div className="photo-preview">
              <img src={photo} alt="Your selfie" className="selfie-image" />
              <button onClick={retakePhoto} className="retake-button">
                🔄 Retake Photo
              </button>
            </div>
          )}
          {error && <p className="error-text">Camera error: {error}</p>}
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="input-group">
            <label htmlFor="name" className="label">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setValidationError('');
              }}
              placeholder="Enter your name"
              className="input"
              maxLength={50}
            />
          </div>

          <div className="input-group">
            <label htmlFor="message" className="label">
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setValidationError('');
              }}
              placeholder="Write your message here..."
              className="textarea"
              rows={4}
              maxLength={200}
            />
            <p className="char-count">{message.length}/200</p>
          </div>

          {validationError && (
            <div className="validation-error">
              <span className="icon">⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          <button
            onClick={handleStartSlingshot}
            disabled={!name.trim() || !message.trim() || !photo}
            className="submit-button"
          >
            <span className="icon">🚀</span>
            <span>Start Slingshot</span>
          </button>
        </div>

        <div className="footer-text">
          <p>📱 Pull your phone back and release to shoot!</p>
        </div>
      </div>
    </div>
  );
};

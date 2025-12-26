import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
import "./IPSettings.css";

export const IPSettings: React.FC = () => {
  const navigate = useNavigate();
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("3001");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    loadSavedIP();
  }, []);

  const loadSavedIP = async () => {
    try {
      const { value: savedIP } = await Preferences.get({ key: "socket_ip" });
      const { value: savedPort } = await Preferences.get({ key: "socket_port" });
      
      if (savedIP) {
        setIpAddress(savedIP);
      }
      if (savedPort) {
        setPort(savedPort);
      }
    } catch (error) {
      console.error("Error loading saved IP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!ipAddress.trim()) {
      setSaveStatus("Please enter a valid IP address");
      return;
    }

    try {
      await Preferences.set({ key: "socket_ip", value: ipAddress.trim() });
      await Preferences.set({ key: "socket_port", value: port.trim() });
      setSaveStatus("Settings saved successfully!");
      
      setTimeout(() => {
        navigate(-1); // Go back to previous screen
      }, 1000);
    } catch (error) {
      console.error("Error saving IP:", error);
      setSaveStatus("Error saving settings");
    }
  };

  if (loading) {
    return (
      <div className="ip-settings-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ip-settings-container">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Server Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-info">
          <p>Enter your backend server's IP address and port.</p>
          <p className="help-text">
            Example: For local development, use your computer's IP address
            (e.g., 192.168.1.100)
          </p>
        </div>

        <div className="input-group">
          <label htmlFor="ip-address">IP Address</label>
          <input
            id="ip-address"
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="192.168.1.100"
            className="ip-input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="port">Port</label>
          <input
            id="port"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="3001"
            className="ip-input"
          />
        </div>

        {saveStatus && (
          <div className={`status-message ${saveStatus.includes("Error") ? "error" : "success"}`}>
            {saveStatus}
          </div>
        )}

        <button className="save-button" onClick={handleSave}>
          Save Settings
        </button>

        <div className="current-url">
          <strong>Current Socket URL:</strong>
          <div className="url-display">
            http://{ipAddress || "___.___.___.___ "}:{port}
          </div>
        </div>
      </div>
    </div>
  );
};

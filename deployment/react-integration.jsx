// React Hook for ML Model Integration
import { useState, useCallback } from "react";

// Configuration
const API_ENDPOINTS = {
  // Choose one based on your deployment
  HUGGINGFACE: "https://YOUR_USERNAME-agri-sol-detector.hf.space/api/predict",
  RENDER: "https://your-app-name.onrender.com/predict",
  RAILWAY: "https://your-app-name.up.railway.app/predict",
  CLOUD_RUN: "https://your-service-name-hash-uc.a.run.app/predict",
  LOCAL: "http://localhost:5000/predict",
};

// Use the appropriate endpoint
const API_ENDPOINT = API_ENDPOINTS.RENDER; // Change this as needed

export const useDiseaseDetection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Convert file to base64
  const convertToBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  // Predict disease function
  const predictDisease = useCallback(
    async (imageFile, cropType) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        let response;

        // For Flask API (Render, Railway, etc.)
        if (
          API_ENDPOINT.includes("render") ||
          API_ENDPOINT.includes("railway") ||
          API_ENDPOINT.includes("run.app")
        ) {
          const base64Image = await convertToBase64(imageFile);

          response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
              crop_type: cropType.toLowerCase(),
            }),
          });
        }
        // For Hugging Face Gradio API
        else if (API_ENDPOINT.includes("hf.space")) {
          const formData = new FormData();
          formData.append("data", JSON.stringify([imageFile, cropType]));

          response = await fetch(API_ENDPOINT, {
            method: "POST",
            body: formData,
          });
        }
        // For FormData APIs
        else {
          const formData = new FormData();
          formData.append("image", imageFile);
          formData.append("crop_type", cropType);

          response = await fetch(API_ENDPOINT, {
            method: "POST",
            body: formData,
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success === false) {
          throw new Error(data.error || "Prediction failed");
        }

        setResult(data);
        return data;
      } catch (err) {
        const errorMessage = err.message || "Failed to predict disease";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [convertToBase64]
  );

  // Check API health
  const checkApiHealth = useCallback(async () => {
    try {
      const healthEndpoint = API_ENDPOINT.replace("/predict", "/");
      const response = await fetch(healthEndpoint);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    predictDisease,
    checkApiHealth,
    loading,
    error,
    result,
    clearError: () => setError(null),
    clearResult: () => setResult(null),
  };
};

// React Component Example
export const DiseaseDetectionComponent = () => {
  const { predictDisease, loading, error, result, clearError } =
    useDiseaseDetection();
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropType, setCropType] = useState("tomato");
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      alert("Please select an image first");
      return;
    }

    try {
      await predictDisease(selectedFile, cropType);
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    clearError();
  };

  return (
    <div className="disease-detection-container">
      <div className="upload-section">
        <h2>🌱 Plant Disease Detection</h2>

        {/* File Upload */}
        <div className="file-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
          />

          {preview && (
            <div className="image-preview">
              <img
                src={preview}
                alt="Selected plant"
                style={{ maxWidth: "300px", maxHeight: "300px" }}
              />
            </div>
          )}
        </div>

        {/* Crop Type Selection */}
        <div className="crop-selection">
          <label>
            Crop Type:
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              disabled={loading}
            >
              <option value="tomato">🍅 Tomato</option>
              <option value="potato">🥔 Potato</option>
              <option value="beans">🫘 Beans</option>
            </select>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={handlePredict}
            disabled={!selectedFile || loading}
            className="predict-btn"
          >
            {loading ? "🔄 Analyzing..." : "🔍 Analyze Plant"}
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="reset-btn"
          >
            🗑️ Reset
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        {loading && (
          <div className="loading">
            <p>🔄 Analyzing your plant image...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>❌ Error: {error}</p>
          </div>
        )}

        {result && result.success && (
          <div className="results">
            <h3>📊 Analysis Results</h3>
            <div className="result-card">
              <p>
                <strong>Disease:</strong> {result.prediction.disease}
              </p>
              <p>
                <strong>Confidence:</strong>{" "}
                {(result.prediction.confidence * 100).toFixed(1)}%
              </p>
              <p>
                <strong>Crop:</strong> {result.prediction.crop_type}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {result.prediction.is_healthy
                  ? "🟢 Healthy"
                  : "🔴 Disease Detected"}
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .disease-detection-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .upload-section,
        .results-section {
          margin-bottom: 30px;
        }

        .file-upload {
          margin: 20px 0;
        }

        .image-preview {
          margin: 15px 0;
          text-align: center;
        }

        .image-preview img {
          border: 2px solid #ddd;
          border-radius: 8px;
        }

        .crop-selection {
          margin: 20px 0;
        }

        .crop-selection select {
          margin-left: 10px;
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin: 20px 0;
        }

        .predict-btn,
        .reset-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }

        .predict-btn {
          background-color: #4caf50;
          color: white;
        }

        .predict-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .reset-btn {
          background-color: #f44336;
          color: white;
        }

        .loading {
          text-align: center;
          color: #2196f3;
        }

        .error {
          background-color: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #f44336;
        }

        .results {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
        }

        .result-card {
          background-color: white;
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .result-card p {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
};

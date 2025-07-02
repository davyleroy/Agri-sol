# AgriSol Plant Disease Detection Backend API

A Flask-based machine learning API for detecting plant diseases in tomatoes, potatoes, and maize crops using deep learning models.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- TensorFlow 2.13+
- All dependencies in `requirements.txt`

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the API with documentation
python app_with_docs.py
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:5000/docs
- **Testing Interface**: http://localhost:5000/test

### Core Endpoints

#### 1. Health Check

```
GET http://localhost:5000/
```

Returns API status and loaded models.

#### 2. Plant Disease Prediction

```
POST http://localhost:5000/api/ml/{crop_type}
```

**Supported crop types**: `tomatoes`, `potatoes`, `maize`

**Request**:

- Method: POST
- Content-Type: multipart/form-data
- Body: image file (JPG, PNG, etc.)

**Response**:

```json
{
  "success": true,
  "predicted_class": "Early Blight",
  "confidence": 0.95,
  "confidence_percentage": 95.0,
  "severity": "High",
  "recommendations": [
    "Treat Early Blight immediately",
    "Monitor plant regularly",
    "Improve air circulation"
  ],
  "treatment_urgency": "High",
  "estimated_recovery": "2-3 weeks",
  "crop_type": "tomatoes",
  "all_predictions": {
    "Bacterial Spot": 0.01,
    "Early Blight": 0.95,
    "Healthy": 0.02,
    "..."
  }
}
```

#### 3. Model Information

```
GET http://localhost:5000/api/models
```

Returns information about all available models.

## 🔬 Disease Classes

### 🍅 Tomatoes (10 classes)

- Bacterial Spot
- Early Blight
- Healthy
- Late Blight
- Leaf Mold
- Septoria Leaf Spot
- Spider Mites
- Target Spot
- Mosaic Virus
- Yellow Leaf Curl Virus

### 🥔 Potatoes (3 classes)

- Early Blight
- Healthy
- Late Blight

### 🌽 Maize (4 classes) - Currently Unavailable

- Common Rust
- Gray Leaf Spot
- Healthy
- Northern Corn Leaf Blight

## 🛠️ Model Status

### Current Working Models

- ✅ **Tomatoes**: `tomato_disease_best_model_fixed.h5` (10 classes)
- ✅ **Potatoes**: `agrisol_potato_model.keras` (3 classes)
- ❌ **Maize**: Model loading issues (investigating)

### Model Diagnostics

Run the diagnostic tool to check model status:

```bash
python fix_models.py
```

## 🧪 Testing the API

### 1. Web Interface

Visit http://localhost:5000/test for a user-friendly testing interface.

### 2. cURL Example

```bash
curl -X POST \
  http://localhost:5000/api/ml/tomatoes \
  -F "image=@path/to/your/plant_image.jpg"
```

### 3. Python Example

```python
import requests

url = "http://localhost:5000/api/ml/tomatoes"
files = {"image": open("plant_image.jpg", "rb")}

response = requests.post(url, files=files)
result = response.json()

print(f"Disease: {result['predicted_class']}")
print(f"Confidence: {result['confidence_percentage']}%")
```

## 🏗️ Architecture

```
Backend/
├── app_with_docs.py          # Enhanced API with documentation
├── app.py                    # Original API (fallback)
├── requirements.txt          # Dependencies
├── config.py                 # Configuration settings
├── run.py                    # Production startup script
├── utils/
│   ├── model_utils.py        # Model loading and prediction
│   └── treatment_utils.py    # Treatment recommendations
├── uploads/                  # Temporary image storage
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

- `FLASK_ENV`: development/production
- `MODEL_PATH`: Custom model directory path
- `MAX_CONTENT_LENGTH`: Max upload size (default: 16MB)

### Model Paths

Models are loaded from `../Notebook/` directory:

- Primary paths defined in `MODEL_PATHS`
- Alternative paths in `ALTERNATIVE_PATHS`
- Automatic fallback to working models

## 🚨 Troubleshooting

### Common Issues

1. **Model Loading Errors**

   ```bash
   python fix_models.py  # Diagnose model issues
   ```

2. **Port Already in Use**

   ```bash
   # Kill existing Flask processes
   taskkill /f /im python.exe  # Windows
   # or change port in app.py
   ```

3. **Memory Issues**
   - Reduce batch size
   - Use CPU instead of GPU
   - Close unused applications

### Model Issues

- **Maize models**: Currently experiencing loading errors
- **Workaround**: Use API with tomatoes and potatoes only
- **Solution**: Retrain maize models with compatible format

## 📊 Performance

### Response Times

- Health check: ~10ms
- Model loading: ~2-5 seconds (startup)
- Image prediction: ~100-500ms per image

### Resource Usage

- RAM: ~2-4GB (with models loaded)
- CPU: ~10-30% during prediction
- Disk: ~100MB for model files

## 🔐 Security

- File upload size limits (16MB)
- Allowed file types validation
- CORS enabled for frontend integration
- Input sanitization and validation

## 📈 Monitoring

### Health Monitoring

- Health check endpoint: `/`
- Model status: `/api/models`
- Logs: Check console output

### Metrics

- Request count
- Response times
- Model accuracy
- Error rates

## 🚀 Deployment

### Development

```bash
python app_with_docs.py
```

### Production

```bash
python run.py
# or
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📝 Changelog

### Version 1.1.0 (Current)

- ✅ Added Swagger documentation (`/docs`)
- ✅ Added web testing interface (`/test`)
- ✅ Enhanced error handling
- ✅ Model diagnostics tool
- ✅ Automatic model fallback
- ✅ Improved logging

### Version 1.0.0

- ✅ Basic API with prediction endpoints
- ✅ Support for tomatoes, potatoes, maize
- ✅ Treatment recommendations
- ✅ CORS support

## 🤝 Contributing

1. Run diagnostics: `python fix_models.py`
2. Test your changes: `python test_api.py`
3. Update documentation
4. Submit pull request

## 📄 License

This project is part of the AgriSol plant disease detection system.

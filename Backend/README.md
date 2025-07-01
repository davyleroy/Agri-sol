# AgriSol Plant Disease Detection API

A Flask-based REST API for detecting plant diseases in tomatoes, potatoes, and maize using deep learning models.

## Features

- **Multi-crop Support**: Detect diseases in tomatoes (10 classes), potatoes (3 classes), and maize (4 classes)
- **Image Processing**: Automatic image preprocessing and normalization
- **Treatment Recommendations**: Comprehensive treatment advice for detected diseases
- **CORS Enabled**: Ready for frontend integration
- **Error Handling**: Robust error handling and logging
- **Model Flexibility**: Automatic fallback to alternative models if primary models are unavailable

## Supported Crops and Diseases

### Tomatoes (10 classes)

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

### Potatoes (3 classes)

- Early Blight
- Healthy
- Late Blight

### Maize/Corn (4 classes)

- Common Rust
- Gray Leaf Spot
- Healthy
- Northern Corn Leaf Blight

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- TensorFlow-compatible system

### Setup

1. **Clone the repository**

   ```bash
   cd Backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv agrisol_env

   # On Windows
   agrisol_env\Scripts\activate

   # On macOS/Linux
   source agrisol_env/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Verify model files**

   Ensure the following model files exist in the `../Notebook/` directory:

   - `tomato_disease_best_model_fixed.h5` (or alternatives)
   - `sweet_spot_potato_model.keras` (or alternatives)
   - `corn_gentle_v3.h5` (or alternatives)

5. **Run the application**
   ```bash
   python app.py
   ```

The API will start on `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /
```

Returns API status and loaded models.

**Response:**

```json
{
  "status": "healthy",
  "message": "Plant Disease Detection API is running",
  "models_loaded": ["tomatoes", "potatoes", "maize"],
  "timestamp": "2024-01-01T12:00:00"
}
```

### Disease Prediction

```
POST /api/ml/{crop_type}
```

Where `crop_type` is one of: `tomatoes`, `potatoes`, `maize`

**Request:**

- Content-Type: `multipart/form-data`
- `image`: Image file (JPG, PNG, BMP, TIFF)
- `crop_type` (optional): Crop type identifier

**Response:**

```json
{
  "success": true,
  "predicted_class": "Early Blight",
  "confidence": 0.92,
  "confidence_percentage": 92.0,
  "severity": "High",
  "recommendations": [
    "Remove affected leaves immediately",
    "Apply copper-based fungicide",
    "Improve air circulation around plants"
  ],
  "treatment_urgency": "Medium",
  "estimated_recovery": "2-3 weeks",
  "crop_type": "tomatoes",
  "all_predictions": {
    "Early Blight": 0.92,
    "Healthy": 0.05,
    "Late Blight": 0.03
  }
}
```

### Model Information

```
GET /api/models
```

Returns information about available models.

**Response:**

```json
{
  "models": {
    "tomatoes": {
      "loaded": true,
      "classes": ["Bacterial Spot", "Early Blight", ...],
      "endpoint": "/api/ml/tomatoes"
    }
  },
  "total_models": 3
}
```

## Usage Examples

### Python Client Example

```python
import requests

# Health check
response = requests.get('http://localhost:5000/')
print(response.json())

# Disease prediction
with open('plant_image.jpg', 'rb') as image_file:
    files = {'image': image_file}
    response = requests.post(
        'http://localhost:5000/api/ml/tomatoes',
        files=files
    )
    result = response.json()
    print(f"Disease: {result['predicted_class']}")
    print(f"Confidence: {result['confidence_percentage']}%")
```

### JavaScript/Fetch Example

```javascript
const formData = new FormData();
formData.append("image", imageFile);

fetch("http://localhost:5000/api/ml/tomatoes", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Disease:", data.predicted_class);
    console.log("Confidence:", data.confidence_percentage + "%");
    console.log("Recommendations:", data.recommendations);
  });
```

### cURL Example

```bash
curl -X POST \
  http://localhost:5000/api/ml/tomatoes \
  -F "image=@plant_image.jpg"
```

## Configuration

### Environment Variables

- `FLASK_ENV`: Set to `development` or `production`
- `SECRET_KEY`: Flask secret key
- `PORT`: Server port (default: 5000)

### Model Configuration

Edit `MODEL_PATHS` in `app.py` to change model file locations:

```python
MODEL_PATHS = {
    'tomatoes': '../Notebook/your_tomato_model.h5',
    'potatoes': '../Notebook/your_potato_model.keras',
    'maize': '../Notebook/your_maize_model.h5'
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid input)
- `500`: Internal Server Error

Error response format:

```json
{
  "success": false,
  "error": "Error description"
}
```

## Image Requirements

- **Supported formats**: JPG, JPEG, PNG, BMP, TIFF
- **Maximum file size**: 16MB
- **Recommended resolution**: 256x256 pixels or higher
- **Color**: RGB images preferred

## Treatment Recommendations

The API provides comprehensive treatment advice including:

- Immediate actions to take
- Chemical and organic treatment options
- Prevention measures
- Recovery time estimates
- Treatment urgency levels

## Logging

Logs are written to the console and include:

- Model loading status
- Prediction requests and results
- Error messages and stack traces

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Performance Considerations

- **Model Loading**: Models are loaded once at startup
- **Memory Usage**: Each model requires ~100-500MB RAM
- **Processing Time**: Typical prediction takes 1-3 seconds
- **Concurrent Requests**: Limited by available RAM and CPU

## Troubleshooting

### Common Issues

1. **Model Loading Errors**

   - Verify model files exist and are not corrupted
   - Check TensorFlow version compatibility
   - Ensure sufficient RAM for model loading

2. **Image Processing Errors**

   - Verify image format is supported
   - Check file size is under 16MB
   - Ensure image is not corrupted

3. **CORS Issues**
   - Update `CORS_ORIGINS` in config.py
   - Check browser developer console for CORS errors

### Debug Mode

Run with debug logging:

```bash
export FLASK_ENV=development
python app.py
```

## License

This project is part of the AgriSol plant disease detection system.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:

- Check existing GitHub issues
- Create new issue with detailed description
- Include error logs and system information

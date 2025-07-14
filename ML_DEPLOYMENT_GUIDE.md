# 🚀 Free ML Model Deployment Options for React Apps

This guide provides multiple free deployment options for your Agri-Sol machine learning models with step-by-step instructions.

## 📋 Table of Contents

1. [Hugging Face Spaces (Recommended)](#1-hugging-face-spaces)
2. [Render.com](#2-rendercom)
3. [Railway](#3-railway)
4. [Google Cloud Run (Free Tier)](#4-google-cloud-run)
5. [Vercel (Serverless Functions)](#5-vercel-serverless)
6. [Streamlit Community Cloud](#6-streamlit-community-cloud)
7. [Heroku Alternatives](#7-heroku-alternatives)

---

## 1. 🤗 Hugging Face Spaces (Recommended)

**Best for**: Simple API deployment, great for ML models
**Free Tier**: Unlimited public spaces, 2 vCPU, 16GB RAM

### Steps:

#### A. Prepare Your Model

```bash
# 1. Create a requirements.txt
pip freeze > requirements.txt

# 2. Convert your models to a standard format if needed
python -c "
import tensorflow as tf
model = tf.keras.models.load_model('your_model.h5')
model.save('model_saved', save_format='tf')
"
```

#### B. Create Hugging Face Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose "Gradio" or "Streamlit" as SDK
4. Make it public for free tier

#### C. Create app.py for Gradio

```python
import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image
import requests

# Load your models
models = {
    'tomato': tf.keras.models.load_model('models/tomato_model'),
    'potato': tf.keras.models.load_model('models/potato_model'),
    'beans': tf.keras.models.load_model('models/beans_model'),
}

class_names = {
    'tomato': ['Bacterial Spot', 'Early Blight', 'Healthy', 'Late Blight', 'Leaf Mold',
               'Septoria Leaf Spot', 'Spider Mites', 'Target Spot', 'Mosaic Virus', 'Yellow Leaf Curl'],
    'potato': ['Early Blight', 'Healthy', 'Late Blight'],
    'beans': ['Angular Leaf Spot', 'Bean Rust', 'Healthy']
}

def predict_disease(image, crop_type):
    # Preprocess image
    img = Image.fromarray(image).resize((256, 256))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Get prediction
    model = models[crop_type.lower()]
    predictions = model.predict(img_array)
    predicted_class = np.argmax(predictions[0])
    confidence = np.max(predictions[0])

    disease = class_names[crop_type.lower()][predicted_class]

    return f"Disease: {disease}, Confidence: {confidence:.2%}"

# Create Gradio interface
iface = gr.Interface(
    fn=predict_disease,
    inputs=[
        gr.Image(type="numpy"),
        gr.Dropdown(["Tomato", "Potato", "Beans"], label="Crop Type")
    ],
    outputs="text",
    title="Agri-Sol Disease Detection",
    description="Upload a plant image to detect diseases"
)

if __name__ == "__main__":
    iface.launch()
```

#### D. Deploy to Hugging Face

```bash
# 1. Install Hugging Face CLI
pip install huggingface_hub

# 2. Login
huggingface-cli login

# 3. Create space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/agri-sol-detector
cd agri-sol-detector

# 4. Add your files
cp app.py .
cp -r models/ .
cp requirements.txt .

# 5. Push to Hugging Face
git add .
git commit -m "Initial deployment"
git push
```

#### E. Integrate with React

```javascript
// In your React app
const predictDisease = async (imageFile, cropType) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify([imageFile, cropType]));

  const response = await fetch(
    "https://YOUR_USERNAME-agri-sol-detector.hf.space/api/predict",
    {
      method: "POST",
      body: formData,
    }
  );

  return await response.json();
};
```

---

## 2. 🚀 Render.com

**Best for**: Full backend deployment
**Free Tier**: 750 hours/month, automatic sleep after 15min inactivity

### Steps:

#### A. Prepare Flask API

```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load models on startup
models = {}
try:
    models['tomato'] = tf.keras.models.load_model('models/tomato_model.h5')
    models['potato'] = tf.keras.models.load_model('models/potato_model.h5')
    models['beans'] = tf.keras.models.load_model('models/beans_model.h5')
except Exception as e:
    print(f"Error loading models: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        image_data = data['image']  # base64 encoded
        crop_type = data['crop_type'].lower()

        # Decode image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes)).resize((256, 256))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        model = models[crop_type]
        predictions = model.predict(img_array)
        predicted_class = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))

        return jsonify({
            'predicted_class': predicted_class,
            'confidence': confidence,
            'success': True
        })

    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
```

#### B. Create Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

#### C. Deploy to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Connect GitHub repository
4. Choose "Web Service"
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `python app.py`

---

## 3. 🚂 Railway

**Best for**: Easy deployment with database
**Free Tier**: $5/month credit, 500 hours execution

### Steps:

#### A. Prepare Your App

```bash
# Create railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python app.py"
  }
}
```

#### B. Deploy

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy
railway up
```

---

## 4. ☁️ Google Cloud Run (Free Tier)

**Best for**: Scalable serverless deployment
**Free Tier**: 2 million requests/month, 400,000 GB-seconds

### Steps:

#### A. Create Dockerfile

```dockerfile
FROM python:3.9-slim

ENV PYTHONUNBUFFERED True

ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN pip install -r requirements.txt

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
```

#### B. Deploy to Cloud Run

```bash
# 1. Install Google Cloud SDK
# 2. Authenticate
gcloud auth login

# 3. Set project
gcloud config set project YOUR_PROJECT_ID

# 4. Build and deploy
gcloud run deploy agri-sol-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 5. ⚡ Vercel (Serverless Functions)

**Best for**: Serverless deployment with your React app
**Free Tier**: 100GB bandwidth, 100 serverless function executions

### Steps:

#### A. Create API Route

```python
# api/predict.py
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
import json

def handler(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Your prediction logic here
            return {
                'statusCode': 200,
                'body': json.dumps({'result': 'prediction'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
            }
```

#### B. Configure vercel.json

```json
{
  "functions": {
    "api/predict.py": {
      "runtime": "python3.9"
    }
  }
}
```

#### C. Deploy

```bash
npm install -g vercel
vercel --prod
```

---

## 6. 🎈 Streamlit Community Cloud

**Best for**: Quick ML app deployment
**Free Tier**: Unlimited public apps

### Steps:

#### A. Create Streamlit App

```python
# streamlit_app.py
import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image

st.title("Agri-Sol Disease Detection")

uploaded_file = st.file_uploader("Choose a plant image...", type=['jpg', 'jpeg', 'png'])
crop_type = st.selectbox("Select crop type", ['Tomato', 'Potato', 'Beans'])

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption='Uploaded Image', use_column_width=True)

    if st.button('Predict Disease'):
        # Your prediction logic here
        st.write("Prediction results...")
```

#### B. Deploy

1. Push to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect GitHub repository
4. Deploy

---

## 🔗 React Integration Examples

### For REST API (Render, Railway, Cloud Run)

```javascript
const predictDisease = async (imageFile, cropType) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("crop_type", cropType);

  const response = await fetch("YOUR_API_ENDPOINT/predict", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};
```

### For Base64 Upload

```javascript
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const predictDisease = async (imageFile, cropType) => {
  const base64Image = await convertToBase64(imageFile);

  const response = await fetch("YOUR_API_ENDPOINT/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Image,
      crop_type: cropType,
    }),
  });

  return await response.json();
};
```

---

## 💡 Recommendations

1. **Start with Hugging Face Spaces** - Easiest for ML models
2. **Use Render.com for production** - More reliable uptime
3. **Consider Google Cloud Run** - Best scaling capabilities
4. **Streamlit** - Great for quick prototypes and demos

## 🚨 Important Notes

- **Model Size**: Keep models under 500MB for faster deployment
- **Cold Starts**: Free tiers often have cold start delays
- **CORS**: Enable CORS for React app integration
- **Environment Variables**: Store API keys securely
- **Model Optimization**: Use TensorFlow Lite for smaller models

Choose the option that best fits your needs and technical expertise!

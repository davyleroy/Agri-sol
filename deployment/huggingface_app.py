# Hugging Face Gradio Deployment
import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image
import os

# Define class names for each crop
CLASS_NAMES = {
    'tomato': [
        'Tomato Bacterial Spot', 'Tomato Early Blight', 'Tomato Healthy', 
        'Tomato Late Blight', 'Tomato Leaf Mold', 'Tomato Septoria Leaf Spot',
        'Tomato Spider Mites', 'Tomato Target Spot', 'Tomato Mosaic Virus', 
        'Tomato Yellow Leaf Curl Virus'
    ],
    'potato': [
        'Potato Early Blight', 'Potato Healthy', 'Potato Late Blight'
    ],
    'beans': [
        'Bean Angular Leaf Spot', 'Bean Rust', 'Bean Healthy'
    ]
}

# Load models (adjust paths as needed)
def load_models():
    models = {}
    try:
        # Try loading models from Notebook directory
        base_path = "."
        
        # Check for different model file formats
        model_files = {
            'tomato': ['tomato_disease_model.h5', 'tomato_disease_model_best.keras', 'tomato_model.h5'],
            'potato': ['potato_disease_model_best.keras', 'agrisol_potato_model.h5', 'potato_model.h5'],
            'beans': ['bean_disease_model_best.keras', 'enhanced_bean_disease.h5', 'bean_model.h5']
        }
        
        for crop, possible_files in model_files.items():
            for filename in possible_files:
                filepath = os.path.join(base_path, filename)
                if os.path.exists(filepath):
                    try:
                        models[crop] = tf.keras.models.load_model(filepath)
                        print(f"✅ Loaded {crop} model from {filename}")
                        break
                    except Exception as e:
                        print(f"❌ Failed to load {filename}: {e}")
                        continue
            
            if crop not in models:
                print(f"⚠️ No working model found for {crop}")
    
    except Exception as e:
        print(f"Error loading models: {e}")
    
    return models

# Load models
models = load_models()

def predict_disease(image, crop_type):
    """
    Predict plant disease from image
    """
    try:
        # Validate inputs
        if image is None:
            return "Please upload an image"
        
        crop_key = crop_type.lower()
        if crop_key not in models:
            return f"Model for {crop_type} not available"
        
        # Preprocess image
        if isinstance(image, np.ndarray):
            img = Image.fromarray(image)
        else:
            img = image
            
        # Resize to model input size
        img = img.resize((256, 256))
        img_array = np.array(img)
        
        # Normalize pixel values
        if img_array.max() > 1:
            img_array = img_array / 255.0
            
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Get prediction
        model = models[crop_key]
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = np.max(predictions[0])
        
        # Get class name
        class_names = CLASS_NAMES[crop_key]
        if predicted_class_idx < len(class_names):
            disease_name = class_names[predicted_class_idx]
        else:
            disease_name = f"Unknown Class {predicted_class_idx}"
        
        # Format result
        result = f"""
        🔍 **Prediction Results**
        
        **Disease:** {disease_name}
        **Confidence:** {confidence:.2%}
        **Crop Type:** {crop_type}
        
        {'🟢 Healthy Plant!' if 'healthy' in disease_name.lower() else '🔴 Disease Detected'}
        """
        
        return result
        
    except Exception as e:
        return f"Error during prediction: {str(e)}"

def get_model_info():
    """Display information about loaded models"""
    info = "**🤖 Model Status:**\n\n"
    for crop, model in models.items():
        if model:
            info += f"✅ {crop.title()}: Model loaded successfully\n"
        else:
            info += f"❌ {crop.title()}: Model not available\n"
    
    if not models:
        info += "⚠️ No models loaded. Please check model files."
    
    return info

# Create Gradio interface
with gr.Blocks(title="Agri-Sol Disease Detection", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🌱 Agri-Sol Disease Detection System
    
    Upload an image of a plant leaf to detect diseases using AI. 
    Supports Tomato, Potato, and Bean plants.
    """)
    
    # Model status
    gr.Markdown(get_model_info())
    
    with gr.Row():
        with gr.Column():
            # Input components
            image_input = gr.Image(
                label="📸 Upload Plant Image",
                type="pil",
                height=300
            )
            
            crop_dropdown = gr.Dropdown(
                choices=["Tomato", "Potato", "Beans"],
                label="🌾 Select Crop Type",
                value="Tomato"
            )
            
            predict_btn = gr.Button(
                "🔍 Analyze Plant",
                variant="primary",
                size="lg"
            )
        
        with gr.Column():
            # Output component
            result_output = gr.Markdown(label="📊 Results")
    
    # Set up the prediction
    predict_btn.click(
        fn=predict_disease,
        inputs=[image_input, crop_dropdown],
        outputs=result_output
    )
    
    # Example section
    gr.Markdown("""
    ## 📝 How to Use:
    1. Upload a clear image of a plant leaf
    2. Select the correct crop type
    3. Click "Analyze Plant" to get results
    
    ## 🎯 Supported Diseases:
    - **Tomato**: Bacterial Spot, Early Blight, Late Blight, Leaf Mold, etc.
    - **Potato**: Early Blight, Late Blight, Healthy
    - **Beans**: Angular Leaf Spot, Rust, Healthy
    """)

# Launch the app
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True
    )

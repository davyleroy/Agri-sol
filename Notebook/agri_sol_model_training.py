import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import os
import cv2
from PIL import Image
from collections import Counter

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.utils import to_categorical, img_to_array
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

print(f'TensorFlow Version: {tf.__version__}')

DATASET_PATH = r'C:\Users\mbuto\Agri-sol\Dataset\Bean_Dataset'
CLASSES = ['angular_leaf_spot', 'bean_rust', 'healthy']
NUM_CLASSES = len(CLASSES)
IMAGE_SIZE = (224, 224) # VGG16 was trained on 224x224 images

def load_data(dataset_path, classes, image_size):
    image_list, label_list = [], []
    for i, class_name in enumerate(classes):
        class_path = os.path.join(dataset_path, class_name)
        print(f'Loading images from: {class_path}')
        for image_name in os.listdir(class_path):
            image_path = os.path.join(class_path, image_name)
            try:
                image = cv2.imread(image_path)
                if image is not None:
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # Matplotlib uses RGB
                    image = cv2.resize(image, image_size)
                    image_list.append(img_to_array(image))
                    label_list.append(i)
            except Exception as e:
                print(f'Error loading image {image_path}: {e}')
    return np.array(image_list), np.array(label_list)

X, y = load_data(DATASET_PATH, CLASSES, IMAGE_SIZE)
print(f'\nTotal images loaded: {len(X)}')
print(f'Class distribution: {Counter(y)}')

# Normalize pixel values
X = X.astype('float32') / 255.0

# One-hot encode labels
y_cat = to_categorical(y, NUM_CLASSES)

# First split: 70% train, 30% temp (val + test)
x_train, x_temp, y_train, y_temp = train_test_split(X, y_cat, test_size=0.3, random_state=42, stratify=y_cat)

# Second split: 15% validation, 15% test from the temp set
x_val, x_test, y_val, y_test = train_test_split(x_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp)

print(f'Training data shape: {x_train.shape}')
print(f'Validation data shape: {x_val.shape}')
print(f'Testing data shape: {x_test.shape}')

train_datagen = ImageDataGenerator(
    rotation_range=40,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

train_generator = train_datagen.flow(x_train, y_train, batch_size=32)

# Load the VGG16 base model without the top classifier
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3))

# Freeze the convolutional base
base_model.trainable = False

# Create the new model on top
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x) # Regularization
predictions = Dense(NUM_CLASSES, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

# Compile the model
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

EPOCHS = 50
BATCH_SIZE = 32

callbacks = [
    EarlyStopping(monitor='val_loss', patience=10, verbose=1, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=1e-6, verbose=1),
    ModelCheckpoint(filepath='bean_disease_model_best.keras', monitor='val_accuracy', save_best_only=True, verbose=1)
]

history = model.fit(
    train_generator,
    steps_per_epoch=len(x_train) // BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=(x_val, y_val),
    callbacks=callbacks
)

def plot_history(history):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    # Plot accuracy
    ax1.plot(history.history['accuracy'], label='train_accuracy')
    ax1.plot(history.history['val_accuracy'], label='val_accuracy')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    # Plot loss
    ax2.plot(history.history['loss'], label='train_loss')
    ax2.plot(history.history['val_loss'], label='val_loss')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    plt.show()

plot_history(history)

# Evaluate on test data
loss, accuracy = model.evaluate(x_test, y_test, verbose=0)
print(f'\nTest Accuracy: {accuracy*100:.2f}%')
print(f'Test Loss: {loss:.4f}')

# Get predictions
y_pred_probs = model.predict(x_test)
y_pred_classes = np.argmax(y_pred_probs, axis=1)
y_true_classes = np.argmax(y_test, axis=1)

# Classification Report
print('Classification Report:')
print(classification_report(y_true_classes, y_pred_classes, target_names=CLASSES))

# Confusion Matrix
cm = confusion_matrix(y_true_classes, y_pred_classes)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=CLASSES, yticklabels=CLASSES)
plt.title('Confusion Matrix')
plt.ylabel('Actual Class')
plt.xlabel('Predicted Class')
plt.show()

# %% [markdown]
# ### Importing necessary libraries

# %%
%pip install scikit-image

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.image import imread
import cv2
import random
import os
from os import listdir
from PIL import Image
import tensorflow as tf
from keras.preprocessing import image
from tensorflow. keras.utils import img_to_array, array_to_img
from keras.optimizers import Adam
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D
from keras.layers import Activation, Flatten, Dropout, Dense
from sklearn. model_selection import train_test_split
from keras.models import model_from_json
from keras.utils import to_categorical
from skimage.io import imread
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
import numpy as np
import matplotlib.pyplot as plt
from collections import Counter
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# %%
print(tf. __version__)

# %% [markdown]
# ### Defining the path of dataset directory

# %%
dataset_path = "C:\Plant-Disease-Detection\Dataset"

# %% [markdown]
# ### Visualizing the images and Resize images

# %%
# Using raw string (r prefix) to avoid escape character issues
dataset_path = r"C:\Users\mbuto\Agri-sol\Dataset\Potato___Early_blight"

# Check if directory exists
if not os.path.exists(dataset_path):
    print(f"Error: Directory '{dataset_path}' does not exist!")
else:
    plt.figure(figsize=(12, 12))
    
    files = sorted(os.listdir(dataset_path))
    
    if len(files) == 0:
        print(f"Warning: No files found in '{dataset_path}'")
    else:
        for i in range(1, min(17, len(files) + 1)):
            plt.subplot(4, 4, i)
            plt.tight_layout()
            rand_img = imread(os.path.join(dataset_path, random.choice(files)))
            plt.imshow(rand_img)
            plt.xlabel(rand_img.shape[1], fontsize=10)
            plt.ylabel(rand_img.shape[0], fontsize=10)

# %% [markdown]
# ### Convert the images into a Numpy array and normalize them

# %%
# Converting Images to array 

def convert_image_to_array(image_dir):
    try:
        image = cv2.imread(image_dir)
        if image is not None :
            image = cv2.resize(image, (256, 256))  
            return img_to_array(image)
        else :
            return np.array([])
    except Exception as e:
        print(f"Error : {e}")
        return None

# %%
dataset_path = r"C:\Users\mbuto\Agri-sol\Dataset"

if os.path.exists(dataset_path):
	labels = os.listdir(dataset_path)
	print(labels)
else:
	print(f"Error: Directory '{dataset_path}' does not exist!")

# %%
dataset_path = r"C:\Users\mbuto\Agri-sol\Dataset"
root_dir = listdir(dataset_path)
image_list, label_list = [], []

# Updated to match actual directory names
all_labels = ['Corn_(maize)___Common_rust_', 'Potato___Early_blight', 'Tomato___Bacterial_spot']
binary_labels = [0, 1, 2]

# Filter directories to only include expected ones
expected_dirs = [d for d in root_dir if d in all_labels]
temp = -1

# Reading and converting image to numpy array
for directory in expected_dirs:
    plant_image_list = listdir(f"{dataset_path}/{directory}")
    temp += 1
    for files in plant_image_list:
        image_path = f"{dataset_path}/{directory}/{files}"
        image_list.append(convert_image_to_array(image_path))
        label_list.append(binary_labels[temp])

print(f"Images loaded: {len(image_list)}")
print(f"Labels created: {len(label_list)}")

# %% [markdown]
# ### Visualize the class count and Check for class imbalance

# %%
print("Length of label_list:", len(label_list))
print("Length of image_list:", len(image_list))
print("First few items in label_list:", label_list[:5])

# %%
# Visualize the number of classes count

label_counts = Counter(label_list)
print(label_counts)

# %% [markdown]
# ### it is a balanced dataset as we can see

# %%
# Next we will observe the shape of the image.

image_list[0].shape

# %%
# Checking the total number of the images which is the length of the labels list.

label_list = np.array(label_list)
label_list.shape

# %% [markdown]
# ### Splitting the dataset into train, validate and test sets

# %%
x_train, x_test, y_train, y_test = train_test_split(image_list, label_list, test_size=0.2, random_state = 10) 

# %%
# Now we will normalize the dataset of our images. As pixel values ranges from 0 to 255 so we will divide each image pixel with 255 to normalize the dataset.

x_train = np.array(x_train, dtype=np.float16) / 225.0
x_test = np.array(x_test, dtype=np.float16) / 225.0
x_train = x_train.reshape(-1, 256, 256, 3)
x_test = x_test.reshape(-1, 256, 256, 3)

# %% [markdown]
# ### Performing one-hot encoding on target variable

# %%
y_train = to_categorical(y_train)
y_test = to_categorical(y_test)

# %% [markdown]
# ### Creating the model architecture, compile the model and then fit it using the training data

# %%
# Importing VGG16 model from Keras

# Load pre-trained VGG16
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(256, 256, 3))

# Freeze base model layers
base_model.trainable = False

# Add custom classifier
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation='relu'),
    Dropout(0.5),
    Dense(256, activation='relu'),
    Dropout(0.3),
    Dense(3, activation='softmax')
])

model.summary()

# %%
# 1. Check and convert labels if needed
print("Original label shape:", y_train.shape)
print("Sample labels before conversion:", y_train[:5])

# Convert to one-hot encoding if labels are integers [0,1,2]
if len(y_train.shape) == 1:
    y_train = to_categorical(y_train, num_classes=3)
    y_test = to_categorical(y_test, num_classes=3)
    print("✅ Converted labels to one-hot encoding")
    print("New label shape:", y_train.shape)
    print("Sample one-hot labels:", y_train[:2])

# 2. Model compilation
model.compile(
    loss='categorical_crossentropy', 
    optimizer=Adam(0.001),  # Increased from 0.0001 for better convergence
    metrics=['accuracy']
)

# 3. Split training data into training and validation sets
x_train, x_val, y_train, y_val = train_test_split(
    x_train, y_train, 
    test_size=0.2, 
    random_state=10,
    stratify=y_train  # Ensures balanced split across classes
)

print(f"Training set: {x_train.shape[0]} samples")
print(f"Validation set: {x_val.shape[0]} samples")

# 4. Setup callbacks for better training
callbacks = [
    # Stop training if validation loss doesn't improve for 15 epochs
    EarlyStopping(
        patience=15, 
        restore_best_weights=True, 
        monitor='val_loss',
        verbose=1
    ),
    
    # Reduce learning rate when validation loss plateaus
    ReduceLROnPlateau(
        factor=0.3, 
        patience=5, 
        min_lr=1e-7, 
        monitor='val_loss',
        verbose=1
    ),
    
    # Save the best model
    ModelCheckpoint(
        'best_plant_disease_model.h5', 
        save_best_only=True, 
        monitor='val_accuracy',
        verbose=1
    )
]

# 5. Training parameters
epochs = 50
batch_size = 32  # Reduced from 128 for potentially better results

print("🚀 Starting model training...")
print(f"Epochs: {epochs}")
print(f"Batch size: {batch_size}")
print(f"Learning rate: 0.001")

# 6. Train the model
history = model.fit(
    x_train, y_train,
    batch_size=batch_size,
    epochs=epochs,
    validation_data=(x_val, y_val),
    callbacks=callbacks,
    verbose=1
)

print("✅ Training completed!")

# 7. Training results summary
final_train_acc = history.history['accuracy'][-1]
final_val_acc = history.history['val_accuracy'][-1]
final_train_loss = history.history['loss'][-1]
final_val_loss = history.history['val_loss'][-1]

print(f"\n📊 Final Results:")
print(f"Training Accuracy: {final_train_acc:.4f}")
print(f"Validation Accuracy: {final_val_acc:.4f}")
print(f"Training Loss: {final_train_loss:.4f}")
print(f"Validation Loss: {final_val_loss:.4f}")


def plot_training_history(history):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    # Plot accuracy
    ax1.plot(history.history['accuracy'], label='Training Accuracy', color='blue')
    ax1.plot(history.history['val_accuracy'], label='Validation Accuracy', color='red')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Plot loss
    ax2.plot(history.history['loss'], label='Training Loss', color='blue')
    ax2.plot(history.history['val_loss'], label='Validation Loss', color='red')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()

# Plot the training history
plot_training_history(history)

# %%
model.compile(loss = 'categorical_crossentropy', optimizer = Adam(0.0001), metrics = ['accuracy'])

# %%
# Splitting the training data set into training and validation data sets

x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size = 0.2, random_state = 10)

# %%
# Training the model

epochs = 50
batch_size = 128
history = model.fit(x_train, y_train, batch_size = batch_size, epochs = epochs, validation_data = (x_val, y_val))

# %%
model.save("C:\Plant-Disease-Detection\Model\plant_disease_model.h5")

# %% [markdown]
# ### Plot the accuracy and loss against each epoch

# %%
# Plot the training history

plt.figure(figsize = (12, 5))
plt.plot(history.history['accuracy'], color = 'r')
plt.plot(history.history['val_accuracy'], color = 'b')
plt.title('Model Accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epochs')
plt.legend(['train', 'val'])

plt.show()

# %%
print("Calculating model accuracy")

scores = model.evaluate(x_test, y_test)
print(f"Test Accuracy: {scores[1] * 100}")

# %% [markdown]
# ### Make predictions on testing data

# %%
y_pred = model.predict(x_test)

# %% [markdown]
# ### Visualizing the original and predicted labels for the test images

# %%
# Plotting image to compare

img = array_to_img(x_test[11])
img

# %%
# Finding max value from predition list and comaparing original value vs predicted

print("Originally : ", all_labels[np.argmax(y_test[11])])
print("Predicted : ", all_labels[np.argmax(y_pred[4])])
print(y_pred[2])

# %%
for i in range(50):
    print (all_labels[np.argmax(y_test[i])], " ", all_labels[np.argmax(y_pred [1])])



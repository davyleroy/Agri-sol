import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, FlipHorizontal, X, CircleCheck as CheckCircle, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={['#059669', '#10b981']}
          style={styles.permissionGradient}
        >
          <Camera size={64} color="#ffffff" strokeWidth={1.5} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to capture images of your crops for analysis.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const captureImage = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    // Simulate capture and processing
    setTimeout(() => {
      Alert.alert('Success', 'Image captured successfully!');
      setIsCapturing(false);
    }, 1000);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        Alert.alert('Success', 'Image selected successfully!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  if (!showCamera) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#e2e8f0']}
          style={styles.choiceContainer}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Scan Your Crop</Text>
            <Text style={styles.subtitle}>
              Choose how you'd like to capture or select your crop image
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setShowCamera(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#059669', '#10b981']}
                style={styles.optionGradient}
              >
                <Camera size={48} color="#ffffff" strokeWidth={1.5} />
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionDescription}>
                  Capture crop image with camera
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563eb', '#3b82f6']}
                style={styles.optionGradient}
              >
                <ImageIcon size={48} color="#ffffff" strokeWidth={1.5} />
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionDescription}>
                  Select existing photo from gallery
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for Better Results</Text>
            <View style={styles.tip}>
              <CheckCircle size={16} color="#059669" strokeWidth={2} />
              <Text style={styles.tipText}>Ensure good lighting</Text>
            </View>
            <View style={styles.tip}>
              <CheckCircle size={16} color="#059669" strokeWidth={2} />
              <Text style={styles.tipText}>Focus on affected areas</Text>
            </View>
            <View style={styles.tip}>
              <CheckCircle size={16} color="#059669" strokeWidth={2} />
              <Text style={styles.tipText}>Keep camera steady</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        {/* Header */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCamera(false)}
          >
            <X size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <FlipHorizontal size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Overlay Guide */}
        <View style={styles.overlay}>
          <View style={styles.guideBorder} />
          <Text style={styles.guideText}>
            Position the plant leaf in the center
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
          >
            <ImageIcon size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureButton,
              isCapturing && styles.capturingButton,
            ]}
            onPress={captureImage}
            disabled={isCapturing}
          >
            <View style={styles.captureInner}>
              {isCapturing ? (
                <Zap size={32} color="#ffffff" strokeWidth={2} />
              ) : (
                <Camera size={32} color="#ffffff" strokeWidth={2} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionGradient: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    width: '100%',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  choiceContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  optionGradient: {
    padding: 32,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBorder: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 125,
    borderStyle: 'dashed',
  },
  guideText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  galleryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 12,
  },
  captureButton: {
    backgroundColor: '#ffffff',
    borderRadius: 40,
    padding: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  capturingButton: {
    backgroundColor: '#059669',
  },
  captureInner: {
    backgroundColor: '#059669',
    borderRadius: 36,
    padding: 20,
  },
  placeholder: {
    width: 48,
  },
});
import React, { useState, useEffect } from 'react';
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
import {
  Camera,
  Image as ImageIcon,
  FlipHorizontal,
  X,
  CircleCheck as CheckCircle,
  Zap,
} from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalSearchParams, router } from 'expo-router';
import { mlService, SUPPORTED_CROPS, CropType } from '@/services/mlService';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const { colors } = useTheme();
  const { cropId, cropChosen } = useLocalSearchParams<{
    cropId?: string;
    cropChosen?: string;
  }>();
  const selectedCrop: CropType =
    SUPPORTED_CROPS.find((c) => c.id === cropId) || SUPPORTED_CROPS[0];

  // Redirect to crop selection right after permission is granted (if crop not chosen)
  useEffect(() => {
    if (permission?.granted && !cropChosen) {
      router.replace('/crop-selection' as any);
    }
  }, [permission?.granted, cropChosen]);

  // Auto-reset after 5 minutes of inactivity
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (permission?.granted) {
      t = setTimeout(
        () => {
          router.replace('/scan' as any);
        },
        5 * 60 * 1000,
      );
    }
    return () => {
      if (t) clearTimeout(t as ReturnType<typeof setTimeout>);
    };
  }, [permission?.granted]);

  if (!permission) {
    return <ThemedView style={{ flex: 1 }} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView
        style={[
          styles.permissionContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <LinearGradient
          colors={['#059669', '#10b981']}
          style={styles.permissionGradient}
        >
          <Camera size={64} color="#ffffff" strokeWidth={1.5} />
          <Text style={[styles.permissionTitle, { color: '#ffffff' }]}>
            Camera Access Required
          </Text>
          <Text style={[styles.permissionText, { color: '#ffffff' }]}>
            We need camera access to capture images of your crops for analysis.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ThemedView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const captureImage = async () => {
    if (isCapturing) return;

    setIsCapturing(true);

    // Navigate to results after mock prediction
    const result = await mlService.analyzeImage(
      'file://dummy.jpg',
      selectedCrop,
    );
    router.push({
      pathname: '/results',
      params: { data: JSON.stringify(result), cropId: selectedCrop.id },
    } as any);
    setIsCapturing(false);
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
        const uri = result.assets[0].uri;
        const analysis = await mlService.analyzeImage(uri, selectedCrop);
        router.push({
          pathname: '/results',
          params: {
            data: JSON.stringify(analysis),
            cropId: selectedCrop.id,
            imageUri: uri,
          },
        } as any);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  if (!showCamera) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <LinearGradient
          colors={[colors.background, colors.background]}
          style={styles.choiceContainer}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Scan Your Crop
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Choose how you'd like to capture or select your crop image
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                if (permission?.granted) {
                  setShowCamera(true);
                } else {
                  requestPermission();
                }
              }}
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

          <View
            style={[styles.tipsContainer, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              Tips for Better Results
            </Text>
            <View style={styles.tip}>
              <CheckCircle size={16} color="#059669" strokeWidth={2} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Ensure good lighting
              </Text>
            </View>
            <View style={styles.tip}>
              <CheckCircle size={16} color="#059669" strokeWidth={2} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Focus on affected areas
              </Text>
            </View>
            <View style={styles.tip}>
              <CheckCircle size={16} color="#059669" strokeWidth={2} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Keep camera steady
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
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
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
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

// lib/services/tflite_service.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';
import 'package:flutter/services.dart' show rootBundle;

class TFLiteService extends ChangeNotifier {
  Interpreter? _interpreter;
  List<String>? _labels;
  bool _modelLoaded = false;
  bool _isProcessing = false;
  
  bool get isModelLoaded => _modelLoaded;
  bool get isProcessing => _isProcessing;
  
  // Load the TFLite model and labels
  Future<void> loadModel() async {
    try {
      // Load model from assets
      final modelData = await rootBundle.load('assets/models/agrisol_model.tflite');
      final modelBuffer = modelData.buffer;
      final modelFile = await _getModelFile('agrisol_model.tflite');
      
      // Write model to temporary file
      await modelFile.writeAsBytes(
        modelBuffer.asUint8List(
          modelData.offsetInBytes, 
          modelData.lengthInBytes
        )
      );
      
      // Load interpreter
      _interpreter = await Interpreter.fromFile(modelFile);
      
      // Load labels
      final labelsData = await rootBundle.loadString('assets/models/model_metadata.txt');
      _labels = labelsData.split('\n');
      
      _modelLoaded = true;
      notifyListeners();
      
      print('Model loaded successfully with ${_labels?.length} classes');
    } catch (e) {
      print('Error loading model: $e');
      _modelLoaded = false;
      notifyListeners();
    }
  }
  
  // Get a temporary file for the model
  Future<File> _getModelFile(String filename) async {
    final directory = await getTemporaryDirectory();
    final path = '${directory.path}/$filename';
    return File(path);
  }
  
  // Process image and return prediction results
  Future<Map<String, dynamic>> processImage(File imageFile) async {
    if (!_modelLoaded || _interpreter == null) {
      return {'error': 'Model not loaded'};
    }
    
    _isProcessing = true;
    notifyListeners();
    
    try {
      // Read and preprocess the image
      final imageBytes = await imageFile.readAsBytes();
      final image = img.decodeImage(imageBytes);
      
      if (image == null) {
        _isProcessing = false;
        notifyListeners();
        return {'error': 'Could not decode image'};
      }
      
      // Resize image to 224x224 (matching model input size)
      final resizedImage = img.copyResize(image, width: 224, height: 224);
      
      // Convert to RGB format and normalize
      final inputImage = _preprocessImage(resizedImage);
      
      // Run inference
      final outputBuffer = List<List<double>>.filled(
        1, 
        List<double>.filled(_labels?.length ?? 0, 0)
      );
      
      _interpreter!.run(inputImage, outputBuffer);
      
      // Process results
      final results = _processResults(outputBuffer[0]);
      
      _isProcessing = false;
      notifyListeners();
      
      return results;
    } catch (e) {
      print('Error processing image: $e');
      _isProcessing = false;
      notifyListeners();
      return {'error': 'Error processing image: $e'};
    }
  }
  
  // Preprocess image for the model
  List<List<List<List<double>>>> _preprocessImage(img.Image image) {
    // Create input tensor shape [1, 224, 224, 3]
    final input = List.generate(
      1,
      (_) => List.generate(
        224,
        (_) => List.generate(
          224,
          (_) => List.filled(3, 0.0),
        ),
      ),
    );
    
    // Fill input tensor with normalized pixel values
    for (var y = 0; y < 224; y++) {
      for (var x = 0; x < 224; x++) {
        final pixel = image.getPixel(x, y);
        input[0][y][x][0] = img.getRed(pixel) / 255.0;
        input[0][y][x][1] = img.getGreen(pixel) / 255.0;
        input[0][y][x][2] = img.getBlue(pixel) / 255.0;
      }
    }
    
    return input;
  }
  
  // Process model output to get prediction results
  Map<String, dynamic> _processResults(List<double> outputBuffer) {
    // Find index with highest probability
    int maxIndex = 0;
    double maxProb = outputBuffer[0];
    
    for (var i = 1; i < outputBuffer.length; i++) {
      if (outputBuffer[i] > maxProb) {
        maxProb = outputBuffer[i];
        maxIndex = i;
      }
    }
    
    // Get top 3 predictions
    final List<Map<String, dynamic>> top3 = [];
    
    // Create a list of (index, probability) pairs
    final indexedProbs = List<MapEntry<int, double>>.generate(
      outputBuffer.length,
      (i) => MapEntry(i, outputBuffer[i]),
    );
    
    // Sort by probability (descending)
    indexedProbs.sort((a, b) => b.value.compareTo(a.value));
    
    // Take top 3
    for (var i = 0; i < 3 && i < indexedProbs.length; i++) {
      final idx = indexedProbs[i].key;
      final prob = indexedProbs[i].value;
      
      if (_labels != null && idx < _labels!.length) {
        top3.add({
          'label': _labels![idx],
          'confidence': prob,
        });
      }
    }
    
    // Generate basic recommendations based on detected condition
    String recommendation = '';
    if (_labels != null && maxIndex < _labels!.length) {
      final detectedCondition = _labels![maxIndex];
      
      // Simple recommendation logic (expand this based on your domain knowledge)
      if (detectedCondition.toLowerCase().contains('healthy')) {
        recommendation = 'Your crop appears healthy. Continue with regular maintenance.';
      } else if (detectedCondition.toLowerCase().contains('blight')) {
        recommendation = 'Potential blight detected. Consider copper-based fungicides and ensure proper spacing for air circulation.';
      } else if (detectedCondition.toLowerCase().contains('rust')) {
        recommendation = 'Rust disease detected. Remove affected leaves and apply appropriate fungicide.';
      } else if (detectedCondition.toLowerCase().contains('spot')) {
        recommendation = 'Leaf spot disease detected. Avoid overhead watering and apply recommended fungicide.';
      } else if (detectedCondition.toLowerCase().contains('mildew')) {
        recommendation = 'Mildew detected. Improve air circulation and consider sulfur-based treatments.';
      } else {
        recommendation = 'Issue detected. Consult with local agricultural extension for specific treatment options.';
      }
    }
    
    return {
      'topPrediction': _labels != null && maxIndex < _labels!.length 
          ? _labels![maxIndex] 
          : 'Unknown',
      'confidence': maxProb,
      'top3': top3,
      'recommendation': recommendation,
    };
  }
  
  // Clean up resources
  void dispose() {
    _interpreter?.close();
    super.dispose();
  }
}
// lib/screens/home_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:camera/camera.dart';
import '../services/tflite_service.dart';
import '../widgets/icon_card.dart';
import 'camera_screen.dart';
import 'results_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  File? _imageFile;
  final picker = ImagePicker();

  @override
  Widget build(BuildContext context) {
    final tfliteService = Provider.of<TFLiteService>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Agrisol'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.info_outline),
            onPressed: () => _showAboutDialog(context),
          ),
        ],
      ),
      body: Container(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // App logo and welcome text
            Center(
              child: Column(
                children: [
                  Image.asset('assets/images/logo.png', height: 120),
                  SizedBox(height: 16),
                  Text(
                    'AI-Powered Crop Health Monitor',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Take or select a photo to identify crop diseases',
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            SizedBox(height: 32),

            // Main action cards
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  IconCard(
                    icon: Icons.camera_alt,
                    title: 'Take Photo',
                    color: Colors.green.shade600,
                    onTap: () => _navigateToCameraScreen(context),
                  ),
                  IconCard(
                    icon: Icons.photo_library,
                    title: 'Gallery',
                    color: Colors.blue.shade600,
                    onTap: () => _getImageFromGallery(context),
                  ),
                  IconCard(
                    icon: Icons.history,
                    title: 'History',
                    color: Colors.orange.shade600,
                    onTap: () => _showFeatureComingSoon(context, 'History'),
                  ),
                  IconCard(
                    icon: Icons.eco,
                    title: 'Crop Guide',
                    color: Colors.purple.shade600,
                    onTap: () => _showFeatureComingSoon(context, 'Crop Guide'),
                  ),
                ],
              ),
            ),

            // Status indicator
            Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color:
                          tfliteService.isModelLoaded
                              ? Colors.green
                              : Colors.red,
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    tfliteService.isModelLoaded
                        ? 'AI Model Ready'
                        : 'Loading AI Model...',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToCameraScreen(BuildContext context) async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('No camera available')));
        return;
      }

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CameraScreen(camera: cameras.first),
        ),
      ).then((imageFile) {
        if (imageFile != null) {
          _processImage(context, imageFile);
        }
      });
    } catch (e) {
      print('Error accessing camera: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error accessing camera: $e')));
    }
  }

  void _getImageFromGallery(BuildContext context) async {
    try {
      final pickedFile = await picker.pickImage(source: ImageSource.gallery);
      if (pickedFile != null) {
        _processImage(context, File(pickedFile.path));
      }
    } catch (e) {
      print('Error picking image: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error picking image: $e')));
    }
  }

  void _processImage(BuildContext context, File imageFile) async {
    final tfliteService = Provider.of<TFLiteService>(context, listen: false);

    if (!tfliteService.isModelLoaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('AI model is still loading. Please wait.')),
      );
      return;
    }

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Dialog(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(width: 20),
                Text("Analyzing image..."),
              ],
            ),
          ),
        );
      },
    );

    // Process the image
    final results = await tfliteService.processImage(imageFile);

    // Close loading dialog
    Navigator.pop(context);

    // Navigate to results screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => ResultsScreen(imageFile: imageFile, results: results),
      ),
    );
  }

  void _showFeatureComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature will be available in the next update')),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('About Agrisol'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'AI-Powered Precision Agriculture System for Sustainable Crop Management in Rwanda',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 12),
              Text(
                'Developed by: Davy Mbuto Nkurunziza',
                style: TextStyle(fontSize: 14),
              ),
              SizedBox(height: 8),
              Text('Version: 1.0.0 (MVP)', style: TextStyle(fontSize: 14)),
              SizedBox(height: 16),
              Text(
                'This application uses computer vision and machine learning to detect crop diseases and provide management recommendations to farmers.',
                style: TextStyle(fontSize: 14),
              ),
            ],
          ),
          actions: [
            TextButton(
              child: Text('Close'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}

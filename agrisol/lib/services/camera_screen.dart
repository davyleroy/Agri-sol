// lib/screens/camera_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;

class CameraScreen extends StatefulWidget {
  final CameraDescription camera;

  CameraScreen({required this.camera});

  @override
  _CameraScreenState createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  bool _isTakingPicture = false;

  @override
  void initState() {
    super.initState();
    // Initialize camera controller
    _controller = CameraController(
      widget.camera,
      ResolutionPreset.high,
    );
    _initializeControllerFuture = _controller.initialize();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Take a Photo'),
        backgroundColor: Colors.black,
      ),
      body: FutureBuilder<void>(
        future: _initializeControllerFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return Stack(
              children: [
                // Camera preview
                Center(
                  child: CameraPreview(_controller),
                ),
                
                // Overlay for better framing
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: Colors.white,
                      width: 2,
                    ),
                    shape: BoxShape.circle,
                  ),
                  margin: EdgeInsets.all(50),
                ),
                
                // Guidance text
                Positioned(
                  bottom: 100,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                    color: Colors.black54,
                    child: Text(
                      'Position the plant leaf in the center',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            );
          } else {
            return Center(child: CircularProgressIndicator());
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.white,
        child: Icon(
          Icons.camera,
          color: Colors.black,
        ),
        onPressed: _isTakingPicture ? null : _takePicture,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Future<void> _takePicture() async {
    // Prevent multiple taps
    if (_isTakingPicture) return;
    
    setState(() {
      _isTakingPicture = true;
    });

    try {
      // Ensure camera is initialized
      await _initializeControllerFuture;

      // Create path for storing the image
      final directory = await getApplicationDocumentsDirectory();
      final imagePath = path.join(
        directory.path,
        'crop_image_${DateTime.now().millisecondsSinceEpoch}.jpg',
      );

      // Take the picture
      final image = await _controller.takePicture();
      
      // Copy image to our app directory
      File(image.path).copy(imagePath);

      // Return the image file to previous screen
      Navigator.pop(context, File(imagePath));
    } catch (e) {
      print('Error taking picture: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error taking picture: $e')),
      );
      setState(() {
        _isTakingPicture = false;
      });
    }
  }
}
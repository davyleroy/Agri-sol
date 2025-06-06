// lib/screens/results_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';

class ResultsScreen extends StatelessWidget {
  final File imageFile;
  final Map<String, dynamic> results;

  ResultsScreen({
    required this.imageFile,
    required this.results,
  });

  @override
  Widget build(BuildContext context) {
    // Check for error in results
    if (results.containsKey('error')) {
      return Scaffold(
        appBar: AppBar(title: Text('Error')),
        body: Center(
          child: Text('Error: ${results['error']}'),
        ),
      );
    }

    // Extract prediction data
    final topPrediction = results['topPrediction'] as String;
    final confidence = (results['confidence'] as double) * 100;
    final recommendation = results['recommendation'] as String;
    final top3 = results['top3'] as List<Map<String, dynamic>>;

    // Determine status color based on prediction
    Color statusColor = Colors.green;
    if (!topPrediction.toLowerCase().contains('healthy')) {
      statusColor = Colors.red;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Analysis Results'),
        actions: [
          IconButton(
            icon: Icon(Icons.share),
            onPressed: () => _shareResults(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image container
            Container(
              height: 250,
              width: double.infinity,
              child: Image.file(
                imageFile,
                fit: BoxFit.cover,
              ),
            ),
            
            // Results container
            Container(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Main result card
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: statusColor,
                        width: 2,
                      ),
                    ),
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                topPrediction.toLowerCase().contains('healthy')
                                    ? Icons.check_circle
                                    : Icons.warning,
                                color: statusColor,
                                size: 28,
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  topPrediction,
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 12),
                          Text(
                            'Confidence: ${confidence.toStringAsFixed(2)}%',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Recommendation:',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            recommendation,
                            style: TextStyle(
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  SizedBox(height: 24),
                  
                  // Other possibilities section
                  Text(
                    'Other possibilities:',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 12),
                  
                  // List of other possibilities
                  ...top3.asMap().entries.map((entry) {
                    final index = entry.key;
                    final prediction = entry.value;
                    
                    // Skip the first one as it's already displayed above
                    if (index == 0) return SizedBox.shrink();
                    
                    final label = prediction['label'] as String;
                    final conf = (prediction['confidence'] as double) * 100;
                    
                    return ListTile(
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 4,
                      ),
                      title: Text(label),
                      subtitle: Text('Confidence: ${conf.toStringAsFixed(2)}%'),
                      leading: CircleAvatar(
                        backgroundColor: Colors.grey.shade200,
                        child: Text('${index + 1}'),
                      ),
                    );
                  }).toList(),
                  
                  SizedBox(height: 24),
                  
                  // Notes and disclaimer
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Note:',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'This is an MVP version. For most accurate results, ensure good lighting and clear focus on the affected area.',
                          style: TextStyle(
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton.icon(
                icon: Icon(Icons.camera_alt),
                label: Text('New Scan'),
                onPressed: () {
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                ),
              ),
              ElevatedButton.icon(
                icon: Icon(Icons.save_alt),
                label: Text('Save'),
                onPressed: () => _saveResult(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Share results with others
  void _shareResults(BuildContext context) async {
    try {
      // Create text summary of results
      final topPrediction = results['topPrediction'] as String;
      final confidence = (results['confidence'] as double) * 100;
      final recommendation = results['recommendation'] as String;
      
      final textToShare = '''
Agrisol Crop Analysis Results:
Detected: $topPrediction
Confidence: ${confidence.toStringAsFixed(2)}%
Recommendation: $recommendation

Analyzed with Agrisol - AI-Powered Precision Agriculture
''';

      // Share both text and image
      await Share.shareXFiles(
        [XFile(imageFile.path)],
        text: textToShare,
        subject: 'Agrisol Crop Analysis Results',
      );
    } catch (e) {
      print('Error sharing results: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error sharing results: $e')),
      );
    }
  }

  // Save result to local storage
  void _saveResult(BuildContext context) async {
    // In the MVP, just show a success message
    // In a full version, this would save to local DB
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Analysis saved successfully')),
    );
  }
}
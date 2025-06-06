// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'services/tflite_service.dart';
import 'screens/home_screen.dart';
import 'utils/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  final tfliteService = TFLiteService();
  await tfliteService.loadModel();

  runApp(
    MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => tfliteService)],
      child: AgrisolApp(),
    ),
  );
}

class AgrisolApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agrisol',
      theme: ThemeData(
        primarySwatch: Colors.green,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      localizationsDelegates: [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      supportedLocales: [
        Locale('en', ''), // English
        Locale('rw', ''), // Kinyarwanda
      ],
      home: HomeScreen(),
    );
  }
}

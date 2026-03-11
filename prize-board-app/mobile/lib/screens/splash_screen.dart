import 'dart:async';

import 'package:flutter/material.dart';

import '../widgets/swipe2win_logo.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 2), () {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Swipe2WinLogo(size: 80),
              SizedBox(height: 20),
              CircularProgressIndicator(
                color: Color(0xFF0EA5FF),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

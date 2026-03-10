import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: const SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Name: Demo User'),
              SizedBox(height: 8),
              Text('Email: demo@swipe2win.app'),
              SizedBox(height: 8),
              Text('XP: 1,540'),
              SizedBox(height: 8),
              Text('Prestige: Bronze II'),
              SizedBox(height: 8),
              Text('Entries this month: 9'),
            ],
          ),
        ),
      ),
    );
  }
}

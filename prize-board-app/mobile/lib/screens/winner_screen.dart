import 'package:flutter/material.dart';

class WinnerScreen extends StatelessWidget {
  const WinnerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Winner Screen')),
      body: const SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.emoji_events, size: 56),
                SizedBox(height: 12),
                Text('Winner announced: @lucky_player_42', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                SizedBox(height: 8),
                Text('+500 XP earned • Prestige I unlocked'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

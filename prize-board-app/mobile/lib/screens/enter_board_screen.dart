import 'package:flutter/material.dart';

class EnterBoardScreen extends StatelessWidget {
  const EnterBoardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enter Board')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Confirm your entry for 1 spot at \$25.'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/winner'),
              child: const Text('Pay and enter'),
            ),
          ],
        ),
      ),
    );
  }
}

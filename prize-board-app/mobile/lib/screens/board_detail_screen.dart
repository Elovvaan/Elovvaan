import 'package:flutter/material.dart';

class BoardDetailScreen extends StatelessWidget {
  const BoardDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Board Details')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Luxury Vacation Raffle', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Prize value: \$4,000'),
            const Text('Ticket price: \$25'),
            const Text('Spots remaining: 58'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/enter-board'),
              child: const Text('Enter board'),
            ),
          ],
        ),
      ),
    );
  }
}

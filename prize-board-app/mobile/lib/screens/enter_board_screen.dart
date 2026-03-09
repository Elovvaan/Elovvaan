import 'package:flutter/material.dart';

class EnterBoardScreen extends StatelessWidget {
  const EnterBoardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Entry Flow')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('1) Select spots\n2) Confirm payment\n3) Receive entry + push notification'),
            const SizedBox(height: 16),
            const Card(
              child: ListTile(
                title: Text('Payment flow UI'),
                subtitle: Text('Card • Apple Pay • Google Pay (mocked in MVP).'),
                trailing: Icon(Icons.credit_card),
              ),
            ),
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

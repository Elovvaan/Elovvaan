import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Push Notifications')),
      body: ListView(
        children: const [
          ListTile(
            leading: Icon(Icons.campaign),
            title: Text('Board almost full'),
            subtitle: Text('Luxury Vacation Raffle has only 3 spots left.'),
          ),
          Divider(height: 1),
          ListTile(
            leading: Icon(Icons.payments),
            title: Text('Payment confirmed'),
            subtitle: Text('Your entry for Luxury Vacation Raffle is secured.'),
          ),
          Divider(height: 1),
          ListTile(
            leading: Icon(Icons.emoji_events),
            title: Text('Winner selected'),
            subtitle: Text('Gaming Setup Giveaway winner has been announced.'),
          ),
        ],
      ),
    );
  }
}

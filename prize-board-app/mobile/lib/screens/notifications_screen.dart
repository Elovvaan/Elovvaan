import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: ListView(
        children: const [
          ListTile(
            leading: Icon(Icons.local_fire_department),
            title: Text('Board almost full'),
            subtitle: Text('Luxury Vacation Raffle has only 4 spots left.'),
          ),
          Divider(height: 1),
          ListTile(
            leading: Icon(Icons.emoji_events),
            title: Text('Winner selected'),
            subtitle: Text('Gaming Setup Giveaway winner is now available.'),
          ),
        ],
      ),
    );
  }
}

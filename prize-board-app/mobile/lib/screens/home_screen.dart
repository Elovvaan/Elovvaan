import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Open Boards', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              title: const Text('Luxury Vacation Raffle'),
              subtitle: const Text('84 / 100 spots taken • Live updates enabled'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(context, '/board-detail'),
            ),
          ),
          Card(
            child: ListTile(
              title: const Text('Gaming Setup Giveaway'),
              subtitle: const Text('50 / 50 spots • Winner pending'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(context, '/winner'),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Real-time updates', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Card(
            child: ListTile(
              leading: Icon(Icons.bolt),
              title: Text('board_update'),
              subtitle: Text('Luxury Vacation Raffle now 85/100.'),
            ),
          ),
          Wrap(
            spacing: 8,
            children: [
              OutlinedButton(onPressed: () => Navigator.pushNamed(context, '/notifications'), child: const Text('Notifications')),
              OutlinedButton(onPressed: () => Navigator.pushNamed(context, '/profile'), child: const Text('XP + Prestige')),
            ],
          ),
        ],
      ),
    );
  }
}

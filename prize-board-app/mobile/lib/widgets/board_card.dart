import 'package:flutter/material.dart';

class BoardCard extends StatelessWidget {
  const BoardCard({super.key, required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Card(child: ListTile(title: Text(title)));
  }
}

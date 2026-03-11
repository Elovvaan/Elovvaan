import 'package:flutter/material.dart';

class Swipe2WinLogo extends StatelessWidget {
  const Swipe2WinLogo({super.key, this.size = 80});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFF0EA5FF),
        borderRadius: BorderRadius.circular(size * 0.25),
      ),
      alignment: Alignment.center,
      child: Icon(
        Icons.swipe,
        size: size * 0.5,
        color: Colors.white,
      ),
    );
  }
}

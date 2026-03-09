import 'package:flutter/material.dart';
import 'screens/screens.dart';

void main() {
  runApp(const PrizeBoardApp());
}

class PrizeBoardApp extends StatelessWidget {
  const PrizeBoardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Prize Board',
      theme: ThemeData(useMaterial3: true),
      initialRoute: '/login',
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/home': (_) => const HomeScreen(),
        '/board-detail': (_) => const BoardDetailScreen(),
        '/enter-board': (_) => const EnterBoardScreen(),
        '/winner': (_) => const WinnerScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/notifications': (_) => const NotificationsScreen(),
      },
    );
  }
}

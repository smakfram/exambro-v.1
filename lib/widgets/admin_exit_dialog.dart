import 'package:flutter/material.dart';

class AdminExitDialog extends StatefulWidget {
  final String correctPin;

  const AdminExitDialog({super.key, required this.correctPin});

  @override
  State<AdminExitDialog> createState() => _AdminExitDialogState();
}

class _AdminExitDialogState extends State<AdminExitDialog> {
  final TextEditingController _pinController = TextEditingController();
  String? _errorMessage;

  void _verifyPin() {
    if (_pinController.text.trim() == widget.correctPin.trim()) {
      Navigator.of(context).pop(true);
    } else {
      setState(() {
        _errorMessage = 'PIN Pengawas Salah!';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF0F172A),
      title: Row(
        children: const [
          Icon(Icons.admin_panel_settings, color: Colors.amberAccent),
          SizedBox(width: 8),
          Text('Otorisasi Pengawas', style: TextStyle(color: Colors.white, fontSize: 16)),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Masukkan PIN Khusus Pengawas untuk membuka kunci dan keluar dari mode Kiosk ujian.',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _pinController,
            obscureText: true,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white, letterSpacing: 4, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: 'PIN Admin',
              hintStyle: const TextStyle(color: Colors.white24, letterSpacing: 1),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              errorText: _errorMessage,
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Batal', style: TextStyle(color: Colors.white60)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
          onPressed: _verifyPin,
          child: const Text('Buka Kunci'),
        ),
      ],
    );
  }
}

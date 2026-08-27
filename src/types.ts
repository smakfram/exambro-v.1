export type PlatformTarget = 'flutter-mobile' | 'electron-desktop' | 'android-native' | 'ios-native' | 'windows-native';

export type ActiveTab = 'simulator' | 'flutter-code' | 'electron-code' | 'native-configs' | 'architecture' | 'qr-generator';

export interface ExamConfig {
  title: string;
  linkType?: 'google-form' | 'general';
  formUrl: string;
  durationMinutes: number;
  adminPin: string;
  schoolName: string;
  allowedDomains: string[];
  maxViolations: number;
  strictFullscreen: boolean;
  blockClipboard: boolean;
  blockScreenCapture: boolean;
  enableTimer: boolean;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'blur' | 'visibility' | 'shortcut' | 'contextmenu' | 'navigation_blocked' | 'admin_override' | 'battery_low' | 'offline';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodeSnippetItem {
  id: string;
  filename: string;
  language: string;
  platform: 'Flutter (Android/iOS)' | 'Electron (Desktop)' | 'Android Native' | 'iOS Native' | 'System Config';
  category: string;
  description: string;
  code: string;
}

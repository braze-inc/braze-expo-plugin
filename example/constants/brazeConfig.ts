import { Platform } from 'react-native';

export const defaultApiKey = Platform.select({
  ios: '43a31d1e-c2ac-4412-b473-d0b6b46e2747',
  android: 'c131cc0e-92ea-4c35-a1d6-7c2d1adb5907',
}) ?? '';

export const defaultEndpoint = 'sondheim.braze.com';

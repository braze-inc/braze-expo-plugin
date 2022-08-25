export type ConfigProps = {
  androidApiKey: string;
  iosApiKey: string;
  baseUrl: string;
  sessionTimeout?: number;
  enableSdkAuthentication?: boolean;
  logLevel?: number;
  enableGeofence?: boolean;
  minimumTriggerIntervalInSeconds?: number;
  enableAutomaticLocationCollection?: boolean;
  enableAutomaticGeofenceRequests?: boolean;
  dismissModalOnOutsideTap?: boolean;
  enableBrazeIosPush?: boolean;
  enableFirebaseCloudMessaging?: boolean;
  firebaseCloudMessagingSenderId?: string;
};

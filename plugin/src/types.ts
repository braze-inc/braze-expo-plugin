export type ConfigProps = {
  /**
   * @deprecated Set the Android API key at runtime via `Braze.initialize()` instead.
   */
  androidApiKey?: string;
  /**
   * @deprecated Set the iOS API key at runtime via `Braze.initialize()` instead.
   */
  iosApiKey?: string;
  /**
   * @deprecated Set the SDK endpoint at runtime via `Braze.initialize()` instead.
   */
  baseUrl?: string;

  sessionTimeout?: number;
  enableSdkAuthentication?: boolean;
  logLevel?: number;
  enableGeofence?: boolean;
  minimumTriggerIntervalInSeconds?: number;
  enableAutomaticLocationCollection?: boolean;
  enableAutomaticGeofenceRequests?: boolean;
  dismissModalOnOutsideTap?: boolean;
  enableBrazeIosPush?: boolean;
  enableBrazeIosRichPush?: boolean;
  enableBrazeIosPushStories?: boolean;
  iosPushStoryAppGroup?: string;
  iosRequestPushPermissionsAutomatically?: boolean;
  enableFirebaseCloudMessaging?: boolean;
  firebaseCloudMessagingSenderId?: string;
  androidHandlePushDeepLinksAutomatically?: boolean;
  iosUseUUIDAsDeviceId?: boolean;
  iosForwardUniversalLinks?: boolean;
};

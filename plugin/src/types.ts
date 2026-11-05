import type { ANDROID_CONFIG_MAP } from './brazeAndroidConstants';

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
  /**
   * Value for the main target `aps-environment` entitlement when Braze iOS push
   * features are enabled. Set `production` for release-style builds if needed; does
   * not override an existing `ios.entitlements` / `aps-environment` from app config.
   */
  iosPushEntitlementsMode?: "development" | "production";
  iosPushStoryAppGroup?: string;
  iosRequestPushPermissionsAutomatically?: boolean;
  enableFirebaseCloudMessaging?: boolean;
  firebaseCloudMessagingSenderId?: string;
  androidHandlePushDeepLinksAutomatically?: boolean;
  androidPushNotificationHtmlRenderingEnabled?: boolean;
  /**
   * Drawable resource reference, e.g. `"@drawable/ic_notification"`. The resource must
   * already exist in the Android project; the plugin doesn't copy assets.
   */
  androidNotificationSmallIcon?: string;
  /**
   * Drawable resource reference, e.g. `"@drawable/ic_notification_large"`. The resource must
   * already exist in the Android project; the plugin doesn't copy assets.
   */
  androidNotificationLargeIcon?: string;
  /**
   * Written to `braze.xml` as a `<color>` value, e.g. `"#ff112233"` (ARGB hex).
   */
  androidNotificationAccentColor?: string;
  androidFirebaseMessagingFallbackServiceEnabled?: boolean;
  /**
   * Classpath of the app's own `FirebaseMessagingService`, e.g. `"expo.modules.notifications.service.ExpoFirebaseMessagingService"`.
   * Only used when `androidFirebaseMessagingFallbackServiceEnabled` is `true`.
   */
  androidFirebaseMessagingFallbackServiceClasspath?: string;
  iosUseUUIDAsDeviceId?: boolean;
  iosForwardUniversalLinks?: boolean;
};

// Fails the build if `ANDROID_CONFIG_MAP` has a key that isn't declared in `ConfigProps`.
type AssertNoMissingKeys<T extends [never]> = T;
type _AndroidConfigMapKeysInConfigProps = AssertNoMissingKeys<
  [Exclude<keyof typeof ANDROID_CONFIG_MAP, keyof ConfigProps>]
>;

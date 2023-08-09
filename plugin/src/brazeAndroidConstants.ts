export const GRADLE_APPEND_ID = "expo-react-native-braze-sdk-import"
export const BUILDSCRIPT_LEVEL_GRADLE =
  `
// start-${GRADLE_APPEND_ID}
allprojects {
  repositories {
    maven { url "https://appboy.github.io/appboy-android-sdk/sdk" }
  }
}
buildscript {
    ext {
        // Set the kotlin version used in the Braze React SDK's buildscript
        if (findProperty('android.kotlinVersion')) {
            kotlin_version = findProperty('android.kotlinVersion')
        } else {
            kotlin_version = "1.8.10"
        }
    }
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version")
  }
}
// end-${GRADLE_APPEND_ID}
`;
export const APP_LEVEL_GRADLE =
`
// start-${GRADLE_APPEND_ID}
dependencies {
  if (project.getProperty('expo.braze.addFirebaseMessaging') == 'true') {
    def braze_fcm_version = findProperty('expo.braze.fcmVersion') ?: '23.0.0'
    implementation "com.google.firebase:firebase-messaging:$braze_fcm_version"
  }
}
// end-${GRADLE_APPEND_ID}
`;

export const BRAZE_SDK_REQUIRED_PERMISSIONS = [
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.INTERNET",
]

export const ANDROID_BRAZE_XML_PATH = './android/app/src/main/res/values/braze.xml';
export const BX_STR = "string";
export const BX_INT = "integer";
export const BX_BOOL = "bool";
export const BX_COLOR = "color";
export const BX_DRAWABLE = "drawable";
export const ANDROID_CONFIG_MAP = {
  "androidApiKey": ["com_braze_api_key", BX_STR],
  "baseUrl": ["com_braze_custom_endpoint", BX_STR],
  "firebaseCloudMessagingSenderId": ["com_braze_firebase_cloud_messaging_sender_id", BX_STR],
  "androidFirebaseMessagingFallbackServiceClasspath": ["com_braze_fallback_firebase_cloud_messaging_service_classpath", BX_STR],

  "sessionTimeout": ["com_braze_session_timeout", BX_INT],
  "logLevel": ["com_braze_logger_initial_log_level", BX_INT],
  "minimumTriggerIntervalInSeconds": ["com_braze_trigger_action_minimum_time_interval_seconds", BX_INT],

  "enableSdkAuthentication": ["com_braze_sdk_authentication_enabled", BX_BOOL],
  "enableGeofence": ["com_braze_geofences_enabled", BX_BOOL],
  "enableAutomaticLocationCollection": ["com_braze_enable_location_collection", BX_BOOL],
  "enableAutomaticGeofenceRequests": ["com_braze_automatic_geofence_requests_enabled", BX_BOOL],
  "enableFirebaseCloudMessaging": ["com_braze_firebase_cloud_messaging_registration_enabled", BX_BOOL],
  "androidHandlePushDeepLinksAutomatically": ["com_braze_handle_push_deep_links_automatically", BX_BOOL],
  "androidPushNotificationHtmlRenderingEnabled": ["com_braze_push_notification_html_rendering_enabled", BX_BOOL],
  "androidFirebaseMessagingFallbackServiceEnabled": ["com_braze_fallback_firebase_cloud_messaging_service_enabled", BX_BOOL],

  "androidNotificationSmallIcon": ["com_braze_push_small_notification_icon", BX_DRAWABLE],
  "androidNotificationLargeIcon": ["com_braze_push_large_notification_icon", BX_DRAWABLE],

  "androidNotificationAccentColor": ["com_braze_default_notification_accent_color", BX_COLOR],
};

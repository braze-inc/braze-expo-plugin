# 3.0.0

##### Breaking
- This version requires [`13.1.0`](https://github.com/braze-inc/braze-react-native-sdk/releases/tag/13.1.0) of the Braze React Native SDK.
- Replaces the iOS `BrazeAppDelegate` method call of `BrazeReactUtils.populateInitialUrl` with `BrazeReactUtils.populateInitialPayload`.
  - This update resolves an issue where push opened events would not be triggered when clicking on a notification while the application is in a terminated state.
  - To fully leverage this update, replace all calls of `Braze.getInitialURL` with `Braze.getInitialPushPayload` in your JavaScript code.
    - The initial URL can now be accessed via the `url` property of the initial push payload.

##### Fixed
- Fixes the Expo prebuild script to prevent duplicate Braze properties from being added to `gradle.properties`.
  - Thanks for your contribution, @matinzd!

##### Added
- Updates the sample app to use [Expo SDK 51](https://expo.dev/changelog/2024/05-07-sdk-51).
  - There are no known breaking incompatibilities with the Braze Expo plugin or Braze React Native SDK.

# 2.1.2

##### Fixed
- Fixes the sample app to contain examples on configuring app extension build settings for Expo Application Services (EAS).

# 2.1.1

##### Fixed
- Tentative fix for code-signing notification extensions on iOS when using Expo Managed Workflow and Expo Application Services (EAS).

# 2.1.0

##### Added
- Adds support for Rich Push notifications and Push Stories.
  - Set `enableBrazeIosRichPush` to `true` in your `app.json` to enable Rich Push notifications.
  - Set `enableBrazeIosPushStories` to `true` and configure your app group name with `iosPushStoryAppGroup` in your `app.json` to enable Push Stories.
  - For further integration details, refer to the native Swift SDK instructions for [Rich Push Notifications](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/b2-rich-push-notifications) and [Push Stories](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/b3-push-stories).

# 2.0.0

##### Breaking
- Bumps the iOS minimum platform version to `13.4`, per the [Expo SDK 50 requirements](https://expo.dev/changelog/2024/01-18-sdk-50).
- This version requires version [8.3.0+](https://github.com/braze-inc/braze-react-native-sdk/releases/tag/8.3.0) of the Braze React Native SDK to fully support Expo SDK 50.

##### Fixed
- Fixes Android compatibility with [Expo SDK 50](https://expo.dev/changelog/2024/01-18-sdk-50).
  - This release removes strict dependencies on Java 11 from the `build.gradle` file.
  - This fix adds namespacing and `buildFeatures.buildConfig` for compatibility with Android Gradle Plugin 8+.

# 1.2.0

##### Added
- Updates the `enableBrazeIosPush` configuration to use the [automatic push handling](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/b1-standard-push-notifications#Option-1-Automatic-push-notification-handling) features from the Braze Swift SDK.
  - This release requires version [8.2.0+](https://github.com/braze-inc/braze-react-native-sdk/releases/tag/8.2.0) of the Braze React Native SDK, this change allows the Braze Expo plugin to be compatible with incoming iOS notifications from Expo Notifications.
- Adds the `iosRequestPushPermissionsAutomatically` configuration to control whether iOS push permissions should be requested automatically on app launch.

# 1.1.2

##### Added
- Added Android support for the following configuration fields:
  - `androidPushNotificationHtmlRenderingEnabled, androidNotificationSmallIcon, androidNotificationLargeIcon, androidNotificationAccentColor`
- Added support for configuring a fallback Firebase Messaging Service on Android via `androidFirebaseMessagingFallbackServiceEnabled` and `androidFirebaseMessagingFallbackServiceClasspath`.
  - For example, if your fallback Firebase Messaging Service was `expo.modules.notifications.service.ExpoFirebaseMessagingService`, then your configuration would need to include:
  ```
    "androidFirebaseMessagingFallbackServiceEnabled": true,
    "androidFirebaseMessagingFallbackServiceClasspath": "expo.modules.notifications.service.ExpoFirebaseMessagingService",
  ```
  - You can find the proper fallback classpath in your Android merged `AndroidManifest.xml` file.
- Updated the sample app with version `6.0.1` of the the Braze React Native SDK.
  - This version demonstrates usage of the New Architecture and the Braze SDK as a Turbo Module.

# 1.1.1

##### Fixed
- Fixed an issue where `Braze.getInitialUrl()` could incorrectly return `null`.

# 1.1.0

##### ⚠ Breaking
- Now requires Braze React Native SDK v2.1.0+.
- Updates the default Kotlin version to 1.8.10 for Expo 48 compatibility. This value is overridden by the [`android.kotlinVersion`](https://docs.expo.dev/versions/latest/sdk/build-properties/#pluginconfigtypeandroid) property in `app.json`.

##### Changed
- No longer requires static linkage of frameworks for iOS.

# 1.0.1

##### Fixed
- Fixed an issue introduced in 1.0.0 where setting `enableAutoLocationCollection` to any value in `app.json` would enable the option on iOS.

# 1.0.0

##### ⚠ Breaking
- Adds support for Braze React Native SDK v2.0.2+. This version is not backwards compatible with previous versions of Braze React Native SDK.

# 0.6.0

##### ⚠ Breaking
- The Braze Expo Plugin now requires Expo 47.
- `google-services.json` is no longer required to be placed in the `assets` folder. The filepath is now set in `app.json` through the [`googleServicesFile`](https://docs.expo.dev/versions/latest/config/app/#googleservicesfile-1) property.

##### Added
- Added a new configuration prop `androidHandlePushDeepLinksAutomatically` that allows the Braze SDK to automatically handle push deep links on Android.

# 0.5.0

##### ⚠ Breaking
- The iOS deployment target has been changed to 13.0 for compatibility with Expo 47.

# 0.4.0

##### ⚠ Breaking
- Renamed the prop `fcmSenderID` to `firebaseCloudMessagingSenderId`.

##### Added
- Added support for Android and iOS push.

# 0.3.1

##### Fixed
- Fixed an issue where the `minimumTriggerIntervalInSeconds` prop did not work as expected on Android.

# 0.3.0

##### ⚠ Breaking
- Renamed `customEndpoint` to `baseUrl`.

# 0.2.0

##### ⚠ Breaking
- Removed the `apiKey` prop and replaced it with `iosApiKey` and `androidApiKey` parameters, both of which are required.

# 0.1.0

- Initial release with support for in-app messages, content cards, and analytics.

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

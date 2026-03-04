<p align="center">
  <img width="480" src=".github/assets/logo-light.png#gh-light-mode-only" />
  <img width="480" src=".github/assets/logo-dark.png#gh-dark-mode-only" />
</p>

# Braze Expo Plugin [![latest](https://img.shields.io/github/v/tag/braze-inc/braze-expo-plugin?label=latest%20release&color=300266)](https://github.com/braze-inc/braze-expo-plugin/releases)

- [Braze User Guide](https://www.braze.com/docs/user_guide/introduction/ "Braze User Guide")
- [Braze Developer Guide](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native "Braze Developer Guide")

## Quickstart

``` shell
npm install @braze/react-native-sdk
npx expo install @braze/expo-plugin
```

``` json
// app.json
{
  "expo": {
    "plugins": [
      [
        "@braze/expo-plugin",
        {
          "androidApiKey": "YOUR-ANDROID-API-KEY",
          "iosApiKey": "YOUR-IOS-API-KEY",
          "baseUrl": "YOUR-SDK-ENDPOINT"
        }
      ],
    ]
  }
}
```

``` shell
npx expo prebuild
```

``` typescript
import Braze from "@braze/react-native-sdk";

Braze.changeUser("Jane Doe")
```

See [the Braze Developer Guide](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native) for advanced integration options.

## Version Support

> [!NOTE]
> This SDK has been tested with Expo version **54.0.8**.

| Braze Expo Plugin | Braze React Native SDK |
| ----------------- | ---------------------- |
| >=4.0.0           | >= 19.1.0              |
| >=3.0.0           | >= 13.1.0              |
| >=2.0.0           | >= 8.3.0               |
| >=1.1.0           | >= 2.1.0               |
| 1.0.0 - 1.0.1     | >= 2.0.2               |
| <= 0.6.0          | 1.38.0 - 1.41.0        |

## Contact

If you have questions, please contact [support@braze.com](mailto:support@braze.com).

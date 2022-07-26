import { ConfigPlugin, withInfoPlist, withPodfileProperties } from "@expo/config-plugins";
import { ConfigProps } from "./types";

const withStaticFrameworks: ConfigPlugin = (config) => {
  return withPodfileProperties(config, async (config) => {
    config.modResults["ios.useFrameworks"] = "static";
    return config;
  })
}

export const withIOSBrazeSdk: ConfigPlugin<ConfigProps> = (config, props) => {
  config = withStaticFrameworks(config);
  config = withInfoPlist(config, (config) => {
    delete config.modResults.Braze;
    const { apiKey, customEndpoint } = props;
    if (apiKey) {
      config.modResults.Braze = {
        ApiKey: apiKey,
        Endpoint: customEndpoint,
      };

      if (props.sessionTimeout != null) {
        config.modResults.Braze.SessionTimeout = props.sessionTimeout;
      }

      if (props.enableSdkAuthentication != null) {
        config.modResults.Braze.EnableSDKAuth = props.enableSdkAuthentication;
      }

      if (props.logLevel != null) {
        config.modResults.Braze.LogLevel = props.logLevel;
      }

      if (props.enableGeofence != null) {
        config.modResults.Braze.EnableGeofence = props.enableGeofence;
      }

      if (props.minimumTriggerIntervalInSeconds != null) {
        config.modResults.Braze.TriggerInterval = props.minimumTriggerIntervalInSeconds;
      }

      if (props.enableAutomaticLocationCollection != null) {
        config.modResults.Braze.EnableAutomaticLocationCollection = props.enableAutomaticLocationCollection;
      }

      if (props.enableAutomaticGeofenceRequests != null) {
        // iOS key is `DisableAutomaticGeofenceRequests` so flip the prop value
        config.modResults.Braze.DisableAutomaticGeofenceRequests = !props.enableAutomaticGeofenceRequests;
      }

      if (props.dismissModalOnOutsideTap != null) {
        config.modResults.Braze.DismissModalOnOutsideTap = props.dismissModalOnOutsideTap;
      }
    }

    return config;
  });
  return config;
};

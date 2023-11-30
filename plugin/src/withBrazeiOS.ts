import { ConfigPlugin, withInfoPlist } from "expo/config-plugins";

import { ConfigProps } from "./types";

const withBrazeInfoPlist: ConfigPlugin<ConfigProps> = (config, props) => {
  return withInfoPlist(config, (config) => {
    delete config.modResults.Braze;
    const { iosApiKey, baseUrl } = props;
    if (iosApiKey) {
      config.modResults.Braze = {
        ApiKey: iosApiKey,
        Endpoint: baseUrl,
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
        config.modResults.Braze.EnableAutomaticLocationCollection = props.enableAutomaticGeofenceRequests;
      }

      if (props.dismissModalOnOutsideTap != null) {
        config.modResults.Braze.DismissModalOnOutsideTap = props.dismissModalOnOutsideTap;
      }

      if (props.enableBrazeIosPush != null) {
        config.modResults.Braze.UseBrazePush = props.enableBrazeIosPush;
      }

      if (props.iosRequestPushPermissionsAutomatically != null) {
        config.modResults.Braze.RequestPushPermissionsAutomatically = props.iosRequestPushPermissionsAutomatically;
      }
    }

    return config;
  });
}

export const withIOSBrazeSdk: ConfigPlugin<ConfigProps> = (config, props) => {
  config = withBrazeInfoPlist(config, props);
  return config;
};

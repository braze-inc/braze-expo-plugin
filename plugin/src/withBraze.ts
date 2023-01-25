import { ConfigPlugin, createRunOncePlugin } from "expo/config-plugins";

import { withAndroidBrazeSdk } from "./withBrazeAndroid";
import { withIOSBrazeSdk } from "./withBrazeiOS";
import { ConfigProps } from './types';

const withBraze: ConfigPlugin<ConfigProps> = (
  config,
  _props
) => {
  const props = _props || { androidApiKey: "", iosApiKey: "", baseUrl: "" };

  config = withAndroidBrazeSdk(config, props);
  config = withIOSBrazeSdk(config, props);

  return config;
};

const pkg = require("../package.json");

export default createRunOncePlugin(
  withBraze,
  pkg.name,
  pkg.version
);

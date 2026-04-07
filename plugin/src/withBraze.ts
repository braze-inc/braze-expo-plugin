import { ConfigPlugin, createRunOncePlugin } from "expo/config-plugins";

import { withAndroidBrazeSdk } from "./withBrazeAndroid";
import { withIOSBrazeSdk } from "./withBrazeiOS";
import { ConfigProps } from "./types";

function warningForDeprecatedProps(props: ConfigProps | undefined) {
  if (!props) {
    return;
  }
  const used: string[] = [];
  if (props.androidApiKey) {
    used.push("androidApiKey");
  }
  if (props.iosApiKey) {
    used.push("iosApiKey");
  }
  if (props.baseUrl) {
    used.push("baseUrl");
  }
  if (used.length === 0) {
    return;
  }
  console.warn(
    `The configuration options are deprecated: ${used.join(", ")}. ` +
      "Configure the credentials with `Braze.initialize()` instead. ",
  );
}

const withBraze: ConfigPlugin<ConfigProps> = (config, _props) => {
  const props: ConfigProps = _props ?? {};
  warningForDeprecatedProps(props);

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

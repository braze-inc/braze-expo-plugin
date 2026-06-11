import type { StaticPlugin } from "@expo/config-types";
import type { ConfigProps } from "./types";

export default function withBraze(props: ConfigProps = {}): StaticPlugin<ConfigProps> {
  return ["@braze/expo-plugin", props];
}
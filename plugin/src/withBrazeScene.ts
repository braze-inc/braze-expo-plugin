import { ConfigPlugin, withBaseMod, withDangerousMod } from "expo/config-plugins";

const fs = require("fs");
const path = require("path");

const EXPO_SCENE_DELEGATE_CLASS = "EXExpoAppSceneDelegate";
const BRAZE_SCENE_DELEGATE_CLASS = "BrazeAppSceneDelegate";
const SCENE_DELEGATE_EXTENSION_POINT = "// Extension point for config plugins.";
const BRAZE_SCENE_IMPORT = "import braze_react_native_sdk";
const BRAZE_SCENE_OVERRIDE = `  override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    BrazeReactUtils.sharedInstance().populateInitialPayload(
      from: connectionOptions.notificationResponse
    )
    super.scene(scene, willConnectTo: session, options: connectionOptions)
  }`;

/**
 * The scene manifest points at Expo's own scene delegate.
 *
 * This plugin points it at the Braze scene delegate, which subclasses Expo's, so the push that launched the app is captured.
 * The manifest is written by another plugin, and Info.plist modifiers run in the reverse order they were added.
 */
export const withBrazeSceneManifest: ConfigPlugin = (config) => {
  return withBaseMod(config, {
    platform: "ios",
    mod: "infoPlist",
    isProvider: false,
    action: async ({ modRequest: { nextMod, ...modRequest }, ...config }: any) => {
      const results = await nextMod({ modRequest, ...config });
      const manifest = results.modResults.UIApplicationSceneManifest as
        | { UISceneConfigurations?: Record<string, unknown> }
        | undefined;
      const configurationsByRole = manifest?.UISceneConfigurations ?? {};
      for (const configurations of Object.values(configurationsByRole)) {
        if (!Array.isArray(configurations)) {
          continue;
        }
        for (const configuration of configurations as Record<string, unknown>[]) {
          if (configuration.UISceneDelegateClassName === EXPO_SCENE_DELEGATE_CLASS) {
            configuration.UISceneDelegateClassName = BRAZE_SCENE_DELEGATE_CLASS;
          }
        }
      }
      return results;
    },
  });
};

/**
 * Expo SDK 58 and later generate a scene delegate in the app target with an extension point for config plugins.
 * This plugin adds the Braze override at that extension point. Does nothing when the file is missing or already updated,
 * and warns when the extension point is missing.
 */
export const withBrazeSceneDelegateFile: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const sceneDelegatePath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        "SceneDelegate.swift",
      );
      if (!fs.existsSync(sceneDelegatePath)) {
        return config;
      }
      const contents: string = fs.readFileSync(sceneDelegatePath, "utf8");
      if (contents.includes("populateInitialPayload(")) {
        return config;
      }
      if (!contents.includes(SCENE_DELEGATE_EXTENSION_POINT)) {
        console.warn(
          "Could not find the config plugin extension point in SceneDelegate.swift. " +
            "Braze.getInitialPushPayload() will return null on a cold start from a push tap until " +
            "populateInitialPayload(from: connectionOptions.notificationResponse) is called in scene(_:willConnectTo:options:).",
        );
        return config;
      }
      const updated = contents
        .replace(SCENE_DELEGATE_EXTENSION_POINT, `${SCENE_DELEGATE_EXTENSION_POINT}\n${BRAZE_SCENE_OVERRIDE}`)
        .replace(/^/, `${BRAZE_SCENE_IMPORT}\n`);
      fs.writeFileSync(sceneDelegatePath, updated);
      return config;
    },
  ]);
};

/**
 * The Braze scene delegate is written to Info.plist, so a later prebuild without a clean reads it back.
 * Other plugins that validate the manifest only recognize Expo's delegate class and fail on the Braze one.
 * Dangerous modifiers run before Info.plist modifiers, so this restores Expo's class and lets the manifest modifier swap it again.
 */
export const withBrazeSceneManifestRestore: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const infoPlistPath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        "Info.plist",
      );
      if (!fs.existsSync(infoPlistPath)) {
        return config;
      }
      const contents: string = fs.readFileSync(infoPlistPath, "utf8");
      const brazeClassEntry = `<string>${BRAZE_SCENE_DELEGATE_CLASS}</string>`;
      if (!contents.includes(brazeClassEntry)) {
        return config;
      }
      fs.writeFileSync(
        infoPlistPath,
        contents.split(brazeClassEntry).join(`<string>${EXPO_SCENE_DELEGATE_CLASS}</string>`),
      );
      return config;
    },
  ]);
};

export const withBrazeScene: ConfigPlugin = (config) => {
  config = withBrazeSceneManifestRestore(config);
  config = withBrazeSceneManifest(config);
  config = withBrazeSceneDelegateFile(config);
  return config;
};

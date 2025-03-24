import { ConfigPlugin, withInfoPlist, withXcodeProject, withDangerousMod, withEntitlementsPlist } from "expo/config-plugins";

import { ConfigProps } from "./types";

const fs = require('fs');
const path = require('path');

const BRAZE_IOS_RICH_PUSH_TARGET = 'BrazeExpoRichPush';
const BRAZE_IOS_PUSH_STORY_TARGET = 'BrazeExpoPushStories';

const BRAZE_IOS_RICH_PUSH_FILES = [
  'NotificationService.swift',
  `${BRAZE_IOS_RICH_PUSH_TARGET}-Info.plist`,
  `${BRAZE_IOS_RICH_PUSH_TARGET}.entitlements`
];
const BRAZE_IOS_PUSH_STORY_FILES = [
  'NotificationViewController.swift',
  `${BRAZE_IOS_PUSH_STORY_TARGET}-Info.plist`,
  `${BRAZE_IOS_PUSH_STORY_TARGET}.entitlements`
];

const BRAZE_IOS_NOTIFICATION_SERVICE_POD = 'BrazeNotificationService';
const BRAZE_IOS_PUSH_STORY_POD = 'BrazePushStory';

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

      if (props.iosPushStoryAppGroup != null) {
        config.modResults.Braze.BrazePushStoryAppGroup = props.iosPushStoryAppGroup;
      }

      if (props.useUUIDAsDeviceId != null) {
        config.modResults.Braze.UseUUIDAsDeviceId = props.useUUIDAsDeviceId;
      }
    }

    return config;
  });
}

const withBrazeEntitlements: ConfigPlugin<ConfigProps> = (config, props) => {
  return withEntitlementsPlist(config, (config) => {
    // Add the app group to the main application target's entitlements.
    if (props.enableBrazeIosPushStories === true && props.iosPushStoryAppGroup != null) {
      const appGroupsKey = 'com.apple.security.application-groups';
      const existingAppGroups = config.modResults[appGroupsKey];
      if (Array.isArray(existingAppGroups) && !existingAppGroups.includes(props.iosPushStoryAppGroup)) {
        config.modResults[appGroupsKey] = existingAppGroups.concat([props.iosPushStoryAppGroup]);
      } else {
        config.modResults[appGroupsKey] = [props.iosPushStoryAppGroup];
      }
    }
    return config;
  });
};

// Modify the Xcode project to include the Notification Service Extension and its relevant files.
const withBrazeXcodeProject: ConfigPlugin<ConfigProps> = (config, props) => {
  return withXcodeProject(config, (config) => {

    if (props.enableBrazeIosRichPush === true || props.enableBrazeIosPushStories === true) {
      // Initialize with an empty object if these top-level objects are non-existent.
      // This guarantees that the extension targets will have a destination.
      const objects = config.modResults.hash.project.objects;
      objects['PBXTargetDependency'] = objects['PBXTargetDependency'] || {};
      objects['PBXContainerItemProxy'] = objects['PBXContainerItemProxy'] || {};

      const groups = objects['PBXGroup'];
      const xcconfigs = objects['XCBuildConfiguration'];

      // Retrieve Swift version and code signing settings from main target to apply to dependency targets.
      let swiftVersion;
      let codeSignStyle;
      let codeSignIdentity;
      let otherCodeSigningFlags;
      let developmentTeam;
      let provisioningProfile;
      for (const configUUID of Object.keys(xcconfigs)) {
        const buildSettings = xcconfigs[configUUID].buildSettings;
        if (!swiftVersion && buildSettings && buildSettings.SWIFT_VERSION) {
          swiftVersion = buildSettings.SWIFT_VERSION;
          codeSignStyle = buildSettings.CODE_SIGN_STYLE;
          codeSignIdentity = buildSettings.CODE_SIGN_IDENTITY;
          otherCodeSigningFlags = buildSettings.OTHER_CODE_SIGN_FLAGS;
          developmentTeam = buildSettings.DEVELOPMENT_TEAM;
          provisioningProfile = buildSettings.PROVISIONING_PROFILE_SPECIFIER;
          break;
        }
      }

      // Rich Push Notification Service Extension
      if (props.enableBrazeIosRichPush === true && !config.modResults.pbxGroupByName(BRAZE_IOS_RICH_PUSH_TARGET)) {
        // Add the Notification Service Extension target.
        const richPushTarget = config.modResults.addTarget(
          BRAZE_IOS_RICH_PUSH_TARGET,
          'app_extension',
          BRAZE_IOS_RICH_PUSH_TARGET,
          `${config.ios?.bundleIdentifier}.${BRAZE_IOS_RICH_PUSH_TARGET}`,
        );

        // Add the relevant files to the PBX group.
        const brazeNotificationServiceGroup = config.modResults.addPbxGroup(
          BRAZE_IOS_RICH_PUSH_FILES,
          BRAZE_IOS_RICH_PUSH_TARGET,
          BRAZE_IOS_RICH_PUSH_TARGET,
        );

        for (const groupUUID of Object.keys(groups)) {
          if (typeof groups[groupUUID] === 'object'
                && groups[groupUUID].name === undefined
                && groups[groupUUID].path === undefined) {
            config.modResults.addToPbxGroup(brazeNotificationServiceGroup.uuid, groupUUID);
          }
        };

        for (const configUUID of Object.keys(xcconfigs)) {
          const buildSettings = xcconfigs[configUUID].buildSettings;
          if (buildSettings && buildSettings.PRODUCT_NAME === `"${BRAZE_IOS_RICH_PUSH_TARGET}"`) {
            buildSettings.SWIFT_VERSION = swiftVersion;
            buildSettings.CODE_SIGN_ENTITLEMENTS = `${BRAZE_IOS_RICH_PUSH_TARGET}/${BRAZE_IOS_RICH_PUSH_TARGET}.entitlements`;
            if (codeSignStyle) { buildSettings.CODE_SIGN_STYLE = codeSignStyle; }
            if (codeSignIdentity) { buildSettings.CODE_SIGN_IDENTITY = codeSignIdentity; }
            if (otherCodeSigningFlags) { buildSettings.OTHER_CODE_SIGN_FLAGS = otherCodeSigningFlags; }
            if (developmentTeam) { buildSettings.DEVELOPMENT_TEAM = developmentTeam; }
            if (provisioningProfile) { buildSettings.PROVISIONING_PROFILE_SPECIFIER = provisioningProfile; }
          }
        }

        // Set up target build phase scripts.
        config.modResults.addBuildPhase(
          [
            'NotificationService.swift',
          ],
          'PBXSourcesBuildPhase',
          'Sources',
          richPushTarget.uuid
        );

        config.modResults.addBuildPhase(
          ['UserNotifications.framework'],
          'PBXFrameworksBuildPhase',
          'Frameworks',
          richPushTarget.uuid
        );
      }

      // Push Stories Notification Content Extension
      if (props.enableBrazeIosPushStories === true
            && props.iosPushStoryAppGroup != null
            && !config.modResults.pbxGroupByName(BRAZE_IOS_PUSH_STORY_TARGET)) {
        // Add the Notification Content Extension target.
        const pushStoriesTarget = config.modResults.addTarget(
          BRAZE_IOS_PUSH_STORY_TARGET,
          'app_extension',
          BRAZE_IOS_PUSH_STORY_TARGET,
          `${config.ios?.bundleIdentifier}.${BRAZE_IOS_PUSH_STORY_TARGET}`,
        );

        // Add the relevant files to the PBX group.
        const brazeNotificationServiceGroup = config.modResults.addPbxGroup(
          BRAZE_IOS_PUSH_STORY_FILES,
          BRAZE_IOS_PUSH_STORY_TARGET,
          BRAZE_IOS_PUSH_STORY_TARGET,
        );

        for (const groupUUID of Object.keys(groups)) {
          if (typeof groups[groupUUID] === 'object'
                && groups[groupUUID].name === undefined
                && groups[groupUUID].path === undefined) {
            config.modResults.addToPbxGroup(brazeNotificationServiceGroup.uuid, groupUUID);
          }
        };

        for (const configUUID of Object.keys(xcconfigs)) {
          const buildSettings = xcconfigs[configUUID].buildSettings;
          if (buildSettings && buildSettings.PRODUCT_NAME === `"${BRAZE_IOS_PUSH_STORY_TARGET}"`) {
            buildSettings.BRAZE_PUSH_STORY_APP_GROUP = props.iosPushStoryAppGroup;
            buildSettings.SWIFT_VERSION = swiftVersion;
            buildSettings.CODE_SIGN_ENTITLEMENTS = `${BRAZE_IOS_PUSH_STORY_TARGET}/${BRAZE_IOS_PUSH_STORY_TARGET}.entitlements`;
            if (codeSignStyle) { buildSettings.CODE_SIGN_STYLE = codeSignStyle; }
            if (codeSignIdentity) { buildSettings.CODE_SIGN_IDENTITY = codeSignIdentity; }
            if (otherCodeSigningFlags) { buildSettings.OTHER_CODE_SIGN_FLAGS = otherCodeSigningFlags; }
            if (developmentTeam) { buildSettings.DEVELOPMENT_TEAM = developmentTeam; }
            if (provisioningProfile) { buildSettings.PROVISIONING_PROFILE_SPECIFIER = provisioningProfile; }
          }
        }

        // Set up target build phase scripts.
        config.modResults.addBuildPhase(
          [
            'NotificationViewController.swift',
          ],
          'PBXSourcesBuildPhase',
          'Sources',
          pushStoriesTarget.uuid
        );

        config.modResults.addBuildPhase(
          [
            'UserNotifications.framework',
            'UserNotificationsUI.framework'
          ],
          'PBXFrameworksBuildPhase',
          'Frameworks',
          pushStoriesTarget.uuid
        );
      }
    }

    return config;
  });
};

// Direct modifications to the project files.
// Used for any operations that can't be contained within direct manipulation of the Xcode project or properties.
const withBrazeDangerousMod: ConfigPlugin<ConfigProps> = (config, props) => {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const projectRoot = config.modRequest.projectRoot;

      // Modify the Podfile for rich push.
      if (props.enableBrazeIosRichPush === true) {
        // Copy Rich Push files to project path.
        const absoluteSource = require.resolve('@braze/expo-plugin/ios/ExpoAdapterBraze/RichPush/NotificationService.swift');
        const sourcePath = path.dirname(absoluteSource);
        const destinationPath = `${projectRoot}/ios/${BRAZE_IOS_RICH_PUSH_TARGET}`;
        if (!fs.existsSync(`${destinationPath}`)) {
          fs.mkdirSync(`${destinationPath}`);
        }
        for (const file of BRAZE_IOS_RICH_PUSH_FILES) {
          fs.copyFileSync(`${sourcePath}/${file}`, `${destinationPath}/${file}`);
        }

        // Modify Podfile to include `BrazeNotificationService`.
        const podfilePath = `${projectRoot}/ios/Podfile`;
        const podfile = fs.readFileSync(podfilePath);
        if (!podfile.includes(BRAZE_IOS_NOTIFICATION_SERVICE_POD)) {
          const notificationServiceTarget =
          `
            target '${BRAZE_IOS_RICH_PUSH_TARGET}' do
              use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
              use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']
              pod '${BRAZE_IOS_NOTIFICATION_SERVICE_POD}'
            end
          `
          fs.appendFileSync(podfilePath, notificationServiceTarget);
        }
      }

      // Modify the Podfile for Push Stories.
      if (props.enableBrazeIosPushStories === true) {
        // Copy Push Stories files to project path.
        const absoluteSource = require.resolve('@braze/expo-plugin/ios/ExpoAdapterBraze/PushStories/NotificationViewController.swift');
        const sourcePath = path.dirname(absoluteSource);
        const destinationPath = `${projectRoot}/ios/${BRAZE_IOS_PUSH_STORY_TARGET}`;
        if (!fs.existsSync(`${destinationPath}`)) {
          fs.mkdirSync(`${destinationPath}`);
        }
        for (const file of BRAZE_IOS_PUSH_STORY_FILES) {
          fs.copyFileSync(`${sourcePath}/${file}`, `${destinationPath}/${file}`);
        }

        // Modify Podfile to include `BrazePushStory`.
        const podfilePath = `${projectRoot}/ios/Podfile`;
        const podfile = fs.readFileSync(podfilePath);
        if (!podfile.includes(BRAZE_IOS_PUSH_STORY_POD)) {
          const notificationServiceTarget =
          `
            target '${BRAZE_IOS_PUSH_STORY_TARGET}' do
              use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
              use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']
              pod '${BRAZE_IOS_PUSH_STORY_POD}'
            end
          `
          fs.appendFileSync(podfilePath, notificationServiceTarget);
        }
      }

      return config;
    },
  ]);
};

export const withIOSBrazeSdk: ConfigPlugin<ConfigProps> = (config, props) => {
  config = withBrazeInfoPlist(config, props);
  config = withBrazeEntitlements(config, props);
  config = withBrazeXcodeProject(config, props);
  config = withBrazeDangerousMod(config, props);
  return config;
};

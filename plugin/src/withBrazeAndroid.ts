import { writeFileSync, copyFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

import {
  ConfigPlugin,
  withProjectBuildGradle,
  withDangerousMod,
  withAppBuildGradle,
} from "@expo/config-plugins";
import { withPermissions } from "@expo/config-plugins/build/android/Permissions";
import {
  createGeneratedHeaderComment,
  MergeResults,
  removeGeneratedContents,
} from "@expo/config-plugins/build/utils/generateCode";

import { ConfigProps } from './types';

const ANDROID_BRAZE_XML_PATH = './android/app/src/main/res/values/braze.xml';
const GOOGLE_SERVICES_JSON_DESTINATION_PATH = './android/app/google-services.json';
/**
 * The expected source location of the google-services.json file 
 */
const GOOGLE_SERVICES_JSON_EXPECTED_SOURCE_PATH = './assets/google-services.json';
const PROJECT_LEVEL_GRADLE = "braze-project-level-build-extras.gradle"
const APP_LEVEL_WITH_FIREBASE_GRADLE = "braze-app-level-build-extras-with-firebase.gradle"
const APP_LEVEL_WITHOUT_FIREBASE_GRADLE = "braze-app-level-build-extras-without-firebase.gradle"
const GRADLE_APPEND_ID = "react-native-braze-sdk-import"

const BX_STR = "string";
const BX_INT = "integer";
const BX_BOOL = "bool";
const ANDROID_CONFIG_MAP = {
  "androidApiKey": ["com_braze_api_key", BX_STR],
  "baseUrl": ["com_braze_custom_endpoint", BX_STR],
  "firebaseCloudMessagingSenderId": ["com_braze_firebase_cloud_messaging_sender_id", BX_STR],

  "sessionTimeout": ["com_braze_session_timeout", BX_INT],
  "logLevel": ["com_braze_logger_initial_log_level", BX_INT],
  "minimumTriggerIntervalInSeconds": ["com_braze_trigger_action_minimum_time_interval_seconds", BX_INT],

  "enableSdkAuthentication": ["com_braze_sdk_authentication_enabled", BX_BOOL],
  "enableGeofence": ["com_braze_geofences_enabled", BX_BOOL],
  "enableAutomaticLocationCollection": ["com_braze_enable_location_collection", BX_BOOL],
  "enableAutomaticGeofenceRequests": ["com_braze_automatic_geofence_requests_enabled", BX_BOOL],
  "enableFirebaseCloudMessaging": ["com_braze_firebase_cloud_messaging_registration_enabled", BX_BOOL],
  "enablingAutomaticDeepLinkOpening": ["com_braze_handle_push_deep_links_automatically", BX_BOOL],
};

async function appendContentsFromFile(config: any, tag: string, srcFile: string) {
  if (config.modResults.language === "groovy") {
    const src = config.modResults.contents;
    const appendedContents = appendContents({
      tag: tag,
      src,
      newSrc: readFileSync(srcFile, 'utf8'),
      comment: "//",
    })
    config.modResults.contents = appendedContents.contents;
  } else {
    throw new Error(
      "Cannot add maven gradle because the build.gradle is not in groovy"
    );
  }
  return config;
}

function appendContents({
  src,
  newSrc,
  tag,
  comment,
}: {
  src: string;
  newSrc: string;
  tag: string;
  comment: string;
}): MergeResults {
  const header = createGeneratedHeaderComment(newSrc, tag, comment);
  if (!src.includes(header)) {
    // Ensure the old generated contents are removed.
    const sanitizedTarget = removeGeneratedContents(src, tag);
    const contentsToAdd = [
      // @something
      header,
      // contents
      newSrc,
      // @end
      `${comment} @generated end ${tag}`,
    ].join("\n");

    return {
      contents: sanitizedTarget ?? src + '\n' + contentsToAdd,
      didMerge: true,
      didClear: !!sanitizedTarget,
    };
  }
  return { contents: src, didClear: false, didMerge: false };
}

async function copyFileOver(sourcePath: string, destPath: string) {
  try {
    copyFileSync(sourcePath, destPath);
  } catch (e) {
    throw new Error(
      `Cannot copy file from ${sourcePath} to ${destPath}.\n${e}`
    );
  }
}

async function writeBrazeXml(
  projectRoot: string,
  data: string
) {
  const destinationPath = resolve(projectRoot, ANDROID_BRAZE_XML_PATH);

  try {
    writeFileSync(destinationPath, data);
  } catch (e) {
    throw new Error(
      `Cannot write braze.xml file to ${destinationPath}.\n${e}`
    );
  }
  return true;
}

export const withAndroidBrazeSdk: ConfigPlugin<ConfigProps> = (config, props) => {
  config = withPermissions(config, [
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.INTERNET",
  ]);

  let brazeXml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>'
  Object.entries(props).forEach(([key, value]) => {
    const mappedConfigInfo = ANDROID_CONFIG_MAP[key as keyof typeof ANDROID_CONFIG_MAP];
    if (value == null || mappedConfigInfo == null) {
      // If it's not defined just move on
      return;
    }

    // Should be the Braze configuration name, such as "com_braze_api_key"
    const xmlKeyName = mappedConfigInfo[0];
    // Should be the `braze.xml` key, such as "string"
    const xmlKeyType = mappedConfigInfo[1];

    brazeXml += "\n  ";
    switch (xmlKeyType) {
      case BX_STR:
        brazeXml += `<${xmlKeyType} translatable="false" name="${xmlKeyName}">${value}</${xmlKeyType}>`;
        break;
      case BX_INT:
        brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
        break;
      case BX_BOOL:
        brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
        break;
    }
  });
  brazeXml += "\n</resources>\n";

  // Reference the project build.gradle
  config = withProjectBuildGradle(config, (config) => {
    return appendContentsFromFile(
      config, 
      GRADLE_APPEND_ID, 
      resolve(__dirname, `../src/assets/${PROJECT_LEVEL_GRADLE}`)
    );
  });

  // If FCM is enabled, then move the 
  // google-services.json file to the app
  if (props.enableFirebaseCloudMessaging) {
    // Copy google-services.json
    config = withDangerousMod(config, [
      'android',
      async config => {
        const projectRoot = config.modRequest.projectRoot;
        copyFileOver(
          resolve(projectRoot, GOOGLE_SERVICES_JSON_EXPECTED_SOURCE_PATH),
          resolve(projectRoot, GOOGLE_SERVICES_JSON_DESTINATION_PATH)
        );
        return config;
      },
    ]);

    // Append the "with-firebase" gradle file
    config = withAppBuildGradle(config, (config) => {
      return appendContentsFromFile(
        config,
        GRADLE_APPEND_ID,
        resolve(__dirname, `../src/assets/${APP_LEVEL_WITH_FIREBASE_GRADLE}`)
      );
    });
  } else {
    // Append the "without-firebase" file
    config = withAppBuildGradle(config, (config) => {
      return appendContentsFromFile(
        config,
        GRADLE_APPEND_ID,
        resolve(__dirname, `../src/assets/${APP_LEVEL_WITHOUT_FIREBASE_GRADLE}`)
      );
    });
  }

  config = withDangerousMod(config, [
    'android',
    async config => {
      await writeBrazeXml(config.modRequest.projectRoot, brazeXml);
      return config;
    },
  ]);

  return config;
};

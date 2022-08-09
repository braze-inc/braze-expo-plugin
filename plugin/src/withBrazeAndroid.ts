import { writeFileSync } from 'fs';
import { resolve } from 'path';

import {
  ConfigPlugin,
  withProjectBuildGradle,
  withDangerousMod,
} from "@expo/config-plugins";
import { withPermissions } from "@expo/config-plugins/build/android/Permissions";
import {
  createGeneratedHeaderComment,
  MergeResults,
  removeGeneratedContents,
} from "@expo/config-plugins/build/utils/generateCode";

import { ConfigProps } from './types';

const ANDROID_BRAZE_XML_PATH = './android/app/src/main/res/values/braze.xml';

const BX_STR = "string";
const BX_INT = "integer";
const BX_BOOL = "bool";
const ANDROID_CONFIG_MAP = {
  "androidApiKey": ["com_braze_api_key", BX_STR],
  "customEndpoint": ["com_braze_custom_endpoint", BX_STR],
  "fcmSenderID": ["com_braze_firebase_cloud_messaging_sender_id", BX_STR],

  "sessionTimeout": ["com_braze_session_timeout", BX_INT],
  "logLevel": ["com_braze_logger_initial_log_level", BX_INT],
  "minimumTriggerIntervalInSeconds": ["minimumTriggerIntervalInSeconds", BX_INT],

  "enableSdkAuthentication": ["com_braze_sdk_authentication_enabled", BX_BOOL],
  "enableGeofence": ["com_braze_geofences_enabled", BX_BOOL],
  "enableAutomaticLocationCollection": ["com_braze_enable_location_collection", BX_BOOL],
  "enableAutomaticGeofenceRequests": ["com_braze_automatic_geofence_requests_enabled", BX_BOOL],
};

const gradleMaven = [
  `allprojects { repositories { maven { url "https://appboy.github.io/appboy-android-sdk/sdk" } } }`,
].join("\n");

export function addBrazeImport(src: string): MergeResults {
  return appendContents({
    tag: "react-native-appboy-sdk-import",
    src,
    newSrc: gradleMaven,
    comment: "//",
  });
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
      contents: sanitizedTarget ?? src + contentsToAdd,
      didMerge: true,
      didClear: !!sanitizedTarget,
    };
  }
  return { contents: src, didClear: false, didMerge: false };
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
      `Cannot write braze.xml file to ${destinationPath}. Please make sure the source and destination paths exist.`
    );
  }
  return true;
}

export const withAndroidBrazeSdk: ConfigPlugin<ConfigProps> = (config, props) => {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addBrazeImport(
        config.modResults.contents
      ).contents;
    } else {
      throw new Error(
        "Cannot add maven gradle because the build.gradle is not in groovy"
      );
    }
    return config;
  });

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

  config = withDangerousMod(config, [
    'android',
    async config => {
      await writeBrazeXml(config.modRequest.projectRoot, brazeXml);
      return config;
    },
  ]);

  return config;
};

import { writeFileSync } from 'fs';
import { resolve } from 'path';

import {
  ConfigPlugin,
  withProjectBuildGradle,
  withDangerousMod,
  withAppBuildGradle,
  AndroidConfig,
  withGradleProperties,
  ExportedConfigWithProps
} from "expo/config-plugins";

import { ConfigProps } from './types';
import {
  GRADLE_APPEND_ID,
  BUILDSCRIPT_LEVEL_GRADLE,
  APP_LEVEL_GRADLE,
  BRAZE_SDK_REQUIRED_PERMISSIONS,
  ANDROID_BRAZE_XML_PATH,
  BX_STR,
  BX_INT,
  BX_BOOL,
  BX_DRAWABLE,
  BX_COLOR,
  ANDROID_CONFIG_MAP
} from './brazeAndroidConstants'

async function writeBrazeXml(
  projectRoot: string,
  props: ConfigProps
) {
  const destinationPath = resolve(projectRoot, ANDROID_BRAZE_XML_PATH);

  try {
    let brazeXml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
    brazeXml += '<string-array name="com_braze_internal_sdk_metadata">\n<item>GRADLE</item>\n</string-array>\n'

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
        case BX_DRAWABLE:
          brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
          break;
        case BX_COLOR:
          brazeXml += `<${xmlKeyType} name="${xmlKeyName}">${value}</${xmlKeyType}>`;
          break;
      }
    });
    brazeXml += "\n</resources>\n";

    writeFileSync(destinationPath, brazeXml);
  } catch (e) {
    throw new Error(
      `Cannot write braze.xml file to ${destinationPath}.\n${e}`
    );
  }
  return true;
}

async function appendContentsToConfig(newConfig: ExportedConfigWithProps<AndroidConfig.Paths.GradleProjectFile>, newContents: string) {
  let { contents } = newConfig.modResults;
  // Don't add this twice
  if (!contents.includes(GRADLE_APPEND_ID)) {
    contents += newContents;
    newConfig.modResults.contents = contents;
  }
  return newConfig;
}

export const withAndroidBrazeSdk: ConfigPlugin<ConfigProps> = (config, props) => {
  config = AndroidConfig.Permissions.withPermissions(config, BRAZE_SDK_REQUIRED_PERMISSIONS);

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      await writeBrazeXml(config.modRequest.projectRoot, props);
      return config;
    },
  ]);

  // Reference the project build.gradle
  config = withProjectBuildGradle(config, (newConfig) => {
    return appendContentsToConfig(newConfig, BUILDSCRIPT_LEVEL_GRADLE);
  });

  // Update app build.gradle
  config = withAppBuildGradle(config, (newConfig) => {
    return appendContentsToConfig(newConfig, APP_LEVEL_GRADLE);
  });

  // Add to the gradle properties
  config = withGradleProperties(config, (newConfig) => {
    const newProperties: AndroidConfig.Properties.PropertiesItem[] = [
      {
        type: "property",
        key: "expo.braze.fcmVersion",
        value: "23.0.0",
      },
      {
        type: "property",
        key: "expo.braze.addFirebaseMessaging",
        value: String(props.enableFirebaseCloudMessaging === true),
      },
    ]

    // Avoid adding duplicate entries to the gradle.properties file.
    const findExistingProperty = (key: string) => newConfig.modResults.find(property => property.type === 'property' && property.key === key);

    newProperties.forEach(newProperty => {
      // Only `property` types have a `key`. Check the type to prevent `undefined` states.
      if (newProperty.type === 'property') {
        const existingProperty = findExistingProperty(newProperty.key);

        if (!existingProperty) {
          newConfig.modResults.push(newProperty);
        } else if (existingProperty.type === 'property' && existingProperty.value !== newProperty.value) {
          existingProperty.value = newProperty.value;
        }
      }
    });

    return newConfig;
  });

  return config;
};

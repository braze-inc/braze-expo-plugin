import * as fs from 'fs';
import {
  shouldAddIosPushEntitlement,
  withBrazeInfoPlist,
  withBrazeEntitlements,
  withBrazeXcodeProject,
  withBrazeDangerousMod,
} from '../withBrazeiOS';

jest.mock('expo/config-plugins', () => ({
  withInfoPlist: jest.fn((config: unknown, modifier: (c: unknown) => unknown) => modifier(config)),
  withEntitlementsPlist: jest.fn((config: unknown, modifier: (c: unknown) => unknown) => modifier(config)),
  withXcodeProject: jest.fn((config: unknown, modifier: (c: unknown) => unknown) => modifier(config)),
  withDangerousMod: jest.fn((config: unknown, [, modifier]: [unknown, (c: unknown) => unknown]) => modifier(config)),
}));

jest.mock('fs');

// Allow require.resolve to return deterministic paths for @braze/expo-plugin assets.
const originalResolve = require.resolve;
beforeAll(() => {
  (require as unknown as { resolve: (id: string) => string }).resolve = (id: string) => {
    if (id.startsWith('@braze/expo-plugin/ios/')) {
      return `/mock/${id.replace('@braze/expo-plugin/', '')}`;
    }
    return originalResolve(id);
  };
});
afterAll(() => {
  (require as unknown as { resolve: (id: string) => string }).resolve = originalResolve;
});

// --- Config factories ---

function makeInfoPlistConfig(modResults: Record<string, unknown> = {}) {
  return {
    ios: { bundleIdentifier: 'com.test.app' },
    modResults,
  };
}

function makeEntitlementsConfig(modResults: Record<string, unknown> = {}) {
  return { modResults };
}

function makeXcodeConfig(xcconfigs: Record<string, unknown> = {}, groups: Record<string, unknown> = {}) {
  const modResults = {
    hash: {
      project: {
        objects: {
          PBXGroup: groups,
          XCBuildConfiguration: xcconfigs,
          // These keys are initialised inside the plugin if missing.
        },
      },
    },
    pbxGroupByName: jest.fn().mockReturnValue(null),
    addTarget: jest.fn().mockReturnValue({ uuid: 'target-uuid' }),
    addPbxGroup: jest.fn().mockReturnValue({ uuid: 'group-uuid' }),
    addToPbxGroup: jest.fn(),
    addBuildPhase: jest.fn(),
  };
  return {
    ios: { bundleIdentifier: 'com.test.app' },
    modResults,
  };
}

function makeDangerousConfig() {
  return { modRequest: { projectRoot: '/project' } };
}

// ============================================================
// shouldAddIosPushEntitlement
// ============================================================

describe('shouldAddIosPushEntitlement', () => {
  it('returns false when no push flags are set', () => {
    expect(shouldAddIosPushEntitlement({})).toBe(false);
  });

  it('returns true when enableBrazeIosPush is true', () => {
    expect(shouldAddIosPushEntitlement({ enableBrazeIosPush: true })).toBe(true);
  });

  it('returns true when enableBrazeIosRichPush is true', () => {
    expect(shouldAddIosPushEntitlement({ enableBrazeIosRichPush: true })).toBe(true);
  });

  it('returns true when enableBrazeIosPushStories is true', () => {
    expect(shouldAddIosPushEntitlement({ enableBrazeIosPushStories: true })).toBe(true);
  });

  it('returns false when all push flags are explicitly false', () => {
    expect(
      shouldAddIosPushEntitlement({
        enableBrazeIosPush: false,
        enableBrazeIosRichPush: false,
        enableBrazeIosPushStories: false,
      }),
    ).toBe(false);
  });
});

// ============================================================
// withBrazeInfoPlist
// ============================================================

describe('withBrazeInfoPlist', () => {
  it('creates an empty Braze dict when no props are set', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, {});
    expect((result as typeof config).modResults.Braze).toEqual({});
  });

  it('deletes any pre-existing Braze key before writing', () => {
    const config = makeInfoPlistConfig({ Braze: { ApiKey: 'old' } });
    const result = withBrazeInfoPlist(config as never, {});
    expect((result as typeof config).modResults.Braze).toEqual({});
  });

  it('sets ApiKey when iosApiKey is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { iosApiKey: 'MY_KEY' });
    expect((result as typeof config).modResults.Braze).toMatchObject({ ApiKey: 'MY_KEY' });
  });

  it('sets Endpoint when baseUrl is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { baseUrl: 'sdk.iad-01.braze.com' });
    expect((result as typeof config).modResults.Braze).toMatchObject({ Endpoint: 'sdk.iad-01.braze.com' });
  });

  it('sets SessionTimeout when sessionTimeout is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { sessionTimeout: 30 });
    expect((result as typeof config).modResults.Braze).toMatchObject({ SessionTimeout: 30 });
  });

  it('sets EnableSDKAuth when enableSdkAuthentication is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { enableSdkAuthentication: true });
    expect((result as typeof config).modResults.Braze).toMatchObject({ EnableSDKAuth: true });
  });

  it('sets LogLevel when logLevel is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { logLevel: 8 });
    expect((result as typeof config).modResults.Braze).toMatchObject({ LogLevel: 8 });
  });

  it('sets EnableGeofence when enableGeofence is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { enableGeofence: true });
    expect((result as typeof config).modResults.Braze).toMatchObject({ EnableGeofence: true });
  });

  it('sets TriggerInterval when minimumTriggerIntervalInSeconds is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { minimumTriggerIntervalInSeconds: 10 });
    expect((result as typeof config).modResults.Braze).toMatchObject({ TriggerInterval: 10 });
  });

  it('sets EnableAutomaticLocationCollection when provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { enableAutomaticLocationCollection: true });
    expect((result as typeof config).modResults.Braze).toMatchObject({ EnableAutomaticLocationCollection: true });
  });

  it('sets EnableAutomaticGeofenceRequests when provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { enableAutomaticGeofenceRequests: false });
    expect((result as typeof config).modResults.Braze).toMatchObject({ EnableAutomaticGeofenceRequests: false });
  });

  it('sets DismissModalOnOutsideTap when provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { dismissModalOnOutsideTap: true });
    expect((result as typeof config).modResults.Braze).toMatchObject({ DismissModalOnOutsideTap: true });
  });

  it('sets UseBrazePush when enableBrazeIosPush is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { enableBrazeIosPush: true });
    expect((result as typeof config).modResults.Braze).toMatchObject({ UseBrazePush: true });
  });

  it('sets RequestPushPermissionsAutomatically when provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { iosRequestPushPermissionsAutomatically: false });
    expect((result as typeof config).modResults.Braze).toMatchObject({ RequestPushPermissionsAutomatically: false });
  });

  it('sets BrazePushStoryAppGroup when iosPushStoryAppGroup is provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { iosPushStoryAppGroup: 'group.com.test' });
    expect((result as typeof config).modResults.Braze).toMatchObject({ BrazePushStoryAppGroup: 'group.com.test' });
  });

  it('sets UseUUIDAsDeviceId when provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { iosUseUUIDAsDeviceId: true });
    expect((result as typeof config).modResults.Braze).toMatchObject({ UseUUIDAsDeviceId: true });
  });

  it('sets ForwardUniversalLinks when provided', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, { iosForwardUniversalLinks: true });
    expect((result as typeof config).modResults.Braze).toMatchObject({ ForwardUniversalLinks: true });
  });

  it('omits keys whose props are undefined', () => {
    const config = makeInfoPlistConfig();
    const result = withBrazeInfoPlist(config as never, {});
    const braze = (result as typeof config).modResults.Braze as Record<string, unknown>;
    expect(braze.ApiKey).toBeUndefined();
    expect(braze.Endpoint).toBeUndefined();
    expect(braze.SessionTimeout).toBeUndefined();
  });
});

// ============================================================
// withBrazeEntitlements
// ============================================================

describe('withBrazeEntitlements', () => {
  it('adds no entitlements when no push flags are set', () => {
    const config = makeEntitlementsConfig();
    const result = withBrazeEntitlements(config as never, {});
    expect((result as typeof config).modResults['aps-environment']).toBeUndefined();
    expect((result as typeof config).modResults['com.apple.security.application-groups']).toBeUndefined();
  });

  it('adds aps-environment: development when enableBrazeIosPush is true', () => {
    const config = makeEntitlementsConfig();
    const result = withBrazeEntitlements(config as never, { enableBrazeIosPush: true });
    expect((result as typeof config).modResults['aps-environment']).toBe('development');
  });

  it('adds aps-environment: production when iosPushEntitlementsMode is production', () => {
    const config = makeEntitlementsConfig();
    const result = withBrazeEntitlements(config as never, {
      enableBrazeIosPush: true,
      iosPushEntitlementsMode: 'production',
    });
    expect((result as typeof config).modResults['aps-environment']).toBe('production');
  });

  it('does not overwrite an existing aps-environment value', () => {
    const config = makeEntitlementsConfig({ 'aps-environment': 'production' });
    const result = withBrazeEntitlements(config as never, { enableBrazeIosPush: true });
    expect((result as typeof config).modResults['aps-environment']).toBe('production');
  });

  it('adds app group when push stories and app group are both set', () => {
    const config = makeEntitlementsConfig();
    const result = withBrazeEntitlements(config as never, {
      enableBrazeIosPushStories: true,
      iosPushStoryAppGroup: 'group.com.test',
    });
    expect((result as typeof config).modResults['com.apple.security.application-groups']).toEqual(['group.com.test']);
  });

  it('appends the app group to an existing app groups array', () => {
    const config = makeEntitlementsConfig({
      'com.apple.security.application-groups': ['group.existing'],
    });
    const result = withBrazeEntitlements(config as never, {
      enableBrazeIosPushStories: true,
      iosPushStoryAppGroup: 'group.com.test',
    });
    expect((result as typeof config).modResults['com.apple.security.application-groups']).toEqual([
      'group.existing',
      'group.com.test',
    ]);
  });

  it('does not duplicate app group if already present in the array', () => {
    const config = makeEntitlementsConfig({
      'com.apple.security.application-groups': ['group.com.test'],
    });
    const result = withBrazeEntitlements(config as never, {
      enableBrazeIosPushStories: true,
      iosPushStoryAppGroup: 'group.com.test',
    });
    expect((result as typeof config).modResults['com.apple.security.application-groups']).toEqual(['group.com.test']);
  });

  it('does not add app group when iosPushStoryAppGroup is not set', () => {
    const config = makeEntitlementsConfig();
    const result = withBrazeEntitlements(config as never, { enableBrazeIosPushStories: true });
    expect((result as typeof config).modResults['com.apple.security.application-groups']).toBeUndefined();
  });
});

// ============================================================
// withBrazeXcodeProject
// ============================================================

describe('withBrazeXcodeProject', () => {
  it('does not modify the Xcode project when no push flags are enabled', () => {
    const config = makeXcodeConfig();
    withBrazeXcodeProject(config as never, {});
    expect(config.modResults.addTarget).not.toHaveBeenCalled();
    expect(config.modResults.addPbxGroup).not.toHaveBeenCalled();
  });

  describe('Rich Push', () => {
    it('adds BrazeExpoRichPush target when enableBrazeIosRichPush is true', () => {
      const config = makeXcodeConfig();
      withBrazeXcodeProject(config as never, { enableBrazeIosRichPush: true });
      expect(config.modResults.addTarget).toHaveBeenCalledWith(
        'BrazeExpoRichPush',
        'app_extension',
        'BrazeExpoRichPush',
        'com.test.app.BrazeExpoRichPush',
      );
    });

    it('adds PBX group with rich push files', () => {
      const config = makeXcodeConfig();
      withBrazeXcodeProject(config as never, { enableBrazeIosRichPush: true });
      expect(config.modResults.addPbxGroup).toHaveBeenCalledWith(
        expect.arrayContaining(['NotificationService.swift']),
        'BrazeExpoRichPush',
        'BrazeExpoRichPush',
      );
    });

    it('adds Sources and Frameworks build phases for the rich push target', () => {
      const config = makeXcodeConfig();
      withBrazeXcodeProject(config as never, { enableBrazeIosRichPush: true });
      expect(config.modResults.addBuildPhase).toHaveBeenCalledWith(
        ['NotificationService.swift'],
        'PBXSourcesBuildPhase',
        'Sources',
        'target-uuid',
      );
      expect(config.modResults.addBuildPhase).toHaveBeenCalledWith(
        ['UserNotifications.framework'],
        'PBXFrameworksBuildPhase',
        'Frameworks',
        'target-uuid',
      );
    });

    it('sets CODE_SIGN_ENTITLEMENTS build setting for the rich push target', () => {
      const xcconfigs = {
        'cfg-1': {
          buildSettings: {
            SWIFT_VERSION: '5.0',
            PRODUCT_NAME: '"BrazeExpoRichPush"',
          },
        },
      };
      const config = makeXcodeConfig(xcconfigs);
      withBrazeXcodeProject(config as never, { enableBrazeIosRichPush: true });
      expect(xcconfigs['cfg-1'].buildSettings).toMatchObject({
        CODE_SIGN_ENTITLEMENTS: 'BrazeExpoRichPush/BrazeExpoRichPush.entitlements',
        SWIFT_VERSION: '5.0',
      });
    });

    it('does not add target when the group already exists (idempotent)', () => {
      const config = makeXcodeConfig();
      config.modResults.pbxGroupByName.mockReturnValue({ uuid: 'existing-group' });
      withBrazeXcodeProject(config as never, { enableBrazeIosRichPush: true });
      expect(config.modResults.addTarget).not.toHaveBeenCalled();
    });
  });

  describe('Push Stories', () => {
    it('adds BrazeExpoPushStories target when enableBrazeIosPushStories and iosPushStoryAppGroup are set', () => {
      const config = makeXcodeConfig();
      withBrazeXcodeProject(config as never, {
        enableBrazeIosPushStories: true,
        iosPushStoryAppGroup: 'group.com.test',
      });
      expect(config.modResults.addTarget).toHaveBeenCalledWith(
        'BrazeExpoPushStories',
        'app_extension',
        'BrazeExpoPushStories',
        'com.test.app.BrazeExpoPushStories',
      );
    });

    it('sets BRAZE_PUSH_STORY_APP_GROUP build setting for the push stories target', () => {
      const xcconfigs = {
        'cfg-1': {
          buildSettings: {
            SWIFT_VERSION: '5.0',
            PRODUCT_NAME: '"BrazeExpoPushStories"',
          },
        },
      };
      const config = makeXcodeConfig(xcconfigs);
      withBrazeXcodeProject(config as never, {
        enableBrazeIosPushStories: true,
        iosPushStoryAppGroup: 'group.com.test',
      });
      expect(xcconfigs['cfg-1'].buildSettings).toMatchObject({
        BRAZE_PUSH_STORY_APP_GROUP: 'group.com.test',
        CODE_SIGN_ENTITLEMENTS: 'BrazeExpoPushStories/BrazeExpoPushStories.entitlements',
      });
    });

    it('does not add push stories target when iosPushStoryAppGroup is missing', () => {
      const config = makeXcodeConfig();
      withBrazeXcodeProject(config as never, { enableBrazeIosPushStories: true });
      expect(config.modResults.addTarget).not.toHaveBeenCalled();
    });

    it('adds Sources and Frameworks build phases (including UserNotificationsUI) for push stories', () => {
      const config = makeXcodeConfig();
      withBrazeXcodeProject(config as never, {
        enableBrazeIosPushStories: true,
        iosPushStoryAppGroup: 'group.com.test',
      });
      expect(config.modResults.addBuildPhase).toHaveBeenCalledWith(
        ['NotificationViewController.swift'],
        'PBXSourcesBuildPhase',
        'Sources',
        'target-uuid',
      );
      expect(config.modResults.addBuildPhase).toHaveBeenCalledWith(
        ['UserNotifications.framework', 'UserNotificationsUI.framework'],
        'PBXFrameworksBuildPhase',
        'Frameworks',
        'target-uuid',
      );
    });
  });
});

// ============================================================
// withBrazeDangerousMod
// ============================================================

describe('withBrazeDangerousMod', () => {
  const mockedFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs no file operations when no push flags are set', () => {
    const config = makeDangerousConfig();
    withBrazeDangerousMod(config as never, {});
    expect(mockedFs.copyFileSync).not.toHaveBeenCalled();
    expect(mockedFs.appendFileSync).not.toHaveBeenCalled();
    expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
  });

  describe('Rich Push', () => {
    it('creates the destination directory when it does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockReturnValue(Buffer.from(''));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosRichPush: true });
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/project/ios/BrazeExpoRichPush');
    });

    it('skips mkdirSync when the destination directory already exists', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(Buffer.from(''));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosRichPush: true });
      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });

    it('copies all rich push files to the destination', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockReturnValue(Buffer.from(''));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosRichPush: true });
      expect(mockedFs.copyFileSync).toHaveBeenCalledTimes(3);
      expect(mockedFs.copyFileSync).toHaveBeenCalledWith(
        expect.stringContaining('NotificationService.swift'),
        '/project/ios/BrazeExpoRichPush/NotificationService.swift',
      );
    });

    it('appends BrazeNotificationService pod target to Podfile when not already present', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(Buffer.from('# existing Podfile content'));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosRichPush: true });
      expect(mockedFs.appendFileSync).toHaveBeenCalledWith(
        '/project/ios/Podfile',
        expect.stringContaining('BrazeNotificationService'),
      );
    });

    it('does not append to Podfile when BrazeNotificationService is already present', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(Buffer.from("pod 'BrazeNotificationService'"));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosRichPush: true });
      expect(mockedFs.appendFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Push Stories', () => {
    it('creates the destination directory when it does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockReturnValue(Buffer.from(''));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosPushStories: true });
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/project/ios/BrazeExpoPushStories');
    });

    it('copies all push stories files to the destination', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockReturnValue(Buffer.from(''));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosPushStories: true });
      expect(mockedFs.copyFileSync).toHaveBeenCalledTimes(3);
      expect(mockedFs.copyFileSync).toHaveBeenCalledWith(
        expect.stringContaining('NotificationViewController.swift'),
        '/project/ios/BrazeExpoPushStories/NotificationViewController.swift',
      );
    });

    it('appends BrazePushStory pod target to Podfile when not already present', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(Buffer.from('# existing Podfile content'));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosPushStories: true });
      expect(mockedFs.appendFileSync).toHaveBeenCalledWith(
        '/project/ios/Podfile',
        expect.stringContaining('BrazePushStory'),
      );
    });

    it('does not append to Podfile when BrazePushStory is already present', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(Buffer.from("pod 'BrazePushStory'"));
      const config = makeDangerousConfig();
      withBrazeDangerousMod(config as never, { enableBrazeIosPushStories: true });
      expect(mockedFs.appendFileSync).not.toHaveBeenCalled();
    });
  });
});

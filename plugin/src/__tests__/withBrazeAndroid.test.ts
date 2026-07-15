import * as fs from 'fs';
import { withAndroidBrazeSdk } from '../withBrazeAndroid';

let dangerousModCallback: ((config: unknown) => Promise<unknown>) | null = null;

jest.mock('expo/config-plugins', () => ({
  withDangerousMod: jest.fn((config: unknown, [, modifier]: [unknown, (c: unknown) => Promise<unknown>]) => {
    dangerousModCallback = modifier;
    return config;
  }),
  withProjectBuildGradle: jest.fn((config: unknown, modifier: (c: unknown) => unknown) =>
    modifier({ modResults: { contents: '' } }),
  ),
  withAppBuildGradle: jest.fn((config: unknown, modifier: (c: unknown) => unknown) =>
    modifier({ modResults: { contents: '' } }),
  ),
  withGradleProperties: jest.fn((config: unknown, modifier: (c: unknown) => unknown) =>
    modifier({ modResults: [] }),
  ),
  AndroidConfig: {
    Permissions: {
      withPermissions: jest.fn((config: unknown) => config),
    },
  },
}));

jest.mock('fs');

function makeConfig() {
  return {
    modRequest: { projectRoot: '/project' },
    modResults: { contents: '' },
  };
}

async function runBrazeXmlMod(props: Record<string, unknown> = {}) {
  withAndroidBrazeSdk(makeConfig() as never, props);
  if (!dangerousModCallback) {
    throw new Error('withDangerousMod callback was not registered');
  }
  await dangerousModCallback(makeConfig());
}

describe('withAndroidBrazeSdk', () => {
  const mockedFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    dangerousModCallback = null;
  });

  it('writes GRADLE and EXPO sdk metadata to braze.xml', async () => {
    await runBrazeXmlMod();

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    const [, writtenXml] = mockedFs.writeFileSync.mock.calls[0];
    expect(writtenXml).toContain('<string-array name="com_braze_internal_sdk_metadata">');
    expect(writtenXml).toContain('<item>GRADLE</item>');
    expect(writtenXml).toContain('<item>EXPO</item>');
  });

  it('includes sdk metadata even when no other props are set', async () => {
    await runBrazeXmlMod({});

    const [, writtenXml] = mockedFs.writeFileSync.mock.calls[0];
    expect(writtenXml).toContain('<item>GRADLE</item>');
    expect(writtenXml).toContain('<item>EXPO</item>');
  });

  it('enables delayed initialization when no androidApiKey is provided', async () => {
    await runBrazeXmlMod();

    const [, writtenXml] = mockedFs.writeFileSync.mock.calls[0];
    expect(writtenXml).toContain('<bool name="com_braze_enable_delayed_initialization">true</bool>');
  });

  it('omits delayed initialization when androidApiKey is provided', async () => {
    await runBrazeXmlMod({ androidApiKey: 'test-key' });

    const [, writtenXml] = mockedFs.writeFileSync.mock.calls[0];
    expect(writtenXml).not.toContain('com_braze_enable_delayed_initialization');
  });
});

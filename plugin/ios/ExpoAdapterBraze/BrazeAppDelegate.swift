import Appboy_iOS_SDK
import ExpoModulesCore
import SystemConfiguration

public class BrazeAppDelegate: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    let plistDict = Bundle.main.infoDictionary
    if let plist = plistDict, let plistConfig = plist["Braze"] as? [String: Any], let apiKey = plistConfig["ApiKey"] as? String {
      var appboyOptions: [AnyHashable: Any] = [:]

      if let endpoint = plistConfig["Endpoint"] as? String {
        appboyOptions[ABKEndpointKey] = plistConfig
      }

      if let sessionTimeout = plistConfig["SessionTimeout"] as? Int {
        appboyOptions[ABKSessionTimeoutKey] = sessionTimeout
      }

      if let enableSdkAuthentication = plistConfig["EnableSDKAuth"] as? Bool {
        appboyOptions[ABKEnableSDKAuthenticationKey] = enableSdkAuthentication
      }

      if let logLevel = plistConfig["LogLevel"] as? Int {
        appboyOptions[ABKLogLevelKey] = logLevel
      }

      if let enableGeofence = plistConfig["EnableGeofence"] as? Bool {
        appboyOptions[ABKEnableGeofencesKey] = enableGeofence
      }

      if let triggerInterval = plistConfig["TriggerInterval"] as? Int {
        appboyOptions[ABKMinimumTriggerTimeIntervalKey] = triggerInterval
      }

      if let enableAutoLocationCollection = plistConfig["EnableAutomaticLocationCollection"] as? Bool {
        appboyOptions[ABKEnableAutomaticLocationCollectionKey] = enableAutoLocationCollection
      }

      if let disableAutoGeofenceRequests = plistConfig["DisableAutomaticGeofenceRequests"] as? Bool {
        appboyOptions[ABKDisableAutomaticGeofenceRequestsKey] = disableAutoGeofenceRequests
      }

      if let dismissModalOnOutsideTap = plistConfig["DismissModalOnOutsideTap"] as? Bool {
        appboyOptions[ABKEnableDismissModalOnOutsideTapKey] = dismissModalOnOutsideTap
      }

      Appboy.start(withApiKey: apiKey, in:application, withLaunchOptions:launchOptions, withAppboyOptions:appboyOptions)
    }

    return true
  }

  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Appboy.sharedInstance()?.registerDeviceToken(deviceToken)
  }

  public func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    Appboy.sharedInstance()?.register(application,
          didReceiveRemoteNotification: userInfo,
                fetchCompletionHandler: completionHandler)
  }

  // public func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
  //   return false
  // }

  // public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
  //   return false
  // }
}

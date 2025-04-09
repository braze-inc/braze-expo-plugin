import braze_react_native_sdk
import BrazeKit
import BrazeLocation
import BrazeUI
import ExpoModulesCore
import SystemConfiguration

public class BrazeAppDelegate: ExpoAppDelegateSubscriber {
  static var braze: Braze? = nil

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    let plistDict = Bundle.main.infoDictionary
    if let plist = plistDict, let plistConfig = plist["Braze"] as? [String: Any], let apiKey = plistConfig["ApiKey"] as? String, let endpoint = plistConfig["Endpoint"] as? String {
      let configuration = Braze.Configuration(apiKey: apiKey, endpoint: endpoint)

      if let sessionTimeout = plistConfig["SessionTimeout"] as? Double {
        configuration.sessionTimeout = sessionTimeout
      }

      if let triggerInterval = plistConfig["TriggerInterval"] as? Double {
        configuration.triggerMinimumTimeInterval = triggerInterval
      }

      if let enableSdkAuthentication = plistConfig["EnableSDKAuth"] as? Bool {
        configuration.api.sdkAuthentication = enableSdkAuthentication
      }

      if let logLevel = plistConfig["LogLevel"] as? Int {
        switch logLevel {
        case 0, 1:
          configuration.logger.level = .debug
        case 2:
          configuration.logger.level = .info
        case 4:
          configuration.logger.level = .error
        default:
          configuration.logger.level = .disabled
        }
      }

      if let enableGeofence = plistConfig["EnableGeofence"] as? Bool {
        if configuration.location.brazeLocationProvider == nil {
          configuration.location.brazeLocationProvider = BrazeLocationProvider()
        }
        configuration.location.geofencesEnabled = enableGeofence
      }

      if let enableAutoLocationCollection = plistConfig["EnableAutomaticLocationCollection"] as? Bool {
        if configuration.location.brazeLocationProvider == nil {
          configuration.location.brazeLocationProvider = BrazeLocationProvider()
        }
        configuration.location.automaticLocationCollection = enableAutoLocationCollection
      }

      if let enableAutoGeofenceRequests = plistConfig["EnableAutomaticLocationCollection"] as? Bool {
        if configuration.location.brazeLocationProvider == nil {
          configuration.location.brazeLocationProvider = BrazeLocationProvider()
        }
        configuration.location.automaticGeofenceRequests = enableAutoGeofenceRequests
      }

      if let dismissModalOnOutsideTap = plistConfig["DismissModalOnOutsideTap"] as? Bool {
        BrazeInAppMessageUI.ModalView.Attributes.defaults.dismissOnBackgroundTap = dismissModalOnOutsideTap
        BrazeInAppMessageUI.ModalImageView.Attributes.defaults.dismissOnBackgroundTap = dismissModalOnOutsideTap
        BrazeInAppMessageUI.FullView.Attributes.defaults.dismissOnBackgroundTap = dismissModalOnOutsideTap
        BrazeInAppMessageUI.FullImageView.Attributes.defaults.dismissOnBackgroundTap = dismissModalOnOutsideTap
      }

      configuration.api.addSDKMetadata([.expo])

      if let useBrazePush = plistConfig["UseBrazePush"] as? Bool, useBrazePush {
        configuration.push.automation = true
        configuration.push.automation.requestAuthorizationAtLaunch = false
      }

      if let requestAuthorizationAtLaunch = plistConfig["RequestPushPermissionsAutomatically"] as? Bool,
         requestAuthorizationAtLaunch {
        configuration.push.automation.requestAuthorizationAtLaunch = true
      }

      if let pushStoryAppGroup = plistConfig["BrazePushStoryAppGroup"] as? String {
        configuration.push.appGroup = pushStoryAppGroup
      }

      if let useUUIDAsDeviceId = plistConfig["UseUUIDAsDeviceId"] as? Bool {
        configuration.useUUIDAsDeviceId = useUUIDAsDeviceId
      }

      let braze = BrazeReactBridge.perform(#selector(BrazeReactBridge.initBraze(_:)), with: configuration).takeUnretainedValue() as! Braze
      BrazeAppDelegate.braze = braze

      BrazeReactUtils.sharedInstance().populateInitialPayload(fromLaunchOptions: launchOptions)
    }

    return true
  }
}

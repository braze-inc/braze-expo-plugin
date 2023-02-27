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
      let braze = BrazeReactBridge.perform(#selector(BrazeReactBridge.initBraze(_:)), with: configuration).takeUnretainedValue() as! Braze
      BrazeAppDelegate.braze = braze

      if let useBrazePush = plistConfig["UseBrazePush"] as? Bool, useBrazePush {
        application.registerForRemoteNotifications()
        let center = UNUserNotificationCenter.current()
        center.setNotificationCategories(Braze.Notifications.categories)
        center.delegate = self
      }
    }

    return true
  }

  public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    BrazeAppDelegate.braze?.notifications.register(deviceToken: deviceToken)
  }

  public func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    // Forward background notification to Braze.
    let handledByBraze = BrazeAppDelegate.braze?.notifications.handleBackgroundNotification(
      userInfo: userInfo,
      fetchCompletionHandler: completionHandler
    ) ?? false

    if handledByBraze {
      // Braze handled the notification, nothing more to do.
      return
    }

    // Braze did not handle this remote background notification.
    // Manually call the completion handler to let the system know
    // that the background notification is processed.
    completionHandler(.noData)
  }
}

extension BrazeAppDelegate: UNUserNotificationCenterDelegate {
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    // Forward user notification to Braze.
    let handledByBraze = BrazeAppDelegate.braze?.notifications.handleUserNotification(
      response: response,
      withCompletionHandler: completionHandler
    ) ?? false

    if handledByBraze {
      // Braze handled the notification, nothing more to do.
      return
    }

    // Braze did not handle this user notification, manually
    // call the completion handler to let the system know
    // that the user notification is processed.
    completionHandler()
  }

  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    if #available(iOS 14.0, *) {
      completionHandler([.list, .banner])
    } else {
      completionHandler(.alert)
    }
  }
}

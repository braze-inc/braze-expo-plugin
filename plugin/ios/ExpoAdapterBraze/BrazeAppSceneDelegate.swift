import braze_react_native_sdk
import Expo
import UIKit

/// Scene delegate for apps that use the UIKit scene life cycle with the Expo scene support.
@available(iOSApplicationExtension, unavailable)
@objc(BrazeAppSceneDelegate)
open class BrazeAppSceneDelegate: ExpoAppSceneDelegate {
  open override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    // UIKit delivers the notification that cold started the app in the scene connection options,
    // so the Braze React Native SDK is given the notification response before React Native starts.
    BrazeReactUtils.sharedInstance().populateInitialPayload(
      from: connectionOptions.notificationResponse
    )
    super.scene(scene, willConnectTo: session, options: connectionOptions)
  }
}

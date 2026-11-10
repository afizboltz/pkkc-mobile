package my.ppkc.stg
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle
import android.view.View

import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsAnimationCompat
import androidx.core.view.WindowInsetsCompat

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private var keyboardVisible = false

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
    setUpKeyboardInsetsBridge()
  }

  /**
   * Android 15+ (SDK 35) enforces edge-to-edge display, so the window no longer
   * resizes for the on-screen keyboard - it only reports the keyboard via
   * WindowInsets (ime type). React Native's `Keyboard` module (and therefore
   * `KeyboardAvoidingView`) still relies on the legacy `keyboardDidShow`/
   * `keyboardDidHide` device events, which stop firing once the window stops
   * resizing. This listens for the modern WindowInsets ime changes at the
   * activity's content root and re-emits the same event names/payload shape
   * RN's JS `Keyboard` module already listens for (see
   * node_modules/react-native/Libraries/Components/Keyboard/Keyboard.js),
   * restoring KeyboardAvoidingView without an RN upgrade or new dependency.
   */
  private fun setUpKeyboardInsetsBridge() {
    val decorView = window.decorView

    ViewCompat.setOnApplyWindowInsetsListener(decorView) { _, insets ->
      handleImeInsets(insets)
      insets
    }

    // setOnApplyWindowInsetsListener alone doesn't reliably re-fire while the
    // IME is animating open/closed on this device/API level.
    // WindowInsetsAnimationCompat.Callback.onEnd below is what reliably catches
    // the keyboard settling into its final shown/hidden state.
    ViewCompat.setWindowInsetsAnimationCallback(
      decorView,
      object : WindowInsetsAnimationCompat.Callback(WindowInsetsAnimationCompat.Callback.DISPATCH_MODE_CONTINUE_ON_SUBTREE) {
        override fun onProgress(
          insets: WindowInsetsCompat,
          runningAnimations: MutableList<WindowInsetsAnimationCompat>
        ): WindowInsetsCompat {
          // Deliberately not calling handleImeInsets here - mid-animation frames
          // report the IME's current (still tiny, not-yet-final) height, and
          // emitting that as "the" keyboard height undershoots badly. onEnd below
          // reports the final, settled height, which is what KeyboardAvoidingView
          // actually needs.
          return insets
        }

        override fun onEnd(animation: WindowInsetsAnimationCompat) {
          super.onEnd(animation)
          val finalInsets = ViewCompat.getRootWindowInsets(decorView)
          finalInsets?.let { handleImeInsets(it) }
        }
      }
    )
  }

  private fun handleImeInsets(insets: WindowInsetsCompat) {
    val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
    val isVisible = imeInsets.bottom > 0

    if (isVisible == keyboardVisible) return
    keyboardVisible = isVisible

    val density = resources.displayMetrics.density
    val screenHeightDp = resources.displayMetrics.heightPixels / density
    val screenWidthDp = resources.displayMetrics.widthPixels / density
    val keyboardHeightDp = imeInsets.bottom / density

    val endCoordinates: WritableMap = Arguments.createMap().apply {
      putDouble("screenX", 0.0)
      putDouble("screenY", (screenHeightDp - keyboardHeightDp).toDouble())
      putDouble("width", screenWidthDp.toDouble())
      putDouble("height", keyboardHeightDp.toDouble())
    }
    val params: WritableMap = Arguments.createMap().apply {
      putDouble("duration", 0.0)
      putString("easing", "keyboard")
      putMap("endCoordinates", endCoordinates)
    }

    // reactInstanceManager throws (rather than returning null) under the New
    // Architecture/Bridgeless mode this app runs with (newArchEnabled: true) -
    // reactDelegate.currentReactContext is the API that's actually safe across
    // both bridge and bridgeless modes.
    val reactContext = reactDelegate?.currentReactContext
    reactContext
      ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      ?.emit(if (isVisible) "keyboardDidShow" else "keyboardDidHide", params)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}

package expo.modules.proctoringmodule

import android.view.MotionEvent
import android.view.View
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ProctoringModule : Module() {

  private var isOverlayDetected = false
  private var wasInMultiWindowMode = false
  private val touchListener =
          View.OnTouchListener { _, event ->
            val isObscured = (event.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0

            if (isObscured && !isOverlayDetected) {
              isOverlayDetected = true
              sendEvent("onOverlayDetected", mapOf("isActive" to true))
            } else if (!isObscured && isOverlayDetected) {
              isOverlayDetected = false
              sendEvent("onOverlayDetected", mapOf("isActive" to false))
            }
            false
          }

  override fun definition() = ModuleDefinition {
    Name("ProctoringModule")
    Events("onSplitScreenChange", "onOverlayDetected")

    Function("isSplitScreenActive") {
      return@Function appContext.activityProvider?.currentActivity?.isInMultiWindowMode ?: false
    }

    OnCreate {
      val activity = appContext.activityProvider?.currentActivity ?: return@OnCreate
      wasInMultiWindowMode = activity.isInMultiWindowMode

      // Attach touch listener initially
      activity.window.decorView.setOnTouchListener(touchListener)
    }

    // Use OnActivityEntersForeground instead of onHostResume
    OnActivityEntersForeground {
      val currentActivity =
              appContext.activityProvider?.currentActivity ?: return@OnActivityEntersForeground
      val isInMultiWindowMode = currentActivity.isInMultiWindowMode

      if (isInMultiWindowMode != wasInMultiWindowMode) {
        sendEvent("onSplitScreenChange", mapOf("isActive" to isInMultiWindowMode))
        wasInMultiWindowMode = isInMultiWindowMode
      }

      // Re-attach the touch listener when activity resumes
      currentActivity.window.decorView.setOnTouchListener(touchListener)
    }

    // Use OnActivityEntersBackground instead of onHostPause
    OnActivityEntersBackground {
      val currentActivity =
              appContext.activityProvider?.currentActivity ?: return@OnActivityEntersBackground

      // Update state when app is paused
      wasInMultiWindowMode = currentActivity.isInMultiWindowMode

      // Remove the touch listener when activity pauses
      currentActivity.window.decorView.setOnTouchListener(null)
    }

    OnDestroy {
      // Clean up when module is destroyed
      appContext.activityProvider?.currentActivity?.window?.decorView?.setOnTouchListener(null)
    }
  }
}

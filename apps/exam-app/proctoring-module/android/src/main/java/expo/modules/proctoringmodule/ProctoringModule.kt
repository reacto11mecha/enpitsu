// package expo.modules.proctoringmodule

// import expo.modules.kotlin.modules.Module
// import expo.modules.kotlin.modules.ModuleDefinition
// import java.net.URL

// class ProctoringModule : Module() {
//   // Each module class must implement the definition function. The definition consists of components
//   // that describes the module's functionality and behavior.
//   // See https://docs.expo.dev/modules/module-api for more details about available components.
//   override fun definition() = ModuleDefinition {
//     // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
//     // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
//     // The module will be accessible from `requireNativeModule('ProctoringModule')` in JavaScript.
//     Name("ProctoringModule")

//     // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
//     Constants(
//       "PI" to Math.PI
//     )

//     // Defines event names that the module can send to JavaScript.
//     Events("onChange")

//     // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
//     Function("hello") {
//       "Hello world! 👋"
//     }

//     // Defines a JavaScript function that always returns a Promise and whose native code
//     // is by default dispatched on the different thread than the JavaScript runtime runs on.
//     AsyncFunction("setValueAsync") { value: String ->
//       // Send an event to JavaScript.
//       sendEvent("onChange", mapOf(
//         "value" to value
//       ))
//     }

//     // Enables the module to be used as a native view. Definition components that are accepted as part of
//     // the view definition: Prop, Events.
//     View(ProctoringModuleView::class) {
//       // Defines a setter for the `url` prop.
//       Prop("url") { view: ProctoringModuleView, url: URL ->
//         view.webView.loadUrl(url.toString())
//       }
//       // Defines an event that the view can send to JavaScript.
//       Events("onLoad")
//     }
//   }
// }

package expo.modules.proctoringmodule

import android.app.Activity
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ProctoringModule : Module() {
  override fun definition() = ModuleDefinition {
    // Set the name of the module that will be used in JavaScript
    Name("ProctoringModule")

    // Define the event that will be sent from native to JavaScript
    Events("onMultiWindowModeChange")

    // Create a function that can be called from JS to get the current state
    Function("isInMultiWindowMode") {
      return@Function activity.isInMultiWindowMode
    }

    // This is the most important part: It listens for the OS to report a change
    // in multi-window status and executes the code inside.
    OnActivityMultiWindowModeChanged { isInMultiWindowMode ->
      // When the status changes, send an event to JavaScript with the new value.
      sendEvent("onMultiWindowModeChange", mapOf(
        "isInMultiWindowMode" to isInMultiWindowMode
      ))
    }
  }

  // A helper to get the current running Activity
  private val activity: Activity
    get() = appContext.activityProvider?.currentActivity
      ?: throw IllegalStateException("Activity is not available")
}
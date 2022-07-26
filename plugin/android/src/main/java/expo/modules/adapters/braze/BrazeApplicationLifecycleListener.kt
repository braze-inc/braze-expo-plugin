package expo.modules.adapters.braze

import android.app.Application
import android.content.Context
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.braze.BrazeActivityLifecycleCallbackListener

class BrazeApplicationLifecycleListener() : ApplicationLifecycleListener {
    override fun onCreate(application: Application) {
        super.onCreate(application)
        application.registerActivityLifecycleCallbacks(BrazeActivityLifecycleCallbackListener())
    }
}

package expo.modules.adapters.braze

import android.app.Application
import expo.modules.core.interfaces.ApplicationLifecycleListener
import com.braze.Braze
import com.braze.BrazeActivityLifecycleCallbackListener
import com.braze.enums.BrazeSdkMetadata
import java.util.EnumSet

class BrazeApplicationLifecycleListener() : ApplicationLifecycleListener {
    override fun onCreate(application: Application) {
        super.onCreate(application)
        Braze.addSdkMetadata(
            application,
            EnumSet.of(BrazeSdkMetadata.GRADLE, BrazeSdkMetadata.EXPO),
        )
        application.registerActivityLifecycleCallbacks(BrazeActivityLifecycleCallbackListener())
    }
}

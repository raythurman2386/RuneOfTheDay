package package_name

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

/**
 * Native module to bridge between React Native and Android widgets
 * Provides methods for updating widget data and triggering widget updates
 */
class RuneWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val PREFS_NAME = "com.ravenwoodcreations.runeoftheday.widget"
        private const val RUNE_DATA_KEY = "runeOfTheDayWidget"
    }
    
    override fun getName(): String {
        return "RuneWidgetModule"
    }
    
    /**
     * Updates the widget with new rune data
     * @param runeDataJson JSON string containing rune data
     * @param promise Promise to resolve when update is complete
     */
    @ReactMethod
    fun updateWidget(runeDataJson: String, promise: Promise) {
        try {
            // Save the rune data to SharedPreferences
            val prefs: SharedPreferences = reactApplicationContext.getSharedPreferences(
                PREFS_NAME, 
                Context.MODE_PRIVATE
            )
            
            prefs.edit().apply {
                putString(RUNE_DATA_KEY, runeDataJson)
                apply()
            }
            
            // Trigger widget update
            RuneWidgetProvider.updateAllWidgets(reactApplicationContext)
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to update widget: ${e.message}")
        }
    }
    
    /**
     * Clears the widget data
     * @param promise Promise to resolve when clear is complete
     */
    @ReactMethod
    fun clearWidgetData(promise: Promise) {
        try {
            val prefs: SharedPreferences = reactApplicationContext.getSharedPreferences(
                PREFS_NAME, 
                Context.MODE_PRIVATE
            )
            
            prefs.edit().apply {
                remove(RUNE_DATA_KEY)
                apply()
            }
            
            RuneWidgetProvider.updateAllWidgets(reactApplicationContext)
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to clear widget data: ${e.message}")
        }
    }
}

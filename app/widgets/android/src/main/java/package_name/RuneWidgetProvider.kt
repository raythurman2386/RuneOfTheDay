package package_name

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.SharedPreferences
import android.widget.RemoteViews
import android.content.Intent
import android.app.PendingIntent
import android.net.Uri
import android.os.Build
import org.json.JSONObject

/**
 * Implementation of App Widget functionality for Rune of the Day
 * Displays the current rune symbol, name, meaning, and deity
 */
class RuneWidgetProvider : AppWidgetProvider() {
    
    companion object {
        private const val PREFS_NAME = "com.ravenwoodcreations.runeoftheday.widget"
        private const val RUNE_DATA_KEY = "runeOfTheDayWidget"
        
        /**
         * Updates all instances of the widget
         */
        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, RuneWidgetProvider::class.java)
            )
            
            // Update all widgets
            if (appWidgetIds.isNotEmpty()) {
                val intent = Intent(context, RuneWidgetProvider::class.java)
                intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)
                context.sendBroadcast(intent)
            }
        }
    }
    
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        // Update each widget
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
    
    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        // Get the stored rune data from SharedPreferences
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val runeDataString = prefs.getString(RUNE_DATA_KEY, null)
        
        // Create RemoteViews for the widget layout
        val views = RemoteViews(context.packageName, R.layout.rune_widget)
        
        if (runeDataString != null) {
            try {
                // Parse the JSON data
                val runeData = JSONObject(runeDataString)
                
                // Set the widget text views with rune data
                views.setTextViewText(R.id.widget_rune_symbol, runeData.optString("symbol", context.getString(R.string.default_rune_symbol)))
                views.setTextViewText(R.id.widget_rune_name, runeData.optString("name", context.getString(R.string.default_rune_name)))
                views.setTextViewText(R.id.widget_rune_meaning, runeData.optString("primaryThemes", context.getString(R.string.default_rune_meaning)))
                
                val deity = runeData.optString("deity", context.getString(R.string.default_rune_deity))
                views.setTextViewText(R.id.widget_rune_deity, "Deity: $deity")
            } catch (e: Exception) {
                // Set default values if there's an error parsing the JSON
                setDefaultValues(views, context)
            }
        } else {
            // Set default values if no data is available
            setDefaultValues(views, context)
        }
        
        // Create an Intent to open the app when widget is clicked
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("runeoftheday://widget"))
        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        
        val pendingIntent = PendingIntent.getActivity(context, 0, intent, pendingIntentFlags)
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
        
        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
    
    private fun setDefaultValues(views: RemoteViews, context: Context) {
        views.setTextViewText(R.id.widget_rune_symbol, context.getString(R.string.default_rune_symbol))
        views.setTextViewText(R.id.widget_rune_name, context.getString(R.string.default_rune_name))
        views.setTextViewText(R.id.widget_rune_meaning, context.getString(R.string.default_rune_meaning))
        views.setTextViewText(R.id.widget_rune_deity, "Deity: ${context.getString(R.string.default_rune_deity)}")
    }
}

package com.tempproject;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.util.Log;
import org.json.JSONObject;

public class HomeWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("group.com.tempproject.widget", Context.MODE_PRIVATE);
            String dataString = prefs.getString("widgetData", null);
            
            Log.d("WIDGET_DEBUG", "읽어온 데이터: " + dataString);

            String destination = "목적지 없음";
            String time = "--:--";
            String lastTrain = "--:--"; // [추가] 막차 시간 변수

            if (dataString != null) {
                JSONObject json = new JSONObject(dataString);
                destination = json.optString("destination", "목적지");
                time = json.optString("time", "--:--");
                // [추가] JSON에서 막차 시간 파싱
                lastTrain = json.optString("lastTrain", "--:--"); 
            }

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
            views.setTextViewText(R.id.widget_destination, destination);
            views.setTextViewText(R.id.widget_time, time);
            // [추가] UI에 막차 시간 연결
            views.setTextViewText(R.id.widget_last_train, lastTrain); 

            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
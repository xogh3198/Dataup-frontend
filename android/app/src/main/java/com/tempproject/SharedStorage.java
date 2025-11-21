package com.tempproject;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

public class SharedStorage extends ReactContextBaseJavaModule {
    ReactApplicationContext context;

    public SharedStorage(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    public String getName() {
        return "SharedStorage";
    }

    @ReactMethod
    public void set(String data, Promise promise) {
        try {
            // [중요] HomeWidget.java와 똑같은 이름이어야 함
            String PREFS_NAME = "group.com.tempproject.widget";

            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("widgetData", data);
            editor.apply(); // 저장 실행

            Log.d("SharedStorage", "데이터 저장 성공: " + data);
            promise.resolve(true);
        } catch (Exception e) {
            e.printStackTrace();
            promise.reject("SAVE_ERROR", e);
        }
    }
}
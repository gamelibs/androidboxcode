package com.example.gameboxone.utils

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.R
import com.example.gameboxone.data.model.GameConfigItem
import com.google.gson.Gson
import com.google.gson.JsonStreamParser
import com.google.gson.reflect.TypeToken
import org.json.JSONArray
import org.json.JSONException
import java.io.IOException
import java.io.StringReader


object JsonUtils {
    private const val TAG = "JsonUtils"

//    fun getGameConfigs(context: Context): List<GameConfigItem> {
//        Log.d("JsonUtils", "Entered getGameConfigs")
//        val jsonString = getJsonFromAssets(context, "gameconfig.json")
//        Log.d("JsonUtils", "getJsonFromAssets, jsonString = $jsonString")
//        val gameConfigs = mutableListOf<GameConfigItem>()
//        if (jsonString == null) {
//            Log.e("JsonUtils", "jsonString is null")
//            return gameConfigs
//        }
//        try {
//            val jsonArray = JSONArray(jsonString)
//            Log.d("JsonUtils", "jsonArray.length() = ${jsonArray.length()}")
//            for (i in 0 until jsonArray.length()) {
//                Log.d("JsonUtils", "Processing item at index $i")
//                val jsonObject = jsonArray.getJSONObject(i)
//                val id = jsonObject.getInt("id")
//                val gamename = jsonObject.getString("gamename")
//                val icon = jsonObject.getString("icon")
//                val hot = jsonObject.getBoolean("hot")
//                val download = jsonObject.getString("download")
//                var loadgame = jsonObject.getString("loadgame")
//                val path = jsonObject.getInt("path")
//                val downicon = jsonObject.getString("downicon")
//                val lastModified = jsonObject.getString("lastModified")
//
////                gameConfigs.add(GameConfigItem(id, gamename, download,loadgame,path,downicon,lastModified))
//            }
//        } catch (e: JSONException) {
//            Log.e("JsonUtils", "JSONException: ${e.message}")
//            e.printStackTrace()
//        }
//
//        return gameConfigs
//    }

//    private fun getJsonFromAssets(context: Context, fileName: String): String? {
//        Log.d("JsonUtils", "Entered getJsonFromAssets, fileName = $fileName")
//        val jsonString: String?
//        try {
//            val inputStream = context.assets.open(fileName)
//            val size = inputStream.available()
//            val buffer = ByteArray(size)
//            inputStream.read(buffer)
//            inputStream.close()
//            jsonString = String(buffer, Charsets.UTF_8)
//            Log.d("JsonUtils", "getJsonFromAssets success, jsonString = $jsonString")
//        } catch (ioException: IOException) {
//            Log.e("JsonUtils", "IOException: ${ioException.message}")
//            ioException.printStackTrace()
//            return null
//        }
//        return jsonString
//    }

//    fun getDrawableResId(context: Context, iconPath: String): Int {
//        Log.d("JsonUtils", "Entered getDrawableResId, iconPath = $iconPath")
//        val resources = context.resources
//        val packageName = context.packageName
//
//        // Remove the "/drawable/" prefix and the ".xml" suffix
//        val iconName = iconPath.substringAfterLast("/")
//            .substringBeforeLast(".")
//        val resId = resources.getIdentifier(iconName, "drawable", packageName)
//        if (resId == 0) {
//            Log.e("JsonUtils", "Resource not found: $iconPath")
//            return R.drawable.ic_launcher_foreground
//        }
//        Log.d("JsonUtils", "getDrawableResId success, iconName = $iconName, resId = $resId")
//        return resId
//    }



    /**
     * 验证JSON格式是否正确
     */
//    fun isValidJson(jsonString: String): Boolean {
//        return try {
//            val parser = JsonStreamParser(StringReader(jsonString))
//            while (parser.hasNext()) {
//                parser.next()
//            }
//            true
//        } catch (e: Exception) {
//            Log.e(TAG, "JSON格式验证失败: ${e.message}", e)
//            false
//        }
//    }

    /**
     * 解析游戏配置JSON
     */
//    fun parseGameConfig(jsonString: String): List<GameConfigItem> {
//        return try {
//            val gson = Gson()
//            val listType = object : TypeToken<List<GameConfigItem>>() {}.type
//            val games = gson.fromJson<List<GameConfigItem>>(jsonString, listType)
//
//            // 过滤无效数据，并提供详细日志
//            games.filter { game ->
//                var isValid = true
//                val errors = mutableListOf<String>()
//
//                if (game.name.isNullOrBlank()) {
//                    isValid = false
//                    errors.add("name is blank")
//                }
//                if (game.icon.isNullOrBlank()) {
//                    isValid = false
//                    errors.add("icon is blank")
//                }
//                if (game.id <= 0) {
//                    isValid = false
//                    errors.add("invalid id")
//                }
//
//                if (!isValid) {
//                    Log.w(TAG, "跳过无效游戏数据 id=${game.id}: ${errors.joinToString()}")
//                }
//
//                isValid
//            }.also {
//                Log.d(TAG, "成功解析 ${it.size} 个有效游戏配置")
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "解析游戏配置失败", e)
//            throw e
//        }
//    }
}
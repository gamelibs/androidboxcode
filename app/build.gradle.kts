plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp") // 使用 KSP 代替 KAPT
    id("dagger.hilt.android.plugin")
}

android {
    namespace = "com.example.gameboxone"
    compileSdk = 34 // 使用当前稳定版

    defaultConfig {
        applicationId = "com.example.gameboxone"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.3" // 与 Kotlin 1.9.10 兼容
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // 核心库
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")

    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.1")

    // NanoHTTPD 本地服务器
    implementation("org.nanohttpd:nanohttpd:2.3.1")

    // Retrofit 网络请求
    implementation("com.squareup.retrofit2:retrofit:2.9.0")         // Retrofit 核心库
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")   // Gson 转换器

    // AndroidX WebView
    implementation ("androidx.webkit:webkit:1.7.0")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.47")
    implementation(libs.androidx.ui.tooling.preview.android)
    implementation(libs.play.services.basement)
    ksp("com.google.dagger:hilt-android-compiler:2.47") // 使用 ksp
    implementation("androidx.hilt:hilt-navigation-compose:1.0.0")

    // Room
    implementation("androidx.room:room-runtime:2.6.0")
    implementation("androidx.room:room-ktx:2.6.0")
    ksp("androidx.room:room-compiler:2.6.0") // 使用 ksp


    // 图标
    implementation ("io.coil-kt:coil-compose:2.4.0") // 加载图像资源
    implementation("androidx.compose.material:material-icons-extended:1.6.1")

    // Compose 导航
    implementation("androidx.navigation:navigation-compose:2.7.7")  // 导航组件

    // Android 测试依赖
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

// Room Schema 位置
ksp {
    arg("room.schemaLocation", "$projectDir/schemas")
}
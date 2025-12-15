package com.example.gameboxone.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = CartoonDarkPrimary,
    onPrimary = CartoonDarkOnPrimary,
    background = CartoonDarkBackground,
    surface = CartoonDarkSurface,
    secondary = CartoonSecondary,
    tertiary = CartoonTertiary
)

private val LightColorScheme = lightColorScheme(
    primary = CartoonPrimary,
    onPrimary = CartoonOnPrimary,
    primaryContainer = CartoonPrimaryContainer,
    onPrimaryContainer = CartoonOnPrimaryContainer,
    secondary = CartoonSecondary,
    onSecondary = CartoonOnSecondary,
    secondaryContainer = CartoonSecondaryContainer,
    onSecondaryContainer = CartoonOnSecondaryContainer,
    tertiary = CartoonTertiary,
    onTertiary = CartoonOnTertiary,
    tertiaryContainer = CartoonTertiaryContainer,
    onTertiaryContainer = CartoonOnTertiaryContainer,
    background = CartoonBackground,
    onBackground = CartoonOnBackground,
    surface = CartoonSurface,
    onSurface = CartoonOnSurface,
    surfaceVariant = CartoonSurfaceVariant,
    onSurfaceVariant = CartoonOnSurfaceVariant,
    error = CartoonError,
    onError = CartoonOnError
)

@Composable
fun GameboxoneTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = false, // Disable dynamic color to enforce cartoon theme
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
# AGENTS.md — GameBoxOne

## Project Overview
**GameBoxOne** is a Kotlin/Jetpack Compose Android game-box app. The product differentiator is a growth/adventure/task-driven retention loop ("历练挑战"), not merely a game list. Core flow: *首页(Home) → accept task → play game (WebView) → report result → complete task → earn reward → level up → unlock more*.

- **Package**: `com.example.gameboxone`
- **Min SDK**: 24 | **Target/Compile SDK**: 34 | **JVM**: 17
- **DI**: Hilt (`@HiltAndroidApp` in `App.kt`); all managers are `@Singleton`
- **DB**: Room v6 (`AppDatabase`) — currently uses `fallbackToDestructiveMigration()`; proper migrations are commented out in `di/DatabaseMigrations.kt`

## Architecture

### Layer Map
```
UI (Compose Screens)  →  ViewModels (extend GameViewModel)
                              ↓
                    Managers (business logic — all Singleton via Hilt)
                              ↓
              Room DB  |  NetManager  |  Assets  |  SharedPreferences
```

**Key Managers** (`manager/`):
| Manager | Responsibility |
|---|---|
| `DataManager` | Game config sync (remote → Room → assets fallback) |
| `EventManager` | Central event bus — multiple `SharedFlow` channels |
| `UserManager` | Anonymous player session, exp/level persisted in SharedPrefs |
| `LocalAdventureManager` | Adventure progress (fully local, offline-first) |
| `SdkManager` | Game JS SDK download/cache in `context.getDir("games")` |
| `WebServerManager` | NanoHTTPD local HTTP server serving game files |
| `GameTaskEventHandler` | Maps H5 game events (SCORE/STAGE/CLEAR/ELITE) → task progress |
| `NetManager` | HTTP via OkHttp/Retrofit; player login, game config, SDK fetch |

### Activities
- **`MainActivity`** — Single activity hosting Compose nav graph (bottom nav + full-screen destinations)
- **`WebViewActivity`** — Standalone activity for running H5 games; receives `gameId` + local `gamePath` via Intent; hosts NanoHTTPD server

### Navigation Routes (`NavGraphBuilders.Routes`)
`hot` (Home/挑战) | `adventure` (地图) | `myGame` (藏经阁) | `setting` | `profile`  
Full-screen: `gameDetail/{gameId}`, `gamePlayer/{gameId}?path=...`  
Navigation is event-driven via `EventManager.navigationEvents` → `AppNavigator`.

### Adventure System (Offline-First)
- Config source: `assets/adventure_config.json` → parsed by `LocalAdventureManager`
- Fallback if JSON fails: hardcoded `hardcodedLevelMetas` (10 levels) inside `LocalAdventureManager`
- Player progress stored in Room: `LocalAdventureProfileEntity`, `LocalAdventureTaskDefinitionEntity`, `LocalAdventureTaskProgressEntity`
- **Backend principle**: backend only serves global config rules; ALL per-player progress lives locally

### WebView ↔ Native Bridge
`WebViewBridgeRegistrar` registers JS interfaces on the WebView.  
- **Debug**: injects WebGL fix scripts, ad tools, guard/log scripts  
- **Release**: minimal injection only; filter by `isAppDebuggable()`  
H5 game events (score, stage, clear) flow: `GameDataBridge` (JS interface) → `GameTaskEventHandler.onGameScore/onGameStage/onGameClear()`

## Critical Conventions

### Logging — Always use `AppLog`
```kotlin
import com.example.gameboxone.AppLog as Log
// then: Log.d(TAG, "message")
```
Never import `android.util.Log` directly. Filter Logcat with tag `GAMEBOX`.

### Ads — All test IDs are active
`AdConfig.kt` currently has Google test ad unit IDs. Switch to production with:
```kotlin
AdConfig.setProduction(appId, interstitial, rewarded, banner, appOpen)
```
`ConsentManager` has a dev-mode bypass — **must be removed before release**.

### Database Migrations
`fallbackToDestructiveMigration()` is in `AppModule.kt` for dev only.  
Proper migrations must be written in `di/DatabaseMigrations.kt` before release.  
Schemas are in `app/schemas/com.example.gameboxone.base.AppDatabase/`.

### Coroutine Scopes
- Long-lived background tasks: inject `@ApplicationScope CoroutineScope` (defined in `di/ApplicationScope.kt`)  
- ViewModel tasks: `viewModelScope`  
- Never use `GlobalScope`

### Assets as Fallback
`assets/gameconfig.json` — fallback game list  
`assets/adventure_config.json` — adventure chapter/task/level config  
Always handle `IOException` from `context.assets.open(...)` and fall back gracefully.

## Build & Debug Commands
```bash
# Debug build
./gradlew assembleDebug

# Release build (signing config must be configured first)
./gradlew assembleRelease

# Unit tests
./gradlew test

# Filter logs (all app logs carry GAMEBOX prefix)
adb logcat | grep GAMEBOX
```

## Current Scope Constraints (do not implement)
- `RankingScreen` exists — **hide all entry points**, do not surface it
- **No payment / Google Play Billing** in this version
- No cloud sync, no multi-account, no complex social features


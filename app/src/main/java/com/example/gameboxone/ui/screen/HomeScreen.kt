package com.example.gameboxone.ui.screen


import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.runtime.produceState
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.example.gameboxone.manager.IconCacheManager
import com.example.gameboxone.R
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.viewmodel.HomeViewModel
import java.io.File


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onGameSelected: (GameConfigItem) -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()

//    LaunchedEffect(Unit) {

//    }

    Scaffold(
        topBar = {
            HomeTopBar(
                isSyncing = uiState.isSyncing,
                isLoading = uiState.isLoading,
                onSyncClick = viewModel::syncGameConfig
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                uiState.isLoading || uiState.isSyncing -> LoadingContent()
                uiState.games.isEmpty() && uiState.error == null -> {
                    // 空状态处理
                    EmptyContent { viewModel.loadInitialData() }
                }
                else -> GameGrid(
                    games = uiState.games,
                    onGameClick = onGameSelected,
                    iconCacheManager = viewModel.iconCacheManager
                )
            }
        }
    }
}

@Composable
private fun LoadingContent() {
    Box(modifier = Modifier.fillMaxSize()) {
        CircularProgressIndicator(
            modifier = Modifier.align(Alignment.Center)
        )
    }
}

@Composable
private fun GameGrid(
    games: List<GameConfigItem>,
    onGameClick: (GameConfigItem) -> Unit,
    iconCacheManager: IconCacheManager
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(games, key = { it.id }) { game ->
            GameCard(
                game = game,
                iconCacheManager = iconCacheManager,
                onClick = { onGameClick(game) }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HomeTopBar(
    isSyncing: Boolean,
    isLoading: Boolean,
    onSyncClick: () -> Unit
) {
    TopAppBar(
        title = { Text("游戏盒子") },
        actions = {
            IconButton(
                onClick = onSyncClick,
                enabled = !isSyncing && !isLoading
            ) {
                if (isSyncing) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Sync,
                        contentDescription = "同步配置"
                    )
                }
            }
        }
    )
}

@Composable
private fun GameCard(
    game: GameConfigItem,
    iconCacheManager: IconCacheManager,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 获取图标文件
            val iconFile by produceState<File?>(initialValue = null, key1 = game.id) {
                value = iconCacheManager.getGameIcon(game.id, game.icon,game.downicon)
            }

            // 图标容器 - 修改这里的尺寸使图标更大
            Box(
                modifier = Modifier
                    .size(256.dp)  // 从64.dp改为96.dp，增加图标尺寸
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                // 使用 AsyncImage 的错误处理和占位符功能
                AsyncImage(
                    model = iconFile,
                    contentDescription = "游戏图标: ${game.name}",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                    error = painterResource(id = R.drawable.ic_game_default),
                    placeholder = painterResource(id = R.drawable.ic_game_default)
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = game.name,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun EmptyContent(onRefresh: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("没有游戏数据")
            Spacer(modifier = Modifier.height(8.dp))
            Button(onClick = onRefresh) {
                Text("刷新")
            }
        }
    }
}
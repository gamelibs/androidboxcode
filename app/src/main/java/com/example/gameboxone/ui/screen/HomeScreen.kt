package com.example.gameboxone.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.runtime.produceState
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.example.gameboxone.manager.IconCacheManager
import com.example.gameboxone.R
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.viewmodel.HomeViewModel
import com.example.gameboxone.data.viewmodel.UserProfileViewModel
import com.example.gameboxone.data.model.UserLevelConfig
import com.example.gameboxone.ui.component.GameCardEnhanced
import com.example.gameboxone.ui.component.HomeStatusHeader
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onGameSelected: (GameConfigItem) -> Unit = {},
    onProfileClick: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val profileViewModel: UserProfileViewModel = hiltViewModel()
    val profile by profileViewModel.profile.collectAsState()
    
    // Pull to refresh state
    val pullRefreshState = rememberPullToRefreshState()
    
    if (pullRefreshState.isRefreshing) {
        LaunchedEffect(true) {
            viewModel.syncGameConfig()
        }
    }
    
    // Stop refreshing when loading is done
    LaunchedEffect(uiState.isSyncing) {
        if (!uiState.isSyncing) {
            pullRefreshState.endRefresh()
        } else {
            pullRefreshState.startRefresh()
        }
    }

    Scaffold(
        topBar = {
            HomeStatusHeader(
                userExp = profile.exp,
                onSdkUpdateClick = viewModel::refreshSdkOnly,
                onRefreshClick = viewModel::syncGameConfig,
                onProfileClick = onProfileClick,
                modifier = Modifier
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                uiState.isLoading && uiState.games.isEmpty() -> LoadingContent()
                uiState.games.isEmpty() && uiState.error == null -> {
                    // 空状态处理
                    EmptyContent { viewModel.loadInitialData() }
                }
                else -> GameGrid(
                    games = uiState.games,
                    userExp = profile.exp,
                    onGameClick = onGameSelected,
                    onSdkUpdateClick = viewModel::refreshSdkOnly,
                    onRefreshClick = viewModel::syncGameConfig,
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
    userExp: Long,
    onGameClick: (GameConfigItem) -> Unit,
    onSdkUpdateClick: () -> Unit,
    onRefreshClick: () -> Unit,
    iconCacheManager: IconCacheManager
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(games, key = { it.id }) { game ->
            GameCardEnhanced(
                game = game,
                iconCacheManager = iconCacheManager,
                onClick = { onGameClick(game) }
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

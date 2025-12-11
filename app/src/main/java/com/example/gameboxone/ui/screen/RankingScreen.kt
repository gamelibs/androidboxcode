package com.example.gameboxone.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import coil.request.ImageRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

/**
 * 排行榜数据模型
 */
data class RankedGame(
    val id: String,
    val name: String,
    val description: String,
    val imageUrl: String,
    val players: Int,
    val likes: Int,
    val score: Int, // 热度分数 = 玩家数 + 点赞数
    val category: String,
    val tags: List<String> = emptyList()
)

/**
 * 排行榜UI状态
 */
data class RankingUiState(
    val isLoading: Boolean = false,
    val games: List<RankedGame> = emptyList(),
    val errorMessage: String? = null,
    val selectedCategory: String = "全部"
)

/**
 * 排行榜ViewModel
 */
@HiltViewModel
class RankingViewModel @Inject constructor() : ViewModel() {

    private val _uiState = MutableStateFlow(RankingUiState(isLoading = true))
    val uiState: StateFlow<RankingUiState> = _uiState.asStateFlow()

    // 排行榜类别
    val categories = listOf("全部", "动作", "益智", "策略", "角色", "冒险")

    init {
        loadRankingData()
    }

    /**
     * 加载排行榜数据
     */
    private fun loadRankingData() {
        viewModelScope.launch {
            // 模拟网络请求延迟
            delay(800)

            // 生成假数据
            val fakeGames = generateFakeGames()

            _uiState.value = RankingUiState(
                isLoading = false,
                games = fakeGames
            )
        }
    }

    /**
     * 根据类别筛选游戏
     */
    fun filterByCategory(category: String) {
        _uiState.value = _uiState.value.copy(
            isLoading = true,
            selectedCategory = category
        )

        viewModelScope.launch {
            // 模拟网络请求延迟
            delay(500)

            val allGames = generateFakeGames()
            val filteredGames = if (category == "全部") {
                allGames
            } else {
                allGames.filter { it.category == category }
            }

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                games = filteredGames
            )
        }
    }

    /**
     * 生成假游戏数据
     */
    private fun generateFakeGames(): List<RankedGame> {
        return listOf(
            RankedGame(
                id = "1",
                name = "超级冒险家",
                description = "一款激动人心的探索冒险游戏，穿越未知世界",
                imageUrl = "https://picsum.photos/id/237/200",
                players = 58700,
                likes = 42500,
                score = 101200,
                category = "冒险",
                tags = listOf("冒险", "探索", "解谜")
            ),
            RankedGame(
                id = "2",
                name = "宝石消除大师",
                description = "经典益智消除游戏，挑战你的智力极限",
                imageUrl = "https://picsum.photos/id/25/200",
                players = 47800,
                likes = 39100,
                score = 86900,
                category = "益智",
                tags = listOf("消除", "益智", "休闲")
            ),
            RankedGame(
                id = "3",
                name = "王国保卫战",
                description = "史诗级塔防游戏，保卫你的王国免受敌人侵扰",
                imageUrl = "https://picsum.photos/id/28/200",
                players = 42300,
                likes = 35600,
                score = 77900,
                category = "策略",
                tags = listOf("塔防", "策略", "战争")
            ),
            RankedGame(
                id = "4",
                name = "城市建设者",
                description = "建造和管理你自己的梦想城市",
                imageUrl = "https://picsum.photos/id/42/200",
                players = 39800,
                likes = 31200,
                score = 71000,
                category = "策略",
                tags = listOf("建造", "模拟", "管理")
            ),
            RankedGame(
                id = "5",
                name = "快速赛车手",
                description = "体验极速赛车带来的刺激与挑战",
                imageUrl = "https://picsum.photos/id/133/200",
                players = 36700,
                likes = 28900,
                score = 65600,
                category = "动作",
                tags = listOf("赛车", "速度", "竞技")
            ),
            RankedGame(
                id = "6",
                name = "龙与魔法",
                description = "奇幻RPG游戏，踏上史诗般的冒险之旅",
                imageUrl = "https://picsum.photos/id/65/200",
                players = 35200,
                likes = 27800,
                score = 63000,
                category = "角色",
                tags = listOf("RPG", "奇幻", "冒险")
            ),
            RankedGame(
                id = "7",
                name = "僵尸末日",
                description = "在后启示录世界中求生存",
                imageUrl = "https://picsum.photos/id/91/200",
                players = 33600,
                likes = 25400,
                score = 59000,
                category = "动作",
                tags = listOf("生存", "僵尸", "射击")
            ),
            RankedGame(
                id = "8",
                name = "单词大师",
                description = "考验你词汇量的益智游戏",
                imageUrl = "https://picsum.photos/id/106/200",
                players = 29800,
                likes = 23100,
                score = 52900,
                category = "益智",
                tags = listOf("单词", "教育", "智力")
            ),
            RankedGame(
                id = "9",
                name = "海洋探险",
                description = "探索神秘的海底世界",
                imageUrl = "https://picsum.photos/id/76/200",
                players = 27500,
                likes = 21900,
                score = 49400,
                category = "冒险",
                tags = listOf("探索", "海洋", "解谜")
            ),
            RankedGame(
                id = "10",
                name = "星际战略",
                description = "征服星系的科幻战略游戏",
                imageUrl = "https://picsum.photos/id/96/200",
                players = 26300,
                likes = 20600,
                score = 46900,
                category = "策略",
                tags = listOf("科幻", "战略", "太空")
            )
        )
    }
}

/**
 * 排行榜屏幕主组件
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RankingScreen(
    viewModel: RankingViewModel = hiltViewModel(),
    onGameSelected: (RankedGame) -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            com.example.gameboxone.ui.component.AppTopBar(title = null)
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            // 分类选择器
            CategorySelector(
                categories = viewModel.categories,
                selectedCategory = uiState.selectedCategory,
                onCategorySelected = viewModel::filterByCategory
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 排行榜内容
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (uiState.errorMessage != null) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = uiState.errorMessage!!,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            } else {
                GameRankingList(
                    games = uiState.games,
                    onGameSelected = onGameSelected
                )
            }
        }
    }
}

/**
 * 分类选择器
 */
@Composable
fun CategorySelector(
    categories: List<String>,
    selectedCategory: String,
    onCategorySelected: (String) -> Unit
) {
    ScrollableTabRow(
        selectedTabIndex = categories.indexOf(selectedCategory),
        edgePadding = 0.dp,
        divider = {},
        indicator = {},
        containerColor = Color.Transparent,
        modifier = Modifier.fillMaxWidth()
    ) {
        categories.forEach { category ->
            CategoryTab(
                title = category,
                selected = selectedCategory == category,
                onClick = { onCategorySelected(category) }
            )
        }
    }
}

/**
 * 分类标签
 */
@Composable
fun CategoryTab(
    title: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    val backgroundColor = if (selected) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.surfaceVariant
    }

    val textColor = if (selected) {
        MaterialTheme.colorScheme.onPrimary
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }

    Tab(
        selected = selected,
        onClick = onClick,
        modifier = Modifier.padding(end = 8.dp)
    ) {
        Box(
            modifier = Modifier
                .padding(vertical = 8.dp, horizontal = 16.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(backgroundColor)
                .padding(vertical = 8.dp, horizontal = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = title,
                color = textColor,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

/**
 * 游戏排行榜列表
 */
@Composable
fun GameRankingList(
    games: List<RankedGame>,
    onGameSelected: (RankedGame) -> Unit
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        itemsIndexed(games) { index, game ->
            GameRankingItem(
                rank = index + 1,
                game = game,
                onClick = { onGameSelected(game) }
            )
        }

        // 底部空间
        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

/**
 * 游戏排行项
 */
@Composable
fun GameRankingItem(
    rank: Int,
    game: RankedGame,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 排名标志
            RankBadge(rank = rank)

            Spacer(modifier = Modifier.width(12.dp))

            // 游戏图像
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(game.imageUrl)
                    .crossfade(true)
                    .build(),
                contentDescription = game.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(8.dp))
            )

            Spacer(modifier = Modifier.width(12.dp))

            // 游戏信息
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = game.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = game.description,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    // 类别标签
                    CategoryChip(category = game.category)

                    Spacer(modifier = Modifier.width(8.dp))

                    // 玩家数
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = formatNumber(game.players),
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(start = 2.dp)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    // 点赞数
                    Icon(
                        imageVector = Icons.Default.ThumbUp,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = formatNumber(game.likes),
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(start = 2.dp)
                    )
                }
            }

            // 热度分数
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = formatNumber(game.score),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                Text(
                    text = "热度",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

/**
 * 排名标志
 */
@Composable
fun RankBadge(rank: Int) {
    val backgroundColor = when (rank) {
        1 -> Color(0xFFFFD700) // 金色
        2 -> Color(0xFFC0C0C0) // 银色
        3 -> Color(0xFFCD7F32) // 铜色
        else -> MaterialTheme.colorScheme.surfaceVariant
    }

    val textColor = when (rank) {
        1, 2, 3 -> Color.Black
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .size(32.dp)
            .clip(CircleShape)
            .background(backgroundColor)
    ) {
        Text(
            text = rank.toString(),
            style = MaterialTheme.typography.bodyMedium.copy(
                fontWeight = FontWeight.Bold
            ),
            color = textColor
        )
    }
}

/**
 * 类别标签
 */
@Composable
fun CategoryChip(category: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(MaterialTheme.colorScheme.primaryContainer)
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = category,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onPrimaryContainer
        )
    }
}

/**
 * 格式化数字
 */
fun formatNumber(number: Int): String {
    return when {
        number >= 10000 -> String.format("%.1f万", number / 10000f)
        else -> number.toString()
    }
}

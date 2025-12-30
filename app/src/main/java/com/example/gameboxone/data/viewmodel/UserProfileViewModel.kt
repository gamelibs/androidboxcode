package com.example.gameboxone.data.viewmodel

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import com.example.gameboxone.manager.UserManager
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.SharedFlow
import com.example.gameboxone.data.model.UserProfile

/**
 * 用于在 Compose 中订阅用户档案（等级/经验等）
 */
@HiltViewModel
class UserProfileViewModel @Inject constructor(
    private val userManager: UserManager
) : ViewModel() {

    val profile: StateFlow<UserProfile> = userManager.profile
    val authState: StateFlow<UserManager.AuthState> = userManager.authState
    val events: SharedFlow<String> = userManager.events
}

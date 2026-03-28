package com.example.gameboxone.observability

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class ObservabilityModule {
    @Binds
    @Singleton
    abstract fun bindCrashReporter(impl: CompositeCrashReporter): CrashReporter
}



(function (global) {

    global.ads_list = {

        "web-cp": [{ "android": "on" }, { "adsense": "data-ad-client=ca-pub-0000000000000000" }, { "gpt": "/22639388115/rewarded_web_example" }, { "ima": "ca-app-pub-0000000000000000/4076351230" }]
    }
}(window));

/**
 * AndroidminCp SDK（单例）
 * 2025-11
 * 暴露为 window.AndroidminCp，无需 new；提供 create() 创建额外实例
 * 支持小数秒级推送间隔
 * 支持自定义网页广告初始化顺序与选项
 */
(function (global) {
    const SDK_NAME = 'AndroidminCp';
    const SDK_VERSION = '1.1.1';

    class Core {
        constructor() {
            this.isInitialized = false;
            window.dataLayer = window.dataLayer || [];
            this.isFramed = (typeof window.parent !== 'undefined' && window.parent !== window);
            this.isAndroid = (!this.isFramed && !!window.CpsenseAppEvent && typeof window.CpsenseAppEvent.events === 'function');
            this.gameid = new URLSearchParams(document.location.search).get("gameid");
            this.pubid = new URLSearchParams(document.location.search).get("pubid");
            this.ret = new URLSearchParams(document.location.search).get("ret");
            this.is_ad_test = new URLSearchParams(document.location.search).get("vb") === "beta";
            this.dev_name = new URLSearchParams(document.location.search).get("dev");
            this.gamePlayTimer = null;

            this.isMath = true; // 是否对动态脚本追加时间戳，避免缓存
            this.is_adsense = null;//是否 adsense 广告
            this.is_gpt = false; // 是否 gpt 广告
            this.is_ima = false; // 是否 IMA 广告
            this.is_android = false; // 是否 Android 广告

            this.ads_code = null; // adsense 广告代码
            this.gpt_code = null; // gpt 广告代码
            this.ima_code = null; // IMA 广告代码
            this.android_code = null; // Android 广告代码

            // cpssdk adType
            this._adType = null;
            this.ima_type = null; // IMA 广告类型
            this.gpt_type = null; // gpt 广告类型
            this.adsense_type = null; // adsense 广告类型
            this.android_type = null; // Android 广告类型

            this.is_first = true;
            this.interstitial_requests_count = 0; // 插页广告请求次数
            this.interstitial_req_frequency = false; // 插页广告请求频率
            this.interstitial_time_start = 0; // 插页广告请求开始时间

            this.reward_requests_count = 3; // 激励广告请求次数
            this.reward_time_start = 0; // 激励广告请求开始时间
            this.reward_req_frequency = false; // 激励广告请求频率

            this.req_ad_stabilization = false; // 请求广告稳定性
            this.req_ad_timeout = true; // 请求广告超时
            this.interstitialAd = this._showInterstitialAd;
            this.rewardAd = this._showRewardAd;

            // androidAd
            this.appads_on = false; // 默认关闭，待父页开启后切换到 ANDROID
            this.appads_pushtime = 3;
            this._adsInitialized = false; // 防重复初始化（Android 或 Web 任一生效后置 true）

            // IMA
            this.adContainer = null;
            this.videoContent = null;
            this.adsLoader = null;
            this.adsManager = null;
            this.adDisplayContainer = null;
            this.videoWidth = null;
            this.videoHeight = null;
            this.adsRequest = null;
            this.ima_isLoaded = false;
            this.imaLoadTimeout = null; // IMA 广告加载超时计时器

            this.adsType = { ADSENSE: 'adsense', IMA: 'ima', GPT: 'gpt', ANDROID: 'androidAds' }; // 广告类型
            Object.defineProperty(this, 'adType', {
                configurable: true,
                enumerable: true,
                get: function () { return this._adType; },
                set: function (val) {
                    const old = this._adType;
                    if (old === val) return;
                    this._adType = val;
                }
            });

            this.android_callback = {
                error: () => { },
                beforeAd: () => { },
                afterAd: () => { },
                adViewed: () => { },
                adDismissed: () => { }
            };

            // 广告请求流水号，用于避免旧超时定时器误判新请求
            this._interstitialReqId = 0;
            this._rewardReqId = 0;

            // 网页广告候选链（按 ads_list.web-cp 顺序）
            this._webAdCandidates = []; // [{ type: this.adsType.X, code: '...' }, ...]
            this._webAdInit = { adsense: false, ima: false, gpt: false }; // 是否已完成对应 SDK 初始化
            this._webAdFailed = { adsense: false, ima: false, gpt: false }; // 是否已判定该类型不可用（加载失败/超时等）
            this.gpt_callback = {
                error: () => { },
                beforeAd: () => { },
                afterAd: () => { },
                adViewed: () => { },
                adDismissed: () => { }
            };
            this.adsense_callback = {
                error: () => { },
                beforeAd: () => { },
                afterAd: () => { },
                adViewed: () => { },
                adDismissed: () => { }
            };
            this.android_callback = {
                error: () => { },
                beforeAd: () => { },
                afterAd: () => { },
                adViewed: () => { },
                adDismissed: () => { }
            };
            this.ima_callback = {
                error: () => { },
                beforeAd: () => { },
                afterAd: () => { },
                adViewed: () => { },
                adDismissed: () => { }
            };

            // 事件处理
            this._eventAds = {
                listeners: {
                    'ready': [],
                    'beforeAd': [],
                    'afterAd': [],
                    'adDismissed': [],
                    'adViewed': [],
                    'ad_error': [],
                    'interstitial': [],
                    'reward': [],
                    'game_start': [],
                    'game_score': [],
                    'game_distance': [],
                    'game_level': [],
                    'level_start': [],
                    'level_end': [],
                    'game_over': [],
                    'load_update': [],
                    'load_complete': []
                },
                on(eventName, callback) {
                    if (!this.listeners[eventName]) return;
                    if (typeof callback !== 'function') return;
                    this.listeners[eventName].push(callback);

                },
                emit(eventName, ...args) {

                    if (!this.listeners[eventName]) return;
                    this.listeners[eventName].forEach(callback => {
                        try { callback(...args); } catch (e) { console.warn('[adsdk] event callback error', e && e.message); }
                    });
                },
                off(eventName, callback) {
                    if (!this.listeners[eventName]) return;
                    if (!callback) { this.listeners[eventName] = []; return; }
                    this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
                }
            }



            this.interstitialAd = this._showInterstitialAd;
            this.rewardAd = this._showRewardAd;

            // 广告请求控制
            this.appads_on = false;
            // 消息队列系统
            this.adsdklayer = [];
            this._messageCheckInterval = null;
            this._gameTime = 0;
            this._sendingMessages = false;
            // 最大30秒发一次 
            this._maxPushTime = 30;
            this._pushtime = 2; // 默认2秒发一次


            // 用于处理Android广告状态查询的回调
            this._appeventCallback = (messageArray) => {
                // 过滤 callback-only 并严格规范化输入为数组形式的消息
                // 支持入参为 JSON 字符串、单一对象或数组。最终只处理 [{type, value}, ...] 格式
                let parsed = null;
                try {
                    if (typeof messageArray === 'string') {
                        parsed = JSON.parse(messageArray);
                    } else {
                        parsed = messageArray;
                    }
                } catch (e) {
                    // 无法解析则直接忽略
                    console.warn('[adsdk] _appeventCallback: 无法解析回调数据', e && e.message);
                    return;
                }

                // 强制只接收数组
                if (!Array.isArray(parsed)) {
                    // 如果是单个对象则封装为数组，否则忽略
                    if (parsed && typeof parsed === 'object' && parsed.type) {
                        parsed = [parsed];
                    } else {
                        return;
                    }
                }

                // 规范化每一项为 { type, value }，忽略不合规项
                const normalized = [];
                for (const item of parsed) {
                    try {
                        if (!item || typeof item !== 'object') continue;
                        const type = item.type || item.event_type || null;
                        if (!type) continue;
                        const value = (item.value !== undefined) ? item.value : (item.data !== undefined ? item.data : null);
                        normalized.push({ type, value });
                    } catch (e) {
                        // 单条解析错误则跳过该条
                        continue;
                    }
                }

                // 记录日志并分发
                normalized.forEach(message => {
                    let self = this;
                    self.__sdklog3('[GameStatus] 收到', message.type);

                    if (message.type === 'app_ads_on' && message["value"]) {
                        self.appads_on = true;
                        self._openAndroid();
                        self.__sdklog3('广告上报已开启', message.value);
                    }

                    if (message.type === "set_pushtime") {
                        if (message.type === 'set_pushtime') {
                            const n = parseFloat(message.value);
                            if (!Number.isNaN(n)) {
                                self.pushtime = n;           // 或直接 this.pushtime = n
                            }
                        }
                    }

                    if (message.type === 'click_ad' && message["value"]) {
                        console.log('收到 click_ad 事件', message.value);
                    }

                    if (message.type === 'set_sound' && message["value"]) {
                        console.log('收到 set_sound 事件', message.value);
                    }

                    try {
                        switch (message.type) {

                            case 'beforeAd':
                                self.req_ad_timeout = false;
                                try { if (self.android_callback && typeof self.android_callback.beforeAd === 'function') self.android_callback.beforeAd(); } catch (_) { }
                                self._eventAds.emit('beforeAd', message.value, 'beforeAd');
                                break;

                            case 'adViewed':
                                self.req_ad_timeout = false;
                                if (message.value === "reward") {
                                    try { if (self.android_callback && typeof self.android_callback.adViewed === 'function') self.android_callback.adViewed(); } catch (_) { }
                                    self._eventAds.emit('adViewed', message.value, 'adViewed');
                                } else {
                                    try { if (self.android_callback && typeof self.android_callback.afterAd === 'function') self.android_callback.afterAd(); } catch (_) { }
                                    self._eventAds.emit('afterAd', message.value, 'afterAd');
                                }
                                break;

                            case 'adDismissed':
                                self.req_ad_timeout = false;
                                try { if (self.android_callback && typeof self.android_callback.adDismissed === 'function') self.android_callback.adDismissed(); } catch (_) { }
                                self._eventAds.emit('adDismissed', message.value, 'adDismissed');
                                break;

                            case 'ad_error':
                                self.req_ad_timeout = false;
                                try { if (self.android_callback && typeof self.android_callback.error === 'function') self.android_callback.error(); } catch (_) { }
                                self._eventAds.emit('ad_error', self.android_type, message.value);
                                break;

                            default:
                            // this._eventAds.emit(message.type, message.value);
                        }
                    } catch (error) {
                        console.warn('[GameStatus] 处理消息失败:', message, error);
                    }
                });

                // 上层已确认（父页面或原生回调触达）后再启动消息轮询，避免在未就绪时立即开始定时发送
            };


            // 原生回调处理
            window.CpsenseAppEventCallBack = (event) => {
                if (this.isAndroid) {
                    try { this._appeventCallback(event) } catch (e) { console.log('message event err', e) }

                }
            };

            // ads事件流程 
            this._eventAds.on('ready', (param1, param2) => {
                this.__sdklog(param1, param2);
            })

            this._eventAds.on('interstitial', (param1) => {

                this.__sdklog(param1, this.adType);

                if (this.appads_on) {
                    this.adsdklayer.push({
                        type: 'interstitial',
                        value: 1
                    })
                    this.checkAndSendMessages();
                }
            })

            this._eventAds.on('reward', (param1) => {

                this.__sdklog(param1, this.adType);

                if (this.appads_on) {
                    this.adsdklayer.push({
                        type: 'reward',
                        value: 1
                    })
                    this.checkAndSendMessages();
                }
            })

            this._eventAds.on('beforeAd', (param1, param2) => {

                this.__sdklog2("*******adevent**********", param1, param2, this.adType);
            })

            this._eventAds.on('adDismissed', (param1) => {

                this.__sdklog2("*******adevent**********", param1, this.adType);

            })

            this._eventAds.on('adViewed', (param1) => {

                this.__sdklog2("*******adevent**********", param1, this.adType);

            })

            this._eventAds.on('afterAd', (param1, param2) => {

                this.__sdklog2("*******adevent**********", param1, param2, this.adType);

            })

            this._eventAds.on('ad_error', (param1, param2) => {

                // 标记当前网页广告类型为失败，供后续请求切换到候选链中的下一个类型
                // 注意：频控类错误（frequencyCapped / frequencyrewardAd / frequencyinterstitialAd）不视为“渠道不可用”，不会触发后补广告切换。
                try {
                    // 对于 breakStatus 为 viewed / dismissed 的情况，表示本次广告正常结束或被用户关闭，
                    // 不视为渠道失败，因此不做候选链切换标记。
                    if (param2 === 'viewed' || param2 === 'dismissed') {
                        // 这里直接跳过失败标记逻辑
                    } else {
                        const isFrequency =
                            param2 === 'frequencyCapped' ||
                            param2 === 'frequencyrewardAd' ||
                            param2 === 'frequencyinterstitialAd';
                        const t = this.adType;
                        if (!isFrequency) {
                            if (t === this.adsType.ADSENSE) {
                                this._webAdFailed.adsense = true;
                            } else if (t === this.adsType.IMA) {
                                this._webAdFailed.ima = true;
                            } else if (t === this.adsType.GPT) {
                                this._webAdFailed.gpt = true;
                            }
                            // 重置当前类型，让下一次请求重新选择
                            if (t !== this.adsType.ANDROID) {
                                this.adType = null;
                            }
                        }
                    }
                } catch (_) { }

                switch (param2) {
                    case 'timeout':
                    case 'error':
                    case 'frequencyCapped':
                    case 'notReady':
                    case 'invalid':
                    case 'noAdPreloaded':
                    case 'frequencyrewardAd':
                    case 'frequencyinterstitialAd':
                    case 'other':

                        this.adsdklayer.push({
                            type: 'ad_error',
                            value: param2
                        })
                        break;
                    case 'viewed':
                    case 'dismissed':
                        break;
                    default:

                        this.adsdklayer.push({
                            type: 'ad_error',
                            value: param2
                        })
                        break;
                }
                if (param2 !== 'viewed' && param2 !== 'dismissed') {

                    this.__sdklog2("*******adevent**********", param1, param2, this.adType);
                }
            })

            this._eventAds.on('game_start', (data) => {
                this.__sdklog3("game_start", data)
                this.adsdklayer.push({
                    type: 'game_start',
                    value: data.level
                });
            })

            this._eventAds.on('game_score', (data) => {
                this.__sdklog2("game_score", data)
                this.adsdklayer.push({
                    type: 'game_score',
                    value: data.score
                });
                // this.checkAndSendMessages();//要一秒一次发送
            })

            this._eventAds.on('game_distance', (data) => {
                this.__sdklog2("game_distance", data)
                this.adsdklayer.push({
                    type: 'game_distance',
                    value: data.distance
                });
                // this.checkAndSendMessages();//要一秒一次发送
            })

            this._eventAds.on('game_level', (data) => {
                this.__sdklog3("game_level", data)
                this.adsdklayer.push({
                    type: 'game_level',
                    value: data.level
                });
            })

            // 汇总游戏状态
            this._eventAds.on('level_end', (data) => {
                this.__sdklog3("level_end", data)
                this.adsdklayer.push({
                    type: 'level_end',
                    value: data
                })
            })

            this._eventAds.on('load_update', (data) => {
                this.__sdklog3("load_update", data)
                this.adsdklayer.push({
                    type: 'load_update',
                    value: data.progress
                })
            })

            this._eventAds.on("load_complete", (data) => {
                this.__sdklog3("load_complete", data)
                this.adsdklayer.push({
                    type: 'load_complete',
                    value: 1
                })
            })

            this._eventAds.on("game_over", (data) => {
                this.__sdklog3("game_over", data)
                this.adsdklayer.push({
                    type: 'game_over',
                    value: 1
                })
            })


            // if (this.isAndroid) {
            //     // 不使用用超时回退,直接等待下行通知进行切换
            //     this.adsdklayer.push({ type: 'app_ads_event', value: 'is_ads_native' });
            //     console.log('发送上层广告能力探测事件');
            //     this.__sdklog('[adsdk] 上层已确认，启动消息轮询');
            //     this.startMessageCheck();
            // }

            // 启用GA
            // this._insert_tagmanager();

            this._initAds();

            if (this.isAndroid || this.isFramed) {
                this.__sdklog('[adsdk] 上层已确认，启动消息轮询');
                this.startMessageCheck();
            }
        }

        // 判断广告类型ad_type,根据pubid和dev来获取广告代码
        _initAds() {

            // Android 广告能力探测：向父页/原生发送统一上行事件
            if (this.isAndroid || this.isFramed) {
                // 不使用用超时回退,直接等待下行通知进行切换
                this.adsdklayer.push({ type: 'app_ads_event', value: 'is_ads_native' });
                console.log('发送上层广告能力探测事件');
                this.checkAndSendMessages();
            }

            // 默认启用网页广告初始化
            this._openWebAds();
        }

        _openAndroid() {
            this.adType = this.adsType.ANDROID;
            this.is_android = true;
            this.adSdk_isReady = true;
            this._adsInitialized = true;
            try { this._eventAds.emit('ready', "adSdk_isReady:true", "android"); } catch (_) { }
            this.__sdklog('[adsdk] 启用Android广告，不执行网页广告初始化');
        }

        // 网页广告初始化调度
        _openWebAds() {
            if (this._adsInitialized) return; // 已有任意广告栈初始化，避免重复
            // 通过全局 window.ads_list 配置广告类型与顺序：
            // 示例：
            // window.ads_list = {
            //   "web-cp": [
            //     { "adsense": "data-ad-client=..." },
            //     { "gpt": "/22639388115/rewarded_web_example" },this.isAndroid
            //     { "ima": "ca-app-pub-.../..." },
            //     { "android": "off" }
            //   ]
            // }

            const adsMap = (typeof window !== 'undefined' && window.ads_list && typeof window.ads_list === 'object')
                ? window.ads_list
                : null;
            if (!adsMap) {
                this.__sdklog('[adsdk] window.ads_list 未配置，跳过网页广告初始化');
                return;
            }

            // 当前实现：仅使用 ads_list.web-cp 作为广告顺序配置
            const seq = Array.isArray(adsMap['web-cp']) ? adsMap['web-cp'] : null;

            if (!Array.isArray(seq) || seq.length === 0) {
                this.__sdklog('[adsdk] ads_list.web-cp 中未找到配置，跳过网页广告初始化');
                return;
            }

            // 1) 若首项为 android，并且当前运行在 Android 环境且未显式关闭，则直接启用原生广告
            const first = seq[0];
            if (first && typeof first === 'object' && first.android !== undefined) {
                const flag = String(first.android || '').toLowerCase();
                const androidOn = flag && flag !== 'off' && flag !== '0' && flag !== 'false';
                if (this.isAndroid && androidOn) {
                    this.__sdklog('[adsdk] ads_list 首项为 android，且当前为 Android 环境，直接启用原生广告');
                    this._openAndroid();
                    return;
                }
            }

            // 2) 否则按顺序构建网页广告候选链（仅记录，不立即加载具体 SDK）
            const normalizeCode = (v) => (typeof v === 'string' ? v.trim() : '');

            const candidates = [];

            for (const item of seq) {
                if (!item || typeof item !== 'object') continue;
                if (item.adsense) {
                    const code = normalizeCode(item.adsense);
                    if (!code) continue;
                    candidates.push({ type: this.adsType.ADSENSE, code });
                }
                if (item.ima) {
                    const code = normalizeCode(item.ima);
                    if (!code) continue;
                    candidates.push({ type: this.adsType.IMA, code });
                }
                if (item.gpt) {
                    const code = normalizeCode(item.gpt);
                    if (!code) continue;
                    candidates.push({ type: this.adsType.GPT, code });
                }
            }

            if (!candidates.length) {
                this.__sdklog('[adsdk] ads_list.web-cp 中未找到可用的网页广告项');
                return;
            }

            this._webAdCandidates = candidates;
            this._webAdInit = { adsense: false, ima: false, gpt: false };
            this._webAdFailed = { adsense: false, ima: false, gpt: false };
            this._adsInitialized = true;
            this.__sdklog('[adsdk] 已根据 ads_list.web-cp 建立网页广告候选链:', candidates.map(c => c.type).join(','));

            // 预初始化候选链中的各类网页广告 SDK，避免首次展示时加载过慢
            for (const cand of candidates) {
                if (cand.type === this.adsType.ADSENSE && !this._webAdInit.adsense) {
                    this.ads_code = cand.code;
                    this._webAdInit.adsense = true;
                    this.__sdklog('[adsdk] 预初始化 Adsense SDK');
                    this._openAdsense();
                } else if (cand.type === this.adsType.IMA && !this._webAdInit.ima) {
                    this.ima_code = cand.code;
                    this._webAdInit.ima = true;
                    this.__sdklog('[adsdk] 预初始化 IMA SDK');
                    this._openIma();
                } else if (cand.type === this.adsType.GPT && !this._webAdInit.gpt) {
                    this.gpt_code = cand.code;
                    this._webAdInit.gpt = true;
                    this.__sdklog('[adsdk] 预初始化 GPT SDK');
                    this._openGPT();
                }
            }
        }

        /**
         * 根据网页广告候选链选择当前可用的广告类型，并切换 adType/代码。
         * - 仅在非 ANDROID 情况下调用
         * - 若无可用候选，则触发 ad_error('noWebAd') 并返回 false
         */
        _ensureWebAdType() {
            if (this.adType === this.adsType.ANDROID) return true;

            const pickKey = (t) => {
                if (t === this.adsType.ADSENSE) return 'adsense';
                if (t === this.adsType.IMA) return 'ima';
                if (t === this.adsType.GPT) return 'gpt';
                return null;
            };

            const candidates = Array.isArray(this._webAdCandidates) ? this._webAdCandidates : [];
            let selected = null;
            for (const cand of candidates) {
                const k = pickKey(cand.type);
                if (!k) continue;
                if (this._webAdFailed && this._webAdFailed[k]) continue; // 已判定不可用则跳过

                if (this.adType !== cand.type) {
                    this.adType = cand.type;
                    if (cand.type === this.adsType.ADSENSE) {
                        this.ads_code = cand.code;
                    } else if (cand.type === this.adsType.IMA) {
                        this.ima_code = cand.code;
                    } else if (cand.type === this.adsType.GPT) {
                        this.gpt_code = cand.code;
                    }
                }
                selected = cand;
                break;
            }

            if (!selected && this.adType !== this.adsType.ANDROID) {
                this._eventAds.emit('ad_error', 'error', 'noWebAd');
                return false;
            }
            return true;
        }

        _openAdsense() {

            const adsense_Script = document.createElement("script");
            adsense_Script.async = true;
            adsense_Script.setAttribute('data-ad-frequency-hint', '30s');
            adsense_Script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            adsense_Script.setAttribute('crossorigin', 'anonymous');

            if (this.is_ad_test) { adsense_Script.setAttribute('data-adbreak-test', 'on') };

            if (this.ads_code && typeof this.ads_code === 'string') {
                let attr_arr = this.ads_code.split(',');
                for (let i = 0; i < attr_arr.length; i++) {
                    let keyValue = attr_arr[i].split('=');
                    if (keyValue.length === 2) {
                        adsense_Script.setAttribute(keyValue[0], keyValue[1]);
                    }
                }
            }

            adsense_Script.onload = () => {
                window.adsbygoogle = window.adsbygoogle || [];
                window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); }
                let isTimeOut = false;
                window.adConfig({
                    preloadAdBreaks: "on",
                    sound: "on",
                    onReady: () => {
                        isTimeOut = true;
                        this.adSdk_isReady = true;

                    }
                });
                this._eventAds.emit('ready', "adSdk_isReady:true", "s");

            }

            adsense_Script.onerror = (error) => {

                this._eventAds.emit('ad_error', "error", "not-loaded-adsense");
                this.__sdklog("adsense loadError:", error);
            }

            document.head.appendChild(adsense_Script);

        }

        _openIma(code) {


            let ima_script = document.createElement("script");
            ima_script.type = "text/javascript";
            ima_script.src = "//imasdk.googleapis.com/js/sdkloader/ima3.js";
            document.head.appendChild(ima_script);

            ima_script.onload = () => {
                let self = this;

                self.adSdk_isReady = true;
                self._eventAds.emit('ready', "adSdk_isReady:true", "x");

            }

            ima_script.onerror = () => {
                this._eventAds.emit('ad_error', "error", "not-loaded-ima");
                this.__sdklog("ima load error");
            }
        }

        _openGPT() {
            let gpt_script = document.createElement("script");
            gpt_script.type = "text/javascript";
            gpt_script.async = true;
            gpt_script.crossOrigin = "anonymous";
            gpt_script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
            document.head.appendChild(gpt_script);

            gpt_script.onload = () => {
                let self = this;

                self.adSdk_isReady = true;
                self._eventAds.emit('ready', "gptSdk_isReady:true", "gpt");

                window.googletag = window.googletag || { cmd: [] };

                self.rewardPayload = null;

                window.googletag.cmd.push(() => {

                    window.googletag.pubads().addEventListener("rewardedSlotReady", (event) => {
                        // GPT广告准备就绪，重置超时标志
                        self.req_ad_timeout = false;

                        // 清除备用超时
                        if (self.gptBackupTimeout) {
                            clearTimeout(self.gptBackupTimeout);
                            self.gptBackupTimeout = null;
                        }

                        // Safely call makeRewardedVisible if it exists
                        try {
                            if (event && typeof event.makeRewardedVisible === 'function') {
                                event.makeRewardedVisible();
                            }
                        } catch (e) {
                            console.log('event.makeRewardedVisible err', e);
                        }
                        self._eventAds.emit('beforeAd', "beforeAd", "pause");
                        if (self.gpt_callback && typeof self.gpt_callback.beforeAd === 'function') {
                            self.gpt_callback.beforeAd();
                        }
                    });

                    window.googletag.pubads().addEventListener("rewardedSlotClosed", () => {
                        if (self.rewardPayload) {
                            // console.log("广告播放完成关闭");
                            if (self.gpt_type === 'rewardedAd') {
                                self._eventAds.emit('adViewed', "adViewed", "completed");
                                if (self.gpt_callback && typeof self.gpt_callback.adViewed === 'function') {
                                    self.gpt_callback.adViewed();
                                }
                            } else {
                                self._eventAds.emit('afterAd', "afterAd", "resume");
                                if (self.gpt_callback && typeof self.gpt_callback.afterAd === 'function') {
                                    self.gpt_callback.afterAd();
                                }
                            }

                            self.rewardPayload = null;
                        } else {
                            // console.log("广告播放未完成关闭");
                            if (self.gpt_type === 'rewardedAd') {
                                self._eventAds.emit('adDismissed', "adDismissed", "skipped");
                                if (self.gpt_callback && typeof self.gpt_callback.adDismissed === 'function') {
                                    self.gpt_callback.adDismissed();
                                }
                            } else {
                                self._eventAds.emit('afterAd', "afterAd", "resume");
                                if (self.gpt_callback && typeof self.gpt_callback.afterAd === 'function') {
                                    self.gpt_callback.afterAd();
                                }
                            }

                        }

                        if (self.rewardedSlot) {
                            // console.log("ad close");
                            window.googletag.destroySlots([self.rewardedSlot]);
                            self.rewardedSlot = null;
                        } else {
                            if (self.gpt_callback && typeof self.gpt_callback.error === 'function') {
                                self.gpt_callback.error();
                            }
                        }
                    });

                    window.googletag.pubads().addEventListener("rewardedSlotGranted", (event) => {
                        try {
                            self.rewardPayload = event && event.payload ? event.payload : null;

                        } catch (e) {

                            self.rewardPayload = null;
                        }
                    });

                    window.googletag.pubads().addEventListener("slotRenderEnded", (event) => {
                        try {
                            if (event && event.slot === self.rewardedSlot) {
                                // 清除备用超时
                                if (self.gptBackupTimeout) {
                                    clearTimeout(self.gptBackupTimeout);
                                    self.gptBackupTimeout = null;
                                }

                                if (event.isEmpty) {

                                    self.req_ad_timeout = false; // 重置超时标志
                                    self._eventAds.emit('ad_error', 'error', "No ad returned for rewarded ad slot.");
                                    if (self.gpt_callback && typeof self.gpt_callback.error === 'function') {
                                        self.gpt_callback.error("No ad returned for rewarded ad slot.");
                                    }
                                }
                            }
                        } catch (e) {
                            console.log('event.isEmpty err', e);
                        }
                    });
                    googletag.pubads().setTargeting("game_id", self.gameid);

                    window.googletag.enableServices();


                });

            }

            gpt_script.onerror = () => {
                this._eventAds.emit('ad_error', "error", "not-loaded-gpt");
                this.__sdklog("gpt load error");
            }
        }

        _isImaDom = false;
        _createImaDom() {
            console.log('IMA _createImaDom called, creating container');
            const adTemplate = `
    <style id="ima-style">
        #ima-mainContainer {
            all: initial; /* 重置样式，避免被父级影响 */
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            background-color: rgba(0,0,0,0.8) !important;
            z-index: 2147483647 !important; /* 最大安全值 */
            pointer-events: auto !important;
        }
        #ima-adContainer {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
        }
        #ima-contentElement {
            width: 90vw !important;
            max-width: 1280px !important;
            aspect-ratio: 16 / 9 !important;
            height: auto !important;
        }
    </style>
    <div id="ima-mainContainer">
        <div id="ima-adContainer">
            <video id="ima-contentElement" playsinline></video>
        </div>
    </div>
`;
            document.body.insertAdjacentHTML('beforeend', adTemplate);
            this._isImaDom = true;
        }

        _destroyImaDom() {
            console.log('IMA _destroyImaDom called');
            const el = document.getElementById('ima-mainContainer');
            if (el) {
                console.log('Removing IMA main container');
                el.remove();
            } else {
                console.log('IMA main container not found');
            }
            const styleTag = document.getElementById('ima-style');
            if (styleTag) {
                console.log('Removing IMA style tag');
                styleTag.remove();
            } else {
                console.log('IMA style tag not found');
            }
            this.adContainer = null;
            this.videoContent = null;
            this._isImaDom = false;
        }

        _onAdsManagerLoaded(adsManagerLoadedEvent) {
            let self = this;

            // 清理 IMA 加载超时计时器，因为广告管理器已成功加载
            if (self.imaLoadTimeout) {
                clearTimeout(self.imaLoadTimeout);
                self.imaLoadTimeout = null;
            }

            const adsRenderingSettings = new google.ima.AdsRenderingSettings();
            adsRenderingSettings.useCustomPlaybackUI = false;

            try {
                if (!adsManagerLoadedEvent || typeof adsManagerLoadedEvent.getAdsManager !== 'function') {
                    throw new Error('Invalid adsManagerLoadedEvent');
                }
                self.adsManager = adsManagerLoadedEvent.getAdsManager(self.videoContent, adsRenderingSettings);
            } catch (e) {
                self.req_ad_timeout = false; // 重置超时标志，防止后续timeout
                self._destroyImaDom(); // 清理广告容器
                self._eventAds.emit('ad_error', 'error', 'notReady');
                if (self.ima_callback && typeof self.ima_callback.error === 'function') {
                    self.ima_callback.error('notReady');
                }
                return;
            }

            try {
                self.adsManager.init(
                    self.videoWidth,
                    self.videoHeight,
                    google.ima.ViewMode.NORMAL
                );
                self.adsManager.start();
            } catch (e) {
                self.req_ad_timeout = false; // 重置超时标志，防止后续timeout
                self._destroyImaDom(); // 清理广告容器
                self._eventAds.emit('ad_error', 'error', 'notReady');
                if (self.ima_callback && typeof self.ima_callback.error === 'function') {
                    self.ima_callback.error('notReady');
                }
                return;
            }

            let isAdPaused = false;

            self.adContainer.addEventListener('click', () => {
                if (!self.adsManager) return;

                if (isAdPaused) {
                    self.adsManager.resume();
                } else {
                    self.adsManager.pause();
                }

                isAdPaused = !isAdPaused;
            });

            self.adsManager.addEventListener(
                google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
                () => {
                    self.req_ad_timeout = false;

                    // 清理 IMA 加载超时计时器，因为广告已成功开始播放
                    if (self.imaLoadTimeout) {
                        clearTimeout(self.imaLoadTimeout);
                        self.imaLoadTimeout = null;
                    }

                    self._eventAds.emit('beforeAd', "beforeAd", "pause");
                    if (self.ima_callback && typeof self.ima_callback.beforeAd === 'function') {
                        self.ima_callback.beforeAd();
                    }
                }
            );


            self.adsManager.addEventListener(
                google.ima.AdEvent.Type.COMPLETE,
                () => {
                    self.req_ad_timeout = false;
                    self._destroyImaDom();
                    if (self.ima_type === 'rewardedAd') {
                        self._eventAds.emit('adViewed', "adViewed", "completed");
                        if (self.ima_callback && typeof self.ima_callback.adViewed === 'function') {
                            self.ima_callback.adViewed();
                        }
                    } else {
                        self._eventAds.emit('afterAd', "afterAd", "completed");
                        if (self.ima_callback && typeof self.ima_callback.afterAd === 'function') {
                            self.ima_callback.afterAd();
                        }
                    }
                }
            );

            self.adsManager.addEventListener(
                google.ima.AdEvent.Type.SKIPPED,
                () => {
                    self.req_ad_timeout = false;
                    self._destroyImaDom();
                    if (self.ima_type === 'rewardedAd') {
                        self._eventAds.emit('adDismissed', "adDismissed", "skipped");
                        if (self.ima_callback && typeof self.ima_callback.adDismissed === 'function') {
                            self.ima_callback.adDismissed();
                        }
                    } else {
                        self._eventAds.emit('afterAd', "afterAd", "skipped");
                        if (self.ima_callback && typeof self.ima_callback.afterAd === 'function') {
                            self.ima_callback.afterAd();
                        }
                    }
                }
            );

            self.adsManager.addEventListener(
                google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
                () => {
                    self.req_ad_timeout = false;
                    self._destroyImaDom();
                    if (self.ima_type !== 'rewardedAd') {
                        self._eventAds.emit('afterAd', "afterAd", "resume");
                        if (self.ima_callback && typeof self.ima_callback.afterAd === 'function') {
                            self.ima_callback.afterAd();
                        }
                    }
                }
            );


            self.adsManager.addEventListener(
                google.ima.AdErrorEvent.Type.AD_ERROR,
                (event) => {
                    self.req_ad_timeout = false;
                    self._destroyImaDom();
                    let errorData = null;
                    let errorType = 'unknown';
                    let errorMessage = 'Unknown error';

                    try {
                        if (event && typeof event.getError === 'function') {
                            errorData = event.getError();
                            if (errorData && errorData.data) {
                                errorType = errorData.data.type || 'unknown';
                                errorMessage = errorData.data.errorMessage || 'Unknown error';
                            }
                        }
                    } catch (e) {
                        console.log('IMA err:', e);
                    }

                    self._eventAds.emit('ad_error', errorType, errorMessage);
                    if (self.ima_callback && typeof self.ima_callback.error === 'function') {
                        self.ima_callback.error(errorType);
                    }

                }
            );


        }

        _onAdError(event) {
            console.log('IMA _onAdError called, destroying container');
            this._destroyImaDom();

            this.req_ad_timeout = false;

            // 清理 IMA 加载超时计时器
            if (this.imaLoadTimeout) {
                clearTimeout(this.imaLoadTimeout);
                this.imaLoadTimeout = null;
            }

            let errorData = null;
            let errorType = 'unknown';
            let errorMessage = 'Unknown error';

            try {
                if (event && typeof event.getError === 'function') {
                    errorData = event.getError();
                    if (errorData && errorData.data) {
                        errorType = errorData.data.type || 'unknown';
                        errorMessage = errorData.data.errorMessage || 'Unknown error';
                    }
                }
            } catch (e) {
                console.log('IMA err:', e);
            }

            this._eventAds.emit('ad_error', errorType, errorMessage);
            if (this.ima_callback && typeof this.ima_callback.error === 'function') {
                this.ima_callback.error(errorType);
            }

        }

        _showIma() {

            let self = this;

            // 检查Google IMA SDK是否加载成功
            if (typeof google === 'undefined' || typeof google.ima === 'undefined') {
                self.req_ad_timeout = false; // 重置超时标志，防止后续timeout
                self._eventAds.emit('ad_error', 'error', 'notReady');
                if (self.ima_callback && typeof self.ima_callback.error === 'function') {
                    self.ima_callback.error('notReady');
                }
                return;
            }

            if (self.adsManager) {
                self.adsManager.destroy();
                self.adsManager = null;
            }

            if (self.adsLoader) {
                self.adsLoader.destroy();
                self.adsLoader = null;
            }

            if (!self._isImaDom) {
                self._createImaDom();
            }

            self.adContainer = document.getElementById('ima-adContainer');
            self.videoContent = document.getElementById('ima-contentElement');


            if (!self.adContainer || !self.videoContent) {
                self.req_ad_timeout = false; // 重置超时标志，防止后续timeout
                self._destroyImaDom(); // 清理广告容器

                self._eventAds.emit('ad_error', 'error', 'notReady');
                if (self.ima_callback && typeof self.ima_callback.error === 'function') {
                    self.ima_callback.error('notReady');
                }
                return;
            }

            // 设置 IMA 广告加载超时，防止广告容器长时间显示空白
            self.imaLoadTimeout = setTimeout(() => {
                if (self.req_ad_timeout) { // 如果仍在请求状态
                    console.log('IMA ad loading timeout, destroying container');
                    self.req_ad_timeout = false;
                    self._destroyImaDom(); // 清理广告容器
                    self._eventAds.emit('ad_error', 'error', 'timeout');
                    if (self.ima_callback && typeof self.ima_callback.error === 'function') {
                        self.ima_callback.error('timeout');
                    }
                }
            }, 10000); // 10秒超时

            try {
                self.adDisplayContainer = new google.ima.AdDisplayContainer(self.adContainer, self.videoContent);
                self.adsLoader = new google.ima.AdsLoader(self.adDisplayContainer);

                self.adsLoader.addEventListener(
                    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                    (event) => self._onAdsManagerLoaded(event),
                    false
                );
                self.adsLoader.addEventListener(
                    google.ima.AdErrorEvent.Type.AD_ERROR,
                    (event) => self._onAdError(event),
                    false
                );

                self.videoWidth = document.documentElement.clientWidth || window.innerWidth;
                self.videoHeight = document.documentElement.clientHeight || window.innerHeight;
                self.adDisplayContainer.initialize();

                const adsRequest = new google.ima.AdsRequest();
                // 直接使用 ads_list 中配置的 IMA 广告代码（如果需要 correlator，可在配置中自行带上）
                adsRequest.adTagUrl = self.ima_code || '';
                // console.log('imaRequest=', self.videoWidth, self.videoHeight);
                adsRequest.linearAdSlotWidth = self.videoWidth;
                adsRequest.linearAdSlotHeight = self.videoHeight;

                self.adsLoader.requestAds(adsRequest);
            } catch (e) {
                console.log('IMA initialization error:', e);
                self.req_ad_timeout = false;
                self._destroyImaDom(); // 清理广告容器
                if (self.imaLoadTimeout) {
                    clearTimeout(self.imaLoadTimeout);
                    self.imaLoadTimeout = null;
                }
                self._eventAds.emit('ad_error', 'error', 'initError');
                if (self.ima_callback && typeof self.ima_callback.error === 'function') {
                    self.ima_callback.error('initError');
                }
            }
        }

        gptBackupTimeout = null; // GPT备用超时
        _showGPT() {

            let self = this;

            // 检查Google Publisher Tag SDK是否加载成功
            if (typeof window.googletag === 'undefined' || !window.googletag.cmd) {
                self.req_ad_timeout = false; // 重置超时标志，防止后续timeout
                self._eventAds.emit('ad_error', 'error', 'notReady');
                if (self.gpt_callback && typeof self.gpt_callback.error === 'function') {
                    self.gpt_callback.error('notReady');
                }
                return;
            }

            // 直接使用 ads_list 中配置的 gpt_code，不再走本地测试地址逻辑
            let gpt_code = self.gpt_code;

            // 设置一个备用超时，如果30秒内没有任何GPT事件响应，直接报错
            self.gptBackupTimeout = setTimeout(() => {

                self._eventAds.emit('ad_error', 'error', 'gpt_no_response');
                if (self.gpt_callback && typeof self.gpt_callback.error === 'function') {
                    self.gpt_callback.error('gpt_no_response');
                }

            }, 8000);

            window.googletag.cmd.push(() => {
                // 创建新的广告位
                self.rewardedSlot = window.googletag.defineOutOfPageSlot(
                    gpt_code,
                    window.googletag.enums.OutOfPageFormat.REWARDED,
                );

                if (self.rewardedSlot) {
                    self.rewardedSlot.addService(window.googletag.pubads());
                    window.googletag.display(self.rewardedSlot);
                    self.req_ad_timeout = false;
                } else {

                    if (self.gptBackupTimeout) {
                        clearTimeout(self.gptBackupTimeout);
                        self.gptBackupTimeout = null;
                    }
                    self.req_ad_timeout = false;
                    self._eventAds.emit('ad_error', 'error', 'create_slot_failed');
                    if (self.gpt_callback && typeof self.gpt_callback.error === 'function') {
                        self.gpt_callback.error('create_slot_failed');
                    }
                }
            });

        }

        _showAdsense() {
            let self = this;

            // 检查adBreak函数是否存在
            if (typeof window.adBreak !== 'function') {
                self.req_ad_timeout = false; // 重置超时标志，防止后续timeout
                if (typeof self.adsense_callback.error === 'function') self.adsense_callback.error("notReady-adsense");
                self._eventAds.emit('ad_error', "error", "notReady-adsense");
                return;
            }
            if (self.adsense_type === 'rewardedAd') {

                window.adBreak({
                    type: 'reward',
                    beforeAd() {
                        self.req_ad_timeout = false;

                        self._eventAds.emit('beforeAd', "rewardedAd", 'beforeAd');
                        if (typeof self.adsense_callback.beforeAd === 'function') self.adsense_callback.beforeAd();
                    },
                    beforeReward(showAdFn) { showAdFn(); },
                    adDismissed() {

                        self._eventAds.emit('adDismissed', "adDismissed");
                        if (typeof self.adsense_callback.adDismissed === 'function') self.adsense_callback.adDismissed();
                    },
                    adViewed() {

                        self._eventAds.emit('adViewed', "adViewed");
                        if (typeof self.adsense_callback.adViewed === 'function') self.adsense_callback.adViewed();
                    },
                    adBreakDone(placement_info) {

                        self.req_ad_timeout = false;
                        let breakStatus = placement_info && placement_info.breakStatus ? placement_info.breakStatus : 'unknown';
                        self._eventAds.emit('ad_error', "reward_error", breakStatus);
                        if (breakStatus !== 'viewed') {
                            if (typeof self.adsense_callback.error === 'function') self.adsense_callback.error(breakStatus);
                        }
                    }
                });
            } else {
                if (self.is_first) {

                    window.adBreak({
                        type: 'preroll',
                        beforeAd() {

                            self.req_ad_timeout = false;
                            self._eventAds.emit('beforeAd', "interstitialAd", "beforeAd");
                            if (typeof self.adsense_callback.beforeAd === 'function') self.adsense_callback.beforeAd();
                        },
                        adBreakDone(placement_info) {
                            self.is_first = false;
                            self.req_ad_timeout = false;
                            // console.log('adBreakDone', placement_info);
                            let breakStatus = placement_info && placement_info.breakStatus ? placement_info.breakStatus : 'unknown';
                            self._eventAds.emit('ad_error', "interstitial_error", breakStatus);

                            if (breakStatus !== 'viewed') {
                                if (typeof self.adsense_callback.error === 'function') self.adsense_callback.error(breakStatus);
                            } else {

                                self._eventAds.emit('afterAd', "interstitialAd", "afterAd");
                                if (typeof self.adsense_callback.afterAd === 'function') self.adsense_callback.afterAd();
                            }

                        }
                    });
                } else {
                    window.adBreak({
                        type: ["start", "pause", "next", "browse"][Math.floor(Math.random() * 4)],

                        beforeAd() {

                            self.req_ad_timeout = false;
                            self._eventAds.emit('beforeAd', "interstitialAd", "beforeAd");
                            if (typeof self.adsense_callback.beforeAd === 'function') self.adsense_callback.beforeAd();
                        },
                        afterAd() {

                            self._eventAds.emit('afterAd', "interstitialAd", "afterAd");
                            if (typeof self.adsense_callback.afterAd === 'function') self.adsense_callback.afterAd();
                        },
                        adBreakDone(placement_info) {
                            self.is_first = false;
                            self.req_ad_timeout = false;
                            // console.log('adBreakDone', placement_info);
                            let breakStatus = placement_info && placement_info.breakStatus ? placement_info.breakStatus : 'unknown';
                            self._eventAds.emit('ad_error', "interstitial_error", breakStatus);

                            if (breakStatus !== 'viewed') {
                                if (typeof self.adsense_callback.error === 'function') self.adsense_callback.error(breakStatus);
                            }

                        }
                    });
                }

            }

        }

        get pushtime() {
            return this._pushtime;
        }

        set pushtime(value) {
            // 支持 0.1s ~ 30s 的任意小数间隔（默认仍为 1s）
            const raw = Number(value);
            const safe = Number.isFinite(raw) ? raw : 1;
            const v = Math.max(0.1, Math.min(safe, this._maxPushTime));
            const oldTime = this._pushtime;
            if (v !== oldTime) {
                this._pushtime = v;
                this.__sdklog('[adsdk] 推送间隔已更新:', this._pushtime, '秒');
                this.updatePushInterval();
            }
        }

        /**
         * 获取推送间隔（毫秒）
         * 限制在 0.1 秒到 30 秒之间
         */
        getPushInterval() {
            let interval = Math.max(0.1, Math.min(this.pushtime, this._maxPushTime));
            return interval * 1000;
        }

        updatePushInterval() {
            if (this._messageCheckInterval) {
                this.startMessageCheck(); // 重新启动定时器
            }
        }

        /**
         * 启动消息队列检查
         * 根据pushtime配置的间隔检查adsdklayer是否有数据，如果有就发送
         */
        startMessageCheck() {
            if (this._messageCheckInterval) {
                clearInterval(this._messageCheckInterval);
            }

            this._messageCheckInterval = setInterval(() => {
                this.checkAndSendMessages();
            }, this.getPushInterval());

            this.__sdklog('[adsdk] 消息队列检查已启动，间隔:', this.getPushInterval() / 1000, '秒');
        }

        checkAndSendMessages() {
            let self = this;

            if (!self.isAndroid) return;

            if (!self.adsdklayer || self.adsdklayer.length === 0) return;

            const pending = self.adsdklayer.slice();

            self.adsdklayer = [];

            // 在发送到原生前进行去重：相同 type 的后者覆盖前者
            // 这可以保证在短时间（例如1秒）内多次上报的 `game_score` 只保留最后一条
            const deduped = self.deduplicateMessages(pending);

            const nativePayload = deduped;

            try {

                if (self.isAndroid) {
                    try {
                        window.CpsenseAppEvent.events(JSON.stringify(nativePayload));
                        self.__sdklog('[adsdk] CpsenseAppEvent.events called with', JSON.stringify(nativePayload));
                    } catch (nativeErr) {
                        console.warn('[adsdk] native push failed:', nativeErr);
                    }
                }
            } catch (sendErr) {
                console.warn('[adsdk] send error:', sendErr);
            }


        }


        deduplicateMessages(messages) {
            const messageMap = new Map();

            // 遍历消息，相同type的后面覆盖前面的
            messages.forEach(message => {
                messageMap.set(message.type, message);
            });

            return Array.from(messageMap.values());
        }

        showAd(value) {
            this.__sdklog3('showAd AD:', value);
            const self = this;

            // 单次尝试：在当前 adType 下调用对应广告，并通过 Promise 暴露结果
            // isRetry 用于标记：是否为同一次 showAd 调用内部的“后补广告”重试。
            // - isRetry === false：外部第一次调用，受 1 秒频控限制；
            // - isRetry === true：同一次调用内部的候选链重试，不受 1 秒频控影响。
            const tryOnce = (isRetry = false) => {
                let isTimeOut = false;
                return new Promise((resolve, reject) => {
                    const st_time = setTimeout(() => {
                        clearTimeout(st_time);
                        if (!isTimeOut) {
                            reject('ad timeout');
                        }
                    }, 3000);

                    const commonCallbacks = {
                        beforeAd() { isTimeOut = true; },
                        error(err) {
                            isTimeOut = true;
                            console.log('Ad error:', err);
                            reject(err);
                        }
                    };

                    if (value === 'rewarded') {
                        self._showRewardAd({
                            ...commonCallbacks,
                            adDismissed() {
                                isTimeOut = true;
                                console.log('Reward Ad dismissed');
                                reject('ad dismissed');
                            },
                            adViewed() {
                                isTimeOut = true;
                                console.log('Reward Ad viewed');
                                resolve('success');
                            }
                        }, { skipFrequencyGate: isRetry });
                    } else {
                        self._showInterstitialAd({
                            ...commonCallbacks,
                            afterAd() {
                                isTimeOut = true;
                                console.log('Interstitial Ad finished');
                                resolve('success');
                            }
                        }, { skipFrequencyGate: isRetry });
                    }
                });
            };

            // 仅当广告真实失败时才尝试候选链中的下一个类型；
            // 频控类错误（frequencyCapped / frequencyrewardAd / frequencyinterstitialAd）不触发后补广告，以避免连续请求。
            const isFrequencyError = (err) => {
                try {
                    if (!err) return false;
                    if (typeof err === 'string') {
                        const s = err.toLowerCase();
                        return s.includes('frequencycapped') ||
                            s.includes('frequencyreward') ||
                            s.includes('frequencyinterstitial');
                    }
                    if (typeof err === 'object') {
                        const code = String(err.ad_error_type || err.type || '').toLowerCase();
                        return code.startsWith('frequency');
                    }
                } catch (_) { }
                return false;
            };

            // 用户主动关闭 / 跳过 广告（dismissed）视为“本次展示已结束”，不再做候选链重试。
            const isDismissError = (err) => {
                try {
                    if (!err) return false;
                    if (typeof err === 'string') {
                        const s = err.toLowerCase();
                        return s.includes('ad dismissed') || s === 'dismissed';
                    }
                    if (typeof err === 'object') {
                        const code = String(err.ad_error_type || err.type || '').toLowerCase();
                        return code === 'dismissed' || code === 'ad_dismissed';
                    }
                } catch (_) { }
                return false;
            };

            const maxTries = (Array.isArray(this._webAdCandidates) ? this._webAdCandidates.length : 0) || 1;

            const run = async () => {
                let attempts = 0;
                // 对于 ANDROID：只尝试一次；对于网页广告：最多尝试候选链长度次
                while (true) {
                    attempts++;

                    // 非 ANDROID：根据候选链选择当前网页广告类型
                    if (self.adType !== self.adsType.ANDROID) {
                        const ok = self._ensureWebAdType();
                        if (!ok) {
                            throw new Error('noWebAd');
                        }
                    }

                    try {
                        // attempts === 1 表示外部第一次真实调用；>1 为同一次调用内部的候选链“后补广告”重试。
                        return await tryOnce(attempts > 1);
                    } catch (err) {
                        // ANDROID、频控错误或用户主动关闭：不做多渠道重试，直接抛出
                        if (self.adType === self.adsType.ANDROID || isFrequencyError(err) || isDismissError(err)) {
                            throw err;
                        }
                        if (attempts >= maxTries) {
                            throw err;
                        }
                        // 对于网页广告：失败后通过 ad_error 事件已标记当前类型为 failed，
                        // 下一轮循环会在 _ensureWebAdType 中自动切换到候选链中的下一种类型。
                        continue;
                    }
                }
            };

            return run();
        }

        _debounceTimer = null;
        _timeoutTimer = null;
        // 插页
        // options.skipFrequencyGate === true 时，认为是同一次 showAd 调用内部的“后补广告”重试，
        // 不再应用 1 秒频控，只对外部短时间内的再次调用做频控。
        _showInterstitialAd(callback, options = {}) {
            let self = this;
            const skipFrequencyGate = options && options.skipFrequencyGate;

            // 检查SDK是否准备就绪,目前adsense不需要检查
            // if (!self.adSdk_isReady) {
            //     if (typeof callback.error === 'function') callback.error("notReady");
            //     self._eventAds.emit('ad_error', "error", "notReady");
            //     return;
            // }

            // 1 秒内禁止重复：仅对外部调用生效；内部候选链重试跳过该逻辑。
            if (!skipFrequencyGate) {
                if (self.req_ad_stabilization) {
                    if (typeof callback.error === 'function') callback.error("frequencyCapped");
                    return;
                }
                self._debounceTimer = setTimeout(() => {
                    clearTimeout(self._debounceTimer);
                    self.req_ad_stabilization = false;
                }, 1000);

                self.req_ad_stabilization = true;
            }

            self._eventAds.emit('interstitial', "interstitialAd");


            // 为本次请求分配唯一ID，并清理旧的超时定时器，避免上一轮定时器误判本轮请求
            self._interstitialReqId = (self._interstitialReqId || 0) + 1;
            const currentReqId = self._interstitialReqId;
            if (self._timeoutTimer) {
                try { clearTimeout(self._timeoutTimer); } catch (_) { }
                self._timeoutTimer = null;
            }
            self._timeoutTimer = setTimeout(() => {
                // 若已有更新的请求在进行中，则忽略本次定时器
                if (self._interstitialReqId !== currentReqId) return;
                clearTimeout(self._timeoutTimer);
                if (self.req_ad_timeout) {
                    self.is_first = false;
                    self._eventAds.emit('ad_error', "error", "timeout");
                    if (typeof callback.error === 'function') callback.error("timeout");
                }
            }, 8000);

            let now = Date.now();
            if (!self.interstitial_time_start) {
                self.interstitial_time_start = now;
            }

            // 如果超过30秒，重置计数器
            let now_duration = now - self.interstitial_time_start;
            // console.log('now_duration=', now_duration, 'interstitial_time_start=', self.interstitial_time_start);

            if (self.interstitial_requests_count > 1) {

                if (now_duration > 30000) {

                    self.interstitial_time_start = now;
                } else {
                    if (typeof callback.error === 'function') callback.error({ ad_error_type: 'frequencyinterstitialAd' });
                    self._eventAds.emit('ad_error', "frequencyinterstitialAd", 'frequencyinterstitialAd');
                    return false;
                }
            }
            self.interstitial_requests_count++;

            // 请求广告超时
            self.req_ad_timeout = true;



            if (self.adType === self.adsType.ADSENSE) {
                self.adsense_type = 'interstitialAd';
                // 安全地合并回调对象，保留默认的空函数
                Object.assign(self.adsense_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });
                self._showAdsense();

            }
            else if (self.adType === self.adsType.IMA) {

                self.ima_type = 'interstitialAd';
                // 安全地合并回调对象，保留默认的空函数
                Object.assign(self.ima_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });
                self._showIma();
            }
            else if (self.adType === self.adsType.GPT) {
                self.gpt_type = 'interstitialAd';
                // 安全地合并回调对象，保留默认的空函数
                Object.assign(self.gpt_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });
                self._showGPT();
            }
            else if (self.adType === self.adsType.ANDROID) {
                // ANDROID：设定类型并改用原生调用，避免重复定时器
                self.android_type = 'interstitialAd';
                Object.assign(self.android_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });
                // 通过事件触发调用安卓原生广告

            }
        }

        _debounceTimer_reward = null;
        _timeoutTimer_reward = null;
        // 激励
        // options.skipFrequencyGate === true 时，认为是同一次 showAd 调用内部的“后补广告”重试，
        // 不再应用 1 秒频控，只对外部短时间内的再次调用做频控。
        _showRewardAd(callback, options = {}) {
            let self = this;
            const skipFrequencyGate = options && options.skipFrequencyGate;

            if (!skipFrequencyGate) {
                if (self.req_ad_stabilization) {
                    if (typeof callback.error === 'function') callback.error("frequencyCapped");
                    return;
                };

                self._debounceTimer_reward = setTimeout(() => {
                    clearTimeout(self._debounceTimer_reward);
                    self.req_ad_stabilization = false;
                }, 1000);

                self.req_ad_stabilization = true;
            }

            self._eventAds.emit('reward', "rewardAd");

            // 为本次激励请求分配唯一ID，并清理旧的超时定时器
            self._rewardReqId = (self._rewardReqId || 0) + 1;
            const currentReqId = self._rewardReqId;
            if (self._timeoutTimer_reward) {
                try { clearTimeout(self._timeoutTimer_reward); } catch (_) { }
                self._timeoutTimer_reward = null;
            }
            self._timeoutTimer_reward = setTimeout(() => {
                if (self._rewardReqId !== currentReqId) return;
                clearTimeout(self._timeoutTimer_reward);
                if (self.req_ad_timeout) {
                    self._eventAds.emit('ad_error', "error", "timeout");
                    if (typeof callback.error === 'function') callback.error("timeout");
                }
            }, 8000);

            const now = Date.now();
            if (!self.reward_time_start) {
                self.reward_time_start = now;
            }

            // 如果超过30秒，重置计数器
            let now_duration = now - self.reward_time_start;
            // console.log('now_duration=', now_duration, 'reward_time_start=', self.reward_time_start);
            if (now_duration > 30000) {
                self.reward_time_start = 0;
                self.reward_requests_count = 3;
            }

            // 检查是否超过3次限制
            if (self.reward_requests_count <= 0) {
                if (typeof callback.error === 'function') callback.error({ ad_error_type: 'frequencyrewardAd' });
                self._eventAds.emit('ad_error', "frequencyrewardAd", 'frequencyrewardAd');
                return false;
            }


            self.reward_requests_count--;
            // 请求广告超时
            self.req_ad_timeout = true;

            if (self.adType === self.adsType.ADSENSE) {

                self.adsense_type = 'rewardedAd';
                // 安全地合并回调对象，保留默认的空函数
                Object.assign(self.adsense_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });
                self._showAdsense();


            } else if (self.adType === self.adsType.IMA) {
                self.ima_type = 'rewardedAd';
                // 安全地合并回调对象，保留默认的空函数
                Object.assign(self.ima_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });

                self._showIma();
            } else if (self.adType === self.adsType.GPT) {
                self.gpt_type = 'rewardedAd';
                // 安全地合并回调对象，保留默认的空函数
                Object.assign(self.gpt_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });
                self._showGPT();
            } else if (this.adType === this.adsType.ANDROID) {
                // ANDROID：设定类型并改用原生调用，避免重复定时器
                this.android_type = 'rewardedAd';
                Object.assign(this.android_callback, {
                    error: (callback && callback.error) || (() => { }),
                    beforeAd: (callback && callback.beforeAd) || (() => { }),
                    afterAd: (callback && callback.afterAd) || (() => { }),
                    adViewed: (callback && callback.adViewed) || (() => { }),
                    adDismissed: (callback && callback.adDismissed) || (() => { })
                });

            }

        }


        // tag init
        _insert_tagmanager() {
            let self = this;
            const ga_script = document.createElement("script");
            ga_script.async = true;
            ga_script.src = "https://www.googletagmanager.com/gtag/js?id=G-NL2943ZRFH";
            ga_script.setAttribute('crossorigin', 'anonymous');
            ga_script.onload = () => {


                window.gtag("consent", "default", {
                    "ad_storage": "granted",
                    "ad_user_data": "granted",
                    "ad_personalization": "granted",
                    "analytics_storage": "granted"
                });

                window.gtag('js', new Date());
                window.gtag('set', 'cookie_flags', 'SameSite=None;Secure');
                window.gtag('config', 'G-NL2943ZRFH', {
                    game_id: self.gameid,
                    dev_name: self.dev_name,//self.config.client
                    iframe_url: document.referrer
                });
            };

            let gamePlayTimerStarted = false;

            window.gtag = function () {


                let own_event_list = [
                    'ad_error',
                    'game_reward_open',
                    'game_interstitialad_open',
                    'game_play_time',
                    'game_reward_dismissed',
                    'game_interstitialad',
                    'game_reward',
                    'game_reward_viewed',
                    'game_interstitialad_viewed',
                    'click_ad'
                ];

                let event_List = [
                    'game_start',
                    'level_start',
                    'level_end'
                ];



                let ar = [...arguments];
                let ar0 = ar[0];
                let ar1 = ar[1];
                let ar2 = ar[2];

                if (
                    (["set", "js", "config", "consent"].indexOf(ar0) !== -1) ||
                    (event_List.indexOf(ar1) !== -1) ||
                    (own_event_list.indexOf(ar1) !== -1 &&
                        ar2 &&
                        ar2['send'] &&
                        ar2['send'] === 'sdk')
                ) {
                    try {

                        let copyThird;
                        if (ar[2] && typeof ar[2] === 'object') {
                            if (Array.isArray(ar[2])) {
                                copyThird = ar[2].slice();
                            } else {
                                copyThird = Object.assign({}, ar[2]);
                            }
                        } else {
                            copyThird = {};
                        }

                        try { delete copyThird.dev_name; } catch (_) { /* ignore */ }
                        try { delete copyThird.iframe_url; } catch (_) { /* ignore */ }
                        copyThird.game_id = self.gameid;

                        const logArgs = Array.from(arguments);
                        logArgs[2] = copyThird;

                        self.__sdklog3(...logArgs);

                    } catch (e) { /* ignore */ }


                    try {
                        if (window.dataLayer && typeof window.dataLayer.push === 'function') {
                            window.dataLayer.push(arguments);
                        }
                    } catch (e) {
                        console.log('dataLayer:', e);
                    }
                }

                if (ar[1] === 'game_start' && !gamePlayTimerStarted) {
                    gamePlayTimerStarted = true;
                    setInterval(function () {
                        if (typeof window.gtag === 'function') {
                            window.gtag('event', 'game_play_time', { send: 'sdk' });
                        }
                        // message
                        self.adsdklayer.push({
                            type: 'game_time',
                            value: self._gameTime += 30
                        });
                    }, 30000);
                }

                // 添加上报分支
                if (ar1 === 'game_start') {
                    self.adsdklayer.push({
                        type: 'game_start',
                        value: ar[2]
                    })
                }

                if (ar1 === 'level_start') {
                    self.adsdklayer.push({
                        type: 'level_start',
                        value: ar[2]
                    })
                }

                if (ar1 === 'level_end') {
                    self.adsdklayer.push({
                        type: 'level_end',
                        value: ar[2]
                    })
                }


            };
            document.head.appendChild(ga_script);



        }

        /**
         * 重放在 AndroidminCp 加载前由占位脚本缓存的事件。
         * 兼容以下几种形式的队列项：
         *  - { eventName, payload }
         *  - { type, value }
         *  - { name, data }
         *  - { eventName, args: [...] }
         */
        _replayQueuedEvents() {
            try {
                const win = (typeof window !== 'undefined') ? window : globalThis;
                if (!win) return;

                const queue = Array.isArray(win.__acpEventQueue) ? win.__acpEventQueue : null;
                if (!queue || !queue.length) return;

                const cached = queue.slice();
                queue.length = 0;

                cached.forEach((item) => {
                    try {
                        if (!item) return;
                        const type =
                            item.eventName ||
                            item.type ||
                            item.name ||
                            (Array.isArray(item) && item[0]) ||
                            null;
                        if (!type || typeof type !== 'string') return;

                        let args = [];
                        if (Array.isArray(item.args)) {
                            args = item.args;
                        } else if ('payload' in item) {
                            args = [item.payload];
                        } else if ('value' in item || 'data' in item) {
                            const v = (item.value !== undefined) ? item.value : item.data;
                            args = [v];
                        }

                        // 回放前打印一条详细日志，便于排查
                        try {
                            this.__sdklog3('replay_cached_event', { event: type, payload: args[0] });
                        } catch (_) { }

                        this._eventAds.emit(type, ...args);
                    } catch (e) {
                        try {
                            console.warn('[AndroidminCp] 重放占位事件失败:', e && e.message);
                        } catch (_) { }
                    }
                });

                try {
                    this.__sdklog('[AndroidminCp] 已重放占位期间缓存的事件');
                } catch (_) { }
            } catch (e) {
                try {
                    console.warn('[AndroidminCp] 重放占位事件时出错:', e && e.message);
                } catch (_) { }
            }
        }

        __sdklog(...args) {
            const formatParam = (arg) => {
                if (typeof arg === 'string') return `'${arg}'`;
                if (typeof arg === 'object') return JSON.stringify(arg);
                return String(arg);
            };

            const params = args.map(formatParam).join(' ');

            console.log(
                `%c ***__acp***: ${params}`,

                'background-color: #f9f9f9; ' +
                'border: 2px solid #8e44ad; ' +
                'color: #333; ' +
                'padding: 5px 15px; ' +
                'border-radius: 5px; ' +
                'font-weight: 500; ' +
                'box-shadow: 0 0 5px rgba(142, 68, 173, 0.3);'
            );
        }

        __sdklog2(...args) {
            const formatParam = (arg) => {
                if (typeof arg === 'string') return `'${arg}'`;
                if (typeof arg === 'object') return JSON.stringify(arg);
                return String(arg);
            };

            const params = args.map(formatParam).join(' ');

            console.log(
                `%c ***__acp***: ${params}`,
                'background: linear-gradient(to right, #8e44ad, #ba43ff); ' +
                'color: white; ' +
                'padding: 5px 15px; ' +
                'border-radius: 5px; ' +
                'font-weight: bold; ' +
                'text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);'

            );
        }
        __sdklog3(...args) {
            const formatParam = (arg) => {
                if (typeof arg === 'string') return `'${arg}'`;
                if (typeof arg === 'object') return JSON.stringify(arg);
                return String(arg);
            };

            const params = args.map(formatParam).join(' ');

            console.log(
                `%c ***DOTGTAG***: ${params}`,
                'background: linear-gradient(to right,rgb(68, 173, 166),rgb(4, 170, 173)); ' +
                'color: white; ' +
                'padding: 5px 15px; ' +
                'border-radius: 5px; ' +
                'font-weight: bold; ' +
                'text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);'

            );
        }
        destroy() { this.isInitialized = false; this.readyCallbacks = []; this.eventCallbacks = {}; this.config = {}; console.log('AndroidminCp 已销毁'); }


    }


    const api = Object.assign(new Core(), {
        create: (cfg) => { const inst = new Core(); if (cfg) inst.setConfig(cfg); return inst; },
        version: SDK_VERSION
    });

    // 自动初始化完成时输出一次名称和版本信息，便于排查集成环境
    try {
        if (typeof api.__sdklog === 'function') {
            api.__sdklog(`${SDK_NAME} SDK 初始化完成`, `version=${SDK_VERSION}`);
        } else {
            console.log(`初始化完成`, `version=${SDK_VERSION}`);
        }
    } catch (e) {
        // 日志失败不影响主流程
    }

    if (!global[SDK_NAME]) global[SDK_NAME] = api;
    try {
        // 记录占位阶段的全局对象和队列
        const prevAcp = (global.__acp && typeof global.__acp === 'object') ? global.__acp : null;
        const prevQueue = Array.isArray(global.__acpEventQueue) ? global.__acpEventQueue : null;

        // SDK 就绪后接管 __acp，使后续 __acp._eventAds.emit 走真正 SDK
        global.__acp = api;

        // 保留占位期间累计的队列
        if (prevQueue) {
            global.__acpEventQueue = prevQueue;
        } else {
            global.__acpEventQueue = global.__acpEventQueue || [];
        }

        // 如果游戏在占位阶段缓存了 __acp._eventAds 的引用，则把该对象的 emit 改为转发到真正 SDK
        try {
            const prevEventAds = prevAcp && prevAcp._eventAds && typeof prevAcp._eventAds.emit === 'function'
                ? prevAcp._eventAds
                : null;
            if (prevEventAds && prevEventAds !== api._eventAds && typeof api._eventAds?.emit === 'function') {
                prevEventAds.emit = function (eventName, payload) {
                    try {
                        api._eventAds.emit(eventName, payload);
                    } catch (e) {
                        // 忽略单条事件转发错误
                    }
                };
            }
        } catch (_) {
            // 占位对象兼容失败不影响主流程
        }

        // 接管完全局后立刻回放占位期间缓存的事件
        try {
            if (typeof api._replayQueuedEvents === 'function') {
                api._replayQueuedEvents();
            }
        } catch (_) { }
    } catch (error) {
        // 忽略全局覆盖异常
    }
})(window);

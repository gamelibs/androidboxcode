var Pf = Object.defineProperty;
var Nf = (s, e, t) => e in s ? Pf(s, e, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: t
}) : s[e] = t;
var Ve = (s, e, t) => Nf(s, typeof e != "symbol" ? e + "" : e, t);
(function() {
    const e = document.createElement("link").relList;
    if (e && e.supports && e.supports("modulepreload")) return;
    for (const i of document.querySelectorAll('link[rel="modulepreload"]')) n(i);
    new MutationObserver(i => {
        for (const r of i)
            if (r.type === "childList")
                for (const a of r.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && n(a)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function t(i) {
        const r = {};
        return i.integrity && (r.integrity = i.integrity), i.referrerPolicy && (r.referrerPolicy = i.referrerPolicy), i.crossOrigin === "use-credentials" ? r.credentials = "include" : i.crossOrigin === "anonymous" ? r.credentials = "omit" : r.credentials = "same-origin", r
    }

    function n(i) {
        if (i.ep) return;
        i.ep = !0;
        const r = t(i);
        fetch(i.href, r)
    }
})();
var Bf = Object.defineProperty,
    Ff = (s, e, t) => e in s ? Bf(s, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : s[e] = t,
    st = (s, e, t) => (Ff(s, typeof e != "symbol" ? e + "" : e, t), t),
    Et = (s => (s.LOADING = "Loading", s.OPENED = "Opened", s.CLOSED = "Closed", s.FAILED = "Failed", s))(Et || {}),
    lt = (s => (s.LOADING = "Loading", s.OPENED = "Opened", s.CLOSED = "Closed", s.FAILED = "Failed", s.REWARDED = "Rewarded", s))(lt || {}),
    Hn = (s => (s.PAUSE = "SplashPause", s.RESUME = "SplashResume", s.REWARDED = "SplashRewarded", s.ERROR = "SplashAdsError", s))(Hn || {});
const kf = () => {
        if (!(typeof window < "u" && typeof window.localStorage == "object" && typeof window.localStorage.setItem == "function")) return !1;
        const s = "safeLocalStorageTest";
        try {
            return window.localStorage.setItem(s, "succeeds"), window.localStorage.removeItem(s), !0
        } catch {
            return !1
        }
    },
    Of = () => {},
    Yr = (s, e, t = Of) => {
        if (kf()) return window.localStorage[s](...e);
        t()
    },
    Lc = {
        get: (s, e) => Yr("getItem", [s], e),
        set: (s, e, t) => {
            Yr("setItem", [s, e], t)
        },
        remove: (s, e) => {
            Yr("removeItem", [s], e)
        },
        removeAll: s => {
            Yr("clear", [], s)
        }
    };
class Uf {
    constructor() {
        st(this, "container", null)
    }
    show() {
        if (!this.container) {
            this.container = document.createElement("div"), this.container.style.position = "fixed", this.container.style.top = "0", this.container.style.left = "0", this.container.style.width = "100vw", this.container.style.height = "100vh", this.container.style.backgroundColor = "rgba(0, 0, 0, 0.7)", this.container.style.display = "flex", this.container.style.alignItems = "center", this.container.style.justifyContent = "center", this.container.style.fontSize = "2rem", this.container.style.fontWeight = "bold", this.container.style.color = "white", this.container.style.zIndex = "1000", this.container.innerText = "Interstitial";
            const e = document.createElement("button");
            e.textContent = "Close", e.style.position = "absolute", e.style.top = "20px", e.style.right = "20px", e.style.padding = "10px 20px", e.style.fontSize = "1rem", e.onclick = () => this.hide(), this.container.appendChild(e), document.body.appendChild(this.container)
        }
        this.container.style.display = "flex", Ps()
    }
    hide() {
        console.log("inter hide"), this.container && (this.container.style.display = "none", Ds())
    }
}

function Ds() {
    console.log("Dispatch ADS_EVENTS.RESUME");
    var s = new Event(Hn.RESUME);
    window.dispatchEvent(s)
}

function Ps() {
    console.log("Dispatch ADS_EVENTS.PAUSE");
    var s = new Event(Hn.PAUSE);
    window.dispatchEvent(s)
}

function Cn() {
    console.log("Dispatch ADS_EVENTS.ERROR");
    var s = new Event(Hn.ERROR);
    window.dispatchEvent(s)
}
class zf {
    constructor(e) {
        st(this, "container", null), st(this, "countdownInterval", null), st(this, "countdownTime", 3), st(this, "rewardButton", null), st(this, "closeButton", null), st(this, "textElement", null), st(this, "rewardedCallback"), this.rewardedCallback = e
    }
    show() {
        if (!this.container) {
            this.container = document.createElement("div"), this.container.style.position = "fixed", this.container.style.top = "0", this.container.style.left = "0", this.container.style.width = "100vw", this.container.style.height = "100vh", this.container.style.backgroundColor = "rgba(0, 0, 0, 0.7)", this.container.style.display = "flex", this.container.style.alignItems = "center", this.container.style.justifyContent = "center", this.container.style.fontSize = "2rem", this.container.style.fontWeight = "bold", this.container.style.color = "white", this.container.style.zIndex = "1000", this.container.innerText = `Interstitial - Reward in ${this.countdownTime} seconds`;
            const e = document.createElement("button");
            e.textContent = "Close", e.style.position = "absolute", e.style.top = "20px", e.style.right = "20px", e.style.padding = "10px 20px", e.style.fontSize = "1rem", e.onclick = () => {
                this.hide()
            }, this.closeButton = e, this.container.appendChild(e), this.textElement = document.createElement("div"), this.container.appendChild(this.textElement), document.body.appendChild(this.container)
        }
        this.container.style.display = "flex", Ps(), this.startCountdown()
    }
    startCountdown() {
        this.countdownTime = 3, this.updateCountdownText(), this.countdownInterval = window.setInterval(() => {
            this.countdownTime -= 1, this.updateCountdownText(), this.countdownTime <= 0 && (this.showRewardButton(), this.clearCountdown())
        }, 1e3)
    }
    updateCountdownText() {
        this.textElement && (this.textElement.innerText = `Interstitial - Reward in ${this.countdownTime} seconds`)
    }
    showRewardButton() {
        this.container && !this.rewardButton && (this.container.innerText = "Reward Ready", this.rewardButton = document.createElement("button"), this.rewardButton.textContent = "Get Reward", this.rewardButton.style.position = "absolute", this.rewardButton.style.bottom = "20px", this.rewardButton.style.left = "50%", this.rewardButton.style.transform = "translateX(-50%)", this.rewardButton.style.padding = "10px 20px", this.rewardButton.style.fontSize = "1rem", this.rewardButton.onclick = () => {
            this.claimReward()
        }, this.container.appendChild(this.rewardButton), this.closeButton && (this.closeButton.onclick = () => this.claimReward()))
    }
    claimReward() {
        this.rewardedCallback(), Gl(), this.hide()
    }
    clearCountdown() {
        this.countdownInterval !== null && (clearInterval(this.countdownInterval), this.countdownInterval = null)
    }
    hide() {
        this.container && (this.container.style.display = "none", Ds()), this.clearCountdown(), this.rewardButton && (this.rewardButton.remove(), this.rewardButton = null)
    }
}

function Gl() {
    console.log("Dispatch ADS_EVENTS.REWARDED");
    var s = new Event(Hn.REWARDED);
    window.dispatchEvent(s)
}
const Ic = "playerDataKey",
    Rc = "playerStatsKey";
class Vl {
    constructor(e) {
        st(this, "rewardedCallback"), st(this, "interState", Et.CLOSED), st(this, "rewardedState", lt.CLOSED), st(this, "inter"), st(this, "rewarded"), st(this, "isRewarded", !1), this.params = e, e.type == "DefaultPlatform" && setTimeout(() => {
            e.onLoaded()
        }, 2e3)
    }
    warmAds() {}
    get type() {
        return "DefaultPlatform"
    }
    get isLoaded() {
        return !0
    }
    get lang() {
        return "en"
    }
    get tld() {
        return "com"
    }
    isMobile() {
        return !1
    }
    isTablet() {
        return !1
    }
    isDesktop() {
        return !0
    }
    login(e) {
        return Promise.resolve()
    }
    fetchStats(e) {
        return this.getLocalData(Rc).then(e), Promise.resolve()
    }
    fetchCatalog(e) {
        return Promise.resolve()
    }
    purchase(e, t, n) {
        return Promise.resolve()
    }
    confirmPayments(e) {
        return Promise.resolve()
    }
    incrementStats(e, t) {
        return Promise.resolve()
    }
    setStats(e) {
        return this.setLocalData(e, Rc), Promise.resolve(!0)
    }
    showRewarded(e) {
        if (this.rewardedCallback = e, this.isRewarded = !0, this.params.rewardedError != null && this.params.rewardedError > Math.random()) {
            this.rewardedState = lt.FAILED, console.log("::: Simulate Error Rewarded  - Request:::"), Cn();
            return
        }
        this.rewardedState = lt.OPENED, this.rewarded = this.rewarded ?? new zf(e), this.rewarded.rewardedCallback = e, this.rewarded.show()
    }
    showInterstitial() {
        if (this.isRewarded = !1, this.params.interstitialError != null && this.params.interstitialError > Math.random()) {
            this.interState = Et.FAILED, console.log("::: Simulate Error Rewarded  - Request:::"), Cn();
            return
        }
        this.interState = Et.OPENED, this.inter = this.inter ?? new Uf, this.inter.show()
    }
    doCallbacks(e) {}
    gameReady() {}
    fetchLeaderboards() {
        return Promise.resolve()
    }
    hasAuth() {
        return !1
    }
    openAuthDialog() {
        return Promise.resolve()
    }
    setLeaderboardScore(e, t) {
        return Promise.resolve()
    }
    getLeaderboardScores(e, t, n, i) {
        return Promise.resolve(void 0)
    }
    getPlayerId() {
        return this.getUniqueId()
    }
    generateUniqueId() {
        const e = Math.random().toString(36).substr(2, 9),
            t = new Date().getTime();
        return e + t
    }
    getUniqueId() {
        let e = localStorage.getItem("uniquePlayerId");
        return e || (e = this.generateUniqueId(), localStorage.setItem("uniquePlayerId", e)), e
    }
    getData(e) {
        return this.getLocalData(e || Ic)
    }
    setData(e, t) {
        return this.setLocalData(e, t || Ic)
    }
    getLocalData(e) {
        return new Promise((t, n) => {
            try {
                const i = Lc.get(e);
                if (!i) {
                    t({});
                    return
                }
                const r = JSON.parse(i);
                t(r)
            } catch (i) {
                n(i)
            }
        })
    }
    setLocalData(e, t) {
        return new Promise((n, i) => {
            try {
                const r = JSON.stringify(e);
                Lc.set(t, r), n()
            } catch (r) {
                i(r)
            }
        })
    }
    checkOpenAds() {
        this.isRewarded && this.rewardedState == lt.LOADING ? (this.rewardedState = lt.OPENED, Ps()) : this.interState == Et.LOADING && (this.interState = Et.OPENED, Ps())
    }
    checkRewarded() {
        this.isRewarded && this.rewardedState == lt.OPENED && (this.rewardedState = lt.REWARDED, this.rewardedCallback(), Gl())
    }
    checkClose() {
        console.log("checkClose: inter " + this.interState), console.log("checkClose: rewarded " + this.rewardedState), !this.isRewarded && this.interState == Et.OPENED && (this.interState = Et.CLOSED, Ds()), this.isRewarded && this.rewardedState == lt.OPENED && (this.rewardedState = lt.CLOSED, Ds())
    }
    checkError() {
        !this.isRewarded && this.interState == Et.LOADING && (this.interState = Et.FAILED, Cn()), this.isRewarded && this.rewardedState == lt.LOADING && (this.rewardedState = lt.FAILED, Cn())
    }
}
class Gf extends Vl {
    constructor(e) {
        super(e), st(this, "sdk"), st(this, "payments"), st(this, "player"), st(this, "leaderboards"), st(this, "readyCalled", !1), YaGames.init().then(t => {
            this.sdk = t, e.onLoaded()
        })
    }
    getPlayerId() {
        return this.player.getUniqueID()
    }
    isMobile() {
        return this.sdk.deviceInfo.isMobile()
    }
    isTablet() {
        return this.sdk.deviceInfo.isTablet()
    }
    isDesktop() {
        return this.sdk.deviceInfo.isDesktop()
    }
    get lang() {
        return this.sdk.environment.i18n.lang
    }
    get tld() {
        return this.sdk.environment.i18n.tld
    }
    get type() {
        return "Yandex"
    }
    get isLoaded() {
        return this.sdk != null
    }
    async login(e = !0) {
        return this.sdk.getPlayer({
            scopes: e
        }).then(t => {
            this.player = t
        }).catch(t => {
            console.log(t)
        })
    }
    async fetchLeaderboards() {
        return this.sdk.getLeaderboards().then(e => {
            this.leaderboards = e
        }).catch(e => {
            console.log(e)
        })
    }
    async setLeaderboardScore(e, t) {
        var n;
        return (n = this.leaderboards) == null ? void 0 : n.setLeaderboardScore(e, t)
    }
    async getLeaderboardScores(e, t, n, i) {
        var r;
        let a = await ((r = this.leaderboards) == null ? void 0 : r.getLeaderboardEntries(e, {
            includeUser: t,
            quantityTop: n,
            quantityAround: i
        }));
        if (a) {
            let o = new Array;
            return a.entries.forEach(l => {
                o.push({
                    name: l.player.publicName,
                    rank: l.rank,
                    score: l.score,
                    formattedScore: l.formattedScore,
                    iconUrl: l.player.getAvatarSrc("medium"),
                    id: l.player.uniqueID
                })
            }), o
        }
    }
    async fetchStats(e) {
        return this.player.getStats().then(t => {
            e(t)
        }).catch(() => {
            e(void 0)
        })
    }
    async incrementStats(e, t) {
        return this.player.incrementStats(e).then(n => {
            t(n)
        }).catch(() => {
            t(void 0)
        })
    }
    async setStats(e) {
        return this.player.setStats(e)
    }
    async fetchCatalog(e) {
        const t = await this.sdk.getPayments();
        this.payments = t;
        const n = await t.getCatalog();
        e(n)
    }
    async purchase(e, t, n) {
        return this.payments.purchase({
            id: e,
            developerPayload: n
        }).then(() => {
            t()
        })
    }
    async confirmPayments(e) {
        const t = await this.payments.getPurchases();
        console.log("waiting purchase count:" + t.length);
        for (let n = 0; n < t.length; n++) {
            const i = t[n];
            console.log("waiting purchase:" + i.productID), await e(i.productID), await this.payments.consumePurchase(i.purchaseToken)
        }
    }
    showRewarded(e) {
        this.rewardedCallback = e, this.isRewarded = !0, this.sdk.adv.showRewardedVideo({
            callbacks: {
                onClose: () => {
                    this.rewardedState = lt.CLOSED, Ds()
                },
                onError: () => {
                    this.rewardedState = lt.FAILED, Cn()
                },
                onOpen: () => {
                    this.rewardedState = lt.OPENED, Ps()
                },
                onRewarded: () => {
                    this.rewardedState = lt.REWARDED, e(), Gl()
                }
            }
        })
    }
    showInterstitial() {
        this.isRewarded = !1, this.sdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: () => {
                    this.interState = Et.CLOSED, Ds()
                },
                onError: () => {
                    this.interState = Et.FAILED, Cn()
                },
                onOpen: () => {
                    this.interState = Et.OPENED, Ps()
                }
            }
        })
    }
    gameReady() {
        if (this.readyCalled == !1) try {
            this.sdk.features.LoadingAPI.ready(), this.readyCalled = !0
        } catch (e) {
            console.log(e)
        }
    }
    hasAuth() {
        return this.player.getMode() != "lite"
    }
    openAuthDialog() {
        return this.sdk.auth.openAuthDialog()
    }
    async getRankings() {
        await this.sdk.isAvailableMethod("leaderboards.getLeaderboardPlayerEntry") ? console.log("avaliable") : this.sdk.auth.openAuthDialog()
    }
    async getData() {
        return this.player.getData()
    }
    async setData(e) {
        return this.player.setData(e, !0)
    }
}
class Vf extends Vl {
    constructor(e) {
        super(e), st(this, "gdsdk");
        const t = this;
        window.GD_OPTIONS = {
                gameId: t.params.gid,
                onEvent: function(n) {
                    switch (n.name) {
                        case "SDK_READY":
                            t.sdkready();
                            break;
                        case "SDK_GAME_START":
                            t.checkClose();
                            break;
                        case "SDK_GAME_PAUSE":
                            t.checkOpenAds();
                            break;
                        case "SDK_REWARDED_WATCH_COMPLETE":
                            t.checkRewarded();
                            break;
                        case "AD_ERROR":
                            t.checkError();
                            break
                    }
                }
            };
            window.GD_OPTIONS.onEvent({name:"SDK_READY"});
            
    }
    sdkready() {
        this.gdsdk = window.gdsdk, 
        setTimeout(() => {
            // 启动接口
            this.params.onLoaded()
        }, 1e3)
    }
    get type() {
        return "GameDist"
    }
    showRewarded(e) {
        this.rewardedCallback = e, 
        this.isRewarded = !0 
        //  this.gdsdk.preloadAd("rewarded").then(() => {
        //     this.rewardedState = lt.LOADING, this.gdsdk.showAd("rewarded").then(t => {}).catch(t => {
        //         this.rewardedState = lt.FAILED, Cn()
        //     })
        // }).catch(t => {
        //     this.rewardedState = lt.FAILED, Cn()
        // })
        this.rewardedState = lt.LOADING;
        if(typeof __woso !="undefine"){
            window.GD_OPTIONS.onEvent({name:"SDK_GAME_PAUSE"})
        
            __woso.showAd("rewarded").then((s)=>{
                window.GD_OPTIONS.onEvent({name:"SDK_GAME_START"})
                    this.rewardedState = lt.OPENED;
                    setTimeout(()=>{
                
                        window.GD_OPTIONS.onEvent({name:"SDK_REWARDED_WATCH_COMPLETE"});
                        this.rewardedState = lt.CLOSED;
                    },100)
            }).catch((e)=>{
                window.GD_OPTIONS.onEvent({name:"SDK_GAME_START"})
            });
        }else{
            this.rewardedState = lt.OPENED;
            setTimeout(()=>{
        
                window.GD_OPTIONS.onEvent({name:"SDK_REWARDED_WATCH_COMPLETE"});
                this.rewardedState = lt.CLOSED;
            },100)
        }

    }
    showInterstitial() {
        console.log('ads inter')
        this.isRewarded = !1;
        if(typeof __woso !="undefine"){

            window.GD_OPTIONS.onEvent({name:"SDK_GAME_PAUSE"})


            __woso.showAd("interstitial").then(()=>{
                window.GD_OPTIONS.onEvent({name:"SDK_GAME_START"})
            }).catch((e)=>{
                window.GD_OPTIONS.onEvent({name:"SDK_GAME_START"})
               
            });
        }
        (this.interState = Et.FAILED, Cn())
        // typeof this.gdsdk < "u" && this.gdsdk.showAd !== "undefined" ? (this.interState = Et.LOADING, this.gdsdk.showAd().catch(() => {
        //     this.interState = Et.FAILED, Cn()
        // })) : 
        
    }
    warmAds() {
        // this.gdsdk !== "undefined" && this.gdsdk.preloadAd !== "undefined" && (this.gdsdk.preloadAd(), this.gdsdk.preloadAd("rewarded"))
    }
}
var mn = (s => (s[s.Ignore = 0] = "Ignore", s[s.Any = 1] = "Any", s[s.Landscape = 2] = "Landscape", s[s.Portrait = 3] = "Portrait", s))(mn || {});

function Hf(s) {
    return {
        message: "Landscape view is not available. Please rotate your device",
        color: "#ffffff",
        bgColor: "#3a3a3a",
        minHeight: 500,
        animation: !0,
        fontSize: 5,
        iconColor: "#1D1D1D",
        iconSize: 10,
        orientationType: 0,
        interstitialError: 0,
        rewardedError: 0,
        gid: "",
        onLoaded: () => {},
        type: "DefaultPlatform",
        ...s
    }
}
const Wf = (s, e = 0) => `
    <?xml version="1.0" encoding="UTF-8"?>
    <svg width='${e}vw' height='${e*1.6}vw' viewBox="0 0 14 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g  transform="translate(-343.000000, -2503.000000)">
                <g  transform="translate(100.000000, 2404.000000)">
                    <g  transform="translate(238.000000, 98.000000)">
                        <g>
                            <rect id="Rectangle-Copy-119" x="0" y="0" width="24" height="24"></rect>
                            <path d="M16,1 L8,1 C6.34,1 5,2.34 5,4 L5,20 C5,21.66 6.34,23 8,23 L16,23 C17.66,23 19,21.66 19,20 L19,4 C19,2.34 17.66,1 16,1 Z M13.5,21 L10.5,21 C10.22,21 10,20.78 10,20.5 C10,20.22 10.22,20 10.5,20 L13.5,20 C13.78,20 14,20.22 14,20.5 C14,20.78 13.78,21 13.5,21 Z M17,18 L7,18 L7,4 L17,4 L17,18 Z" id="phone-color-5488" fill=${s}></path>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </svg>
  `;

function Xf(s) {
    switch (s) {
        case mn.Ignore:
            return "This message will always display, regardless of orientation.";
        case mn.Landscape:
            return "Please rotate your device to landscape mode.";
        case mn.Portrait:
            return "Please rotate your device to portrait mode.";
        case mn.Any:
        default:
            return "You can use this app in any orientation."
    }
}

function qf(s, e) {
    switch (e) {
        case mn.Ignore:
            return !0;
        case mn.Any:
            return window.innerHeight > s;
        case mn.Landscape:
            return window.innerHeight < window.innerWidth;
        case mn.Portrait:
            return window.innerHeight > window.innerWidth;
        default:
            return !0
    }
}

function Dc(s, e) {
    const t = qf(e.minHeight || 0, e.orientationType);
    s.style.display = t ? "none" : "flex"
}

function jf(s) {
    const {
        bgColor: e,
        message: t,
        color: n,
        animation: i,
        fontSize: r,
        iconColor: a,
        iconSize: o,
        orientationType: l
    } = s, c = document.createElement("div"), h = document.createElement("div"), u = document.createElement("div");
    let d = c.style;
    d.backgroundColor = `${e}`, d.position = "fixed", d.zIndex = "999999", d.top = "0", d.left = "0", d.width = "100%", d.height = "100%", d.justifyContent = "center", d.alignItems = "center", d.flexDirection = "column", d.display = "none", h.id = "orienterMessage", h.innerText = Xf(l);
    let f = h.style;
    return f.fontSize = `${r}vw`, f.color = `${n}`, f.padding = "5vw", u.innerHTML = Wf(a, o), c.appendChild(h), i && c.appendChild(u), document.body.appendChild(c), c
}

function Yf(s) {
    if (!window || s.orientationType == mn.Ignore) return;
    const e = jf(s);
    Dc(e, s), window.addEventListener("resize", () => Dc(e, s))
}
class $f {
    constructor() {
        st(this, "platform")
    }
    setup(e) {
        switch (e = Hf(e), Yf(e), e.type) {
            case "Yandex":
                this.platform = new Gf(e);
                break;
            case "GameDist":
                this.platform = new Vf(e);
                break;
            case "DefaultPlatform":
                this.platform = new Vl(e);
                break
        }
    }
    which() {
        return console.log(this.platform), this.platform.type
    }
    lang() {
        return this.platform.lang
    }
    tld() {
        return this.platform.tld
    }
    async login(e = !0) {
        return this.platform.login(e)
    }
    async fetchStats(e) {
        return this.platform.fetchStats(e)
    }
    async incrementStats(e, t) {
        return this.platform.incrementStats(e, t)
    }
    async setStats(e) {
        return this.platform.setStats(e)
    }
    async fetchCatalog(e) {
        return this.platform.fetchCatalog(e)
    }
    async purchase(e, t, n) {
        this.platform.purchase(e, t, n)
    }
    async confirmPayments(e) {
        return this.platform.confirmPayments(e)
    }
    showRewarded(e) {
        this.platform.showRewarded(e)
    }
    showInter() {
        this.platform.showInterstitial()
    }
    gameReady() {
        this.platform.gameReady()
    }
    async fetchLeaderboards() {
        return this.platform.fetchLeaderboards()
    }
    hasAuth() {
        return this.platform.hasAuth()
    }
    async openAuthDialog() {
        return this.platform.openAuthDialog()
    }
    setLeaderboardScore(e, t) {
        return this.platform.setLeaderboardScore(e, t)
    }
    async getLeaderboardScores(e, t, n, i) {
        return this.platform.getLeaderboardScores(e, t, n, i)
    }
    async getData() {
        return this.platform.getData()
    }
    async setData(e) {
        return this.platform.setData(e)
    }
    async getLocalData(e) {
        return this.platform.getLocalData(e)
    }
    async setLocaData(e, t) {
        return this.platform.setLocalData(e, t)
    }
    warmAds() {
        this.platform.warmAds()
    }
}
/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const Hl = "150",
    Kf = 0,
    Pc = 1,
    Zf = 2,
    Pu = 1,
    Nu = 2,
    fr = 3,
    $n = 0,
    Qt = 1,
    Ln = 2,
    hi = 0,
    Es = 1,
    br = 2,
    Nc = 3,
    Bc = 4,
    Jf = 5,
    gs = 100,
    Qf = 101,
    ep = 102,
    Fc = 103,
    kc = 104,
    tp = 200,
    np = 201,
    ip = 202,
    sp = 203,
    Bu = 204,
    Fu = 205,
    rp = 206,
    ap = 207,
    op = 208,
    lp = 209,
    cp = 210,
    hp = 0,
    up = 1,
    dp = 2,
    il = 3,
    fp = 4,
    pp = 5,
    mp = 6,
    gp = 7,
    ku = 0,
    _p = 1,
    xp = 2,
    qn = 0,
    yp = 1,
    vp = 2,
    Sp = 3,
    Ou = 4,
    wp = 5,
    Uu = 300,
    Ns = 301,
    Bs = 302,
    sl = 303,
    rl = 304,
    Xa = 306,
    Fs = 1e3,
    sn = 1001,
    Da = 1002,
    gt = 1003,
    al = 1004,
    Ma = 1005,
    Gt = 1006,
    zu = 1007,
    Fi = 1008,
    ki = 1009,
    Mp = 1010,
    bp = 1011,
    Gu = 1012,
    Ep = 1013,
    Ci = 1014,
    oi = 1015,
    Er = 1016,
    Tp = 1017,
    Ap = 1018,
    Ts = 1020,
    Cp = 1021,
    rn = 1023,
    Vu = 1024,
    Lp = 1025,
    Bi = 1026,
    ks = 1027,
    Ip = 1028,
    Rp = 1029,
    Dp = 1030,
    Pp = 1031,
    Np = 1033,
    co = 33776,
    ho = 33777,
    uo = 33778,
    fo = 33779,
    Oc = 35840,
    Uc = 35841,
    zc = 35842,
    Gc = 35843,
    Bp = 36196,
    Vc = 37492,
    Hc = 37496,
    Wc = 37808,
    Xc = 37809,
    qc = 37810,
    jc = 37811,
    Yc = 37812,
    $c = 37813,
    Kc = 37814,
    Zc = 37815,
    Jc = 37816,
    Qc = 37817,
    eh = 37818,
    th = 37819,
    nh = 37820,
    ih = 37821,
    po = 36492,
    Fp = 36283,
    sh = 36284,
    rh = 36285,
    ah = 36286,
    Wl = 2200,
    kp = 2201,
    Op = 2202,
    Tr = 2300,
    Os = 2301,
    mo = 2302,
    vs = 2400,
    Ss = 2401,
    Pa = 2402,
    Xl = 2500,
    Up = 2501,
    zp = 0,
    Hu = 1,
    ol = 2,
    Oi = 3e3,
    Be = 3001,
    Gp = 3200,
    Vp = 3201,
    ql = 0,
    Hp = 1,
    En = "srgb",
    Ar = "srgb-linear",
    Wu = "display-p3",
    go = 7680,
    Wp = 519,
    ll = 35044,
    oh = "300 es",
    cl = 1035;
class ji {
    addEventListener(e, t) {
        this._listeners === void 0 && (this._listeners = {});
        const n = this._listeners;
        n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t)
    }
    hasEventListener(e, t) {
        if (this._listeners === void 0) return !1;
        const n = this._listeners;
        return n[e] !== void 0 && n[e].indexOf(t) !== -1
    }
    removeEventListener(e, t) {
        if (this._listeners === void 0) return;
        const i = this._listeners[e];
        if (i !== void 0) {
            const r = i.indexOf(t);
            r !== -1 && i.splice(r, 1)
        }
    }
    dispatchEvent(e) {
        if (this._listeners === void 0) return;
        const n = this._listeners[e.type];
        if (n !== void 0) {
            e.target = this;
            const i = n.slice(0);
            for (let r = 0, a = i.length; r < a; r++) i[r].call(this, e);
            e.target = null
        }
    }
}
const Mt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let lh = 1234567;
const yr = Math.PI / 180,
    Cr = 180 / Math.PI;

function xn() {
    const s = Math.random() * 4294967295 | 0,
        e = Math.random() * 4294967295 | 0,
        t = Math.random() * 4294967295 | 0,
        n = Math.random() * 4294967295 | 0;
    return (Mt[s & 255] + Mt[s >> 8 & 255] + Mt[s >> 16 & 255] + Mt[s >> 24 & 255] + "-" + Mt[e & 255] + Mt[e >> 8 & 255] + "-" + Mt[e >> 16 & 15 | 64] + Mt[e >> 24 & 255] + "-" + Mt[t & 63 | 128] + Mt[t >> 8 & 255] + "-" + Mt[t >> 16 & 255] + Mt[t >> 24 & 255] + Mt[n & 255] + Mt[n >> 8 & 255] + Mt[n >> 16 & 255] + Mt[n >> 24 & 255]).toLowerCase()
}

function St(s, e, t) {
    return Math.max(e, Math.min(t, s))
}

function jl(s, e) {
    return (s % e + e) % e
}

function Xp(s, e, t, n, i) {
    return n + (s - e) * (i - n) / (t - e)
}

function qp(s, e, t) {
    return s !== e ? (t - s) / (e - s) : 0
}

function vr(s, e, t) {
    return (1 - t) * s + t * e
}

function jp(s, e, t, n) {
    return vr(s, e, 1 - Math.exp(-t * n))
}

function Yp(s, e = 1) {
    return e - Math.abs(jl(s, e * 2) - e)
}

function $p(s, e, t) {
    return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * (3 - 2 * s))
}

function Kp(s, e, t) {
    return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * s * (s * (s * 6 - 15) + 10))
}

function Zp(s, e) {
    return s + Math.floor(Math.random() * (e - s + 1))
}

function Jp(s, e) {
    return s + Math.random() * (e - s)
}

function Qp(s) {
    return s * (.5 - Math.random())
}

function em(s) {
    s !== void 0 && (lh = s);
    let e = lh += 1831565813;
    return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296
}

function tm(s) {
    return s * yr
}

function nm(s) {
    return s * Cr
}

function hl(s) {
    return (s & s - 1) === 0 && s !== 0
}

function Xu(s) {
    return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2))
}

function qu(s) {
    return Math.pow(2, Math.floor(Math.log(s) / Math.LN2))
}

function im(s, e, t, n, i) {
    const r = Math.cos,
        a = Math.sin,
        o = r(t / 2),
        l = a(t / 2),
        c = r((e + n) / 2),
        h = a((e + n) / 2),
        u = r((e - n) / 2),
        d = a((e - n) / 2),
        f = r((n - e) / 2),
        g = a((n - e) / 2);
    switch (i) {
        case "XYX":
            s.set(o * h, l * u, l * d, o * c);
            break;
        case "YZY":
            s.set(l * d, o * h, l * u, o * c);
            break;
        case "ZXZ":
            s.set(l * u, l * d, o * h, o * c);
            break;
        case "XZX":
            s.set(o * h, l * g, l * f, o * c);
            break;
        case "YXY":
            s.set(l * f, o * h, l * g, o * c);
            break;
        case "ZYZ":
            s.set(l * g, l * f, o * h, o * c);
            break;
        default:
            console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i)
    }
}

function Wn(s, e) {
    switch (e.constructor) {
        case Float32Array:
            return s;
        case Uint16Array:
            return s / 65535;
        case Uint8Array:
            return s / 255;
        case Int16Array:
            return Math.max(s / 32767, -1);
        case Int8Array:
            return Math.max(s / 127, -1);
        default:
            throw new Error("Invalid component type.")
    }
}

function qe(s, e) {
    switch (e.constructor) {
        case Float32Array:
            return s;
        case Uint16Array:
            return Math.round(s * 65535);
        case Uint8Array:
            return Math.round(s * 255);
        case Int16Array:
            return Math.round(s * 32767);
        case Int8Array:
            return Math.round(s * 127);
        default:
            throw new Error("Invalid component type.")
    }
}
const _s = {
    DEG2RAD: yr,
    RAD2DEG: Cr,
    generateUUID: xn,
    clamp: St,
    euclideanModulo: jl,
    mapLinear: Xp,
    inverseLerp: qp,
    lerp: vr,
    damp: jp,
    pingpong: Yp,
    smoothstep: $p,
    smootherstep: Kp,
    randInt: Zp,
    randFloat: Jp,
    randFloatSpread: Qp,
    seededRandom: em,
    degToRad: tm,
    radToDeg: nm,
    isPowerOfTwo: hl,
    ceilPowerOfTwo: Xu,
    floorPowerOfTwo: qu,
    setQuaternionFromProperEuler: im,
    normalize: qe,
    denormalize: Wn
};
class ve {
    constructor(e = 0, t = 0) {
        ve.prototype.isVector2 = !0, this.x = e, this.y = t
    }
    get width() {
        return this.x
    }
    set width(e) {
        this.x = e
    }
    get height() {
        return this.y
    }
    set height(e) {
        this.y = e
    }
    set(e, t) {
        return this.x = e, this.y = t, this
    }
    setScalar(e) {
        return this.x = e, this.y = e, this
    }
    setX(e) {
        return this.x = e, this
    }
    setY(e) {
        return this.y = e, this
    }
    setComponent(e, t) {
        switch (e) {
            case 0:
                this.x = t;
                break;
            case 1:
                this.y = t;
                break;
            default:
                throw new Error("index is out of range: " + e)
        }
        return this
    }
    getComponent(e) {
        switch (e) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            default:
                throw new Error("index is out of range: " + e)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y)
    }
    copy(e) {
        return this.x = e.x, this.y = e.y, this
    }
    add(e) {
        return this.x += e.x, this.y += e.y, this
    }
    addScalar(e) {
        return this.x += e, this.y += e, this
    }
    addVectors(e, t) {
        return this.x = e.x + t.x, this.y = e.y + t.y, this
    }
    addScaledVector(e, t) {
        return this.x += e.x * t, this.y += e.y * t, this
    }
    sub(e) {
        return this.x -= e.x, this.y -= e.y, this
    }
    subScalar(e) {
        return this.x -= e, this.y -= e, this
    }
    subVectors(e, t) {
        return this.x = e.x - t.x, this.y = e.y - t.y, this
    }
    multiply(e) {
        return this.x *= e.x, this.y *= e.y, this
    }
    multiplyScalar(e) {
        return this.x *= e, this.y *= e, this
    }
    divide(e) {
        return this.x /= e.x, this.y /= e.y, this
    }
    divideScalar(e) {
        return this.multiplyScalar(1 / e)
    }
    applyMatrix3(e) {
        const t = this.x,
            n = this.y,
            i = e.elements;
        return this.x = i[0] * t + i[3] * n + i[6], this.y = i[1] * t + i[4] * n + i[7], this
    }
    min(e) {
        return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this
    }
    max(e) {
        return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this
    }
    clamp(e, t) {
        return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this
    }
    clampScalar(e, t) {
        return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this
    }
    clampLength(e, t) {
        const n = this.length();
        return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this
    }
    roundToZero() {
        return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this
    }
    dot(e) {
        return this.x * e.x + this.y * e.y
    }
    cross(e) {
        return this.x * e.y - this.y * e.x
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    angle() {
        return Math.atan2(-this.y, -this.x) + Math.PI
    }
    distanceTo(e) {
        return Math.sqrt(this.distanceToSquared(e))
    }
    distanceToSquared(e) {
        const t = this.x - e.x,
            n = this.y - e.y;
        return t * t + n * n
    }
    manhattanDistanceTo(e) {
        return Math.abs(this.x - e.x) + Math.abs(this.y - e.y)
    }
    setLength(e) {
        return this.normalize().multiplyScalar(e)
    }
    lerp(e, t) {
        return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this
    }
    lerpVectors(e, t, n) {
        return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this
    }
    equals(e) {
        return e.x === this.x && e.y === this.y
    }
    fromArray(e, t = 0) {
        return this.x = e[t], this.y = e[t + 1], this
    }
    toArray(e = [], t = 0) {
        return e[t] = this.x, e[t + 1] = this.y, e
    }
    fromBufferAttribute(e, t) {
        return this.x = e.getX(t), this.y = e.getY(t), this
    }
    rotateAround(e, t) {
        const n = Math.cos(t),
            i = Math.sin(t),
            r = this.x - e.x,
            a = this.y - e.y;
        return this.x = r * n - a * i + e.x, this.y = r * i + a * n + e.y, this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y
    }
}
class Ft {
    constructor() {
        Ft.prototype.isMatrix3 = !0, this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    }
    set(e, t, n, i, r, a, o, l, c) {
        const h = this.elements;
        return h[0] = e, h[1] = i, h[2] = o, h[3] = t, h[4] = r, h[5] = l, h[6] = n, h[7] = a, h[8] = c, this
    }
    identity() {
        return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
    }
    copy(e) {
        const t = this.elements,
            n = e.elements;
        return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this
    }
    extractBasis(e, t, n) {
        return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this
    }
    setFromMatrix4(e) {
        const t = e.elements;
        return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this
    }
    multiply(e) {
        return this.multiplyMatrices(this, e)
    }
    premultiply(e) {
        return this.multiplyMatrices(e, this)
    }
    multiplyMatrices(e, t) {
        const n = e.elements,
            i = t.elements,
            r = this.elements,
            a = n[0],
            o = n[3],
            l = n[6],
            c = n[1],
            h = n[4],
            u = n[7],
            d = n[2],
            f = n[5],
            g = n[8],
            m = i[0],
            p = i[3],
            _ = i[6],
            E = i[1],
            y = i[4],
            S = i[7],
            T = i[2],
            L = i[5],
            I = i[8];
        return r[0] = a * m + o * E + l * T, r[3] = a * p + o * y + l * L, r[6] = a * _ + o * S + l * I, r[1] = c * m + h * E + u * T, r[4] = c * p + h * y + u * L, r[7] = c * _ + h * S + u * I, r[2] = d * m + f * E + g * T, r[5] = d * p + f * y + g * L, r[8] = d * _ + f * S + g * I, this
    }
    multiplyScalar(e) {
        const t = this.elements;
        return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this
    }
    determinant() {
        const e = this.elements,
            t = e[0],
            n = e[1],
            i = e[2],
            r = e[3],
            a = e[4],
            o = e[5],
            l = e[6],
            c = e[7],
            h = e[8];
        return t * a * h - t * o * c - n * r * h + n * o * l + i * r * c - i * a * l
    }
    invert() {
        const e = this.elements,
            t = e[0],
            n = e[1],
            i = e[2],
            r = e[3],
            a = e[4],
            o = e[5],
            l = e[6],
            c = e[7],
            h = e[8],
            u = h * a - o * c,
            d = o * l - h * r,
            f = c * r - a * l,
            g = t * u + n * d + i * f;
        if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
        const m = 1 / g;
        return e[0] = u * m, e[1] = (i * c - h * n) * m, e[2] = (o * n - i * a) * m, e[3] = d * m, e[4] = (h * t - i * l) * m, e[5] = (i * r - o * t) * m, e[6] = f * m, e[7] = (n * l - c * t) * m, e[8] = (a * t - n * r) * m, this
    }
    transpose() {
        let e;
        const t = this.elements;
        return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this
    }
    getNormalMatrix(e) {
        return this.setFromMatrix4(e).invert().transpose()
    }
    transposeIntoArray(e) {
        const t = this.elements;
        return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this
    }
    setUvTransform(e, t, n, i, r, a, o) {
        const l = Math.cos(r),
            c = Math.sin(r);
        return this.set(n * l, n * c, -n * (l * a + c * o) + a + e, -i * c, i * l, -i * (-c * a + l * o) + o + t, 0, 0, 1), this
    }
    scale(e, t) {
        return this.premultiply(_o.makeScale(e, t)), this
    }
    rotate(e) {
        return this.premultiply(_o.makeRotation(-e)), this
    }
    translate(e, t) {
        return this.premultiply(_o.makeTranslation(e, t)), this
    }
    makeTranslation(e, t) {
        return this.set(1, 0, e, 0, 1, t, 0, 0, 1), this
    }
    makeRotation(e) {
        const t = Math.cos(e),
            n = Math.sin(e);
        return this.set(t, -n, 0, n, t, 0, 0, 0, 1), this
    }
    makeScale(e, t) {
        return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this
    }
    equals(e) {
        const t = this.elements,
            n = e.elements;
        for (let i = 0; i < 9; i++)
            if (t[i] !== n[i]) return !1;
        return !0
    }
    fromArray(e, t = 0) {
        for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
        return this
    }
    toArray(e = [], t = 0) {
        const n = this.elements;
        return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e
    }
    clone() {
        return new this.constructor().fromArray(this.elements)
    }
}
const _o = new Ft;

function ju(s) {
    for (let e = s.length - 1; e >= 0; --e)
        if (s[e] >= 65535) return !0;
    return !1
}

function Lr(s) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", s)
}
class Wt {
    constructor(e = 0, t = 0, n = 0, i = 1) {
        this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = i
    }
    static slerpFlat(e, t, n, i, r, a, o) {
        let l = n[i + 0],
            c = n[i + 1],
            h = n[i + 2],
            u = n[i + 3];
        const d = r[a + 0],
            f = r[a + 1],
            g = r[a + 2],
            m = r[a + 3];
        if (o === 0) {
            e[t + 0] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = u;
            return
        }
        if (o === 1) {
            e[t + 0] = d, e[t + 1] = f, e[t + 2] = g, e[t + 3] = m;
            return
        }
        if (u !== m || l !== d || c !== f || h !== g) {
            let p = 1 - o;
            const _ = l * d + c * f + h * g + u * m,
                E = _ >= 0 ? 1 : -1,
                y = 1 - _ * _;
            if (y > Number.EPSILON) {
                const T = Math.sqrt(y),
                    L = Math.atan2(T, _ * E);
                p = Math.sin(p * L) / T, o = Math.sin(o * L) / T
            }
            const S = o * E;
            if (l = l * p + d * S, c = c * p + f * S, h = h * p + g * S, u = u * p + m * S, p === 1 - o) {
                const T = 1 / Math.sqrt(l * l + c * c + h * h + u * u);
                l *= T, c *= T, h *= T, u *= T
            }
        }
        e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = u
    }
    static multiplyQuaternionsFlat(e, t, n, i, r, a) {
        const o = n[i],
            l = n[i + 1],
            c = n[i + 2],
            h = n[i + 3],
            u = r[a],
            d = r[a + 1],
            f = r[a + 2],
            g = r[a + 3];
        return e[t] = o * g + h * u + l * f - c * d, e[t + 1] = l * g + h * d + c * u - o * f, e[t + 2] = c * g + h * f + o * d - l * u, e[t + 3] = h * g - o * u - l * d - c * f, e
    }
    get x() {
        return this._x
    }
    set x(e) {
        this._x = e, this._onChangeCallback()
    }
    get y() {
        return this._y
    }
    set y(e) {
        this._y = e, this._onChangeCallback()
    }
    get z() {
        return this._z
    }
    set z(e) {
        this._z = e, this._onChangeCallback()
    }
    get w() {
        return this._w
    }
    set w(e) {
        this._w = e, this._onChangeCallback()
    }
    set(e, t, n, i) {
        return this._x = e, this._y = t, this._z = n, this._w = i, this._onChangeCallback(), this
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._w)
    }
    copy(e) {
        return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this
    }
    setFromEuler(e, t) {
        const n = e._x,
            i = e._y,
            r = e._z,
            a = e._order,
            o = Math.cos,
            l = Math.sin,
            c = o(n / 2),
            h = o(i / 2),
            u = o(r / 2),
            d = l(n / 2),
            f = l(i / 2),
            g = l(r / 2);
        switch (a) {
            case "XYZ":
                this._x = d * h * u + c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u - d * f * g;
                break;
            case "YXZ":
                this._x = d * h * u + c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u + d * f * g;
                break;
            case "ZXY":
                this._x = d * h * u - c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u - d * f * g;
                break;
            case "ZYX":
                this._x = d * h * u - c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u + d * f * g;
                break;
            case "YZX":
                this._x = d * h * u + c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u - d * f * g;
                break;
            case "XZY":
                this._x = d * h * u - c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u + d * f * g;
                break;
            default:
                console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a)
        }
        return t !== !1 && this._onChangeCallback(), this
    }
    setFromAxisAngle(e, t) {
        const n = t / 2,
            i = Math.sin(n);
        return this._x = e.x * i, this._y = e.y * i, this._z = e.z * i, this._w = Math.cos(n), this._onChangeCallback(), this
    }
    setFromRotationMatrix(e) {
        const t = e.elements,
            n = t[0],
            i = t[4],
            r = t[8],
            a = t[1],
            o = t[5],
            l = t[9],
            c = t[2],
            h = t[6],
            u = t[10],
            d = n + o + u;
        if (d > 0) {
            const f = .5 / Math.sqrt(d + 1);
            this._w = .25 / f, this._x = (h - l) * f, this._y = (r - c) * f, this._z = (a - i) * f
        } else if (n > o && n > u) {
            const f = 2 * Math.sqrt(1 + n - o - u);
            this._w = (h - l) / f, this._x = .25 * f, this._y = (i + a) / f, this._z = (r + c) / f
        } else if (o > u) {
            const f = 2 * Math.sqrt(1 + o - n - u);
            this._w = (r - c) / f, this._x = (i + a) / f, this._y = .25 * f, this._z = (l + h) / f
        } else {
            const f = 2 * Math.sqrt(1 + u - n - o);
            this._w = (a - i) / f, this._x = (r + c) / f, this._y = (l + h) / f, this._z = .25 * f
        }
        return this._onChangeCallback(), this
    }
    setFromUnitVectors(e, t) {
        let n = e.dot(t) + 1;
        return n < Number.EPSILON ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize()
    }
    angleTo(e) {
        return 2 * Math.acos(Math.abs(St(this.dot(e), -1, 1)))
    }
    rotateTowards(e, t) {
        const n = this.angleTo(e);
        if (n === 0) return this;
        const i = Math.min(1, t / n);
        return this.slerp(e, i), this
    }
    identity() {
        return this.set(0, 0, 0, 1)
    }
    invert() {
        return this.conjugate()
    }
    conjugate() {
        return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this
    }
    dot(e) {
        return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w
    }
    lengthSq() {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
    }
    length() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
    }
    normalize() {
        let e = this.length();
        return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this
    }
    multiply(e) {
        return this.multiplyQuaternions(this, e)
    }
    premultiply(e) {
        return this.multiplyQuaternions(e, this)
    }
    multiplyQuaternions(e, t) {
        const n = e._x,
            i = e._y,
            r = e._z,
            a = e._w,
            o = t._x,
            l = t._y,
            c = t._z,
            h = t._w;
        return this._x = n * h + a * o + i * c - r * l, this._y = i * h + a * l + r * o - n * c, this._z = r * h + a * c + n * l - i * o, this._w = a * h - n * o - i * l - r * c, this._onChangeCallback(), this
    }
    slerp(e, t) {
        if (t === 0) return this;
        if (t === 1) return this.copy(e);
        const n = this._x,
            i = this._y,
            r = this._z,
            a = this._w;
        let o = a * e._w + n * e._x + i * e._y + r * e._z;
        if (o < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, o = -o) : this.copy(e), o >= 1) return this._w = a, this._x = n, this._y = i, this._z = r, this;
        const l = 1 - o * o;
        if (l <= Number.EPSILON) {
            const f = 1 - t;
            return this._w = f * a + t * this._w, this._x = f * n + t * this._x, this._y = f * i + t * this._y, this._z = f * r + t * this._z, this.normalize(), this._onChangeCallback(), this
        }
        const c = Math.sqrt(l),
            h = Math.atan2(c, o),
            u = Math.sin((1 - t) * h) / c,
            d = Math.sin(t * h) / c;
        return this._w = a * u + this._w * d, this._x = n * u + this._x * d, this._y = i * u + this._y * d, this._z = r * u + this._z * d, this._onChangeCallback(), this
    }
    slerpQuaternions(e, t, n) {
        return this.copy(e).slerp(t, n)
    }
    random() {
        const e = Math.random(),
            t = Math.sqrt(1 - e),
            n = Math.sqrt(e),
            i = 2 * Math.PI * Math.random(),
            r = 2 * Math.PI * Math.random();
        return this.set(t * Math.cos(i), n * Math.sin(r), n * Math.cos(r), t * Math.sin(i))
    }
    equals(e) {
        return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w
    }
    fromArray(e, t = 0) {
        return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this
    }
    toArray(e = [], t = 0) {
        return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e
    }
    fromBufferAttribute(e, t) {
        return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this
    }
    _onChange(e) {
        return this._onChangeCallback = e, this
    }
    _onChangeCallback() {}*[Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._w
    }
}
class M {
    constructor(e = 0, t = 0, n = 0) {
        M.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n
    }
    set(e, t, n) {
        return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this
    }
    setScalar(e) {
        return this.x = e, this.y = e, this.z = e, this
    }
    setX(e) {
        return this.x = e, this
    }
    setY(e) {
        return this.y = e, this
    }
    setZ(e) {
        return this.z = e, this
    }
    setComponent(e, t) {
        switch (e) {
            case 0:
                this.x = t;
                break;
            case 1:
                this.y = t;
                break;
            case 2:
                this.z = t;
                break;
            default:
                throw new Error("index is out of range: " + e)
        }
        return this
    }
    getComponent(e) {
        switch (e) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            default:
                throw new Error("index is out of range: " + e)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z)
    }
    copy(e) {
        return this.x = e.x, this.y = e.y, this.z = e.z, this
    }
    add(e) {
        return this.x += e.x, this.y += e.y, this.z += e.z, this
    }
    addScalar(e) {
        return this.x += e, this.y += e, this.z += e, this
    }
    addVectors(e, t) {
        return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this
    }
    addScaledVector(e, t) {
        return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this
    }
    sub(e) {
        return this.x -= e.x, this.y -= e.y, this.z -= e.z, this
    }
    subScalar(e) {
        return this.x -= e, this.y -= e, this.z -= e, this
    }
    subVectors(e, t) {
        return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this
    }
    multiply(e) {
        return this.x *= e.x, this.y *= e.y, this.z *= e.z, this
    }
    multiplyScalar(e) {
        return this.x *= e, this.y *= e, this.z *= e, this
    }
    multiplyVectors(e, t) {
        return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this
    }
    applyEuler(e) {
        return this.applyQuaternion(ch.setFromEuler(e))
    }
    applyAxisAngle(e, t) {
        return this.applyQuaternion(ch.setFromAxisAngle(e, t))
    }
    applyMatrix3(e) {
        const t = this.x,
            n = this.y,
            i = this.z,
            r = e.elements;
        return this.x = r[0] * t + r[3] * n + r[6] * i, this.y = r[1] * t + r[4] * n + r[7] * i, this.z = r[2] * t + r[5] * n + r[8] * i, this
    }
    applyNormalMatrix(e) {
        return this.applyMatrix3(e).normalize()
    }
    applyMatrix4(e) {
        const t = this.x,
            n = this.y,
            i = this.z,
            r = e.elements,
            a = 1 / (r[3] * t + r[7] * n + r[11] * i + r[15]);
        return this.x = (r[0] * t + r[4] * n + r[8] * i + r[12]) * a, this.y = (r[1] * t + r[5] * n + r[9] * i + r[13]) * a, this.z = (r[2] * t + r[6] * n + r[10] * i + r[14]) * a, this
    }
    applyQuaternion(e) {
        const t = this.x,
            n = this.y,
            i = this.z,
            r = e.x,
            a = e.y,
            o = e.z,
            l = e.w,
            c = l * t + a * i - o * n,
            h = l * n + o * t - r * i,
            u = l * i + r * n - a * t,
            d = -r * t - a * n - o * i;
        return this.x = c * l + d * -r + h * -o - u * -a, this.y = h * l + d * -a + u * -r - c * -o, this.z = u * l + d * -o + c * -a - h * -r, this
    }
    project(e) {
        return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)
    }
    unproject(e) {
        return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)
    }
    transformDirection(e) {
        const t = this.x,
            n = this.y,
            i = this.z,
            r = e.elements;
        return this.x = r[0] * t + r[4] * n + r[8] * i, this.y = r[1] * t + r[5] * n + r[9] * i, this.z = r[2] * t + r[6] * n + r[10] * i, this.normalize()
    }
    divide(e) {
        return this.x /= e.x, this.y /= e.y, this.z /= e.z, this
    }
    divideScalar(e) {
        return this.multiplyScalar(1 / e)
    }
    min(e) {
        return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this
    }
    max(e) {
        return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this
    }
    clamp(e, t) {
        return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this
    }
    clampScalar(e, t) {
        return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this
    }
    clampLength(e, t) {
        const n = this.length();
        return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this
    }
    roundToZero() {
        return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this
    }
    dot(e) {
        return this.x * e.x + this.y * e.y + this.z * e.z
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    setLength(e) {
        return this.normalize().multiplyScalar(e)
    }
    lerp(e, t) {
        return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this
    }
    lerpVectors(e, t, n) {
        return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this
    }
    cross(e) {
        return this.crossVectors(this, e)
    }
    crossVectors(e, t) {
        const n = e.x,
            i = e.y,
            r = e.z,
            a = t.x,
            o = t.y,
            l = t.z;
        return this.x = i * l - r * o, this.y = r * a - n * l, this.z = n * o - i * a, this
    }
    projectOnVector(e) {
        const t = e.lengthSq();
        if (t === 0) return this.set(0, 0, 0);
        const n = e.dot(this) / t;
        return this.copy(e).multiplyScalar(n)
    }
    projectOnPlane(e) {
        return xo.copy(this).projectOnVector(e), this.sub(xo)
    }
    reflect(e) {
        return this.sub(xo.copy(e).multiplyScalar(2 * this.dot(e)))
    }
    angleTo(e) {
        const t = Math.sqrt(this.lengthSq() * e.lengthSq());
        if (t === 0) return Math.PI / 2;
        const n = this.dot(e) / t;
        return Math.acos(St(n, -1, 1))
    }
    distanceTo(e) {
        return Math.sqrt(this.distanceToSquared(e))
    }
    distanceToSquared(e) {
        const t = this.x - e.x,
            n = this.y - e.y,
            i = this.z - e.z;
        return t * t + n * n + i * i
    }
    manhattanDistanceTo(e) {
        return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z)
    }
    setFromSpherical(e) {
        return this.setFromSphericalCoords(e.radius, e.phi, e.theta)
    }
    setFromSphericalCoords(e, t, n) {
        const i = Math.sin(t) * e;
        return this.x = i * Math.sin(n), this.y = Math.cos(t) * e, this.z = i * Math.cos(n), this
    }
    setFromCylindrical(e) {
        return this.setFromCylindricalCoords(e.radius, e.theta, e.y)
    }
    setFromCylindricalCoords(e, t, n) {
        return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this
    }
    setFromMatrixPosition(e) {
        const t = e.elements;
        return this.x = t[12], this.y = t[13], this.z = t[14], this
    }
    setFromMatrixScale(e) {
        const t = this.setFromMatrixColumn(e, 0).length(),
            n = this.setFromMatrixColumn(e, 1).length(),
            i = this.setFromMatrixColumn(e, 2).length();
        return this.x = t, this.y = n, this.z = i, this
    }
    setFromMatrixColumn(e, t) {
        return this.fromArray(e.elements, t * 4)
    }
    setFromMatrix3Column(e, t) {
        return this.fromArray(e.elements, t * 3)
    }
    setFromEuler(e) {
        return this.x = e._x, this.y = e._y, this.z = e._z, this
    }
    equals(e) {
        return e.x === this.x && e.y === this.y && e.z === this.z
    }
    fromArray(e, t = 0) {
        return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this
    }
    toArray(e = [], t = 0) {
        return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e
    }
    fromBufferAttribute(e, t) {
        return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this
    }
    randomDirection() {
        const e = (Math.random() - .5) * 2,
            t = Math.random() * Math.PI * 2,
            n = Math.sqrt(1 - e ** 2);
        return this.x = n * Math.cos(t), this.y = n * Math.sin(t), this.z = e, this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z
    }
}
const xo = new M,
    ch = new Wt;

function As(s) {
    return s < .04045 ? s * .0773993808 : Math.pow(s * .9478672986 + .0521327014, 2.4)
}

function yo(s) {
    return s < .0031308 ? s * 12.92 : 1.055 * Math.pow(s, .41666) - .055
}
const sm = new Ft().fromArray([.8224621, .0331941, .0170827, .177538, .9668058, .0723974, -1e-7, 1e-7, .9105199]),
    rm = new Ft().fromArray([1.2249401, -.0420569, -.0196376, -.2249404, 1.0420571, -.0786361, 1e-7, 0, 1.0982735]),
    li = new M;

function am(s) {
    return s.convertSRGBToLinear(), li.set(s.r, s.g, s.b).applyMatrix3(rm), s.setRGB(li.x, li.y, li.z)
}

function om(s) {
    return li.set(s.r, s.g, s.b).applyMatrix3(sm), s.setRGB(li.x, li.y, li.z).convertLinearToSRGB()
}
const lm = {
        [Ar]: s => s,
        [En]: s => s.convertSRGBToLinear(),
        [Wu]: am
    },
    cm = {
        [Ar]: s => s,
        [En]: s => s.convertLinearToSRGB(),
        [Wu]: om
    },
    Rt = {
        enabled: !1,
        get legacyMode() {
            return console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."), !this.enabled
        },
        set legacyMode(s) {
            console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."), this.enabled = !s
        },
        get workingColorSpace() {
            return Ar
        },
        set workingColorSpace(s) {
            console.warn("THREE.ColorManagement: .workingColorSpace is readonly.")
        },
        convert: function(s, e, t) {
            if (this.enabled === !1 || e === t || !e || !t) return s;
            const n = lm[e],
                i = cm[t];
            if (n === void 0 || i === void 0) throw new Error(`Unsupported color space conversion, "${e}" to "${t}".`);
            return i(n(s))
        },
        fromWorkingColorSpace: function(s, e) {
            return this.convert(s, this.workingColorSpace, e)
        },
        toWorkingColorSpace: function(s, e) {
            return this.convert(s, e, this.workingColorSpace)
        }
    };
let Ji;
class Yu {
    static getDataURL(e) {
        if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
        let t;
        if (e instanceof HTMLCanvasElement) t = e;
        else {
            Ji === void 0 && (Ji = Lr("canvas")), Ji.width = e.width, Ji.height = e.height;
            const n = Ji.getContext("2d");
            e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = Ji
        }
        return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", .6)) : t.toDataURL("image/png")
    }
    static sRGBToLinear(e) {
        if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
            const t = Lr("canvas");
            t.width = e.width, t.height = e.height;
            const n = t.getContext("2d");
            n.drawImage(e, 0, 0, e.width, e.height);
            const i = n.getImageData(0, 0, e.width, e.height),
                r = i.data;
            for (let a = 0; a < r.length; a++) r[a] = As(r[a] / 255) * 255;
            return n.putImageData(i, 0, 0), t
        } else if (e.data) {
            const t = e.data.slice(0);
            for (let n = 0; n < t.length; n++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(As(t[n] / 255) * 255) : t[n] = As(t[n]);
            return {
                data: t,
                width: e.width,
                height: e.height
            }
        } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e
    }
}
class $u {
    constructor(e = null) {
        this.isSource = !0, this.uuid = xn(), this.data = e, this.version = 0
    }
    set needsUpdate(e) {
        e === !0 && this.version++
    }
    toJSON(e) {
        const t = e === void 0 || typeof e == "string";
        if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
        const n = {
                uuid: this.uuid,
                url: ""
            },
            i = this.data;
        if (i !== null) {
            let r;
            if (Array.isArray(i)) {
                r = [];
                for (let a = 0, o = i.length; a < o; a++) i[a].isDataTexture ? r.push(vo(i[a].image)) : r.push(vo(i[a]))
            } else r = vo(i);
            n.url = r
        }
        return t || (e.images[this.uuid] = n), n
    }
}

function vo(s) {
    return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? Yu.getDataURL(s) : s.data ? {
        data: Array.from(s.data),
        width: s.width,
        height: s.height,
        type: s.data.constructor.name
    } : (console.warn("THREE.Texture: Unable to serialize Texture."), {})
}
let hm = 0;
class wt extends ji {
    constructor(e = wt.DEFAULT_IMAGE, t = wt.DEFAULT_MAPPING, n = sn, i = sn, r = Gt, a = Fi, o = rn, l = ki, c = wt.DEFAULT_ANISOTROPY, h = Oi) {
        super(), this.isTexture = !0, Object.defineProperty(this, "id", {
            value: hm++
        }), this.uuid = xn(), this.name = "", this.source = new $u(e), this.mipmaps = [], this.mapping = t, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new ve(0, 0), this.repeat = new ve(1, 1), this.center = new ve(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Ft, this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.encoding = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.needsPMREMUpdate = !1
    }
    get image() {
        return this.source.data
    }
    set image(e = null) {
        this.source.data = e
    }
    updateMatrix() {
        this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.encoding = e.encoding, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this
    }
    toJSON(e) {
        const t = e === void 0 || typeof e == "string";
        if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
        const n = {
            metadata: {
                version: 4.5,
                type: "Texture",
                generator: "Texture.toJSON"
            },
            uuid: this.uuid,
            name: this.name,
            image: this.source.toJSON(e).uuid,
            mapping: this.mapping,
            repeat: [this.repeat.x, this.repeat.y],
            offset: [this.offset.x, this.offset.y],
            center: [this.center.x, this.center.y],
            rotation: this.rotation,
            wrap: [this.wrapS, this.wrapT],
            format: this.format,
            internalFormat: this.internalFormat,
            type: this.type,
            encoding: this.encoding,
            minFilter: this.minFilter,
            magFilter: this.magFilter,
            anisotropy: this.anisotropy,
            flipY: this.flipY,
            generateMipmaps: this.generateMipmaps,
            premultiplyAlpha: this.premultiplyAlpha,
            unpackAlignment: this.unpackAlignment
        };
        return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
    transformUv(e) {
        if (this.mapping !== Uu) return e;
        if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1) switch (this.wrapS) {
            case Fs:
                e.x = e.x - Math.floor(e.x);
                break;
            case sn:
                e.x = e.x < 0 ? 0 : 1;
                break;
            case Da:
                Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
                break
        }
        if (e.y < 0 || e.y > 1) switch (this.wrapT) {
            case Fs:
                e.y = e.y - Math.floor(e.y);
                break;
            case sn:
                e.y = e.y < 0 ? 0 : 1;
                break;
            case Da:
                Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
                break
        }
        return this.flipY && (e.y = 1 - e.y), e
    }
    set needsUpdate(e) {
        e === !0 && (this.version++, this.source.needsUpdate = !0)
    }
}
wt.DEFAULT_IMAGE = null;
wt.DEFAULT_MAPPING = Uu;
wt.DEFAULT_ANISOTROPY = 1;
class je {
    constructor(e = 0, t = 0, n = 0, i = 1) {
        je.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = i
    }
    get width() {
        return this.z
    }
    set width(e) {
        this.z = e
    }
    get height() {
        return this.w
    }
    set height(e) {
        this.w = e
    }
    set(e, t, n, i) {
        return this.x = e, this.y = t, this.z = n, this.w = i, this
    }
    setScalar(e) {
        return this.x = e, this.y = e, this.z = e, this.w = e, this
    }
    setX(e) {
        return this.x = e, this
    }
    setY(e) {
        return this.y = e, this
    }
    setZ(e) {
        return this.z = e, this
    }
    setW(e) {
        return this.w = e, this
    }
    setComponent(e, t) {
        switch (e) {
            case 0:
                this.x = t;
                break;
            case 1:
                this.y = t;
                break;
            case 2:
                this.z = t;
                break;
            case 3:
                this.w = t;
                break;
            default:
                throw new Error("index is out of range: " + e)
        }
        return this
    }
    getComponent(e) {
        switch (e) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            case 3:
                return this.w;
            default:
                throw new Error("index is out of range: " + e)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z, this.w)
    }
    copy(e) {
        return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this
    }
    add(e) {
        return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this
    }
    addScalar(e) {
        return this.x += e, this.y += e, this.z += e, this.w += e, this
    }
    addVectors(e, t) {
        return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this
    }
    addScaledVector(e, t) {
        return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this
    }
    sub(e) {
        return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this
    }
    subScalar(e) {
        return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this
    }
    subVectors(e, t) {
        return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this
    }
    multiply(e) {
        return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this
    }
    multiplyScalar(e) {
        return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this
    }
    applyMatrix4(e) {
        const t = this.x,
            n = this.y,
            i = this.z,
            r = this.w,
            a = e.elements;
        return this.x = a[0] * t + a[4] * n + a[8] * i + a[12] * r, this.y = a[1] * t + a[5] * n + a[9] * i + a[13] * r, this.z = a[2] * t + a[6] * n + a[10] * i + a[14] * r, this.w = a[3] * t + a[7] * n + a[11] * i + a[15] * r, this
    }
    divideScalar(e) {
        return this.multiplyScalar(1 / e)
    }
    setAxisAngleFromQuaternion(e) {
        this.w = 2 * Math.acos(e.w);
        const t = Math.sqrt(1 - e.w * e.w);
        return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this
    }
    setAxisAngleFromRotationMatrix(e) {
        let t, n, i, r;
        const l = e.elements,
            c = l[0],
            h = l[4],
            u = l[8],
            d = l[1],
            f = l[5],
            g = l[9],
            m = l[2],
            p = l[6],
            _ = l[10];
        if (Math.abs(h - d) < .01 && Math.abs(u - m) < .01 && Math.abs(g - p) < .01) {
            if (Math.abs(h + d) < .1 && Math.abs(u + m) < .1 && Math.abs(g + p) < .1 && Math.abs(c + f + _ - 3) < .1) return this.set(1, 0, 0, 0), this;
            t = Math.PI;
            const y = (c + 1) / 2,
                S = (f + 1) / 2,
                T = (_ + 1) / 2,
                L = (h + d) / 4,
                I = (u + m) / 4,
                v = (g + p) / 4;
            return y > S && y > T ? y < .01 ? (n = 0, i = .707106781, r = .707106781) : (n = Math.sqrt(y), i = L / n, r = I / n) : S > T ? S < .01 ? (n = .707106781, i = 0, r = .707106781) : (i = Math.sqrt(S), n = L / i, r = v / i) : T < .01 ? (n = .707106781, i = .707106781, r = 0) : (r = Math.sqrt(T), n = I / r, i = v / r), this.set(n, i, r, t), this
        }
        let E = Math.sqrt((p - g) * (p - g) + (u - m) * (u - m) + (d - h) * (d - h));
        return Math.abs(E) < .001 && (E = 1), this.x = (p - g) / E, this.y = (u - m) / E, this.z = (d - h) / E, this.w = Math.acos((c + f + _ - 1) / 2), this
    }
    min(e) {
        return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this
    }
    max(e) {
        return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this
    }
    clamp(e, t) {
        return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this
    }
    clampScalar(e, t) {
        return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this.w = Math.max(e, Math.min(t, this.w)), this
    }
    clampLength(e, t) {
        const n = this.length();
        return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this
    }
    roundToZero() {
        return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this
    }
    dot(e) {
        return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    setLength(e) {
        return this.normalize().multiplyScalar(e)
    }
    lerp(e, t) {
        return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this
    }
    lerpVectors(e, t, n) {
        return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this
    }
    equals(e) {
        return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w
    }
    fromArray(e, t = 0) {
        return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this
    }
    toArray(e = [], t = 0) {
        return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e
    }
    fromBufferAttribute(e, t) {
        return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z, yield this.w
    }
}
class Ui extends ji {
    constructor(e = 1, t = 1, n = {}) {
        super(), this.isWebGLRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new je(0, 0, e, t), this.scissorTest = !1, this.viewport = new je(0, 0, e, t);
        const i = {
            width: e,
            height: t,
            depth: 1
        };
        this.texture = new wt(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.encoding), this.texture.isRenderTargetTexture = !0, this.texture.flipY = !1, this.texture.generateMipmaps = n.generateMipmaps !== void 0 ? n.generateMipmaps : !1, this.texture.internalFormat = n.internalFormat !== void 0 ? n.internalFormat : null, this.texture.minFilter = n.minFilter !== void 0 ? n.minFilter : Gt, this.depthBuffer = n.depthBuffer !== void 0 ? n.depthBuffer : !0, this.stencilBuffer = n.stencilBuffer !== void 0 ? n.stencilBuffer : !1, this.depthTexture = n.depthTexture !== void 0 ? n.depthTexture : null, this.samples = n.samples !== void 0 ? n.samples : 0
    }
    setSize(e, t, n = 1) {
        (this.width !== e || this.height !== t || this.depth !== n) && (this.width = e, this.height = t, this.depth = n, this.texture.image.width = e, this.texture.image.height = t, this.texture.image.depth = n, this.dispose()), this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        this.width = e.width, this.height = e.height, this.depth = e.depth, this.viewport.copy(e.viewport), this.texture = e.texture.clone(), this.texture.isRenderTargetTexture = !0;
        const t = Object.assign({}, e.texture.image);
        return this.texture.source = new $u(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
class Ku extends wt {
    constructor(e = null, t = 1, n = 1, i = 1) {
        super(null), this.isDataArrayTexture = !0, this.image = {
            data: e,
            width: t,
            height: n,
            depth: i
        }, this.magFilter = gt, this.minFilter = gt, this.wrapR = sn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
    }
}
class um extends wt {
    constructor(e = null, t = 1, n = 1, i = 1) {
        super(null), this.isData3DTexture = !0, this.image = {
            data: e,
            width: t,
            height: n,
            depth: i
        }, this.magFilter = gt, this.minFilter = gt, this.wrapR = sn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
    }
}
class Rn {
    constructor(e = new M(1 / 0, 1 / 0, 1 / 0), t = new M(-1 / 0, -1 / 0, -1 / 0)) {
        this.isBox3 = !0, this.min = e, this.max = t
    }
    set(e, t) {
        return this.min.copy(e), this.max.copy(t), this
    }
    setFromArray(e) {
        let t = 1 / 0,
            n = 1 / 0,
            i = 1 / 0,
            r = -1 / 0,
            a = -1 / 0,
            o = -1 / 0;
        for (let l = 0, c = e.length; l < c; l += 3) {
            const h = e[l],
                u = e[l + 1],
                d = e[l + 2];
            h < t && (t = h), u < n && (n = u), d < i && (i = d), h > r && (r = h), u > a && (a = u), d > o && (o = d)
        }
        return this.min.set(t, n, i), this.max.set(r, a, o), this
    }
    setFromBufferAttribute(e) {
        let t = 1 / 0,
            n = 1 / 0,
            i = 1 / 0,
            r = -1 / 0,
            a = -1 / 0,
            o = -1 / 0;
        for (let l = 0, c = e.count; l < c; l++) {
            const h = e.getX(l),
                u = e.getY(l),
                d = e.getZ(l);
            h < t && (t = h), u < n && (n = u), d < i && (i = d), h > r && (r = h), u > a && (a = u), d > o && (o = d)
        }
        return this.min.set(t, n, i), this.max.set(r, a, o), this
    }
    setFromPoints(e) {
        this.makeEmpty();
        for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
        return this
    }
    setFromCenterAndSize(e, t) {
        const n = vi.copy(t).multiplyScalar(.5);
        return this.min.copy(e).sub(n), this.max.copy(e).add(n), this
    }
    setFromObject(e, t = !1) {
        return this.makeEmpty(), this.expandByObject(e, t)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        return this.min.copy(e.min), this.max.copy(e.max), this
    }
    makeEmpty() {
        return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this
    }
    isEmpty() {
        return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
    }
    getCenter(e) {
        return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5)
    }
    getSize(e) {
        return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min)
    }
    expandByPoint(e) {
        return this.min.min(e), this.max.max(e), this
    }
    expandByVector(e) {
        return this.min.sub(e), this.max.add(e), this
    }
    expandByScalar(e) {
        return this.min.addScalar(-e), this.max.addScalar(e), this
    }
    expandByObject(e, t = !1) {
        e.updateWorldMatrix(!1, !1);
        const n = e.geometry;
        if (n !== void 0)
            if (t && n.attributes != null && n.attributes.position !== void 0) {
                const r = n.attributes.position;
                for (let a = 0, o = r.count; a < o; a++) vi.fromBufferAttribute(r, a).applyMatrix4(e.matrixWorld), this.expandByPoint(vi)
            } else n.boundingBox === null && n.computeBoundingBox(), So.copy(n.boundingBox), So.applyMatrix4(e.matrixWorld), this.union(So);
        const i = e.children;
        for (let r = 0, a = i.length; r < a; r++) this.expandByObject(i[r], t);
        return this
    }
    containsPoint(e) {
        return !(e.x < this.min.x || e.x > this.max.x || e.y < this.min.y || e.y > this.max.y || e.z < this.min.z || e.z > this.max.z)
    }
    containsBox(e) {
        return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z
    }
    getParameter(e, t) {
        return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z))
    }
    intersectsBox(e) {
        return !(e.max.x < this.min.x || e.min.x > this.max.x || e.max.y < this.min.y || e.min.y > this.max.y || e.max.z < this.min.z || e.min.z > this.max.z)
    }
    intersectsSphere(e) {
        return this.clampPoint(e.center, vi), vi.distanceToSquared(e.center) <= e.radius * e.radius
    }
    intersectsPlane(e) {
        let t, n;
        return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant
    }
    intersectsTriangle(e) {
        if (this.isEmpty()) return !1;
        this.getCenter(Js), $r.subVectors(this.max, Js), Qi.subVectors(e.a, Js), es.subVectors(e.b, Js), ts.subVectors(e.c, Js), Zn.subVectors(es, Qi), Jn.subVectors(ts, es), Si.subVectors(Qi, ts);
        let t = [0, -Zn.z, Zn.y, 0, -Jn.z, Jn.y, 0, -Si.z, Si.y, Zn.z, 0, -Zn.x, Jn.z, 0, -Jn.x, Si.z, 0, -Si.x, -Zn.y, Zn.x, 0, -Jn.y, Jn.x, 0, -Si.y, Si.x, 0];
        return !wo(t, Qi, es, ts, $r) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !wo(t, Qi, es, ts, $r)) ? !1 : (Kr.crossVectors(Zn, Jn), t = [Kr.x, Kr.y, Kr.z], wo(t, Qi, es, ts, $r))
    }
    clampPoint(e, t) {
        return t.copy(e).clamp(this.min, this.max)
    }
    distanceToPoint(e) {
        return this.clampPoint(e, vi).distanceTo(e)
    }
    getBoundingSphere(e) {
        return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(vi).length() * .5), e
    }
    intersect(e) {
        return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this
    }
    union(e) {
        return this.min.min(e.min), this.max.max(e.max), this
    }
    applyMatrix4(e) {
        return this.isEmpty() ? this : (kn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), kn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), kn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), kn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), kn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), kn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), kn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), kn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(kn), this)
    }
    translate(e) {
        return this.min.add(e), this.max.add(e), this
    }
    equals(e) {
        return e.min.equals(this.min) && e.max.equals(this.max)
    }
}
const kn = [new M, new M, new M, new M, new M, new M, new M, new M],
    vi = new M,
    So = new Rn,
    Qi = new M,
    es = new M,
    ts = new M,
    Zn = new M,
    Jn = new M,
    Si = new M,
    Js = new M,
    $r = new M,
    Kr = new M,
    wi = new M;

function wo(s, e, t, n, i) {
    for (let r = 0, a = s.length - 3; r <= a; r += 3) {
        wi.fromArray(s, r);
        const o = i.x * Math.abs(wi.x) + i.y * Math.abs(wi.y) + i.z * Math.abs(wi.z),
            l = e.dot(wi),
            c = t.dot(wi),
            h = n.dot(wi);
        if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o) return !1
    }
    return !0
}
const dm = new Rn,
    Qs = new M,
    Mo = new M;
class Ws {
    constructor(e = new M, t = -1) {
        this.center = e, this.radius = t
    }
    set(e, t) {
        return this.center.copy(e), this.radius = t, this
    }
    setFromPoints(e, t) {
        const n = this.center;
        t !== void 0 ? n.copy(t) : dm.setFromPoints(e).getCenter(n);
        let i = 0;
        for (let r = 0, a = e.length; r < a; r++) i = Math.max(i, n.distanceToSquared(e[r]));
        return this.radius = Math.sqrt(i), this
    }
    copy(e) {
        return this.center.copy(e.center), this.radius = e.radius, this
    }
    isEmpty() {
        return this.radius < 0
    }
    makeEmpty() {
        return this.center.set(0, 0, 0), this.radius = -1, this
    }
    containsPoint(e) {
        return e.distanceToSquared(this.center) <= this.radius * this.radius
    }
    distanceToPoint(e) {
        return e.distanceTo(this.center) - this.radius
    }
    intersectsSphere(e) {
        const t = this.radius + e.radius;
        return e.center.distanceToSquared(this.center) <= t * t
    }
    intersectsBox(e) {
        return e.intersectsSphere(this)
    }
    intersectsPlane(e) {
        return Math.abs(e.distanceToPoint(this.center)) <= this.radius
    }
    clampPoint(e, t) {
        const n = this.center.distanceToSquared(e);
        return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t
    }
    getBoundingBox(e) {
        return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e)
    }
    applyMatrix4(e) {
        return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this
    }
    translate(e) {
        return this.center.add(e), this
    }
    expandByPoint(e) {
        if (this.isEmpty()) return this.center.copy(e), this.radius = 0, this;
        Qs.subVectors(e, this.center);
        const t = Qs.lengthSq();
        if (t > this.radius * this.radius) {
            const n = Math.sqrt(t),
                i = (n - this.radius) * .5;
            this.center.addScaledVector(Qs, i / n), this.radius += i
        }
        return this
    }
    union(e) {
        return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Mo.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(Qs.copy(e.center).add(Mo)), this.expandByPoint(Qs.copy(e.center).sub(Mo))), this)
    }
    equals(e) {
        return e.center.equals(this.center) && e.radius === this.radius
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
const On = new M,
    bo = new M,
    Zr = new M,
    Qn = new M,
    Eo = new M,
    Jr = new M,
    To = new M;
class qa {
    constructor(e = new M, t = new M(0, 0, -1)) {
        this.origin = e, this.direction = t
    }
    set(e, t) {
        return this.origin.copy(e), this.direction.copy(t), this
    }
    copy(e) {
        return this.origin.copy(e.origin), this.direction.copy(e.direction), this
    }
    at(e, t) {
        return t.copy(this.origin).addScaledVector(this.direction, e)
    }
    lookAt(e) {
        return this.direction.copy(e).sub(this.origin).normalize(), this
    }
    recast(e) {
        return this.origin.copy(this.at(e, On)), this
    }
    closestPointToPoint(e, t) {
        t.subVectors(e, this.origin);
        const n = t.dot(this.direction);
        return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n)
    }
    distanceToPoint(e) {
        return Math.sqrt(this.distanceSqToPoint(e))
    }
    distanceSqToPoint(e) {
        const t = On.subVectors(e, this.origin).dot(this.direction);
        return t < 0 ? this.origin.distanceToSquared(e) : (On.copy(this.origin).addScaledVector(this.direction, t), On.distanceToSquared(e))
    }
    distanceSqToSegment(e, t, n, i) {
        bo.copy(e).add(t).multiplyScalar(.5), Zr.copy(t).sub(e).normalize(), Qn.copy(this.origin).sub(bo);
        const r = e.distanceTo(t) * .5,
            a = -this.direction.dot(Zr),
            o = Qn.dot(this.direction),
            l = -Qn.dot(Zr),
            c = Qn.lengthSq(),
            h = Math.abs(1 - a * a);
        let u, d, f, g;
        if (h > 0)
            if (u = a * l - o, d = a * o - l, g = r * h, u >= 0)
                if (d >= -g)
                    if (d <= g) {
                        const m = 1 / h;
                        u *= m, d *= m, f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * l) + c
                    } else d = r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
        else d = -r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
        else d <= -g ? (u = Math.max(0, -(-a * r + o)), d = u > 0 ? -r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c) : d <= g ? (u = 0, d = Math.min(Math.max(-r, -l), r), f = d * (d + 2 * l) + c) : (u = Math.max(0, -(a * r + o)), d = u > 0 ? r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c);
        else d = a > 0 ? -r : r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
        return n && n.copy(this.origin).addScaledVector(this.direction, u), i && i.copy(bo).addScaledVector(Zr, d), f
    }
    intersectSphere(e, t) {
        On.subVectors(e.center, this.origin);
        const n = On.dot(this.direction),
            i = On.dot(On) - n * n,
            r = e.radius * e.radius;
        if (i > r) return null;
        const a = Math.sqrt(r - i),
            o = n - a,
            l = n + a;
        return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t)
    }
    intersectsSphere(e) {
        return this.distanceSqToPoint(e.center) <= e.radius * e.radius
    }
    distanceToPlane(e) {
        const t = e.normal.dot(this.direction);
        if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
        const n = -(this.origin.dot(e.normal) + e.constant) / t;
        return n >= 0 ? n : null
    }
    intersectPlane(e, t) {
        const n = this.distanceToPlane(e);
        return n === null ? null : this.at(n, t)
    }
    intersectsPlane(e) {
        const t = e.distanceToPoint(this.origin);
        return t === 0 || e.normal.dot(this.direction) * t < 0
    }
    intersectBox(e, t) {
        let n, i, r, a, o, l;
        const c = 1 / this.direction.x,
            h = 1 / this.direction.y,
            u = 1 / this.direction.z,
            d = this.origin;
        return c >= 0 ? (n = (e.min.x - d.x) * c, i = (e.max.x - d.x) * c) : (n = (e.max.x - d.x) * c, i = (e.min.x - d.x) * c), h >= 0 ? (r = (e.min.y - d.y) * h, a = (e.max.y - d.y) * h) : (r = (e.max.y - d.y) * h, a = (e.min.y - d.y) * h), n > a || r > i || ((r > n || isNaN(n)) && (n = r), (a < i || isNaN(i)) && (i = a), u >= 0 ? (o = (e.min.z - d.z) * u, l = (e.max.z - d.z) * u) : (o = (e.max.z - d.z) * u, l = (e.min.z - d.z) * u), n > l || o > i) || ((o > n || n !== n) && (n = o), (l < i || i !== i) && (i = l), i < 0) ? null : this.at(n >= 0 ? n : i, t)
    }
    intersectsBox(e) {
        return this.intersectBox(e, On) !== null
    }
    intersectTriangle(e, t, n, i, r) {
        Eo.subVectors(t, e), Jr.subVectors(n, e), To.crossVectors(Eo, Jr);
        let a = this.direction.dot(To),
            o;
        if (a > 0) {
            if (i) return null;
            o = 1
        } else if (a < 0) o = -1, a = -a;
        else return null;
        Qn.subVectors(this.origin, e);
        const l = o * this.direction.dot(Jr.crossVectors(Qn, Jr));
        if (l < 0) return null;
        const c = o * this.direction.dot(Eo.cross(Qn));
        if (c < 0 || l + c > a) return null;
        const h = -o * Qn.dot(To);
        return h < 0 ? null : this.at(h / a, r)
    }
    applyMatrix4(e) {
        return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this
    }
    equals(e) {
        return e.origin.equals(this.origin) && e.direction.equals(this.direction)
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
class Te {
    constructor() {
        Te.prototype.isMatrix4 = !0, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }
    set(e, t, n, i, r, a, o, l, c, h, u, d, f, g, m, p) {
        const _ = this.elements;
        return _[0] = e, _[4] = t, _[8] = n, _[12] = i, _[1] = r, _[5] = a, _[9] = o, _[13] = l, _[2] = c, _[6] = h, _[10] = u, _[14] = d, _[3] = f, _[7] = g, _[11] = m, _[15] = p, this
    }
    identity() {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    clone() {
        return new Te().fromArray(this.elements)
    }
    copy(e) {
        const t = this.elements,
            n = e.elements;
        return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this
    }
    copyPosition(e) {
        const t = this.elements,
            n = e.elements;
        return t[12] = n[12], t[13] = n[13], t[14] = n[14], this
    }
    setFromMatrix3(e) {
        const t = e.elements;
        return this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this
    }
    extractBasis(e, t, n) {
        return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this
    }
    makeBasis(e, t, n) {
        return this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this
    }
    extractRotation(e) {
        const t = this.elements,
            n = e.elements,
            i = 1 / ns.setFromMatrixColumn(e, 0).length(),
            r = 1 / ns.setFromMatrixColumn(e, 1).length(),
            a = 1 / ns.setFromMatrixColumn(e, 2).length();
        return t[0] = n[0] * i, t[1] = n[1] * i, t[2] = n[2] * i, t[3] = 0, t[4] = n[4] * r, t[5] = n[5] * r, t[6] = n[6] * r, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
    }
    makeRotationFromEuler(e) {
        const t = this.elements,
            n = e.x,
            i = e.y,
            r = e.z,
            a = Math.cos(n),
            o = Math.sin(n),
            l = Math.cos(i),
            c = Math.sin(i),
            h = Math.cos(r),
            u = Math.sin(r);
        if (e.order === "XYZ") {
            const d = a * h,
                f = a * u,
                g = o * h,
                m = o * u;
            t[0] = l * h, t[4] = -l * u, t[8] = c, t[1] = f + g * c, t[5] = d - m * c, t[9] = -o * l, t[2] = m - d * c, t[6] = g + f * c, t[10] = a * l
        } else if (e.order === "YXZ") {
            const d = l * h,
                f = l * u,
                g = c * h,
                m = c * u;
            t[0] = d + m * o, t[4] = g * o - f, t[8] = a * c, t[1] = a * u, t[5] = a * h, t[9] = -o, t[2] = f * o - g, t[6] = m + d * o, t[10] = a * l
        } else if (e.order === "ZXY") {
            const d = l * h,
                f = l * u,
                g = c * h,
                m = c * u;
            t[0] = d - m * o, t[4] = -a * u, t[8] = g + f * o, t[1] = f + g * o, t[5] = a * h, t[9] = m - d * o, t[2] = -a * c, t[6] = o, t[10] = a * l
        } else if (e.order === "ZYX") {
            const d = a * h,
                f = a * u,
                g = o * h,
                m = o * u;
            t[0] = l * h, t[4] = g * c - f, t[8] = d * c + m, t[1] = l * u, t[5] = m * c + d, t[9] = f * c - g, t[2] = -c, t[6] = o * l, t[10] = a * l
        } else if (e.order === "YZX") {
            const d = a * l,
                f = a * c,
                g = o * l,
                m = o * c;
            t[0] = l * h, t[4] = m - d * u, t[8] = g * u + f, t[1] = u, t[5] = a * h, t[9] = -o * h, t[2] = -c * h, t[6] = f * u + g, t[10] = d - m * u
        } else if (e.order === "XZY") {
            const d = a * l,
                f = a * c,
                g = o * l,
                m = o * c;
            t[0] = l * h, t[4] = -u, t[8] = c * h, t[1] = d * u + m, t[5] = a * h, t[9] = f * u - g, t[2] = g * u - f, t[6] = o * h, t[10] = m * u + d
        }
        return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
    }
    makeRotationFromQuaternion(e) {
        return this.compose(fm, e, pm)
    }
    lookAt(e, t, n) {
        const i = this.elements;
        return Kt.subVectors(e, t), Kt.lengthSq() === 0 && (Kt.z = 1), Kt.normalize(), ei.crossVectors(n, Kt), ei.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Kt.x += 1e-4 : Kt.z += 1e-4, Kt.normalize(), ei.crossVectors(n, Kt)), ei.normalize(), Qr.crossVectors(Kt, ei), i[0] = ei.x, i[4] = Qr.x, i[8] = Kt.x, i[1] = ei.y, i[5] = Qr.y, i[9] = Kt.y, i[2] = ei.z, i[6] = Qr.z, i[10] = Kt.z, this
    }
    multiply(e) {
        return this.multiplyMatrices(this, e)
    }
    premultiply(e) {
        return this.multiplyMatrices(e, this)
    }
    multiplyMatrices(e, t) {
        const n = e.elements,
            i = t.elements,
            r = this.elements,
            a = n[0],
            o = n[4],
            l = n[8],
            c = n[12],
            h = n[1],
            u = n[5],
            d = n[9],
            f = n[13],
            g = n[2],
            m = n[6],
            p = n[10],
            _ = n[14],
            E = n[3],
            y = n[7],
            S = n[11],
            T = n[15],
            L = i[0],
            I = i[4],
            v = i[8],
            A = i[12],
            P = i[1],
            q = i[5],
            X = i[9],
            F = i[13],
            D = i[2],
            U = i[6],
            j = i[10],
            Z = i[14],
            H = i[3],
            J = i[7],
            Y = i[11],
            ge = i[15];
        return r[0] = a * L + o * P + l * D + c * H, r[4] = a * I + o * q + l * U + c * J, r[8] = a * v + o * X + l * j + c * Y, r[12] = a * A + o * F + l * Z + c * ge, r[1] = h * L + u * P + d * D + f * H, r[5] = h * I + u * q + d * U + f * J, r[9] = h * v + u * X + d * j + f * Y, r[13] = h * A + u * F + d * Z + f * ge, r[2] = g * L + m * P + p * D + _ * H, r[6] = g * I + m * q + p * U + _ * J, r[10] = g * v + m * X + p * j + _ * Y, r[14] = g * A + m * F + p * Z + _ * ge, r[3] = E * L + y * P + S * D + T * H, r[7] = E * I + y * q + S * U + T * J, r[11] = E * v + y * X + S * j + T * Y, r[15] = E * A + y * F + S * Z + T * ge, this
    }
    multiplyScalar(e) {
        const t = this.elements;
        return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this
    }
    determinant() {
        const e = this.elements,
            t = e[0],
            n = e[4],
            i = e[8],
            r = e[12],
            a = e[1],
            o = e[5],
            l = e[9],
            c = e[13],
            h = e[2],
            u = e[6],
            d = e[10],
            f = e[14],
            g = e[3],
            m = e[7],
            p = e[11],
            _ = e[15];
        return g * (+r * l * u - i * c * u - r * o * d + n * c * d + i * o * f - n * l * f) + m * (+t * l * f - t * c * d + r * a * d - i * a * f + i * c * h - r * l * h) + p * (+t * c * u - t * o * f - r * a * u + n * a * f + r * o * h - n * c * h) + _ * (-i * o * h - t * l * u + t * o * d + i * a * u - n * a * d + n * l * h)
    }
    transpose() {
        const e = this.elements;
        let t;
        return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this
    }
    setPosition(e, t, n) {
        const i = this.elements;
        return e.isVector3 ? (i[12] = e.x, i[13] = e.y, i[14] = e.z) : (i[12] = e, i[13] = t, i[14] = n), this
    }
    invert() {
        const e = this.elements,
            t = e[0],
            n = e[1],
            i = e[2],
            r = e[3],
            a = e[4],
            o = e[5],
            l = e[6],
            c = e[7],
            h = e[8],
            u = e[9],
            d = e[10],
            f = e[11],
            g = e[12],
            m = e[13],
            p = e[14],
            _ = e[15],
            E = u * p * c - m * d * c + m * l * f - o * p * f - u * l * _ + o * d * _,
            y = g * d * c - h * p * c - g * l * f + a * p * f + h * l * _ - a * d * _,
            S = h * m * c - g * u * c + g * o * f - a * m * f - h * o * _ + a * u * _,
            T = g * u * l - h * m * l - g * o * d + a * m * d + h * o * p - a * u * p,
            L = t * E + n * y + i * S + r * T;
        if (L === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const I = 1 / L;
        return e[0] = E * I, e[1] = (m * d * r - u * p * r - m * i * f + n * p * f + u * i * _ - n * d * _) * I, e[2] = (o * p * r - m * l * r + m * i * c - n * p * c - o * i * _ + n * l * _) * I, e[3] = (u * l * r - o * d * r - u * i * c + n * d * c + o * i * f - n * l * f) * I, e[4] = y * I, e[5] = (h * p * r - g * d * r + g * i * f - t * p * f - h * i * _ + t * d * _) * I, e[6] = (g * l * r - a * p * r - g * i * c + t * p * c + a * i * _ - t * l * _) * I, e[7] = (a * d * r - h * l * r + h * i * c - t * d * c - a * i * f + t * l * f) * I, e[8] = S * I, e[9] = (g * u * r - h * m * r - g * n * f + t * m * f + h * n * _ - t * u * _) * I, e[10] = (a * m * r - g * o * r + g * n * c - t * m * c - a * n * _ + t * o * _) * I, e[11] = (h * o * r - a * u * r - h * n * c + t * u * c + a * n * f - t * o * f) * I, e[12] = T * I, e[13] = (h * m * i - g * u * i + g * n * d - t * m * d - h * n * p + t * u * p) * I, e[14] = (g * o * i - a * m * i - g * n * l + t * m * l + a * n * p - t * o * p) * I, e[15] = (a * u * i - h * o * i + h * n * l - t * u * l - a * n * d + t * o * d) * I, this
    }
    scale(e) {
        const t = this.elements,
            n = e.x,
            i = e.y,
            r = e.z;
        return t[0] *= n, t[4] *= i, t[8] *= r, t[1] *= n, t[5] *= i, t[9] *= r, t[2] *= n, t[6] *= i, t[10] *= r, t[3] *= n, t[7] *= i, t[11] *= r, this
    }
    getMaxScaleOnAxis() {
        const e = this.elements,
            t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
            n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
            i = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
        return Math.sqrt(Math.max(t, n, i))
    }
    makeTranslation(e, t, n) {
        return this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1), this
    }
    makeRotationX(e) {
        const t = Math.cos(e),
            n = Math.sin(e);
        return this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this
    }
    makeRotationY(e) {
        const t = Math.cos(e),
            n = Math.sin(e);
        return this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this
    }
    makeRotationZ(e) {
        const t = Math.cos(e),
            n = Math.sin(e);
        return this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    makeRotationAxis(e, t) {
        const n = Math.cos(t),
            i = Math.sin(t),
            r = 1 - n,
            a = e.x,
            o = e.y,
            l = e.z,
            c = r * a,
            h = r * o;
        return this.set(c * a + n, c * o - i * l, c * l + i * o, 0, c * o + i * l, h * o + n, h * l - i * a, 0, c * l - i * o, h * l + i * a, r * l * l + n, 0, 0, 0, 0, 1), this
    }
    makeScale(e, t, n) {
        return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this
    }
    makeShear(e, t, n, i, r, a) {
        return this.set(1, n, r, 0, e, 1, a, 0, t, i, 1, 0, 0, 0, 0, 1), this
    }
    compose(e, t, n) {
        const i = this.elements,
            r = t._x,
            a = t._y,
            o = t._z,
            l = t._w,
            c = r + r,
            h = a + a,
            u = o + o,
            d = r * c,
            f = r * h,
            g = r * u,
            m = a * h,
            p = a * u,
            _ = o * u,
            E = l * c,
            y = l * h,
            S = l * u,
            T = n.x,
            L = n.y,
            I = n.z;
        return i[0] = (1 - (m + _)) * T, i[1] = (f + S) * T, i[2] = (g - y) * T, i[3] = 0, i[4] = (f - S) * L, i[5] = (1 - (d + _)) * L, i[6] = (p + E) * L, i[7] = 0, i[8] = (g + y) * I, i[9] = (p - E) * I, i[10] = (1 - (d + m)) * I, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this
    }
    decompose(e, t, n) {
        const i = this.elements;
        let r = ns.set(i[0], i[1], i[2]).length();
        const a = ns.set(i[4], i[5], i[6]).length(),
            o = ns.set(i[8], i[9], i[10]).length();
        this.determinant() < 0 && (r = -r), e.x = i[12], e.y = i[13], e.z = i[14], un.copy(this);
        const c = 1 / r,
            h = 1 / a,
            u = 1 / o;
        return un.elements[0] *= c, un.elements[1] *= c, un.elements[2] *= c, un.elements[4] *= h, un.elements[5] *= h, un.elements[6] *= h, un.elements[8] *= u, un.elements[9] *= u, un.elements[10] *= u, t.setFromRotationMatrix(un), n.x = r, n.y = a, n.z = o, this
    }
    makePerspective(e, t, n, i, r, a) {
        const o = this.elements,
            l = 2 * r / (t - e),
            c = 2 * r / (n - i),
            h = (t + e) / (t - e),
            u = (n + i) / (n - i),
            d = -(a + r) / (a - r),
            f = -2 * a * r / (a - r);
        return o[0] = l, o[4] = 0, o[8] = h, o[12] = 0, o[1] = 0, o[5] = c, o[9] = u, o[13] = 0, o[2] = 0, o[6] = 0, o[10] = d, o[14] = f, o[3] = 0, o[7] = 0, o[11] = -1, o[15] = 0, this
    }
    makeOrthographic(e, t, n, i, r, a) {
        const o = this.elements,
            l = 1 / (t - e),
            c = 1 / (n - i),
            h = 1 / (a - r),
            u = (t + e) * l,
            d = (n + i) * c,
            f = (a + r) * h;
        return o[0] = 2 * l, o[4] = 0, o[8] = 0, o[12] = -u, o[1] = 0, o[5] = 2 * c, o[9] = 0, o[13] = -d, o[2] = 0, o[6] = 0, o[10] = -2 * h, o[14] = -f, o[3] = 0, o[7] = 0, o[11] = 0, o[15] = 1, this
    }
    equals(e) {
        const t = this.elements,
            n = e.elements;
        for (let i = 0; i < 16; i++)
            if (t[i] !== n[i]) return !1;
        return !0
    }
    fromArray(e, t = 0) {
        for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
        return this
    }
    toArray(e = [], t = 0) {
        const n = this.elements;
        return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e
    }
}
const ns = new M,
    un = new Te,
    fm = new M(0, 0, 0),
    pm = new M(1, 1, 1),
    ei = new M,
    Qr = new M,
    Kt = new M,
    hh = new Te,
    uh = new Wt;
class ja {
    constructor(e = 0, t = 0, n = 0, i = ja.DEFAULT_ORDER) {
        this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = i
    }
    get x() {
        return this._x
    }
    set x(e) {
        this._x = e, this._onChangeCallback()
    }
    get y() {
        return this._y
    }
    set y(e) {
        this._y = e, this._onChangeCallback()
    }
    get z() {
        return this._z
    }
    set z(e) {
        this._z = e, this._onChangeCallback()
    }
    get order() {
        return this._order
    }
    set order(e) {
        this._order = e, this._onChangeCallback()
    }
    set(e, t, n, i = this._order) {
        return this._x = e, this._y = t, this._z = n, this._order = i, this._onChangeCallback(), this
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._order)
    }
    copy(e) {
        return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this
    }
    setFromRotationMatrix(e, t = this._order, n = !0) {
        const i = e.elements,
            r = i[0],
            a = i[4],
            o = i[8],
            l = i[1],
            c = i[5],
            h = i[9],
            u = i[2],
            d = i[6],
            f = i[10];
        switch (t) {
            case "XYZ":
                this._y = Math.asin(St(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, c), this._z = 0);
                break;
            case "YXZ":
                this._x = Math.asin(-St(h, -1, 1)), Math.abs(h) < .9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, r), this._z = 0);
                break;
            case "ZXY":
                this._x = Math.asin(St(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, r));
                break;
            case "ZYX":
                this._y = Math.asin(-St(u, -1, 1)), Math.abs(u) < .9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-a, c));
                break;
            case "YZX":
                this._z = Math.asin(St(l, -1, 1)), Math.abs(l) < .9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(o, f));
                break;
            case "XZY":
                this._z = Math.asin(-St(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
                break;
            default:
                console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t)
        }
        return this._order = t, n === !0 && this._onChangeCallback(), this
    }
    setFromQuaternion(e, t, n) {
        return hh.makeRotationFromQuaternion(e), this.setFromRotationMatrix(hh, t, n)
    }
    setFromVector3(e, t = this._order) {
        return this.set(e.x, e.y, e.z, t)
    }
    reorder(e) {
        return uh.setFromEuler(this), this.setFromQuaternion(uh, e)
    }
    equals(e) {
        return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order
    }
    fromArray(e) {
        return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this
    }
    toArray(e = [], t = 0) {
        return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e
    }
    _onChange(e) {
        return this._onChangeCallback = e, this
    }
    _onChangeCallback() {}*[Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._order
    }
}
ja.DEFAULT_ORDER = "XYZ";
class Yl {
    constructor() {
        this.mask = 1
    }
    set(e) {
        this.mask = (1 << e | 0) >>> 0
    }
    enable(e) {
        this.mask |= 1 << e | 0
    }
    enableAll() {
        this.mask = -1
    }
    toggle(e) {
        this.mask ^= 1 << e | 0
    }
    disable(e) {
        this.mask &= ~(1 << e | 0)
    }
    disableAll() {
        this.mask = 0
    }
    test(e) {
        return (this.mask & e.mask) !== 0
    }
    isEnabled(e) {
        return (this.mask & (1 << e | 0)) !== 0
    }
}
let mm = 0;
const dh = new M,
    is = new Wt,
    Un = new Te,
    ea = new M,
    er = new M,
    gm = new M,
    _m = new Wt,
    fh = new M(1, 0, 0),
    ph = new M(0, 1, 0),
    mh = new M(0, 0, 1),
    xm = {
        type: "added"
    },
    gh = {
        type: "removed"
    };
class Ye extends ji {
    constructor() {
        super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
            value: mm++
        }), this.uuid = xn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Ye.DEFAULT_UP.clone();
        const e = new M,
            t = new ja,
            n = new Wt,
            i = new M(1, 1, 1);

        function r() {
            n.setFromEuler(t, !1)
        }

        function a() {
            t.setFromQuaternion(n, void 0, !1)
        }
        t._onChange(r), n._onChange(a), Object.defineProperties(this, {
            position: {
                configurable: !0,
                enumerable: !0,
                value: e
            },
            rotation: {
                configurable: !0,
                enumerable: !0,
                value: t
            },
            quaternion: {
                configurable: !0,
                enumerable: !0,
                value: n
            },
            scale: {
                configurable: !0,
                enumerable: !0,
                value: i
            },
            modelViewMatrix: {
                value: new Te
            },
            normalMatrix: {
                value: new Ft
            }
        }), this.matrix = new Te, this.matrixWorld = new Te, this.matrixAutoUpdate = Ye.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.matrixWorldAutoUpdate = Ye.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.layers = new Yl, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {}
    }
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(e) {
        this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale)
    }
    applyQuaternion(e) {
        return this.quaternion.premultiply(e), this
    }
    setRotationFromAxisAngle(e, t) {
        this.quaternion.setFromAxisAngle(e, t)
    }
    setRotationFromEuler(e) {
        this.quaternion.setFromEuler(e, !0)
    }
    setRotationFromMatrix(e) {
        this.quaternion.setFromRotationMatrix(e)
    }
    setRotationFromQuaternion(e) {
        this.quaternion.copy(e)
    }
    rotateOnAxis(e, t) {
        return is.setFromAxisAngle(e, t), this.quaternion.multiply(is), this
    }
    rotateOnWorldAxis(e, t) {
        return is.setFromAxisAngle(e, t), this.quaternion.premultiply(is), this
    }
    rotateX(e) {
        return this.rotateOnAxis(fh, e)
    }
    rotateY(e) {
        return this.rotateOnAxis(ph, e)
    }
    rotateZ(e) {
        return this.rotateOnAxis(mh, e)
    }
    translateOnAxis(e, t) {
        return dh.copy(e).applyQuaternion(this.quaternion), this.position.add(dh.multiplyScalar(t)), this
    }
    translateX(e) {
        return this.translateOnAxis(fh, e)
    }
    translateY(e) {
        return this.translateOnAxis(ph, e)
    }
    translateZ(e) {
        return this.translateOnAxis(mh, e)
    }
    localToWorld(e) {
        return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld)
    }
    worldToLocal(e) {
        return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Un.copy(this.matrixWorld).invert())
    }
    lookAt(e, t, n) {
        e.isVector3 ? ea.copy(e) : ea.set(e, t, n);
        const i = this.parent;
        this.updateWorldMatrix(!0, !1), er.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Un.lookAt(er, ea, this.up) : Un.lookAt(ea, er, this.up), this.quaternion.setFromRotationMatrix(Un), i && (Un.extractRotation(i.matrixWorld), is.setFromRotationMatrix(Un), this.quaternion.premultiply(is.invert()))
    }
    add(e) {
        if (arguments.length > 1) {
            for (let t = 0; t < arguments.length; t++) this.add(arguments[t]);
            return this
        }
        return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.parent !== null && e.parent.remove(e), e.parent = this, this.children.push(e), e.dispatchEvent(xm)) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this)
    }
    remove(e) {
        if (arguments.length > 1) {
            for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
            return this
        }
        const t = this.children.indexOf(e);
        return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(gh)), this
    }
    removeFromParent() {
        const e = this.parent;
        return e !== null && e.remove(this), this
    }
    clear() {
        for (let e = 0; e < this.children.length; e++) {
            const t = this.children[e];
            t.parent = null, t.dispatchEvent(gh)
        }
        return this.children.length = 0, this
    }
    attach(e) {
        return this.updateWorldMatrix(!0, !1), Un.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Un.multiply(e.parent.matrixWorld)), e.applyMatrix4(Un), this.add(e), e.updateWorldMatrix(!1, !0), this
    }
    getObjectById(e) {
        return this.getObjectByProperty("id", e)
    }
    getObjectByName(e) {
        return this.getObjectByProperty("name", e)
    }
    getObjectByProperty(e, t) {
        if (this[e] === t) return this;
        for (let n = 0, i = this.children.length; n < i; n++) {
            const a = this.children[n].getObjectByProperty(e, t);
            if (a !== void 0) return a
        }
    }
    getObjectsByProperty(e, t) {
        let n = [];
        this[e] === t && n.push(this);
        for (let i = 0, r = this.children.length; i < r; i++) {
            const a = this.children[i].getObjectsByProperty(e, t);
            a.length > 0 && (n = n.concat(a))
        }
        return n
    }
    getWorldPosition(e) {
        return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld)
    }
    getWorldQuaternion(e) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(er, e, gm), e
    }
    getWorldScale(e) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(er, _m, e), e
    }
    getWorldDirection(e) {
        this.updateWorldMatrix(!0, !1);
        const t = this.matrixWorld.elements;
        return e.set(t[8], t[9], t[10]).normalize()
    }
    raycast() {}
    traverse(e) {
        e(this);
        const t = this.children;
        for (let n = 0, i = t.length; n < i; n++) t[n].traverse(e)
    }
    traverseVisible(e) {
        if (this.visible === !1) return;
        e(this);
        const t = this.children;
        for (let n = 0, i = t.length; n < i; n++) t[n].traverseVisible(e)
    }
    traverseAncestors(e) {
        const t = this.parent;
        t !== null && (e(t), t.traverseAncestors(e))
    }
    updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0
    }
    updateMatrixWorld(e) {
        this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorldNeedsUpdate = !1, e = !0);
        const t = this.children;
        for (let n = 0, i = t.length; n < i; n++) {
            const r = t[n];
            (r.matrixWorldAutoUpdate === !0 || e === !0) && r.updateMatrixWorld(e)
        }
    }
    updateWorldMatrix(e, t) {
        const n = this.parent;
        if (e === !0 && n !== null && n.matrixWorldAutoUpdate === !0 && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), t === !0) {
            const i = this.children;
            for (let r = 0, a = i.length; r < a; r++) {
                const o = i[r];
                o.matrixWorldAutoUpdate === !0 && o.updateWorldMatrix(!1, !0)
            }
        }
    }
    toJSON(e) {
        const t = e === void 0 || typeof e == "string",
            n = {};
        t && (e = {
            geometries: {},
            materials: {},
            textures: {},
            images: {},
            shapes: {},
            skeletons: {},
            animations: {},
            nodes: {}
        }, n.metadata = {
            version: 4.5,
            type: "Object",
            generator: "Object3D.toJSON"
        });
        const i = {};
        i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.castShadow === !0 && (i.castShadow = !0), this.receiveShadow === !0 && (i.receiveShadow = !0), this.visible === !1 && (i.visible = !1), this.frustumCulled === !1 && (i.frustumCulled = !1), this.renderOrder !== 0 && (i.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (i.userData = this.userData), i.layers = this.layers.mask, i.matrix = this.matrix.toArray(), this.matrixAutoUpdate === !1 && (i.matrixAutoUpdate = !1), this.isInstancedMesh && (i.type = "InstancedMesh", i.count = this.count, i.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (i.instanceColor = this.instanceColor.toJSON()));

        function r(o, l) {
            return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid
        }
        if (this.isScene) this.background && (this.background.isColor ? i.background = this.background.toJSON() : this.background.isTexture && (i.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (i.environment = this.environment.toJSON(e).uuid);
        else if (this.isMesh || this.isLine || this.isPoints) {
            i.geometry = r(e.geometries, this.geometry);
            const o = this.geometry.parameters;
            if (o !== void 0 && o.shapes !== void 0) {
                const l = o.shapes;
                if (Array.isArray(l))
                    for (let c = 0, h = l.length; c < h; c++) {
                        const u = l[c];
                        r(e.shapes, u)
                    } else r(e.shapes, l)
            }
        }
        if (this.isSkinnedMesh && (i.bindMode = this.bindMode, i.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(e.skeletons, this.skeleton), i.skeleton = this.skeleton.uuid)), this.material !== void 0)
            if (Array.isArray(this.material)) {
                const o = [];
                for (let l = 0, c = this.material.length; l < c; l++) o.push(r(e.materials, this.material[l]));
                i.material = o
            } else i.material = r(e.materials, this.material);
        if (this.children.length > 0) {
            i.children = [];
            for (let o = 0; o < this.children.length; o++) i.children.push(this.children[o].toJSON(e).object)
        }
        if (this.animations.length > 0) {
            i.animations = [];
            for (let o = 0; o < this.animations.length; o++) {
                const l = this.animations[o];
                i.animations.push(r(e.animations, l))
            }
        }
        if (t) {
            const o = a(e.geometries),
                l = a(e.materials),
                c = a(e.textures),
                h = a(e.images),
                u = a(e.shapes),
                d = a(e.skeletons),
                f = a(e.animations),
                g = a(e.nodes);
            o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), d.length > 0 && (n.skeletons = d), f.length > 0 && (n.animations = f), g.length > 0 && (n.nodes = g)
        }
        return n.object = i, n;

        function a(o) {
            const l = [];
            for (const c in o) {
                const h = o[c];
                delete h.metadata, l.push(h)
            }
            return l
        }
    }
    clone(e) {
        return new this.constructor().copy(this, e)
    }
    copy(e, t = !0) {
        if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
            for (let n = 0; n < e.children.length; n++) {
                const i = e.children[n];
                this.add(i.clone())
            }
        return this
    }
}
Ye.DEFAULT_UP = new M(0, 1, 0);
Ye.DEFAULT_MATRIX_AUTO_UPDATE = !0;
Ye.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const dn = new M,
    zn = new M,
    Ao = new M,
    Gn = new M,
    ss = new M,
    rs = new M,
    _h = new M,
    Co = new M,
    Lo = new M,
    Io = new M;
class An {
    constructor(e = new M, t = new M, n = new M) {
        this.a = e, this.b = t, this.c = n
    }
    static getNormal(e, t, n, i) {
        i.subVectors(n, t), dn.subVectors(e, t), i.cross(dn);
        const r = i.lengthSq();
        return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0)
    }
    static getBarycoord(e, t, n, i, r) {
        dn.subVectors(i, t), zn.subVectors(n, t), Ao.subVectors(e, t);
        const a = dn.dot(dn),
            o = dn.dot(zn),
            l = dn.dot(Ao),
            c = zn.dot(zn),
            h = zn.dot(Ao),
            u = a * c - o * o;
        if (u === 0) return r.set(-2, -1, -1);
        const d = 1 / u,
            f = (c * l - o * h) * d,
            g = (a * h - o * l) * d;
        return r.set(1 - f - g, g, f)
    }
    static containsPoint(e, t, n, i) {
        return this.getBarycoord(e, t, n, i, Gn), Gn.x >= 0 && Gn.y >= 0 && Gn.x + Gn.y <= 1
    }
    static getUV(e, t, n, i, r, a, o, l) {
        return this.getBarycoord(e, t, n, i, Gn), l.set(0, 0), l.addScaledVector(r, Gn.x), l.addScaledVector(a, Gn.y), l.addScaledVector(o, Gn.z), l
    }
    static isFrontFacing(e, t, n, i) {
        return dn.subVectors(n, t), zn.subVectors(e, t), dn.cross(zn).dot(i) < 0
    }
    set(e, t, n) {
        return this.a.copy(e), this.b.copy(t), this.c.copy(n), this
    }
    setFromPointsAndIndices(e, t, n, i) {
        return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[i]), this
    }
    setFromAttributeAndIndices(e, t, n, i) {
        return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, i), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this
    }
    getArea() {
        return dn.subVectors(this.c, this.b), zn.subVectors(this.a, this.b), dn.cross(zn).length() * .5
    }
    getMidpoint(e) {
        return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3)
    }
    getNormal(e) {
        return An.getNormal(this.a, this.b, this.c, e)
    }
    getPlane(e) {
        return e.setFromCoplanarPoints(this.a, this.b, this.c)
    }
    getBarycoord(e, t) {
        return An.getBarycoord(e, this.a, this.b, this.c, t)
    }
    getUV(e, t, n, i, r) {
        return An.getUV(e, this.a, this.b, this.c, t, n, i, r)
    }
    containsPoint(e) {
        return An.containsPoint(e, this.a, this.b, this.c)
    }
    isFrontFacing(e) {
        return An.isFrontFacing(this.a, this.b, this.c, e)
    }
    intersectsBox(e) {
        return e.intersectsTriangle(this)
    }
    closestPointToPoint(e, t) {
        const n = this.a,
            i = this.b,
            r = this.c;
        let a, o;
        ss.subVectors(i, n), rs.subVectors(r, n), Co.subVectors(e, n);
        const l = ss.dot(Co),
            c = rs.dot(Co);
        if (l <= 0 && c <= 0) return t.copy(n);
        Lo.subVectors(e, i);
        const h = ss.dot(Lo),
            u = rs.dot(Lo);
        if (h >= 0 && u <= h) return t.copy(i);
        const d = l * u - h * c;
        if (d <= 0 && l >= 0 && h <= 0) return a = l / (l - h), t.copy(n).addScaledVector(ss, a);
        Io.subVectors(e, r);
        const f = ss.dot(Io),
            g = rs.dot(Io);
        if (g >= 0 && f <= g) return t.copy(r);
        const m = f * c - l * g;
        if (m <= 0 && c >= 0 && g <= 0) return o = c / (c - g), t.copy(n).addScaledVector(rs, o);
        const p = h * g - f * u;
        if (p <= 0 && u - h >= 0 && f - g >= 0) return _h.subVectors(r, i), o = (u - h) / (u - h + (f - g)), t.copy(i).addScaledVector(_h, o);
        const _ = 1 / (p + m + d);
        return a = m * _, o = d * _, t.copy(n).addScaledVector(ss, a).addScaledVector(rs, o)
    }
    equals(e) {
        return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c)
    }
}
let ym = 0;
class ln extends ji {
    constructor() {
        super(), this.isMaterial = !0, Object.defineProperty(this, "id", {
            value: ym++
        }), this.uuid = xn(), this.name = "", this.type = "Material", this.blending = Es, this.side = $n, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.blendSrc = Bu, this.blendDst = Fu, this.blendEquation = gs, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.depthFunc = il, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Wp, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = go, this.stencilZFail = go, this.stencilZPass = go, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0
    }
    get alphaTest() {
        return this._alphaTest
    }
    set alphaTest(e) {
        this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e
    }
    onBuild() {}
    onBeforeRender() {}
    onBeforeCompile() {}
    customProgramCacheKey() {
        return this.onBeforeCompile.toString()
    }
    setValues(e) {
        if (e !== void 0)
            for (const t in e) {
                const n = e[t];
                if (n === void 0) {
                    console.warn("THREE.Material: '" + t + "' parameter is undefined.");
                    continue
                }
                const i = this[t];
                if (i === void 0) {
                    console.warn("THREE." + this.type + ": '" + t + "' is not a property of this material.");
                    continue
                }
                i && i.isColor ? i.set(n) : i && i.isVector3 && n && n.isVector3 ? i.copy(n) : this[t] = n
            }
    }
    toJSON(e) {
        const t = e === void 0 || typeof e == "string";
        t && (e = {
            textures: {},
            images: {}
        });
        const n = {
            metadata: {
                version: 4.5,
                type: "Material",
                generator: "Material.toJSON"
            }
        };
        n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Es && (n.blending = this.blending), this.side !== $n && (n.side = this.side), this.vertexColors && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = this.transparent), n.depthFunc = this.depthFunc, n.depthTest = this.depthTest, n.depthWrite = this.depthWrite, n.colorWrite = this.colorWrite, n.stencilWrite = this.stencilWrite, n.stencilWriteMask = this.stencilWriteMask, n.stencilFunc = this.stencilFunc, n.stencilRef = this.stencilRef, n.stencilFuncMask = this.stencilFuncMask, n.stencilFail = this.stencilFail, n.stencilZFail = this.stencilZFail, n.stencilZPass = this.stencilZPass, this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaToCoverage === !0 && (n.alphaToCoverage = this.alphaToCoverage), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = this.premultipliedAlpha), this.forceSinglePass === !0 && (n.forceSinglePass = this.forceSinglePass), this.wireframe === !0 && (n.wireframe = this.wireframe), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = this.flatShading), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);

        function i(r) {
            const a = [];
            for (const o in r) {
                const l = r[o];
                delete l.metadata, a.push(l)
            }
            return a
        }
        if (t) {
            const r = i(e.textures),
                a = i(e.images);
            r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a)
        }
        return n
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
        const t = e.clippingPlanes;
        let n = null;
        if (t !== null) {
            const i = t.length;
            n = new Array(i);
            for (let r = 0; r !== i; ++r) n[r] = t[r].clone()
        }
        return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
    set needsUpdate(e) {
        e === !0 && this.version++
    }
}
const Zu = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        rebeccapurple: 6697881,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
    },
    fn = {
        h: 0,
        s: 0,
        l: 0
    },
    ta = {
        h: 0,
        s: 0,
        l: 0
    };

function Ro(s, e, t) {
    return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? s + (e - s) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? s + (e - s) * 6 * (2 / 3 - t) : s
}
class pe {
    constructor(e, t, n) {
        return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, t === void 0 && n === void 0 ? this.set(e) : this.setRGB(e, t, n)
    }
    set(e) {
        return e && e.isColor ? this.copy(e) : typeof e == "number" ? this.setHex(e) : typeof e == "string" && this.setStyle(e), this
    }
    setScalar(e) {
        return this.r = e, this.g = e, this.b = e, this
    }
    setHex(e, t = En) {
        return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Rt.toWorkingColorSpace(this, t), this
    }
    setRGB(e, t, n, i = Rt.workingColorSpace) {
        return this.r = e, this.g = t, this.b = n, Rt.toWorkingColorSpace(this, i), this
    }
    setHSL(e, t, n, i = Rt.workingColorSpace) {
        if (e = jl(e, 1), t = St(t, 0, 1), n = St(n, 0, 1), t === 0) this.r = this.g = this.b = n;
        else {
            const r = n <= .5 ? n * (1 + t) : n + t - n * t,
                a = 2 * n - r;
            this.r = Ro(a, r, e + 1 / 3), this.g = Ro(a, r, e), this.b = Ro(a, r, e - 1 / 3)
        }
        return Rt.toWorkingColorSpace(this, i), this
    }
    setStyle(e, t = En) {
        function n(r) {
            r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.")
        }
        let i;
        if (i = /^(\w+)\(([^\)]*)\)/.exec(e)) {
            let r;
            const a = i[1],
                o = i[2];
            switch (a) {
                case "rgb":
                case "rgba":
                    if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return this.r = Math.min(255, parseInt(r[1], 10)) / 255, this.g = Math.min(255, parseInt(r[2], 10)) / 255, this.b = Math.min(255, parseInt(r[3], 10)) / 255, Rt.toWorkingColorSpace(this, t), n(r[4]), this;
                    if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return this.r = Math.min(100, parseInt(r[1], 10)) / 100, this.g = Math.min(100, parseInt(r[2], 10)) / 100, this.b = Math.min(100, parseInt(r[3], 10)) / 100, Rt.toWorkingColorSpace(this, t), n(r[4]), this;
                    break;
                case "hsl":
                case "hsla":
                    if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) {
                        const l = parseFloat(r[1]) / 360,
                            c = parseFloat(r[2]) / 100,
                            h = parseFloat(r[3]) / 100;
                        return n(r[4]), this.setHSL(l, c, h, t)
                    }
                    break;
                default:
                    console.warn("THREE.Color: Unknown color model " + e)
            }
        } else if (i = /^\#([A-Fa-f\d]+)$/.exec(e)) {
            const r = i[1],
                a = r.length;
            if (a === 3) return this.r = parseInt(r.charAt(0) + r.charAt(0), 16) / 255, this.g = parseInt(r.charAt(1) + r.charAt(1), 16) / 255, this.b = parseInt(r.charAt(2) + r.charAt(2), 16) / 255, Rt.toWorkingColorSpace(this, t), this;
            if (a === 6) return this.r = parseInt(r.charAt(0) + r.charAt(1), 16) / 255, this.g = parseInt(r.charAt(2) + r.charAt(3), 16) / 255, this.b = parseInt(r.charAt(4) + r.charAt(5), 16) / 255, Rt.toWorkingColorSpace(this, t), this;
            console.warn("THREE.Color: Invalid hex color " + e)
        } else if (e && e.length > 0) return this.setColorName(e, t);
        return this
    }
    setColorName(e, t = En) {
        const n = Zu[e.toLowerCase()];
        return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this
    }
    clone() {
        return new this.constructor(this.r, this.g, this.b)
    }
    copy(e) {
        return this.r = e.r, this.g = e.g, this.b = e.b, this
    }
    copySRGBToLinear(e) {
        return this.r = As(e.r), this.g = As(e.g), this.b = As(e.b), this
    }
    copyLinearToSRGB(e) {
        return this.r = yo(e.r), this.g = yo(e.g), this.b = yo(e.b), this
    }
    convertSRGBToLinear() {
        return this.copySRGBToLinear(this), this
    }
    convertLinearToSRGB() {
        return this.copyLinearToSRGB(this), this
    }
    getHex(e = En) {
        return Rt.fromWorkingColorSpace(bt.copy(this), e), St(bt.r * 255, 0, 255) << 16 ^ St(bt.g * 255, 0, 255) << 8 ^ St(bt.b * 255, 0, 255) << 0
    }
    getHexString(e = En) {
        return ("000000" + this.getHex(e).toString(16)).slice(-6)
    }
    getHSL(e, t = Rt.workingColorSpace) {
        Rt.fromWorkingColorSpace(bt.copy(this), t);
        const n = bt.r,
            i = bt.g,
            r = bt.b,
            a = Math.max(n, i, r),
            o = Math.min(n, i, r);
        let l, c;
        const h = (o + a) / 2;
        if (o === a) l = 0, c = 0;
        else {
            const u = a - o;
            switch (c = h <= .5 ? u / (a + o) : u / (2 - a - o), a) {
                case n:
                    l = (i - r) / u + (i < r ? 6 : 0);
                    break;
                case i:
                    l = (r - n) / u + 2;
                    break;
                case r:
                    l = (n - i) / u + 4;
                    break
            }
            l /= 6
        }
        return e.h = l, e.s = c, e.l = h, e
    }
    getRGB(e, t = Rt.workingColorSpace) {
        return Rt.fromWorkingColorSpace(bt.copy(this), t), e.r = bt.r, e.g = bt.g, e.b = bt.b, e
    }
    getStyle(e = En) {
        Rt.fromWorkingColorSpace(bt.copy(this), e);
        const t = bt.r,
            n = bt.g,
            i = bt.b;
        return e !== En ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${t*255|0},${n*255|0},${i*255|0})`
    }
    offsetHSL(e, t, n) {
        return this.getHSL(fn), fn.h += e, fn.s += t, fn.l += n, this.setHSL(fn.h, fn.s, fn.l), this
    }
    add(e) {
        return this.r += e.r, this.g += e.g, this.b += e.b, this
    }
    addColors(e, t) {
        return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this
    }
    addScalar(e) {
        return this.r += e, this.g += e, this.b += e, this
    }
    sub(e) {
        return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this
    }
    multiply(e) {
        return this.r *= e.r, this.g *= e.g, this.b *= e.b, this
    }
    multiplyScalar(e) {
        return this.r *= e, this.g *= e, this.b *= e, this
    }
    lerp(e, t) {
        return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this
    }
    lerpColors(e, t, n) {
        return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this
    }
    lerpHSL(e, t) {
        this.getHSL(fn), e.getHSL(ta);
        const n = vr(fn.h, ta.h, t),
            i = vr(fn.s, ta.s, t),
            r = vr(fn.l, ta.l, t);
        return this.setHSL(n, i, r), this
    }
    equals(e) {
        return e.r === this.r && e.g === this.g && e.b === this.b
    }
    fromArray(e, t = 0) {
        return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this
    }
    toArray(e = [], t = 0) {
        return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e
    }
    fromBufferAttribute(e, t) {
        return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this
    }
    toJSON() {
        return this.getHex()
    }*[Symbol.iterator]() {
        yield this.r, yield this.g, yield this.b
    }
}
const bt = new pe;
pe.NAMES = Zu;
class Li extends ln {
    constructor(e) {
        super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new pe(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = ku, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this
    }
}
const ot = new M,
    na = new ve;
class $e {
    constructor(e, t, n = !1) {
        if (Array.isArray(e)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
        this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = ll, this.updateRange = {
            offset: 0,
            count: -1
        }, this.version = 0
    }
    onUploadCallback() {}
    set needsUpdate(e) {
        e === !0 && this.version++
    }
    setUsage(e) {
        return this.usage = e, this
    }
    copy(e) {
        return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this
    }
    copyAt(e, t, n) {
        e *= this.itemSize, n *= t.itemSize;
        for (let i = 0, r = this.itemSize; i < r; i++) this.array[e + i] = t.array[n + i];
        return this
    }
    copyArray(e) {
        return this.array.set(e), this
    }
    applyMatrix3(e) {
        if (this.itemSize === 2)
            for (let t = 0, n = this.count; t < n; t++) na.fromBufferAttribute(this, t), na.applyMatrix3(e), this.setXY(t, na.x, na.y);
        else if (this.itemSize === 3)
            for (let t = 0, n = this.count; t < n; t++) ot.fromBufferAttribute(this, t), ot.applyMatrix3(e), this.setXYZ(t, ot.x, ot.y, ot.z);
        return this
    }
    applyMatrix4(e) {
        for (let t = 0, n = this.count; t < n; t++) ot.fromBufferAttribute(this, t), ot.applyMatrix4(e), this.setXYZ(t, ot.x, ot.y, ot.z);
        return this
    }
    applyNormalMatrix(e) {
        for (let t = 0, n = this.count; t < n; t++) ot.fromBufferAttribute(this, t), ot.applyNormalMatrix(e), this.setXYZ(t, ot.x, ot.y, ot.z);
        return this
    }
    transformDirection(e) {
        for (let t = 0, n = this.count; t < n; t++) ot.fromBufferAttribute(this, t), ot.transformDirection(e), this.setXYZ(t, ot.x, ot.y, ot.z);
        return this
    }
    set(e, t = 0) {
        return this.array.set(e, t), this
    }
    getX(e) {
        let t = this.array[e * this.itemSize];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    setX(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.array[e * this.itemSize] = t, this
    }
    getY(e) {
        let t = this.array[e * this.itemSize + 1];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    setY(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.array[e * this.itemSize + 1] = t, this
    }
    getZ(e) {
        let t = this.array[e * this.itemSize + 2];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    setZ(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.array[e * this.itemSize + 2] = t, this
    }
    getW(e) {
        let t = this.array[e * this.itemSize + 3];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    setW(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.array[e * this.itemSize + 3] = t, this
    }
    setXY(e, t, n) {
        return e *= this.itemSize, this.normalized && (t = qe(t, this.array), n = qe(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this
    }
    setXYZ(e, t, n, i) {
        return e *= this.itemSize, this.normalized && (t = qe(t, this.array), n = qe(n, this.array), i = qe(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this
    }
    setXYZW(e, t, n, i, r) {
        return e *= this.itemSize, this.normalized && (t = qe(t, this.array), n = qe(n, this.array), i = qe(i, this.array), r = qe(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this
    }
    onUpload(e) {
        return this.onUploadCallback = e, this
    }
    clone() {
        return new this.constructor(this.array, this.itemSize).copy(this)
    }
    toJSON() {
        const e = {
            itemSize: this.itemSize,
            type: this.array.constructor.name,
            array: Array.from(this.array),
            normalized: this.normalized
        };
        return this.name !== "" && (e.name = this.name), this.usage !== ll && (e.usage = this.usage), (this.updateRange.offset !== 0 || this.updateRange.count !== -1) && (e.updateRange = this.updateRange), e
    }
    copyColorsArray() {
        console.error("THREE.BufferAttribute: copyColorsArray() was removed in r144.")
    }
    copyVector2sArray() {
        console.error("THREE.BufferAttribute: copyVector2sArray() was removed in r144.")
    }
    copyVector3sArray() {
        console.error("THREE.BufferAttribute: copyVector3sArray() was removed in r144.")
    }
    copyVector4sArray() {
        console.error("THREE.BufferAttribute: copyVector4sArray() was removed in r144.")
    }
}
class Ju extends $e {
    constructor(e, t, n) {
        super(new Uint16Array(e), t, n)
    }
}
class Qu extends $e {
    constructor(e, t, n) {
        super(new Uint32Array(e), t, n)
    }
}
class jn extends $e {
    constructor(e, t, n) {
        super(new Float32Array(e), t, n)
    }
}
let vm = 0;
const tn = new Te,
    Do = new Ye,
    as = new M,
    Zt = new Rn,
    tr = new Rn,
    mt = new M;
class jt extends ji {
    constructor() {
        super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
            value: vm++
        }), this.uuid = xn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
            start: 0,
            count: 1 / 0
        }, this.userData = {}
    }
    getIndex() {
        return this.index
    }
    setIndex(e) {
        return Array.isArray(e) ? this.index = new(ju(e) ? Qu : Ju)(e, 1) : this.index = e, this
    }
    getAttribute(e) {
        return this.attributes[e]
    }
    setAttribute(e, t) {
        return this.attributes[e] = t, this
    }
    deleteAttribute(e) {
        return delete this.attributes[e], this
    }
    hasAttribute(e) {
        return this.attributes[e] !== void 0
    }
    addGroup(e, t, n = 0) {
        this.groups.push({
            start: e,
            count: t,
            materialIndex: n
        })
    }
    clearGroups() {
        this.groups = []
    }
    setDrawRange(e, t) {
        this.drawRange.start = e, this.drawRange.count = t
    }
    applyMatrix4(e) {
        const t = this.attributes.position;
        t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
        const n = this.attributes.normal;
        if (n !== void 0) {
            const r = new Ft().getNormalMatrix(e);
            n.applyNormalMatrix(r), n.needsUpdate = !0
        }
        const i = this.attributes.tangent;
        return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this
    }
    applyQuaternion(e) {
        return tn.makeRotationFromQuaternion(e), this.applyMatrix4(tn), this
    }
    rotateX(e) {
        return tn.makeRotationX(e), this.applyMatrix4(tn), this
    }
    rotateY(e) {
        return tn.makeRotationY(e), this.applyMatrix4(tn), this
    }
    rotateZ(e) {
        return tn.makeRotationZ(e), this.applyMatrix4(tn), this
    }
    translate(e, t, n) {
        return tn.makeTranslation(e, t, n), this.applyMatrix4(tn), this
    }
    scale(e, t, n) {
        return tn.makeScale(e, t, n), this.applyMatrix4(tn), this
    }
    lookAt(e) {
        return Do.lookAt(e), Do.updateMatrix(), this.applyMatrix4(Do.matrix), this
    }
    center() {
        return this.computeBoundingBox(), this.boundingBox.getCenter(as).negate(), this.translate(as.x, as.y, as.z), this
    }
    setFromPoints(e) {
        const t = [];
        for (let n = 0, i = e.length; n < i; n++) {
            const r = e[n];
            t.push(r.x, r.y, r.z || 0)
        }
        return this.setAttribute("position", new jn(t, 3)), this
    }
    computeBoundingBox() {
        this.boundingBox === null && (this.boundingBox = new Rn);
        const e = this.attributes.position,
            t = this.morphAttributes.position;
        if (e && e.isGLBufferAttribute) {
            console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".', this), this.boundingBox.set(new M(-1 / 0, -1 / 0, -1 / 0), new M(1 / 0, 1 / 0, 1 / 0));
            return
        }
        if (e !== void 0) {
            if (this.boundingBox.setFromBufferAttribute(e), t)
                for (let n = 0, i = t.length; n < i; n++) {
                    const r = t[n];
                    Zt.setFromBufferAttribute(r), this.morphTargetsRelative ? (mt.addVectors(this.boundingBox.min, Zt.min), this.boundingBox.expandByPoint(mt), mt.addVectors(this.boundingBox.max, Zt.max), this.boundingBox.expandByPoint(mt)) : (this.boundingBox.expandByPoint(Zt.min), this.boundingBox.expandByPoint(Zt.max))
                }
        } else this.boundingBox.makeEmpty();
        (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this)
    }
    computeBoundingSphere() {
        this.boundingSphere === null && (this.boundingSphere = new Ws);
        const e = this.attributes.position,
            t = this.morphAttributes.position;
        if (e && e.isGLBufferAttribute) {
            console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this), this.boundingSphere.set(new M, 1 / 0);
            return
        }
        if (e) {
            const n = this.boundingSphere.center;
            if (Zt.setFromBufferAttribute(e), t)
                for (let r = 0, a = t.length; r < a; r++) {
                    const o = t[r];
                    tr.setFromBufferAttribute(o), this.morphTargetsRelative ? (mt.addVectors(Zt.min, tr.min), Zt.expandByPoint(mt), mt.addVectors(Zt.max, tr.max), Zt.expandByPoint(mt)) : (Zt.expandByPoint(tr.min), Zt.expandByPoint(tr.max))
                }
            Zt.getCenter(n);
            let i = 0;
            for (let r = 0, a = e.count; r < a; r++) mt.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(mt));
            if (t)
                for (let r = 0, a = t.length; r < a; r++) {
                    const o = t[r],
                        l = this.morphTargetsRelative;
                    for (let c = 0, h = o.count; c < h; c++) mt.fromBufferAttribute(o, c), l && (as.fromBufferAttribute(e, c), mt.add(as)), i = Math.max(i, n.distanceToSquared(mt))
                }
            this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this)
        }
    }
    computeTangents() {
        const e = this.index,
            t = this.attributes;
        if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
            console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
            return
        }
        const n = e.array,
            i = t.position.array,
            r = t.normal.array,
            a = t.uv.array,
            o = i.length / 3;
        this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new $e(new Float32Array(4 * o), 4));
        const l = this.getAttribute("tangent").array,
            c = [],
            h = [];
        for (let P = 0; P < o; P++) c[P] = new M, h[P] = new M;
        const u = new M,
            d = new M,
            f = new M,
            g = new ve,
            m = new ve,
            p = new ve,
            _ = new M,
            E = new M;

        function y(P, q, X) {
            u.fromArray(i, P * 3), d.fromArray(i, q * 3), f.fromArray(i, X * 3), g.fromArray(a, P * 2), m.fromArray(a, q * 2), p.fromArray(a, X * 2), d.sub(u), f.sub(u), m.sub(g), p.sub(g);
            const F = 1 / (m.x * p.y - p.x * m.y);
            isFinite(F) && (_.copy(d).multiplyScalar(p.y).addScaledVector(f, -m.y).multiplyScalar(F), E.copy(f).multiplyScalar(m.x).addScaledVector(d, -p.x).multiplyScalar(F), c[P].add(_), c[q].add(_), c[X].add(_), h[P].add(E), h[q].add(E), h[X].add(E))
        }
        let S = this.groups;
        S.length === 0 && (S = [{
            start: 0,
            count: n.length
        }]);
        for (let P = 0, q = S.length; P < q; ++P) {
            const X = S[P],
                F = X.start,
                D = X.count;
            for (let U = F, j = F + D; U < j; U += 3) y(n[U + 0], n[U + 1], n[U + 2])
        }
        const T = new M,
            L = new M,
            I = new M,
            v = new M;

        function A(P) {
            I.fromArray(r, P * 3), v.copy(I);
            const q = c[P];
            T.copy(q), T.sub(I.multiplyScalar(I.dot(q))).normalize(), L.crossVectors(v, q);
            const F = L.dot(h[P]) < 0 ? -1 : 1;
            l[P * 4] = T.x, l[P * 4 + 1] = T.y, l[P * 4 + 2] = T.z, l[P * 4 + 3] = F
        }
        for (let P = 0, q = S.length; P < q; ++P) {
            const X = S[P],
                F = X.start,
                D = X.count;
            for (let U = F, j = F + D; U < j; U += 3) A(n[U + 0]), A(n[U + 1]), A(n[U + 2])
        }
    }
    computeVertexNormals() {
        const e = this.index,
            t = this.getAttribute("position");
        if (t !== void 0) {
            let n = this.getAttribute("normal");
            if (n === void 0) n = new $e(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
            else
                for (let d = 0, f = n.count; d < f; d++) n.setXYZ(d, 0, 0, 0);
            const i = new M,
                r = new M,
                a = new M,
                o = new M,
                l = new M,
                c = new M,
                h = new M,
                u = new M;
            if (e)
                for (let d = 0, f = e.count; d < f; d += 3) {
                    const g = e.getX(d + 0),
                        m = e.getX(d + 1),
                        p = e.getX(d + 2);
                    i.fromBufferAttribute(t, g), r.fromBufferAttribute(t, m), a.fromBufferAttribute(t, p), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), o.fromBufferAttribute(n, g), l.fromBufferAttribute(n, m), c.fromBufferAttribute(n, p), o.add(h), l.add(h), c.add(h), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(m, l.x, l.y, l.z), n.setXYZ(p, c.x, c.y, c.z)
                } else
                    for (let d = 0, f = t.count; d < f; d += 3) i.fromBufferAttribute(t, d + 0), r.fromBufferAttribute(t, d + 1), a.fromBufferAttribute(t, d + 2), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
            this.normalizeNormals(), n.needsUpdate = !0
        }
    }
    merge() {
        return console.error("THREE.BufferGeometry.merge() has been removed. Use THREE.BufferGeometryUtils.mergeBufferGeometries() instead."), this
    }
    normalizeNormals() {
        const e = this.attributes.normal;
        for (let t = 0, n = e.count; t < n; t++) mt.fromBufferAttribute(e, t), mt.normalize(), e.setXYZ(t, mt.x, mt.y, mt.z)
    }
    toNonIndexed() {
        function e(o, l) {
            const c = o.array,
                h = o.itemSize,
                u = o.normalized,
                d = new c.constructor(l.length * h);
            let f = 0,
                g = 0;
            for (let m = 0, p = l.length; m < p; m++) {
                o.isInterleavedBufferAttribute ? f = l[m] * o.data.stride + o.offset : f = l[m] * h;
                for (let _ = 0; _ < h; _++) d[g++] = c[f++]
            }
            return new $e(d, h, u)
        }
        if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
        const t = new jt,
            n = this.index.array,
            i = this.attributes;
        for (const o in i) {
            const l = i[o],
                c = e(l, n);
            t.setAttribute(o, c)
        }
        const r = this.morphAttributes;
        for (const o in r) {
            const l = [],
                c = r[o];
            for (let h = 0, u = c.length; h < u; h++) {
                const d = c[h],
                    f = e(d, n);
                l.push(f)
            }
            t.morphAttributes[o] = l
        }
        t.morphTargetsRelative = this.morphTargetsRelative;
        const a = this.groups;
        for (let o = 0, l = a.length; o < l; o++) {
            const c = a[o];
            t.addGroup(c.start, c.count, c.materialIndex)
        }
        return t
    }
    toJSON() {
        const e = {
            metadata: {
                version: 4.5,
                type: "BufferGeometry",
                generator: "BufferGeometry.toJSON"
            }
        };
        if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
            const l = this.parameters;
            for (const c in l) l[c] !== void 0 && (e[c] = l[c]);
            return e
        }
        e.data = {
            attributes: {}
        };
        const t = this.index;
        t !== null && (e.data.index = {
            type: t.array.constructor.name,
            array: Array.prototype.slice.call(t.array)
        });
        const n = this.attributes;
        for (const l in n) {
            const c = n[l];
            e.data.attributes[l] = c.toJSON(e.data)
        }
        const i = {};
        let r = !1;
        for (const l in this.morphAttributes) {
            const c = this.morphAttributes[l],
                h = [];
            for (let u = 0, d = c.length; u < d; u++) {
                const f = c[u];
                h.push(f.toJSON(e.data))
            }
            h.length > 0 && (i[l] = h, r = !0)
        }
        r && (e.data.morphAttributes = i, e.data.morphTargetsRelative = this.morphTargetsRelative);
        const a = this.groups;
        a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
        const o = this.boundingSphere;
        return o !== null && (e.data.boundingSphere = {
            center: o.center.toArray(),
            radius: o.radius
        }), e
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
        const t = {};
        this.name = e.name;
        const n = e.index;
        n !== null && this.setIndex(n.clone(t));
        const i = e.attributes;
        for (const c in i) {
            const h = i[c];
            this.setAttribute(c, h.clone(t))
        }
        const r = e.morphAttributes;
        for (const c in r) {
            const h = [],
                u = r[c];
            for (let d = 0, f = u.length; d < f; d++) h.push(u[d].clone(t));
            this.morphAttributes[c] = h
        }
        this.morphTargetsRelative = e.morphTargetsRelative;
        const a = e.groups;
        for (let c = 0, h = a.length; c < h; c++) {
            const u = a[c];
            this.addGroup(u.start, u.count, u.materialIndex)
        }
        const o = e.boundingBox;
        o !== null && (this.boundingBox = o.clone());
        const l = e.boundingSphere;
        return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
const xh = new Te,
    Mn = new qa,
    ia = new Ws,
    yh = new M,
    nr = new M,
    ir = new M,
    sr = new M,
    Po = new M,
    sa = new M,
    ra = new ve,
    aa = new ve,
    oa = new ve,
    No = new M,
    la = new M;
class ct extends Ye {
    constructor(e = new jt, t = new Li) {
        super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.updateMorphTargets()
    }
    copy(e, t) {
        return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = e.material, this.geometry = e.geometry, this
    }
    updateMorphTargets() {
        const t = this.geometry.morphAttributes,
            n = Object.keys(t);
        if (n.length > 0) {
            const i = t[n[0]];
            if (i !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let r = 0, a = i.length; r < a; r++) {
                    const o = i[r].name || String(r);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
                }
            }
        }
    }
    getVertexPosition(e, t) {
        const n = this.geometry,
            i = n.attributes.position,
            r = n.morphAttributes.position,
            a = n.morphTargetsRelative;
        t.fromBufferAttribute(i, e);
        const o = this.morphTargetInfluences;
        if (r && o) {
            sa.set(0, 0, 0);
            for (let l = 0, c = r.length; l < c; l++) {
                const h = o[l],
                    u = r[l];
                h !== 0 && (Po.fromBufferAttribute(u, e), a ? sa.addScaledVector(Po, h) : sa.addScaledVector(Po.sub(t), h))
            }
            t.add(sa)
        }
        return this.isSkinnedMesh && this.boneTransform(e, t), t
    }
    raycast(e, t) {
        const n = this.geometry,
            i = this.material,
            r = this.matrixWorld;
        if (i === void 0 || (n.boundingSphere === null && n.computeBoundingSphere(), ia.copy(n.boundingSphere), ia.applyMatrix4(r), Mn.copy(e.ray).recast(e.near), ia.containsPoint(Mn.origin) === !1 && (Mn.intersectSphere(ia, yh) === null || Mn.origin.distanceToSquared(yh) > (e.far - e.near) ** 2)) || (xh.copy(r).invert(), Mn.copy(e.ray).applyMatrix4(xh), n.boundingBox !== null && Mn.intersectsBox(n.boundingBox) === !1)) return;
        let a;
        const o = n.index,
            l = n.attributes.position,
            c = n.attributes.uv,
            h = n.attributes.uv2,
            u = n.groups,
            d = n.drawRange;
        if (o !== null)
            if (Array.isArray(i))
                for (let f = 0, g = u.length; f < g; f++) {
                    const m = u[f],
                        p = i[m.materialIndex],
                        _ = Math.max(m.start, d.start),
                        E = Math.min(o.count, Math.min(m.start + m.count, d.start + d.count));
                    for (let y = _, S = E; y < S; y += 3) {
                        const T = o.getX(y),
                            L = o.getX(y + 1),
                            I = o.getX(y + 2);
                        a = ca(this, p, e, Mn, c, h, T, L, I), a && (a.faceIndex = Math.floor(y / 3), a.face.materialIndex = m.materialIndex, t.push(a))
                    }
                } else {
                    const f = Math.max(0, d.start),
                        g = Math.min(o.count, d.start + d.count);
                    for (let m = f, p = g; m < p; m += 3) {
                        const _ = o.getX(m),
                            E = o.getX(m + 1),
                            y = o.getX(m + 2);
                        a = ca(this, i, e, Mn, c, h, _, E, y), a && (a.faceIndex = Math.floor(m / 3), t.push(a))
                    }
                } else if (l !== void 0)
                    if (Array.isArray(i))
                        for (let f = 0, g = u.length; f < g; f++) {
                            const m = u[f],
                                p = i[m.materialIndex],
                                _ = Math.max(m.start, d.start),
                                E = Math.min(l.count, Math.min(m.start + m.count, d.start + d.count));
                            for (let y = _, S = E; y < S; y += 3) {
                                const T = y,
                                    L = y + 1,
                                    I = y + 2;
                                a = ca(this, p, e, Mn, c, h, T, L, I), a && (a.faceIndex = Math.floor(y / 3), a.face.materialIndex = m.materialIndex, t.push(a))
                            }
                        } else {
                            const f = Math.max(0, d.start),
                                g = Math.min(l.count, d.start + d.count);
                            for (let m = f, p = g; m < p; m += 3) {
                                const _ = m,
                                    E = m + 1,
                                    y = m + 2;
                                a = ca(this, i, e, Mn, c, h, _, E, y), a && (a.faceIndex = Math.floor(m / 3), t.push(a))
                            }
                        }
    }
}

function Sm(s, e, t, n, i, r, a, o) {
    let l;
    if (e.side === Qt ? l = n.intersectTriangle(a, r, i, !0, o) : l = n.intersectTriangle(i, r, a, e.side === $n, o), l === null) return null;
    la.copy(o), la.applyMatrix4(s.matrixWorld);
    const c = t.ray.origin.distanceTo(la);
    return c < t.near || c > t.far ? null : {
        distance: c,
        point: la.clone(),
        object: s
    }
}

function ca(s, e, t, n, i, r, a, o, l) {
    s.getVertexPosition(a, nr), s.getVertexPosition(o, ir), s.getVertexPosition(l, sr);
    const c = Sm(s, e, t, n, nr, ir, sr, No);
    if (c) {
        i && (ra.fromBufferAttribute(i, a), aa.fromBufferAttribute(i, o), oa.fromBufferAttribute(i, l), c.uv = An.getUV(No, nr, ir, sr, ra, aa, oa, new ve)), r && (ra.fromBufferAttribute(r, a), aa.fromBufferAttribute(r, o), oa.fromBufferAttribute(r, l), c.uv2 = An.getUV(No, nr, ir, sr, ra, aa, oa, new ve));
        const h = {
            a,
            b: o,
            c: l,
            normal: new M,
            materialIndex: 0
        };
        An.getNormal(nr, ir, sr, h.normal), c.face = h
    }
    return c
}
class Yi extends jt {
    constructor(e = 1, t = 1, n = 1, i = 1, r = 1, a = 1) {
        super(), this.type = "BoxGeometry", this.parameters = {
            width: e,
            height: t,
            depth: n,
            widthSegments: i,
            heightSegments: r,
            depthSegments: a
        };
        const o = this;
        i = Math.floor(i), r = Math.floor(r), a = Math.floor(a);
        const l = [],
            c = [],
            h = [],
            u = [];
        let d = 0,
            f = 0;
        g("z", "y", "x", -1, -1, n, t, e, a, r, 0), g("z", "y", "x", 1, -1, n, t, -e, a, r, 1), g("x", "z", "y", 1, 1, e, n, t, i, a, 2), g("x", "z", "y", 1, -1, e, n, -t, i, a, 3), g("x", "y", "z", 1, -1, e, t, n, i, r, 4), g("x", "y", "z", -1, -1, e, t, -n, i, r, 5), this.setIndex(l), this.setAttribute("position", new jn(c, 3)), this.setAttribute("normal", new jn(h, 3)), this.setAttribute("uv", new jn(u, 2));

        function g(m, p, _, E, y, S, T, L, I, v, A) {
            const P = S / I,
                q = T / v,
                X = S / 2,
                F = T / 2,
                D = L / 2,
                U = I + 1,
                j = v + 1;
            let Z = 0,
                H = 0;
            const J = new M;
            for (let Y = 0; Y < j; Y++) {
                const ge = Y * q - F;
                for (let k = 0; k < U; k++) {
                    const K = k * P - X;
                    J[m] = K * E, J[p] = ge * y, J[_] = D, c.push(J.x, J.y, J.z), J[m] = 0, J[p] = 0, J[_] = L > 0 ? 1 : -1, h.push(J.x, J.y, J.z), u.push(k / I), u.push(1 - Y / v), Z += 1
                }
            }
            for (let Y = 0; Y < v; Y++)
                for (let ge = 0; ge < I; ge++) {
                    const k = d + ge + U * Y,
                        K = d + ge + U * (Y + 1),
                        ne = d + (ge + 1) + U * (Y + 1),
                        B = d + (ge + 1) + U * Y;
                    l.push(k, K, B), l.push(K, ne, B), H += 6
                }
            o.addGroup(f, H, A), f += H, d += Z
        }
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new Yi(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments)
    }
}

function Us(s) {
    const e = {};
    for (const t in s) {
        e[t] = {};
        for (const n in s[t]) {
            const i = s[t][n];
            i && (i.isColor || i.isMatrix3 || i.isMatrix4 || i.isVector2 || i.isVector3 || i.isVector4 || i.isTexture || i.isQuaternion) ? e[t][n] = i.clone() : Array.isArray(i) ? e[t][n] = i.slice() : e[t][n] = i
        }
    }
    return e
}

function Pt(s) {
    const e = {};
    for (let t = 0; t < s.length; t++) {
        const n = Us(s[t]);
        for (const i in n) e[i] = n[i]
    }
    return e
}

function wm(s) {
    const e = [];
    for (let t = 0; t < s.length; t++) e.push(s[t].clone());
    return e
}

function ed(s) {
    return s.getRenderTarget() === null && s.outputEncoding === Be ? En : Ar
}
const Mm = {
    clone: Us,
    merge: Pt
};
var bm = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
    Em = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class yt extends ln {
    constructor(e) {
        super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = bm, this.fragmentShader = Em, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.extensions = {
            derivatives: !1,
            fragDepth: !1,
            drawBuffers: !1,
            shaderTextureLOD: !1
        }, this.defaultAttributeValues = {
            color: [1, 1, 1],
            uv: [0, 0],
            uv2: [0, 0]
        }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Us(e.uniforms), this.uniformsGroups = wm(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        t.glslVersion = this.glslVersion, t.uniforms = {};
        for (const i in this.uniforms) {
            const a = this.uniforms[i].value;
            a && a.isTexture ? t.uniforms[i] = {
                type: "t",
                value: a.toJSON(e).uuid
            } : a && a.isColor ? t.uniforms[i] = {
                type: "c",
                value: a.getHex()
            } : a && a.isVector2 ? t.uniforms[i] = {
                type: "v2",
                value: a.toArray()
            } : a && a.isVector3 ? t.uniforms[i] = {
                type: "v3",
                value: a.toArray()
            } : a && a.isVector4 ? t.uniforms[i] = {
                type: "v4",
                value: a.toArray()
            } : a && a.isMatrix3 ? t.uniforms[i] = {
                type: "m3",
                value: a.toArray()
            } : a && a.isMatrix4 ? t.uniforms[i] = {
                type: "m4",
                value: a.toArray()
            } : t.uniforms[i] = {
                value: a
            }
        }
        Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader;
        const n = {};
        for (const i in this.extensions) this.extensions[i] === !0 && (n[i] = !0);
        return Object.keys(n).length > 0 && (t.extensions = n), t
    }
}
class td extends Ye {
    constructor() {
        super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Te, this.projectionMatrix = new Te, this.projectionMatrixInverse = new Te
    }
    copy(e, t) {
        return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this
    }
    getWorldDirection(e) {
        this.updateWorldMatrix(!0, !1);
        const t = this.matrixWorld.elements;
        return e.set(-t[8], -t[9], -t[10]).normalize()
    }
    updateMatrixWorld(e) {
        super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert()
    }
    updateWorldMatrix(e, t) {
        super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert()
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
class Bt extends td {
    constructor(e = 50, t = 1, n = .1, i = 2e3) {
        super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix()
    }
    copy(e, t) {
        return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this
    }
    setFocalLength(e) {
        const t = .5 * this.getFilmHeight() / e;
        this.fov = Cr * 2 * Math.atan(t), this.updateProjectionMatrix()
    }
    getFocalLength() {
        const e = Math.tan(yr * .5 * this.fov);
        return .5 * this.getFilmHeight() / e
    }
    getEffectiveFOV() {
        return Cr * 2 * Math.atan(Math.tan(yr * .5 * this.fov) / this.zoom)
    }
    getFilmWidth() {
        return this.filmGauge * Math.min(this.aspect, 1)
    }
    getFilmHeight() {
        return this.filmGauge / Math.max(this.aspect, 1)
    }
    setViewOffset(e, t, n, i, r, a) {
        this.aspect = e / t, this.view === null && (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = a, this.updateProjectionMatrix()
    }
    clearViewOffset() {
        this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix()
    }
    updateProjectionMatrix() {
        const e = this.near;
        let t = e * Math.tan(yr * .5 * this.fov) / this.zoom,
            n = 2 * t,
            i = this.aspect * n,
            r = -.5 * i;
        const a = this.view;
        if (this.view !== null && this.view.enabled) {
            const l = a.fullWidth,
                c = a.fullHeight;
            r += a.offsetX * i / l, t -= a.offsetY * n / c, i *= a.width / l, n *= a.height / c
        }
        const o = this.filmOffset;
        o !== 0 && (r += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + i, t, t - n, e, this.far), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t
    }
}
const os = -90,
    ls = 1;
class Tm extends Ye {
    constructor(e, t, n) {
        super(), this.type = "CubeCamera", this.renderTarget = n;
        const i = new Bt(os, ls, e, t);
        i.layers = this.layers, i.up.set(0, 1, 0), i.lookAt(1, 0, 0), this.add(i);
        const r = new Bt(os, ls, e, t);
        r.layers = this.layers, r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), this.add(r);
        const a = new Bt(os, ls, e, t);
        a.layers = this.layers, a.up.set(0, 0, -1), a.lookAt(0, 1, 0), this.add(a);
        const o = new Bt(os, ls, e, t);
        o.layers = this.layers, o.up.set(0, 0, 1), o.lookAt(0, -1, 0), this.add(o);
        const l = new Bt(os, ls, e, t);
        l.layers = this.layers, l.up.set(0, 1, 0), l.lookAt(0, 0, 1), this.add(l);
        const c = new Bt(os, ls, e, t);
        c.layers = this.layers, c.up.set(0, 1, 0), c.lookAt(0, 0, -1), this.add(c)
    }
    update(e, t) {
        this.parent === null && this.updateMatrixWorld();
        const n = this.renderTarget,
            [i, r, a, o, l, c] = this.children,
            h = e.getRenderTarget(),
            u = e.toneMapping,
            d = e.xr.enabled;
        e.toneMapping = qn, e.xr.enabled = !1;
        const f = n.texture.generateMipmaps;
        n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0), e.render(t, i), e.setRenderTarget(n, 1), e.render(t, r), e.setRenderTarget(n, 2), e.render(t, a), e.setRenderTarget(n, 3), e.render(t, o), e.setRenderTarget(n, 4), e.render(t, l), n.texture.generateMipmaps = f, e.setRenderTarget(n, 5), e.render(t, c), e.setRenderTarget(h), e.toneMapping = u, e.xr.enabled = d, n.texture.needsPMREMUpdate = !0
    }
}
class nd extends wt {
    constructor(e, t, n, i, r, a, o, l, c, h) {
        e = e !== void 0 ? e : [], t = t !== void 0 ? t : Ns, super(e, t, n, i, r, a, o, l, c, h), this.isCubeTexture = !0, this.flipY = !1
    }
    get images() {
        return this.image
    }
    set images(e) {
        this.image = e
    }
}
class Am extends Ui {
    constructor(e = 1, t = {}) {
        super(e, e, t), this.isWebGLCubeRenderTarget = !0;
        const n = {
                width: e,
                height: e,
                depth: 1
            },
            i = [n, n, n, n, n, n];
        this.texture = new nd(i, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.encoding), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : Gt
    }
    fromEquirectangularTexture(e, t) {
        this.texture.type = t.type, this.texture.encoding = t.encoding, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
        const n = {
                uniforms: {
                    tEquirect: {
                        value: null
                    }
                },
                vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
                fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
            },
            i = new Yi(5, 5, 5),
            r = new yt({
                name: "CubemapFromEquirect",
                uniforms: Us(n.uniforms),
                vertexShader: n.vertexShader,
                fragmentShader: n.fragmentShader,
                side: Qt,
                blending: hi
            });
        r.uniforms.tEquirect.value = t;
        const a = new ct(i, r),
            o = t.minFilter;
        return t.minFilter === Fi && (t.minFilter = Gt), new Tm(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this
    }
    clear(e, t, n, i) {
        const r = e.getRenderTarget();
        for (let a = 0; a < 6; a++) e.setRenderTarget(this, a), e.clear(t, n, i);
        e.setRenderTarget(r)
    }
}
const Bo = new M,
    Cm = new M,
    Lm = new Ft;
class Ei {
    constructor(e = new M(1, 0, 0), t = 0) {
        this.isPlane = !0, this.normal = e, this.constant = t
    }
    set(e, t) {
        return this.normal.copy(e), this.constant = t, this
    }
    setComponents(e, t, n, i) {
        return this.normal.set(e, t, n), this.constant = i, this
    }
    setFromNormalAndCoplanarPoint(e, t) {
        return this.normal.copy(e), this.constant = -t.dot(this.normal), this
    }
    setFromCoplanarPoints(e, t, n) {
        const i = Bo.subVectors(n, t).cross(Cm.subVectors(e, t)).normalize();
        return this.setFromNormalAndCoplanarPoint(i, e), this
    }
    copy(e) {
        return this.normal.copy(e.normal), this.constant = e.constant, this
    }
    normalize() {
        const e = 1 / this.normal.length();
        return this.normal.multiplyScalar(e), this.constant *= e, this
    }
    negate() {
        return this.constant *= -1, this.normal.negate(), this
    }
    distanceToPoint(e) {
        return this.normal.dot(e) + this.constant
    }
    distanceToSphere(e) {
        return this.distanceToPoint(e.center) - e.radius
    }
    projectPoint(e, t) {
        return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e))
    }
    intersectLine(e, t) {
        const n = e.delta(Bo),
            i = this.normal.dot(n);
        if (i === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
        const r = -(e.start.dot(this.normal) + this.constant) / i;
        return r < 0 || r > 1 ? null : t.copy(e.start).addScaledVector(n, r)
    }
    intersectsLine(e) {
        const t = this.distanceToPoint(e.start),
            n = this.distanceToPoint(e.end);
        return t < 0 && n > 0 || n < 0 && t > 0
    }
    intersectsBox(e) {
        return e.intersectsPlane(this)
    }
    intersectsSphere(e) {
        return e.intersectsPlane(this)
    }
    coplanarPoint(e) {
        return e.copy(this.normal).multiplyScalar(-this.constant)
    }
    applyMatrix4(e, t) {
        const n = t || Lm.getNormalMatrix(e),
            i = this.coplanarPoint(Bo).applyMatrix4(e),
            r = this.normal.applyMatrix3(n).normalize();
        return this.constant = -i.dot(r), this
    }
    translate(e) {
        return this.constant -= e.dot(this.normal), this
    }
    equals(e) {
        return e.normal.equals(this.normal) && e.constant === this.constant
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
const cs = new Ws,
    ha = new M;
class $l {
    constructor(e = new Ei, t = new Ei, n = new Ei, i = new Ei, r = new Ei, a = new Ei) {
        this.planes = [e, t, n, i, r, a]
    }
    set(e, t, n, i, r, a) {
        const o = this.planes;
        return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(i), o[4].copy(r), o[5].copy(a), this
    }
    copy(e) {
        const t = this.planes;
        for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
        return this
    }
    setFromProjectionMatrix(e) {
        const t = this.planes,
            n = e.elements,
            i = n[0],
            r = n[1],
            a = n[2],
            o = n[3],
            l = n[4],
            c = n[5],
            h = n[6],
            u = n[7],
            d = n[8],
            f = n[9],
            g = n[10],
            m = n[11],
            p = n[12],
            _ = n[13],
            E = n[14],
            y = n[15];
        return t[0].setComponents(o - i, u - l, m - d, y - p).normalize(), t[1].setComponents(o + i, u + l, m + d, y + p).normalize(), t[2].setComponents(o + r, u + c, m + f, y + _).normalize(), t[3].setComponents(o - r, u - c, m - f, y - _).normalize(), t[4].setComponents(o - a, u - h, m - g, y - E).normalize(), t[5].setComponents(o + a, u + h, m + g, y + E).normalize(), this
    }
    intersectsObject(e) {
        const t = e.geometry;
        return t.boundingSphere === null && t.computeBoundingSphere(), cs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld), this.intersectsSphere(cs)
    }
    intersectsSprite(e) {
        return cs.center.set(0, 0, 0), cs.radius = .7071067811865476, cs.applyMatrix4(e.matrixWorld), this.intersectsSphere(cs)
    }
    intersectsSphere(e) {
        const t = this.planes,
            n = e.center,
            i = -e.radius;
        for (let r = 0; r < 6; r++)
            if (t[r].distanceToPoint(n) < i) return !1;
        return !0
    }
    intersectsBox(e) {
        const t = this.planes;
        for (let n = 0; n < 6; n++) {
            const i = t[n];
            if (ha.x = i.normal.x > 0 ? e.max.x : e.min.x, ha.y = i.normal.y > 0 ? e.max.y : e.min.y, ha.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(ha) < 0) return !1
        }
        return !0
    }
    containsPoint(e) {
        const t = this.planes;
        for (let n = 0; n < 6; n++)
            if (t[n].distanceToPoint(e) < 0) return !1;
        return !0
    }
    clone() {
        return new this.constructor().copy(this)
    }
}

function id() {
    let s = null,
        e = !1,
        t = null,
        n = null;

    function i(r, a) {
        t(r, a), n = s.requestAnimationFrame(i)
    }
    return {
        start: function() {
            e !== !0 && t !== null && (n = s.requestAnimationFrame(i), e = !0)
        },
        stop: function() {
            s.cancelAnimationFrame(n), e = !1
        },
        setAnimationLoop: function(r) {
            t = r
        },
        setContext: function(r) {
            s = r
        }
    }
}

function Im(s, e) {
    const t = e.isWebGL2,
        n = new WeakMap;

    function i(c, h) {
        const u = c.array,
            d = c.usage,
            f = s.createBuffer();
        s.bindBuffer(h, f), s.bufferData(h, u, d), c.onUploadCallback();
        let g;
        if (u instanceof Float32Array) g = 5126;
        else if (u instanceof Uint16Array)
            if (c.isFloat16BufferAttribute)
                if (t) g = 5131;
                else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");
        else g = 5123;
        else if (u instanceof Int16Array) g = 5122;
        else if (u instanceof Uint32Array) g = 5125;
        else if (u instanceof Int32Array) g = 5124;
        else if (u instanceof Int8Array) g = 5120;
        else if (u instanceof Uint8Array) g = 5121;
        else if (u instanceof Uint8ClampedArray) g = 5121;
        else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + u);
        return {
            buffer: f,
            type: g,
            bytesPerElement: u.BYTES_PER_ELEMENT,
            version: c.version
        }
    }

    function r(c, h, u) {
        const d = h.array,
            f = h.updateRange;
        s.bindBuffer(u, c), f.count === -1 ? s.bufferSubData(u, 0, d) : (t ? s.bufferSubData(u, f.offset * d.BYTES_PER_ELEMENT, d, f.offset, f.count) : s.bufferSubData(u, f.offset * d.BYTES_PER_ELEMENT, d.subarray(f.offset, f.offset + f.count)), f.count = -1), h.onUploadCallback()
    }

    function a(c) {
        return c.isInterleavedBufferAttribute && (c = c.data), n.get(c)
    }

    function o(c) {
        c.isInterleavedBufferAttribute && (c = c.data);
        const h = n.get(c);
        h && (s.deleteBuffer(h.buffer), n.delete(c))
    }

    function l(c, h) {
        if (c.isGLBufferAttribute) {
            const d = n.get(c);
            (!d || d.version < c.version) && n.set(c, {
                buffer: c.buffer,
                type: c.type,
                bytesPerElement: c.elementSize,
                version: c.version
            });
            return
        }
        c.isInterleavedBufferAttribute && (c = c.data);
        const u = n.get(c);
        u === void 0 ? n.set(c, i(c, h)) : u.version < c.version && (r(u.buffer, c, h), u.version = c.version)
    }
    return {
        get: a,
        remove: o,
        update: l
    }
}
class di extends jt {
    constructor(e = 1, t = 1, n = 1, i = 1) {
        super(), this.type = "PlaneGeometry", this.parameters = {
            width: e,
            height: t,
            widthSegments: n,
            heightSegments: i
        };
        const r = e / 2,
            a = t / 2,
            o = Math.floor(n),
            l = Math.floor(i),
            c = o + 1,
            h = l + 1,
            u = e / o,
            d = t / l,
            f = [],
            g = [],
            m = [],
            p = [];
        for (let _ = 0; _ < h; _++) {
            const E = _ * d - a;
            for (let y = 0; y < c; y++) {
                const S = y * u - r;
                g.push(S, -E, 0), m.push(0, 0, 1), p.push(y / o), p.push(1 - _ / l)
            }
        }
        for (let _ = 0; _ < l; _++)
            for (let E = 0; E < o; E++) {
                const y = E + c * _,
                    S = E + c * (_ + 1),
                    T = E + 1 + c * (_ + 1),
                    L = E + 1 + c * _;
                f.push(y, S, L), f.push(S, T, L)
            }
        this.setIndex(f), this.setAttribute("position", new jn(g, 3)), this.setAttribute("normal", new jn(m, 3)), this.setAttribute("uv", new jn(p, 2))
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new di(e.width, e.height, e.widthSegments, e.heightSegments)
    }
}
var Rm = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,
    Dm = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
    Pm = `#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,
    Nm = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
    Bm = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
    Fm = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
    km = "vec3 transformed = vec3( position );",
    Om = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
    Um = `vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
#ifdef USE_IRIDESCENCE
	vec3 BRDF_GGX_Iridescence( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float iridescence, const in vec3 iridescenceFresnel, const in float roughness ) {
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = mix( F_Schlick( f0, f90, dotVH ), iridescenceFresnel, iridescence );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif`,
    zm = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			 return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
    Gm = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = dFdx( surf_pos.xyz );
		vec3 vSigmaY = dFdy( surf_pos.xyz );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
    Vm = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,
    Hm = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
    Wm = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
    Xm = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
    qm = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
    jm = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
    Ym = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,
    $m = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,
    Km = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,
    Zm = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_v0 0.339
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_v1 0.276
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_v4 0.046
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_v5 0.016
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_v6 0.0038
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
    Jm = `vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
    Qm = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
    eg = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,
    tg = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
    ng = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
    ig = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
    sg = `vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
    rg = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
    ag = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
    og = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
    lg = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
    cg = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
    hg = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
    ug = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
    dg = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
    fg = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
    pg = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
    mg = `#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vUv2 );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,
    gg = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
    _g = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
    xg = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
    yg = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
    vg = `#if defined( USE_ENVMAP )
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,
    Sg = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
    wg = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
    Mg = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
    bg = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
    Eg = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULARINTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;
		#endif
		#ifdef USE_SPECULARCOLORMAP
			specularColorFactor *= texture2D( specularColorMap, vUv ).rgb;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEENCOLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEENROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;
	#endif
#endif`,
    Tg = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	#ifdef USE_IRIDESCENCE
		reflectedLight.directSpecular += irradiance * BRDF_GGX_Iridescence( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness );
	#else
		reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
    Ag = `
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometry.viewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
    Cg = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
    Lg = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,
    Ig = `#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
    Rg = `#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
    Dg = `#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,
    Pg = `#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,
    Ng = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
    Bg = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
    Fg = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
    kg = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
    Og = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
    Ug = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
    zg = `#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
    Gg = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,
    Vg = `#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,
    Hg = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,
    Wg = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,
    Xg = `#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
    qg = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
    jg = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
    Yg = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
    $g = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,
    Kg = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,
    Zg = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,
    Jg = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,
    Qg = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
    e0 = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
    t0 = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,
    n0 = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
    i0 = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
    s0 = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
    r0 = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
    a0 = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
    o0 = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
    l0 = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,
    c0 = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
    h0 = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
    u0 = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
    d0 = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
    f0 = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;
	mat4 getBoneMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}
#endif`,
    p0 = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
    m0 = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
    g0 = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
    _0 = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
    x0 = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
    y0 = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
    v0 = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmission.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
#endif`,
    S0 = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, vec2 fullSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		
		vec2 lodFudge = pow( 1.95, lod ) / fullSize;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec2 fullSize = vec2( textureSize( sampler, 0 ) );
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), fullSize, floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), fullSize, ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,
    w0 = `#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,
    M0 = `#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,
    b0 = `#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,
    E0 = `#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,
    T0 = `#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,
    A0 = `#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,
    C0 = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const L0 = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
    I0 = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
    R0 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
    D0 = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
    P0 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
    N0 = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
    B0 = `#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
    F0 = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,
    k0 = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
    O0 = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
    U0 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
    z0 = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
    G0 = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
    V0 = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
    H0 = `#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
    W0 = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    X0 = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    q0 = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    j0 = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
    Y0 = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    $0 = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
    K0 = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
    Z0 = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    J0 = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    Q0 = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
    e_ = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
		uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    t_ = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    n_ = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    i_ = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
    s_ = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
    r_ = `#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    a_ = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,
    o_ = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
    l_ = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,
    Ee = {
        alphamap_fragment: Rm,
        alphamap_pars_fragment: Dm,
        alphatest_fragment: Pm,
        alphatest_pars_fragment: Nm,
        aomap_fragment: Bm,
        aomap_pars_fragment: Fm,
        begin_vertex: km,
        beginnormal_vertex: Om,
        bsdfs: Um,
        iridescence_fragment: zm,
        bumpmap_pars_fragment: Gm,
        clipping_planes_fragment: Vm,
        clipping_planes_pars_fragment: Hm,
        clipping_planes_pars_vertex: Wm,
        clipping_planes_vertex: Xm,
        color_fragment: qm,
        color_pars_fragment: jm,
        color_pars_vertex: Ym,
        color_vertex: $m,
        common: Km,
        cube_uv_reflection_fragment: Zm,
        defaultnormal_vertex: Jm,
        displacementmap_pars_vertex: Qm,
        displacementmap_vertex: eg,
        emissivemap_fragment: tg,
        emissivemap_pars_fragment: ng,
        encodings_fragment: ig,
        encodings_pars_fragment: sg,
        envmap_fragment: rg,
        envmap_common_pars_fragment: ag,
        envmap_pars_fragment: og,
        envmap_pars_vertex: lg,
        envmap_physical_pars_fragment: vg,
        envmap_vertex: cg,
        fog_vertex: hg,
        fog_pars_vertex: ug,
        fog_fragment: dg,
        fog_pars_fragment: fg,
        gradientmap_pars_fragment: pg,
        lightmap_fragment: mg,
        lightmap_pars_fragment: gg,
        lights_lambert_fragment: _g,
        lights_lambert_pars_fragment: xg,
        lights_pars_begin: yg,
        lights_toon_fragment: Sg,
        lights_toon_pars_fragment: wg,
        lights_phong_fragment: Mg,
        lights_phong_pars_fragment: bg,
        lights_physical_fragment: Eg,
        lights_physical_pars_fragment: Tg,
        lights_fragment_begin: Ag,
        lights_fragment_maps: Cg,
        lights_fragment_end: Lg,
        logdepthbuf_fragment: Ig,
        logdepthbuf_pars_fragment: Rg,
        logdepthbuf_pars_vertex: Dg,
        logdepthbuf_vertex: Pg,
        map_fragment: Ng,
        map_pars_fragment: Bg,
        map_particle_fragment: Fg,
        map_particle_pars_fragment: kg,
        metalnessmap_fragment: Og,
        metalnessmap_pars_fragment: Ug,
        morphcolor_vertex: zg,
        morphnormal_vertex: Gg,
        morphtarget_pars_vertex: Vg,
        morphtarget_vertex: Hg,
        normal_fragment_begin: Wg,
        normal_fragment_maps: Xg,
        normal_pars_fragment: qg,
        normal_pars_vertex: jg,
        normal_vertex: Yg,
        normalmap_pars_fragment: $g,
        clearcoat_normal_fragment_begin: Kg,
        clearcoat_normal_fragment_maps: Zg,
        clearcoat_pars_fragment: Jg,
        iridescence_pars_fragment: Qg,
        output_fragment: e0,
        packing: t0,
        premultiplied_alpha_fragment: n0,
        project_vertex: i0,
        dithering_fragment: s0,
        dithering_pars_fragment: r0,
        roughnessmap_fragment: a0,
        roughnessmap_pars_fragment: o0,
        shadowmap_pars_fragment: l0,
        shadowmap_pars_vertex: c0,
        shadowmap_vertex: h0,
        shadowmask_pars_fragment: u0,
        skinbase_vertex: d0,
        skinning_pars_vertex: f0,
        skinning_vertex: p0,
        skinnormal_vertex: m0,
        specularmap_fragment: g0,
        specularmap_pars_fragment: _0,
        tonemapping_fragment: x0,
        tonemapping_pars_fragment: y0,
        transmission_fragment: v0,
        transmission_pars_fragment: S0,
        uv_pars_fragment: w0,
        uv_pars_vertex: M0,
        uv_vertex: b0,
        uv2_pars_fragment: E0,
        uv2_pars_vertex: T0,
        uv2_vertex: A0,
        worldpos_vertex: C0,
        background_vert: L0,
        background_frag: I0,
        backgroundCube_vert: R0,
        backgroundCube_frag: D0,
        cube_vert: P0,
        cube_frag: N0,
        depth_vert: B0,
        depth_frag: F0,
        distanceRGBA_vert: k0,
        distanceRGBA_frag: O0,
        equirect_vert: U0,
        equirect_frag: z0,
        linedashed_vert: G0,
        linedashed_frag: V0,
        meshbasic_vert: H0,
        meshbasic_frag: W0,
        meshlambert_vert: X0,
        meshlambert_frag: q0,
        meshmatcap_vert: j0,
        meshmatcap_frag: Y0,
        meshnormal_vert: $0,
        meshnormal_frag: K0,
        meshphong_vert: Z0,
        meshphong_frag: J0,
        meshphysical_vert: Q0,
        meshphysical_frag: e_,
        meshtoon_vert: t_,
        meshtoon_frag: n_,
        points_vert: i_,
        points_frag: s_,
        shadow_vert: r_,
        shadow_frag: a_,
        sprite_vert: o_,
        sprite_frag: l_
    },
    te = {
        common: {
            diffuse: {
                value: new pe(16777215)
            },
            opacity: {
                value: 1
            },
            map: {
                value: null
            },
            uvTransform: {
                value: new Ft
            },
            uv2Transform: {
                value: new Ft
            },
            alphaMap: {
                value: null
            },
            alphaTest: {
                value: 0
            }
        },
        specularmap: {
            specularMap: {
                value: null
            }
        },
        envmap: {
            envMap: {
                value: null
            },
            flipEnvMap: {
                value: -1
            },
            reflectivity: {
                value: 1
            },
            ior: {
                value: 1.5
            },
            refractionRatio: {
                value: .98
            }
        },
        aomap: {
            aoMap: {
                value: null
            },
            aoMapIntensity: {
                value: 1
            }
        },
        lightmap: {
            lightMap: {
                value: null
            },
            lightMapIntensity: {
                value: 1
            }
        },
        emissivemap: {
            emissiveMap: {
                value: null
            }
        },
        bumpmap: {
            bumpMap: {
                value: null
            },
            bumpScale: {
                value: 1
            }
        },
        normalmap: {
            normalMap: {
                value: null
            },
            normalScale: {
                value: new ve(1, 1)
            }
        },
        displacementmap: {
            displacementMap: {
                value: null
            },
            displacementScale: {
                value: 1
            },
            displacementBias: {
                value: 0
            }
        },
        roughnessmap: {
            roughnessMap: {
                value: null
            }
        },
        metalnessmap: {
            metalnessMap: {
                value: null
            }
        },
        gradientmap: {
            gradientMap: {
                value: null
            }
        },
        fog: {
            fogDensity: {
                value: 25e-5
            },
            fogNear: {
                value: 1
            },
            fogFar: {
                value: 2e3
            },
            fogColor: {
                value: new pe(16777215)
            }
        },
        lights: {
            ambientLightColor: {
                value: []
            },
            lightProbe: {
                value: []
            },
            directionalLights: {
                value: [],
                properties: {
                    direction: {},
                    color: {}
                }
            },
            directionalLightShadows: {
                value: [],
                properties: {
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            directionalShadowMap: {
                value: []
            },
            directionalShadowMatrix: {
                value: []
            },
            spotLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    direction: {},
                    distance: {},
                    coneCos: {},
                    penumbraCos: {},
                    decay: {}
                }
            },
            spotLightShadows: {
                value: [],
                properties: {
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            spotLightMap: {
                value: []
            },
            spotShadowMap: {
                value: []
            },
            spotLightMatrix: {
                value: []
            },
            pointLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    decay: {},
                    distance: {}
                }
            },
            pointLightShadows: {
                value: [],
                properties: {
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {},
                    shadowCameraNear: {},
                    shadowCameraFar: {}
                }
            },
            pointShadowMap: {
                value: []
            },
            pointShadowMatrix: {
                value: []
            },
            hemisphereLights: {
                value: [],
                properties: {
                    direction: {},
                    skyColor: {},
                    groundColor: {}
                }
            },
            rectAreaLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    width: {},
                    height: {}
                }
            },
            ltc_1: {
                value: null
            },
            ltc_2: {
                value: null
            }
        },
        points: {
            diffuse: {
                value: new pe(16777215)
            },
            opacity: {
                value: 1
            },
            size: {
                value: 1
            },
            scale: {
                value: 1
            },
            map: {
                value: null
            },
            alphaMap: {
                value: null
            },
            alphaTest: {
                value: 0
            },
            uvTransform: {
                value: new Ft
            }
        },
        sprite: {
            diffuse: {
                value: new pe(16777215)
            },
            opacity: {
                value: 1
            },
            center: {
                value: new ve(.5, .5)
            },
            rotation: {
                value: 0
            },
            map: {
                value: null
            },
            alphaMap: {
                value: null
            },
            alphaTest: {
                value: 0
            },
            uvTransform: {
                value: new Ft
            }
        }
    },
    Tn = {
        basic: {
            uniforms: Pt([te.common, te.specularmap, te.envmap, te.aomap, te.lightmap, te.fog]),
            vertexShader: Ee.meshbasic_vert,
            fragmentShader: Ee.meshbasic_frag
        },
        lambert: {
            uniforms: Pt([te.common, te.specularmap, te.envmap, te.aomap, te.lightmap, te.emissivemap, te.bumpmap, te.normalmap, te.displacementmap, te.fog, te.lights, {
                emissive: {
                    value: new pe(0)
                }
            }]),
            vertexShader: Ee.meshlambert_vert,
            fragmentShader: Ee.meshlambert_frag
        },
        phong: {
            uniforms: Pt([te.common, te.specularmap, te.envmap, te.aomap, te.lightmap, te.emissivemap, te.bumpmap, te.normalmap, te.displacementmap, te.fog, te.lights, {
                emissive: {
                    value: new pe(0)
                },
                specular: {
                    value: new pe(1118481)
                },
                shininess: {
                    value: 30
                }
            }]),
            vertexShader: Ee.meshphong_vert,
            fragmentShader: Ee.meshphong_frag
        },
        standard: {
            uniforms: Pt([te.common, te.envmap, te.aomap, te.lightmap, te.emissivemap, te.bumpmap, te.normalmap, te.displacementmap, te.roughnessmap, te.metalnessmap, te.fog, te.lights, {
                emissive: {
                    value: new pe(0)
                },
                roughness: {
                    value: 1
                },
                metalness: {
                    value: 0
                },
                envMapIntensity: {
                    value: 1
                }
            }]),
            vertexShader: Ee.meshphysical_vert,
            fragmentShader: Ee.meshphysical_frag
        },
        toon: {
            uniforms: Pt([te.common, te.aomap, te.lightmap, te.emissivemap, te.bumpmap, te.normalmap, te.displacementmap, te.gradientmap, te.fog, te.lights, {
                emissive: {
                    value: new pe(0)
                }
            }]),
            vertexShader: Ee.meshtoon_vert,
            fragmentShader: Ee.meshtoon_frag
        },
        matcap: {
            uniforms: Pt([te.common, te.bumpmap, te.normalmap, te.displacementmap, te.fog, {
                matcap: {
                    value: null
                }
            }]),
            vertexShader: Ee.meshmatcap_vert,
            fragmentShader: Ee.meshmatcap_frag
        },
        points: {
            uniforms: Pt([te.points, te.fog]),
            vertexShader: Ee.points_vert,
            fragmentShader: Ee.points_frag
        },
        dashed: {
            uniforms: Pt([te.common, te.fog, {
                scale: {
                    value: 1
                },
                dashSize: {
                    value: 1
                },
                totalSize: {
                    value: 2
                }
            }]),
            vertexShader: Ee.linedashed_vert,
            fragmentShader: Ee.linedashed_frag
        },
        depth: {
            uniforms: Pt([te.common, te.displacementmap]),
            vertexShader: Ee.depth_vert,
            fragmentShader: Ee.depth_frag
        },
        normal: {
            uniforms: Pt([te.common, te.bumpmap, te.normalmap, te.displacementmap, {
                opacity: {
                    value: 1
                }
            }]),
            vertexShader: Ee.meshnormal_vert,
            fragmentShader: Ee.meshnormal_frag
        },
        sprite: {
            uniforms: Pt([te.sprite, te.fog]),
            vertexShader: Ee.sprite_vert,
            fragmentShader: Ee.sprite_frag
        },
        background: {
            uniforms: {
                uvTransform: {
                    value: new Ft
                },
                t2D: {
                    value: null
                },
                backgroundIntensity: {
                    value: 1
                }
            },
            vertexShader: Ee.background_vert,
            fragmentShader: Ee.background_frag
        },
        backgroundCube: {
            uniforms: {
                envMap: {
                    value: null
                },
                flipEnvMap: {
                    value: -1
                },
                backgroundBlurriness: {
                    value: 0
                },
                backgroundIntensity: {
                    value: 1
                }
            },
            vertexShader: Ee.backgroundCube_vert,
            fragmentShader: Ee.backgroundCube_frag
        },
        cube: {
            uniforms: {
                tCube: {
                    value: null
                },
                tFlip: {
                    value: -1
                },
                opacity: {
                    value: 1
                }
            },
            vertexShader: Ee.cube_vert,
            fragmentShader: Ee.cube_frag
        },
        equirect: {
            uniforms: {
                tEquirect: {
                    value: null
                }
            },
            vertexShader: Ee.equirect_vert,
            fragmentShader: Ee.equirect_frag
        },
        distanceRGBA: {
            uniforms: Pt([te.common, te.displacementmap, {
                referencePosition: {
                    value: new M
                },
                nearDistance: {
                    value: 1
                },
                farDistance: {
                    value: 1e3
                }
            }]),
            vertexShader: Ee.distanceRGBA_vert,
            fragmentShader: Ee.distanceRGBA_frag
        },
        shadow: {
            uniforms: Pt([te.lights, te.fog, {
                color: {
                    value: new pe(0)
                },
                opacity: {
                    value: 1
                }
            }]),
            vertexShader: Ee.shadow_vert,
            fragmentShader: Ee.shadow_frag
        }
    };
Tn.physical = {
    uniforms: Pt([Tn.standard.uniforms, {
        clearcoat: {
            value: 0
        },
        clearcoatMap: {
            value: null
        },
        clearcoatRoughness: {
            value: 0
        },
        clearcoatRoughnessMap: {
            value: null
        },
        clearcoatNormalScale: {
            value: new ve(1, 1)
        },
        clearcoatNormalMap: {
            value: null
        },
        iridescence: {
            value: 0
        },
        iridescenceMap: {
            value: null
        },
        iridescenceIOR: {
            value: 1.3
        },
        iridescenceThicknessMinimum: {
            value: 100
        },
        iridescenceThicknessMaximum: {
            value: 400
        },
        iridescenceThicknessMap: {
            value: null
        },
        sheen: {
            value: 0
        },
        sheenColor: {
            value: new pe(0)
        },
        sheenColorMap: {
            value: null
        },
        sheenRoughness: {
            value: 1
        },
        sheenRoughnessMap: {
            value: null
        },
        transmission: {
            value: 0
        },
        transmissionMap: {
            value: null
        },
        transmissionSamplerSize: {
            value: new ve
        },
        transmissionSamplerMap: {
            value: null
        },
        thickness: {
            value: 0
        },
        thicknessMap: {
            value: null
        },
        attenuationDistance: {
            value: 0
        },
        attenuationColor: {
            value: new pe(0)
        },
        specularIntensity: {
            value: 1
        },
        specularIntensityMap: {
            value: null
        },
        specularColor: {
            value: new pe(1, 1, 1)
        },
        specularColorMap: {
            value: null
        }
    }]),
    vertexShader: Ee.meshphysical_vert,
    fragmentShader: Ee.meshphysical_frag
};
const ua = {
    r: 0,
    b: 0,
    g: 0
};

function c_(s, e, t, n, i, r, a) {
    const o = new pe(0);
    let l = r === !0 ? 0 : 1,
        c, h, u = null,
        d = 0,
        f = null;

    function g(p, _) {
        let E = !1,
            y = _.isScene === !0 ? _.background : null;
        y && y.isTexture && (y = (_.backgroundBlurriness > 0 ? t : e).get(y));
        const S = s.xr,
            T = S.getSession && S.getSession();
        T && T.environmentBlendMode === "additive" && (y = null), y === null ? m(o, l) : y && y.isColor && (m(y, 1), E = !0), (s.autoClear || E) && s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil), y && (y.isCubeTexture || y.mapping === Xa) ? (h === void 0 && (h = new ct(new Yi(1, 1, 1), new yt({
            name: "BackgroundCubeMaterial",
            uniforms: Us(Tn.backgroundCube.uniforms),
            vertexShader: Tn.backgroundCube.vertexShader,
            fragmentShader: Tn.backgroundCube.fragmentShader,
            side: Qt,
            depthTest: !1,
            depthWrite: !1,
            fog: !1
        })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(L, I, v) {
            this.matrixWorld.copyPosition(v.matrixWorld)
        }, Object.defineProperty(h.material, "envMap", {
            get: function() {
                return this.uniforms.envMap.value
            }
        }), i.update(h)), h.material.uniforms.envMap.value = y, h.material.uniforms.flipEnvMap.value = y.isCubeTexture && y.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = _.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = _.backgroundIntensity, h.material.toneMapped = y.encoding !== Be, (u !== y || d !== y.version || f !== s.toneMapping) && (h.material.needsUpdate = !0, u = y, d = y.version, f = s.toneMapping), h.layers.enableAll(), p.unshift(h, h.geometry, h.material, 0, 0, null)) : y && y.isTexture && (c === void 0 && (c = new ct(new di(2, 2), new yt({
            name: "BackgroundMaterial",
            uniforms: Us(Tn.background.uniforms),
            vertexShader: Tn.background.vertexShader,
            fragmentShader: Tn.background.fragmentShader,
            side: $n,
            depthTest: !1,
            depthWrite: !1,
            fog: !1
        })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
            get: function() {
                return this.uniforms.t2D.value
            }
        }), i.update(c)), c.material.uniforms.t2D.value = y, c.material.uniforms.backgroundIntensity.value = _.backgroundIntensity, c.material.toneMapped = y.encoding !== Be, y.matrixAutoUpdate === !0 && y.updateMatrix(), c.material.uniforms.uvTransform.value.copy(y.matrix), (u !== y || d !== y.version || f !== s.toneMapping) && (c.material.needsUpdate = !0, u = y, d = y.version, f = s.toneMapping), c.layers.enableAll(), p.unshift(c, c.geometry, c.material, 0, 0, null))
    }

    function m(p, _) {
        p.getRGB(ua, ed(s)), n.buffers.color.setClear(ua.r, ua.g, ua.b, _, a)
    }
    return {
        getClearColor: function() {
            return o
        },
        setClearColor: function(p, _ = 1) {
            o.set(p), l = _, m(o, l)
        },
        getClearAlpha: function() {
            return l
        },
        setClearAlpha: function(p) {
            l = p, m(o, l)
        },
        render: g
    }
}

function h_(s, e, t, n) {
    const i = s.getParameter(34921),
        r = n.isWebGL2 ? null : e.get("OES_vertex_array_object"),
        a = n.isWebGL2 || r !== null,
        o = {},
        l = p(null);
    let c = l,
        h = !1;

    function u(D, U, j, Z, H) {
        let J = !1;
        if (a) {
            const Y = m(Z, j, U);
            c !== Y && (c = Y, f(c.object)), J = _(D, Z, j, H), J && E(D, Z, j, H)
        } else {
            const Y = U.wireframe === !0;
            (c.geometry !== Z.id || c.program !== j.id || c.wireframe !== Y) && (c.geometry = Z.id, c.program = j.id, c.wireframe = Y, J = !0)
        }
        H !== null && t.update(H, 34963), (J || h) && (h = !1, v(D, U, j, Z), H !== null && s.bindBuffer(34963, t.get(H).buffer))
    }

    function d() {
        return n.isWebGL2 ? s.createVertexArray() : r.createVertexArrayOES()
    }

    function f(D) {
        return n.isWebGL2 ? s.bindVertexArray(D) : r.bindVertexArrayOES(D)
    }

    function g(D) {
        return n.isWebGL2 ? s.deleteVertexArray(D) : r.deleteVertexArrayOES(D)
    }

    function m(D, U, j) {
        const Z = j.wireframe === !0;
        let H = o[D.id];
        H === void 0 && (H = {}, o[D.id] = H);
        let J = H[U.id];
        J === void 0 && (J = {}, H[U.id] = J);
        let Y = J[Z];
        return Y === void 0 && (Y = p(d()), J[Z] = Y), Y
    }

    function p(D) {
        const U = [],
            j = [],
            Z = [];
        for (let H = 0; H < i; H++) U[H] = 0, j[H] = 0, Z[H] = 0;
        return {
            geometry: null,
            program: null,
            wireframe: !1,
            newAttributes: U,
            enabledAttributes: j,
            attributeDivisors: Z,
            object: D,
            attributes: {},
            index: null
        }
    }

    function _(D, U, j, Z) {
        const H = c.attributes,
            J = U.attributes;
        let Y = 0;
        const ge = j.getAttributes();
        for (const k in ge)
            if (ge[k].location >= 0) {
                const ne = H[k];
                let B = J[k];
                if (B === void 0 && (k === "instanceMatrix" && D.instanceMatrix && (B = D.instanceMatrix), k === "instanceColor" && D.instanceColor && (B = D.instanceColor)), ne === void 0 || ne.attribute !== B || B && ne.data !== B.data) return !0;
                Y++
            } return c.attributesNum !== Y || c.index !== Z
    }

    function E(D, U, j, Z) {
        const H = {},
            J = U.attributes;
        let Y = 0;
        const ge = j.getAttributes();
        for (const k in ge)
            if (ge[k].location >= 0) {
                let ne = J[k];
                ne === void 0 && (k === "instanceMatrix" && D.instanceMatrix && (ne = D.instanceMatrix), k === "instanceColor" && D.instanceColor && (ne = D.instanceColor));
                const B = {};
                B.attribute = ne, ne && ne.data && (B.data = ne.data), H[k] = B, Y++
            } c.attributes = H, c.attributesNum = Y, c.index = Z
    }

    function y() {
        const D = c.newAttributes;
        for (let U = 0, j = D.length; U < j; U++) D[U] = 0
    }

    function S(D) {
        T(D, 0)
    }

    function T(D, U) {
        const j = c.newAttributes,
            Z = c.enabledAttributes,
            H = c.attributeDivisors;
        j[D] = 1, Z[D] === 0 && (s.enableVertexAttribArray(D), Z[D] = 1), H[D] !== U && ((n.isWebGL2 ? s : e.get("ANGLE_instanced_arrays"))[n.isWebGL2 ? "vertexAttribDivisor" : "vertexAttribDivisorANGLE"](D, U), H[D] = U)
    }

    function L() {
        const D = c.newAttributes,
            U = c.enabledAttributes;
        for (let j = 0, Z = U.length; j < Z; j++) U[j] !== D[j] && (s.disableVertexAttribArray(j), U[j] = 0)
    }

    function I(D, U, j, Z, H, J) {
        n.isWebGL2 === !0 && (j === 5124 || j === 5125) ? s.vertexAttribIPointer(D, U, j, H, J) : s.vertexAttribPointer(D, U, j, Z, H, J)
    }

    function v(D, U, j, Z) {
        if (n.isWebGL2 === !1 && (D.isInstancedMesh || Z.isInstancedBufferGeometry) && e.get("ANGLE_instanced_arrays") === null) return;
        y();
        const H = Z.attributes,
            J = j.getAttributes(),
            Y = U.defaultAttributeValues;
        for (const ge in J) {
            const k = J[ge];
            if (k.location >= 0) {
                let K = H[ge];
                if (K === void 0 && (ge === "instanceMatrix" && D.instanceMatrix && (K = D.instanceMatrix), ge === "instanceColor" && D.instanceColor && (K = D.instanceColor)), K !== void 0) {
                    const ne = K.normalized,
                        B = K.itemSize,
                        ce = t.get(K);
                    if (ce === void 0) continue;
                    const ae = ce.buffer,
                        he = ce.type,
                        ue = ce.bytesPerElement;
                    if (K.isInterleavedBufferAttribute) {
                        const Se = K.data,
                            Ce = Se.stride,
                            Ie = K.offset;
                        if (Se.isInstancedInterleavedBuffer) {
                            for (let ze = 0; ze < k.locationSize; ze++) T(k.location + ze, Se.meshPerAttribute);
                            D.isInstancedMesh !== !0 && Z._maxInstanceCount === void 0 && (Z._maxInstanceCount = Se.meshPerAttribute * Se.count)
                        } else
                            for (let ze = 0; ze < k.locationSize; ze++) S(k.location + ze);
                        s.bindBuffer(34962, ae);
                        for (let ze = 0; ze < k.locationSize; ze++) I(k.location + ze, B / k.locationSize, he, ne, Ce * ue, (Ie + B / k.locationSize * ze) * ue)
                    } else {
                        if (K.isInstancedBufferAttribute) {
                            for (let Se = 0; Se < k.locationSize; Se++) T(k.location + Se, K.meshPerAttribute);
                            D.isInstancedMesh !== !0 && Z._maxInstanceCount === void 0 && (Z._maxInstanceCount = K.meshPerAttribute * K.count)
                        } else
                            for (let Se = 0; Se < k.locationSize; Se++) S(k.location + Se);
                        s.bindBuffer(34962, ae);
                        for (let Se = 0; Se < k.locationSize; Se++) I(k.location + Se, B / k.locationSize, he, ne, B * ue, B / k.locationSize * Se * ue)
                    }
                } else if (Y !== void 0) {
                    const ne = Y[ge];
                    if (ne !== void 0) switch (ne.length) {
                        case 2:
                            s.vertexAttrib2fv(k.location, ne);
                            break;
                        case 3:
                            s.vertexAttrib3fv(k.location, ne);
                            break;
                        case 4:
                            s.vertexAttrib4fv(k.location, ne);
                            break;
                        default:
                            s.vertexAttrib1fv(k.location, ne)
                    }
                }
            }
        }
        L()
    }

    function A() {
        X();
        for (const D in o) {
            const U = o[D];
            for (const j in U) {
                const Z = U[j];
                for (const H in Z) g(Z[H].object), delete Z[H];
                delete U[j]
            }
            delete o[D]
        }
    }

    function P(D) {
        if (o[D.id] === void 0) return;
        const U = o[D.id];
        for (const j in U) {
            const Z = U[j];
            for (const H in Z) g(Z[H].object), delete Z[H];
            delete U[j]
        }
        delete o[D.id]
    }

    function q(D) {
        for (const U in o) {
            const j = o[U];
            if (j[D.id] === void 0) continue;
            const Z = j[D.id];
            for (const H in Z) g(Z[H].object), delete Z[H];
            delete j[D.id]
        }
    }

    function X() {
        F(), h = !0, c !== l && (c = l, f(c.object))
    }

    function F() {
        l.geometry = null, l.program = null, l.wireframe = !1
    }
    return {
        setup: u,
        reset: X,
        resetDefaultState: F,
        dispose: A,
        releaseStatesOfGeometry: P,
        releaseStatesOfProgram: q,
        initAttributes: y,
        enableAttribute: S,
        disableUnusedAttributes: L
    }
}

function u_(s, e, t, n) {
    const i = n.isWebGL2;
    let r;

    function a(c) {
        r = c
    }

    function o(c, h) {
        s.drawArrays(r, c, h), t.update(h, r, 1)
    }

    function l(c, h, u) {
        if (u === 0) return;
        let d, f;
        if (i) d = s, f = "drawArraysInstanced";
        else if (d = e.get("ANGLE_instanced_arrays"), f = "drawArraysInstancedANGLE", d === null) {
            console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
            return
        }
        d[f](r, c, h, u), t.update(h, r, u)
    }
    this.setMode = a, this.render = o, this.renderInstances = l
}

function d_(s, e, t) {
    let n;

    function i() {
        if (n !== void 0) return n;
        if (e.has("EXT_texture_filter_anisotropic") === !0) {
            const I = e.get("EXT_texture_filter_anisotropic");
            n = s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        } else n = 0;
        return n
    }

    function r(I) {
        if (I === "highp") {
            if (s.getShaderPrecisionFormat(35633, 36338).precision > 0 && s.getShaderPrecisionFormat(35632, 36338).precision > 0) return "highp";
            I = "mediump"
        }
        return I === "mediump" && s.getShaderPrecisionFormat(35633, 36337).precision > 0 && s.getShaderPrecisionFormat(35632, 36337).precision > 0 ? "mediump" : "lowp"
    }
    const a = typeof WebGL2RenderingContext < "u" && s instanceof WebGL2RenderingContext;
    let o = t.precision !== void 0 ? t.precision : "highp";
    const l = r(o);
    l !== o && (console.warn("THREE.WebGLRenderer:", o, "not supported, using", l, "instead."), o = l);
    const c = a || e.has("WEBGL_draw_buffers"),
        h = t.logarithmicDepthBuffer === !0,
        u = s.getParameter(34930),
        d = s.getParameter(35660),
        f = s.getParameter(3379),
        g = s.getParameter(34076),
        m = s.getParameter(34921),
        p = s.getParameter(36347),
        _ = s.getParameter(36348),
        E = s.getParameter(36349),
        y = d > 0,
        S = a || e.has("OES_texture_float"),
        T = y && S,
        L = a ? s.getParameter(36183) : 0;
    return {
        isWebGL2: a,
        drawBuffers: c,
        getMaxAnisotropy: i,
        getMaxPrecision: r,
        precision: o,
        logarithmicDepthBuffer: h,
        maxTextures: u,
        maxVertexTextures: d,
        maxTextureSize: f,
        maxCubemapSize: g,
        maxAttributes: m,
        maxVertexUniforms: p,
        maxVaryings: _,
        maxFragmentUniforms: E,
        vertexTextures: y,
        floatFragmentTextures: S,
        floatVertexTextures: T,
        maxSamples: L
    }
}

function f_(s) {
    const e = this;
    let t = null,
        n = 0,
        i = !1,
        r = !1;
    const a = new Ei,
        o = new Ft,
        l = {
            value: null,
            needsUpdate: !1
        };
    this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
        const f = u.length !== 0 || d || n !== 0 || i;
        return i = d, n = u.length, f
    }, this.beginShadows = function() {
        r = !0, h(null)
    }, this.endShadows = function() {
        r = !1
    }, this.setGlobalState = function(u, d) {
        t = h(u, d, 0)
    }, this.setState = function(u, d, f) {
        const g = u.clippingPlanes,
            m = u.clipIntersection,
            p = u.clipShadows,
            _ = s.get(u);
        if (!i || g === null || g.length === 0 || r && !p) r ? h(null) : c();
        else {
            const E = r ? 0 : n,
                y = E * 4;
            let S = _.clippingState || null;
            l.value = S, S = h(g, d, y, f);
            for (let T = 0; T !== y; ++T) S[T] = t[T];
            _.clippingState = S, this.numIntersection = m ? this.numPlanes : 0, this.numPlanes += E
        }
    };

    function c() {
        l.value !== t && (l.value = t, l.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0
    }

    function h(u, d, f, g) {
        const m = u !== null ? u.length : 0;
        let p = null;
        if (m !== 0) {
            if (p = l.value, g !== !0 || p === null) {
                const _ = f + m * 4,
                    E = d.matrixWorldInverse;
                o.getNormalMatrix(E), (p === null || p.length < _) && (p = new Float32Array(_));
                for (let y = 0, S = f; y !== m; ++y, S += 4) a.copy(u[y]).applyMatrix4(E, o), a.normal.toArray(p, S), p[S + 3] = a.constant
            }
            l.value = p, l.needsUpdate = !0
        }
        return e.numPlanes = m, e.numIntersection = 0, p
    }
}

function p_(s) {
    let e = new WeakMap;

    function t(a, o) {
        return o === sl ? a.mapping = Ns : o === rl && (a.mapping = Bs), a
    }

    function n(a) {
        if (a && a.isTexture && a.isRenderTargetTexture === !1) {
            const o = a.mapping;
            if (o === sl || o === rl)
                if (e.has(a)) {
                    const l = e.get(a).texture;
                    return t(l, a.mapping)
                } else {
                    const l = a.image;
                    if (l && l.height > 0) {
                        const c = new Am(l.height / 2);
                        return c.fromEquirectangularTexture(s, a), e.set(a, c), a.addEventListener("dispose", i), t(c.texture, a.mapping)
                    } else return null
                }
        }
        return a
    }

    function i(a) {
        const o = a.target;
        o.removeEventListener("dispose", i);
        const l = e.get(o);
        l !== void 0 && (e.delete(o), l.dispose())
    }

    function r() {
        e = new WeakMap
    }
    return {
        get: n,
        dispose: r
    }
}
class Kl extends td {
    constructor(e = -1, t = 1, n = 1, i = -1, r = .1, a = 2e3) {
        super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = i, this.near = r, this.far = a, this.updateProjectionMatrix()
    }
    copy(e, t) {
        return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this
    }
    setViewOffset(e, t, n, i, r, a) {
        this.view === null && (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = a, this.updateProjectionMatrix()
    }
    clearViewOffset() {
        this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix()
    }
    updateProjectionMatrix() {
        const e = (this.right - this.left) / (2 * this.zoom),
            t = (this.top - this.bottom) / (2 * this.zoom),
            n = (this.right + this.left) / 2,
            i = (this.top + this.bottom) / 2;
        let r = n - e,
            a = n + e,
            o = i + t,
            l = i - t;
        if (this.view !== null && this.view.enabled) {
            const c = (this.right - this.left) / this.view.fullWidth / this.zoom,
                h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
            r += c * this.view.offsetX, a = r + c * this.view.width, o -= h * this.view.offsetY, l = o - h * this.view.height
        }
        this.projectionMatrix.makeOrthographic(r, a, o, l, this.near, this.far), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t
    }
}
const ws = 4,
    vh = [.125, .215, .35, .446, .526, .582],
    Ai = 20,
    Fo = new Kl,
    Sh = new pe;
let ko = null;
const Ti = (1 + Math.sqrt(5)) / 2,
    hs = 1 / Ti,
    wh = [new M(1, 1, 1), new M(-1, 1, 1), new M(1, 1, -1), new M(-1, 1, -1), new M(0, Ti, hs), new M(0, Ti, -hs), new M(hs, 0, Ti), new M(-hs, 0, Ti), new M(Ti, hs, 0), new M(-Ti, hs, 0)];
class Mh {
    constructor(e) {
        this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial)
    }
    fromScene(e, t = 0, n = .1, i = 100) {
        ko = this._renderer.getRenderTarget(), this._setSize(256);
        const r = this._allocateTargets();
        return r.depthBuffer = !0, this._sceneToCubeUV(e, n, i, r), t > 0 && this._blur(r, 0, 0, t), this._applyPMREM(r), this._cleanup(r), r
    }
    fromEquirectangular(e, t = null) {
        return this._fromTexture(e, t)
    }
    fromCubemap(e, t = null) {
        return this._fromTexture(e, t)
    }
    compileCubemapShader() {
        this._cubemapMaterial === null && (this._cubemapMaterial = Th(), this._compileMaterial(this._cubemapMaterial))
    }
    compileEquirectangularShader() {
        this._equirectMaterial === null && (this._equirectMaterial = Eh(), this._compileMaterial(this._equirectMaterial))
    }
    dispose() {
        this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose()
    }
    _setSize(e) {
        this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax)
    }
    _dispose() {
        this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
        for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose()
    }
    _cleanup(e) {
        this._renderer.setRenderTarget(ko), e.scissorTest = !1, da(e, 0, 0, e.width, e.height)
    }
    _fromTexture(e, t) {
        e.mapping === Ns || e.mapping === Bs ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), ko = this._renderer.getRenderTarget();
        const n = t || this._allocateTargets();
        return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n
    }
    _allocateTargets() {
        const e = 3 * Math.max(this._cubeSize, 112),
            t = 4 * this._cubeSize,
            n = {
                magFilter: Gt,
                minFilter: Gt,
                generateMipmaps: !1,
                type: Er,
                format: rn,
                encoding: Oi,
                depthBuffer: !1
            },
            i = bh(e, t, n);
        if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
            this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = bh(e, t, n);
            const {
                _lodMax: r
            } = this;
            ({
                sizeLods: this._sizeLods,
                lodPlanes: this._lodPlanes,
                sigmas: this._sigmas
            } = m_(r)), this._blurMaterial = g_(r, e, t)
        }
        return i
    }
    _compileMaterial(e) {
        const t = new ct(this._lodPlanes[0], e);
        this._renderer.compile(t, Fo)
    }
    _sceneToCubeUV(e, t, n, i) {
        const o = new Bt(90, 1, t, n),
            l = [1, -1, 1, 1, 1, 1],
            c = [1, 1, 1, -1, -1, -1],
            h = this._renderer,
            u = h.autoClear,
            d = h.toneMapping;
        h.getClearColor(Sh), h.toneMapping = qn, h.autoClear = !1;
        const f = new Li({
                name: "PMREM.Background",
                side: Qt,
                depthWrite: !1,
                depthTest: !1
            }),
            g = new ct(new Yi, f);
        let m = !1;
        const p = e.background;
        p ? p.isColor && (f.color.copy(p), e.background = null, m = !0) : (f.color.copy(Sh), m = !0);
        for (let _ = 0; _ < 6; _++) {
            const E = _ % 3;
            E === 0 ? (o.up.set(0, l[_], 0), o.lookAt(c[_], 0, 0)) : E === 1 ? (o.up.set(0, 0, l[_]), o.lookAt(0, c[_], 0)) : (o.up.set(0, l[_], 0), o.lookAt(0, 0, c[_]));
            const y = this._cubeSize;
            da(i, E * y, _ > 2 ? y : 0, y, y), h.setRenderTarget(i), m && h.render(g, o), h.render(e, o)
        }
        g.geometry.dispose(), g.material.dispose(), h.toneMapping = d, h.autoClear = u, e.background = p
    }
    _textureToCubeUV(e, t) {
        const n = this._renderer,
            i = e.mapping === Ns || e.mapping === Bs;
        i ? (this._cubemapMaterial === null && (this._cubemapMaterial = Th()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Eh());
        const r = i ? this._cubemapMaterial : this._equirectMaterial,
            a = new ct(this._lodPlanes[0], r),
            o = r.uniforms;
        o.envMap.value = e;
        const l = this._cubeSize;
        da(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(a, Fo)
    }
    _applyPMREM(e) {
        const t = this._renderer,
            n = t.autoClear;
        t.autoClear = !1;
        for (let i = 1; i < this._lodPlanes.length; i++) {
            const r = Math.sqrt(this._sigmas[i] * this._sigmas[i] - this._sigmas[i - 1] * this._sigmas[i - 1]),
                a = wh[(i - 1) % wh.length];
            this._blur(e, i - 1, i, r, a)
        }
        t.autoClear = n
    }
    _blur(e, t, n, i, r) {
        const a = this._pingPongRenderTarget;
        this._halfBlur(e, a, t, n, i, "latitudinal", r), this._halfBlur(a, e, n, n, i, "longitudinal", r)
    }
    _halfBlur(e, t, n, i, r, a, o) {
        const l = this._renderer,
            c = this._blurMaterial;
        a !== "latitudinal" && a !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
        const h = 3,
            u = new ct(this._lodPlanes[i], c),
            d = c.uniforms,
            f = this._sizeLods[n] - 1,
            g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * Ai - 1),
            m = r / g,
            p = isFinite(r) ? 1 + Math.floor(h * m) : Ai;
        p > Ai && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Ai}`);
        const _ = [];
        let E = 0;
        for (let I = 0; I < Ai; ++I) {
            const v = I / m,
                A = Math.exp(-v * v / 2);
            _.push(A), I === 0 ? E += A : I < p && (E += 2 * A)
        }
        for (let I = 0; I < _.length; I++) _[I] = _[I] / E;
        d.envMap.value = e.texture, d.samples.value = p, d.weights.value = _, d.latitudinal.value = a === "latitudinal", o && (d.poleAxis.value = o);
        const {
            _lodMax: y
        } = this;
        d.dTheta.value = g, d.mipInt.value = y - n;
        const S = this._sizeLods[i],
            T = 3 * S * (i > y - ws ? i - y + ws : 0),
            L = 4 * (this._cubeSize - S);
        da(t, T, L, 3 * S, 2 * S), l.setRenderTarget(t), l.render(u, Fo)
    }
}

function m_(s) {
    const e = [],
        t = [],
        n = [];
    let i = s;
    const r = s - ws + 1 + vh.length;
    for (let a = 0; a < r; a++) {
        const o = Math.pow(2, i);
        t.push(o);
        let l = 1 / o;
        a > s - ws ? l = vh[a - s + ws - 1] : a === 0 && (l = 0), n.push(l);
        const c = 1 / (o - 2),
            h = -c,
            u = 1 + c,
            d = [h, h, u, h, u, u, h, h, u, u, h, u],
            f = 6,
            g = 6,
            m = 3,
            p = 2,
            _ = 1,
            E = new Float32Array(m * g * f),
            y = new Float32Array(p * g * f),
            S = new Float32Array(_ * g * f);
        for (let L = 0; L < f; L++) {
            const I = L % 3 * 2 / 3 - 1,
                v = L > 2 ? 0 : -1,
                A = [I, v, 0, I + 2 / 3, v, 0, I + 2 / 3, v + 1, 0, I, v, 0, I + 2 / 3, v + 1, 0, I, v + 1, 0];
            E.set(A, m * g * L), y.set(d, p * g * L);
            const P = [L, L, L, L, L, L];
            S.set(P, _ * g * L)
        }
        const T = new jt;
        T.setAttribute("position", new $e(E, m)), T.setAttribute("uv", new $e(y, p)), T.setAttribute("faceIndex", new $e(S, _)), e.push(T), i > ws && i--
    }
    return {
        lodPlanes: e,
        sizeLods: t,
        sigmas: n
    }
}

function bh(s, e, t) {
    const n = new Ui(s, e, t);
    return n.texture.mapping = Xa, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n
}

function da(s, e, t, n, i) {
    s.viewport.set(e, t, n, i), s.scissor.set(e, t, n, i)
}

function g_(s, e, t) {
    const n = new Float32Array(Ai),
        i = new M(0, 1, 0);
    return new yt({
        name: "SphericalGaussianBlur",
        defines: {
            n: Ai,
            CUBEUV_TEXEL_WIDTH: 1 / e,
            CUBEUV_TEXEL_HEIGHT: 1 / t,
            CUBEUV_MAX_MIP: `${s}.0`
        },
        uniforms: {
            envMap: {
                value: null
            },
            samples: {
                value: 1
            },
            weights: {
                value: n
            },
            latitudinal: {
                value: !1
            },
            dTheta: {
                value: 0
            },
            mipInt: {
                value: 0
            },
            poleAxis: {
                value: i
            }
        },
        vertexShader: Zl(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
        blending: hi,
        depthTest: !1,
        depthWrite: !1
    })
}

function Eh() {
    return new yt({
        name: "EquirectangularToCubeUV",
        uniforms: {
            envMap: {
                value: null
            }
        },
        vertexShader: Zl(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
        blending: hi,
        depthTest: !1,
        depthWrite: !1
    })
}

function Th() {
    return new yt({
        name: "CubemapToCubeUV",
        uniforms: {
            envMap: {
                value: null
            },
            flipEnvMap: {
                value: -1
            }
        },
        vertexShader: Zl(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
        blending: hi,
        depthTest: !1,
        depthWrite: !1
    })
}

function Zl() {
    return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
}

function __(s) {
    let e = new WeakMap,
        t = null;

    function n(o) {
        if (o && o.isTexture) {
            const l = o.mapping,
                c = l === sl || l === rl,
                h = l === Ns || l === Bs;
            if (c || h)
                if (o.isRenderTargetTexture && o.needsPMREMUpdate === !0) {
                    o.needsPMREMUpdate = !1;
                    let u = e.get(o);
                    return t === null && (t = new Mh(s)), u = c ? t.fromEquirectangular(o, u) : t.fromCubemap(o, u), e.set(o, u), u.texture
                } else {
                    if (e.has(o)) return e.get(o).texture;
                    {
                        const u = o.image;
                        if (c && u && u.height > 0 || h && u && i(u)) {
                            t === null && (t = new Mh(s));
                            const d = c ? t.fromEquirectangular(o) : t.fromCubemap(o);
                            return e.set(o, d), o.addEventListener("dispose", r), d.texture
                        } else return null
                    }
                }
        }
        return o
    }

    function i(o) {
        let l = 0;
        const c = 6;
        for (let h = 0; h < c; h++) o[h] !== void 0 && l++;
        return l === c
    }

    function r(o) {
        const l = o.target;
        l.removeEventListener("dispose", r);
        const c = e.get(l);
        c !== void 0 && (e.delete(l), c.dispose())
    }

    function a() {
        e = new WeakMap, t !== null && (t.dispose(), t = null)
    }
    return {
        get: n,
        dispose: a
    }
}

function x_(s) {
    const e = {};

    function t(n) {
        if (e[n] !== void 0) return e[n];
        let i;
        switch (n) {
            case "WEBGL_depth_texture":
                i = s.getExtension("WEBGL_depth_texture") || s.getExtension("MOZ_WEBGL_depth_texture") || s.getExtension("WEBKIT_WEBGL_depth_texture");
                break;
            case "EXT_texture_filter_anisotropic":
                i = s.getExtension("EXT_texture_filter_anisotropic") || s.getExtension("MOZ_EXT_texture_filter_anisotropic") || s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
                break;
            case "WEBGL_compressed_texture_s3tc":
                i = s.getExtension("WEBGL_compressed_texture_s3tc") || s.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
                break;
            case "WEBGL_compressed_texture_pvrtc":
                i = s.getExtension("WEBGL_compressed_texture_pvrtc") || s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
                break;
            default:
                i = s.getExtension(n)
        }
        return e[n] = i, i
    }
    return {
        has: function(n) {
            return t(n) !== null
        },
        init: function(n) {
            n.isWebGL2 ? t("EXT_color_buffer_float") : (t("WEBGL_depth_texture"), t("OES_texture_float"), t("OES_texture_half_float"), t("OES_texture_half_float_linear"), t("OES_standard_derivatives"), t("OES_element_index_uint"), t("OES_vertex_array_object"), t("ANGLE_instanced_arrays")), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture")
        },
        get: function(n) {
            const i = t(n);
            return i === null && console.warn("THREE.WebGLRenderer: " + n + " extension not supported."), i
        }
    }
}

function y_(s, e, t, n) {
    const i = {},
        r = new WeakMap;

    function a(u) {
        const d = u.target;
        d.index !== null && e.remove(d.index);
        for (const g in d.attributes) e.remove(d.attributes[g]);
        d.removeEventListener("dispose", a), delete i[d.id];
        const f = r.get(d);
        f && (e.remove(f), r.delete(d)), n.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === !0 && delete d._maxInstanceCount, t.memory.geometries--
    }

    function o(u, d) {
        return i[d.id] === !0 || (d.addEventListener("dispose", a), i[d.id] = !0, t.memory.geometries++), d
    }

    function l(u) {
        const d = u.attributes;
        for (const g in d) e.update(d[g], 34962);
        const f = u.morphAttributes;
        for (const g in f) {
            const m = f[g];
            for (let p = 0, _ = m.length; p < _; p++) e.update(m[p], 34962)
        }
    }

    function c(u) {
        const d = [],
            f = u.index,
            g = u.attributes.position;
        let m = 0;
        if (f !== null) {
            const E = f.array;
            m = f.version;
            for (let y = 0, S = E.length; y < S; y += 3) {
                const T = E[y + 0],
                    L = E[y + 1],
                    I = E[y + 2];
                d.push(T, L, L, I, I, T)
            }
        } else {
            const E = g.array;
            m = g.version;
            for (let y = 0, S = E.length / 3 - 1; y < S; y += 3) {
                const T = y + 0,
                    L = y + 1,
                    I = y + 2;
                d.push(T, L, L, I, I, T)
            }
        }
        const p = new(ju(d) ? Qu : Ju)(d, 1);
        p.version = m;
        const _ = r.get(u);
        _ && e.remove(_), r.set(u, p)
    }

    function h(u) {
        const d = r.get(u);
        if (d) {
            const f = u.index;
            f !== null && d.version < f.version && c(u)
        } else c(u);
        return r.get(u)
    }
    return {
        get: o,
        update: l,
        getWireframeAttribute: h
    }
}

function v_(s, e, t, n) {
    const i = n.isWebGL2;
    let r;

    function a(d) {
        r = d
    }
    let o, l;

    function c(d) {
        o = d.type, l = d.bytesPerElement
    }

    function h(d, f) {
        s.drawElements(r, f, o, d * l), t.update(f, r, 1)
    }

    function u(d, f, g) {
        if (g === 0) return;
        let m, p;
        if (i) m = s, p = "drawElementsInstanced";
        else if (m = e.get("ANGLE_instanced_arrays"), p = "drawElementsInstancedANGLE", m === null) {
            console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
            return
        }
        m[p](r, f, o, d * l, g), t.update(f, r, g)
    }
    this.setMode = a, this.setIndex = c, this.render = h, this.renderInstances = u
}

function S_(s) {
    const e = {
            geometries: 0,
            textures: 0
        },
        t = {
            frame: 0,
            calls: 0,
            triangles: 0,
            points: 0,
            lines: 0
        };

    function n(r, a, o) {
        switch (t.calls++, a) {
            case 4:
                t.triangles += o * (r / 3);
                break;
            case 1:
                t.lines += o * (r / 2);
                break;
            case 3:
                t.lines += o * (r - 1);
                break;
            case 2:
                t.lines += o * r;
                break;
            case 0:
                t.points += o * r;
                break;
            default:
                console.error("THREE.WebGLInfo: Unknown draw mode:", a);
                break
        }
    }

    function i() {
        t.frame++, t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0
    }
    return {
        memory: e,
        render: t,
        programs: null,
        autoReset: !0,
        reset: i,
        update: n
    }
}

function w_(s, e) {
    return s[0] - e[0]
}

function M_(s, e) {
    return Math.abs(e[1]) - Math.abs(s[1])
}

function b_(s, e, t) {
    const n = {},
        i = new Float32Array(8),
        r = new WeakMap,
        a = new je,
        o = [];
    for (let c = 0; c < 8; c++) o[c] = [c, 0];

    function l(c, h, u) {
        const d = c.morphTargetInfluences;
        if (e.isWebGL2 === !0) {
            const g = h.morphAttributes.position || h.morphAttributes.normal || h.morphAttributes.color,
                m = g !== void 0 ? g.length : 0;
            let p = r.get(h);
            if (p === void 0 || p.count !== m) {
                let U = function() {
                    F.dispose(), r.delete(h), h.removeEventListener("dispose", U)
                };
                var f = U;
                p !== void 0 && p.texture.dispose();
                const y = h.morphAttributes.position !== void 0,
                    S = h.morphAttributes.normal !== void 0,
                    T = h.morphAttributes.color !== void 0,
                    L = h.morphAttributes.position || [],
                    I = h.morphAttributes.normal || [],
                    v = h.morphAttributes.color || [];
                let A = 0;
                y === !0 && (A = 1), S === !0 && (A = 2), T === !0 && (A = 3);
                let P = h.attributes.position.count * A,
                    q = 1;
                P > e.maxTextureSize && (q = Math.ceil(P / e.maxTextureSize), P = e.maxTextureSize);
                const X = new Float32Array(P * q * 4 * m),
                    F = new Ku(X, P, q, m);
                F.type = oi, F.needsUpdate = !0;
                const D = A * 4;
                for (let j = 0; j < m; j++) {
                    const Z = L[j],
                        H = I[j],
                        J = v[j],
                        Y = P * q * 4 * j;
                    for (let ge = 0; ge < Z.count; ge++) {
                        const k = ge * D;
                        y === !0 && (a.fromBufferAttribute(Z, ge), X[Y + k + 0] = a.x, X[Y + k + 1] = a.y, X[Y + k + 2] = a.z, X[Y + k + 3] = 0), S === !0 && (a.fromBufferAttribute(H, ge), X[Y + k + 4] = a.x, X[Y + k + 5] = a.y, X[Y + k + 6] = a.z, X[Y + k + 7] = 0), T === !0 && (a.fromBufferAttribute(J, ge), X[Y + k + 8] = a.x, X[Y + k + 9] = a.y, X[Y + k + 10] = a.z, X[Y + k + 11] = J.itemSize === 4 ? a.w : 1)
                    }
                }
                p = {
                    count: m,
                    texture: F,
                    size: new ve(P, q)
                }, r.set(h, p), h.addEventListener("dispose", U)
            }
            let _ = 0;
            for (let y = 0; y < d.length; y++) _ += d[y];
            const E = h.morphTargetsRelative ? 1 : 1 - _;
            u.getUniforms().setValue(s, "morphTargetBaseInfluence", E), u.getUniforms().setValue(s, "morphTargetInfluences", d), u.getUniforms().setValue(s, "morphTargetsTexture", p.texture, t), u.getUniforms().setValue(s, "morphTargetsTextureSize", p.size)
        } else {
            const g = d === void 0 ? 0 : d.length;
            let m = n[h.id];
            if (m === void 0 || m.length !== g) {
                m = [];
                for (let S = 0; S < g; S++) m[S] = [S, 0];
                n[h.id] = m
            }
            for (let S = 0; S < g; S++) {
                const T = m[S];
                T[0] = S, T[1] = d[S]
            }
            m.sort(M_);
            for (let S = 0; S < 8; S++) S < g && m[S][1] ? (o[S][0] = m[S][0], o[S][1] = m[S][1]) : (o[S][0] = Number.MAX_SAFE_INTEGER, o[S][1] = 0);
            o.sort(w_);
            const p = h.morphAttributes.position,
                _ = h.morphAttributes.normal;
            let E = 0;
            for (let S = 0; S < 8; S++) {
                const T = o[S],
                    L = T[0],
                    I = T[1];
                L !== Number.MAX_SAFE_INTEGER && I ? (p && h.getAttribute("morphTarget" + S) !== p[L] && h.setAttribute("morphTarget" + S, p[L]), _ && h.getAttribute("morphNormal" + S) !== _[L] && h.setAttribute("morphNormal" + S, _[L]), i[S] = I, E += I) : (p && h.hasAttribute("morphTarget" + S) === !0 && h.deleteAttribute("morphTarget" + S), _ && h.hasAttribute("morphNormal" + S) === !0 && h.deleteAttribute("morphNormal" + S), i[S] = 0)
            }
            const y = h.morphTargetsRelative ? 1 : 1 - E;
            u.getUniforms().setValue(s, "morphTargetBaseInfluence", y), u.getUniforms().setValue(s, "morphTargetInfluences", i)
        }
    }
    return {
        update: l
    }
}

function E_(s, e, t, n) {
    let i = new WeakMap;

    function r(l) {
        const c = n.render.frame,
            h = l.geometry,
            u = e.get(l, h);
        return i.get(u) !== c && (e.update(u), i.set(u, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), t.update(l.instanceMatrix, 34962), l.instanceColor !== null && t.update(l.instanceColor, 34962)), u
    }

    function a() {
        i = new WeakMap
    }

    function o(l) {
        const c = l.target;
        c.removeEventListener("dispose", o), t.remove(c.instanceMatrix), c.instanceColor !== null && t.remove(c.instanceColor)
    }
    return {
        update: r,
        dispose: a
    }
}
const sd = new wt,
    rd = new Ku,
    ad = new um,
    od = new nd,
    Ah = [],
    Ch = [],
    Lh = new Float32Array(16),
    Ih = new Float32Array(9),
    Rh = new Float32Array(4);

function Xs(s, e, t) {
    const n = s[0];
    if (n <= 0 || n > 0) return s;
    const i = e * t;
    let r = Ah[i];
    if (r === void 0 && (r = new Float32Array(i), Ah[i] = r), e !== 0) {
        n.toArray(r, 0);
        for (let a = 1, o = 0; a !== e; ++a) o += t, s[a].toArray(r, o)
    }
    return r
}

function ht(s, e) {
    if (s.length !== e.length) return !1;
    for (let t = 0, n = s.length; t < n; t++)
        if (s[t] !== e[t]) return !1;
    return !0
}

function ut(s, e) {
    for (let t = 0, n = e.length; t < n; t++) s[t] = e[t]
}

function Ya(s, e) {
    let t = Ch[e];
    t === void 0 && (t = new Int32Array(e), Ch[e] = t);
    for (let n = 0; n !== e; ++n) t[n] = s.allocateTextureUnit();
    return t
}

function T_(s, e) {
    const t = this.cache;
    t[0] !== e && (s.uniform1f(this.addr, e), t[0] = e)
}

function A_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y) && (s.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
    else {
        if (ht(t, e)) return;
        s.uniform2fv(this.addr, e), ut(t, e)
    }
}

function C_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
    else if (e.r !== void 0)(t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (s.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
    else {
        if (ht(t, e)) return;
        s.uniform3fv(this.addr, e), ut(t, e)
    }
}

function L_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
    else {
        if (ht(t, e)) return;
        s.uniform4fv(this.addr, e), ut(t, e)
    }
}

function I_(s, e) {
    const t = this.cache,
        n = e.elements;
    if (n === void 0) {
        if (ht(t, e)) return;
        s.uniformMatrix2fv(this.addr, !1, e), ut(t, e)
    } else {
        if (ht(t, n)) return;
        Rh.set(n), s.uniformMatrix2fv(this.addr, !1, Rh), ut(t, n)
    }
}

function R_(s, e) {
    const t = this.cache,
        n = e.elements;
    if (n === void 0) {
        if (ht(t, e)) return;
        s.uniformMatrix3fv(this.addr, !1, e), ut(t, e)
    } else {
        if (ht(t, n)) return;
        Ih.set(n), s.uniformMatrix3fv(this.addr, !1, Ih), ut(t, n)
    }
}

function D_(s, e) {
    const t = this.cache,
        n = e.elements;
    if (n === void 0) {
        if (ht(t, e)) return;
        s.uniformMatrix4fv(this.addr, !1, e), ut(t, e)
    } else {
        if (ht(t, n)) return;
        Lh.set(n), s.uniformMatrix4fv(this.addr, !1, Lh), ut(t, n)
    }
}

function P_(s, e) {
    const t = this.cache;
    t[0] !== e && (s.uniform1i(this.addr, e), t[0] = e)
}

function N_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y) && (s.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
    else {
        if (ht(t, e)) return;
        s.uniform2iv(this.addr, e), ut(t, e)
    }
}

function B_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
    else {
        if (ht(t, e)) return;
        s.uniform3iv(this.addr, e), ut(t, e)
    }
}

function F_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
    else {
        if (ht(t, e)) return;
        s.uniform4iv(this.addr, e), ut(t, e)
    }
}

function k_(s, e) {
    const t = this.cache;
    t[0] !== e && (s.uniform1ui(this.addr, e), t[0] = e)
}

function O_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y) && (s.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
    else {
        if (ht(t, e)) return;
        s.uniform2uiv(this.addr, e), ut(t, e)
    }
}

function U_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
    else {
        if (ht(t, e)) return;
        s.uniform3uiv(this.addr, e), ut(t, e)
    }
}

function z_(s, e) {
    const t = this.cache;
    if (e.x !== void 0)(t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
    else {
        if (ht(t, e)) return;
        s.uniform4uiv(this.addr, e), ut(t, e)
    }
}

function G_(s, e, t) {
    const n = this.cache,
        i = t.allocateTextureUnit();
    n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture2D(e || sd, i)
}

function V_(s, e, t) {
    const n = this.cache,
        i = t.allocateTextureUnit();
    n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture3D(e || ad, i)
}

function H_(s, e, t) {
    const n = this.cache,
        i = t.allocateTextureUnit();
    n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTextureCube(e || od, i)
}

function W_(s, e, t) {
    const n = this.cache,
        i = t.allocateTextureUnit();
    n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture2DArray(e || rd, i)
}

function X_(s) {
    switch (s) {
        case 5126:
            return T_;
        case 35664:
            return A_;
        case 35665:
            return C_;
        case 35666:
            return L_;
        case 35674:
            return I_;
        case 35675:
            return R_;
        case 35676:
            return D_;
        case 5124:
        case 35670:
            return P_;
        case 35667:
        case 35671:
            return N_;
        case 35668:
        case 35672:
            return B_;
        case 35669:
        case 35673:
            return F_;
        case 5125:
            return k_;
        case 36294:
            return O_;
        case 36295:
            return U_;
        case 36296:
            return z_;
        case 35678:
        case 36198:
        case 36298:
        case 36306:
        case 35682:
            return G_;
        case 35679:
        case 36299:
        case 36307:
            return V_;
        case 35680:
        case 36300:
        case 36308:
        case 36293:
            return H_;
        case 36289:
        case 36303:
        case 36311:
        case 36292:
            return W_
    }
}

function q_(s, e) {
    s.uniform1fv(this.addr, e)
}

function j_(s, e) {
    const t = Xs(e, this.size, 2);
    s.uniform2fv(this.addr, t)
}

function Y_(s, e) {
    const t = Xs(e, this.size, 3);
    s.uniform3fv(this.addr, t)
}

function $_(s, e) {
    const t = Xs(e, this.size, 4);
    s.uniform4fv(this.addr, t)
}

function K_(s, e) {
    const t = Xs(e, this.size, 4);
    s.uniformMatrix2fv(this.addr, !1, t)
}

function Z_(s, e) {
    const t = Xs(e, this.size, 9);
    s.uniformMatrix3fv(this.addr, !1, t)
}

function J_(s, e) {
    const t = Xs(e, this.size, 16);
    s.uniformMatrix4fv(this.addr, !1, t)
}

function Q_(s, e) {
    s.uniform1iv(this.addr, e)
}

function ex(s, e) {
    s.uniform2iv(this.addr, e)
}

function tx(s, e) {
    s.uniform3iv(this.addr, e)
}

function nx(s, e) {
    s.uniform4iv(this.addr, e)
}

function ix(s, e) {
    s.uniform1uiv(this.addr, e)
}

function sx(s, e) {
    s.uniform2uiv(this.addr, e)
}

function rx(s, e) {
    s.uniform3uiv(this.addr, e)
}

function ax(s, e) {
    s.uniform4uiv(this.addr, e)
}

function ox(s, e, t) {
    const n = this.cache,
        i = e.length,
        r = Ya(t, i);
    ht(n, r) || (s.uniform1iv(this.addr, r), ut(n, r));
    for (let a = 0; a !== i; ++a) t.setTexture2D(e[a] || sd, r[a])
}

function lx(s, e, t) {
    const n = this.cache,
        i = e.length,
        r = Ya(t, i);
    ht(n, r) || (s.uniform1iv(this.addr, r), ut(n, r));
    for (let a = 0; a !== i; ++a) t.setTexture3D(e[a] || ad, r[a])
}

function cx(s, e, t) {
    const n = this.cache,
        i = e.length,
        r = Ya(t, i);
    ht(n, r) || (s.uniform1iv(this.addr, r), ut(n, r));
    for (let a = 0; a !== i; ++a) t.setTextureCube(e[a] || od, r[a])
}

function hx(s, e, t) {
    const n = this.cache,
        i = e.length,
        r = Ya(t, i);
    ht(n, r) || (s.uniform1iv(this.addr, r), ut(n, r));
    for (let a = 0; a !== i; ++a) t.setTexture2DArray(e[a] || rd, r[a])
}

function ux(s) {
    switch (s) {
        case 5126:
            return q_;
        case 35664:
            return j_;
        case 35665:
            return Y_;
        case 35666:
            return $_;
        case 35674:
            return K_;
        case 35675:
            return Z_;
        case 35676:
            return J_;
        case 5124:
        case 35670:
            return Q_;
        case 35667:
        case 35671:
            return ex;
        case 35668:
        case 35672:
            return tx;
        case 35669:
        case 35673:
            return nx;
        case 5125:
            return ix;
        case 36294:
            return sx;
        case 36295:
            return rx;
        case 36296:
            return ax;
        case 35678:
        case 36198:
        case 36298:
        case 36306:
        case 35682:
            return ox;
        case 35679:
        case 36299:
        case 36307:
            return lx;
        case 35680:
        case 36300:
        case 36308:
        case 36293:
            return cx;
        case 36289:
        case 36303:
        case 36311:
        case 36292:
            return hx
    }
}
class dx {
    constructor(e, t, n) {
        this.id = e, this.addr = n, this.cache = [], this.setValue = X_(t.type)
    }
}
class fx {
    constructor(e, t, n) {
        this.id = e, this.addr = n, this.cache = [], this.size = t.size, this.setValue = ux(t.type)
    }
}
class px {
    constructor(e) {
        this.id = e, this.seq = [], this.map = {}
    }
    setValue(e, t, n) {
        const i = this.seq;
        for (let r = 0, a = i.length; r !== a; ++r) {
            const o = i[r];
            o.setValue(e, t[o.id], n)
        }
    }
}
const Oo = /(\w+)(\])?(\[|\.)?/g;

function Dh(s, e) {
    s.seq.push(e), s.map[e.id] = e
}

function mx(s, e, t) {
    const n = s.name,
        i = n.length;
    for (Oo.lastIndex = 0;;) {
        const r = Oo.exec(n),
            a = Oo.lastIndex;
        let o = r[1];
        const l = r[2] === "]",
            c = r[3];
        if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === i) {
            Dh(t, c === void 0 ? new dx(o, s, e) : new fx(o, s, e));
            break
        } else {
            let u = t.map[o];
            u === void 0 && (u = new px(o), Dh(t, u)), t = u
        }
    }
}
class ba {
    constructor(e, t) {
        this.seq = [], this.map = {};
        const n = e.getProgramParameter(t, 35718);
        for (let i = 0; i < n; ++i) {
            const r = e.getActiveUniform(t, i),
                a = e.getUniformLocation(t, r.name);
            mx(r, a, this)
        }
    }
    setValue(e, t, n, i) {
        const r = this.map[t];
        r !== void 0 && r.setValue(e, n, i)
    }
    setOptional(e, t, n) {
        const i = t[n];
        i !== void 0 && this.setValue(e, n, i)
    }
    static upload(e, t, n, i) {
        for (let r = 0, a = t.length; r !== a; ++r) {
            const o = t[r],
                l = n[o.id];
            l.needsUpdate !== !1 && o.setValue(e, l.value, i)
        }
    }
    static seqWithValue(e, t) {
        const n = [];
        for (let i = 0, r = e.length; i !== r; ++i) {
            const a = e[i];
            a.id in t && n.push(a)
        }
        return n
    }
}

function Ph(s, e, t) {
    const n = s.createShader(e);
    return s.shaderSource(n, t), s.compileShader(n), n
}
let gx = 0;

function _x(s, e) {
    const t = s.split(`
`),
        n = [],
        i = Math.max(e - 6, 0),
        r = Math.min(e + 6, t.length);
    for (let a = i; a < r; a++) {
        const o = a + 1;
        n.push(`${o===e?">":" "} ${o}: ${t[a]}`)
    }
    return n.join(`
`)
}

function xx(s) {
    switch (s) {
        case Oi:
            return ["Linear", "( value )"];
        case Be:
            return ["sRGB", "( value )"];
        default:
            return console.warn("THREE.WebGLProgram: Unsupported encoding:", s), ["Linear", "( value )"]
    }
}

function Nh(s, e, t) {
    const n = s.getShaderParameter(e, 35713),
        i = s.getShaderInfoLog(e).trim();
    if (n && i === "") return "";
    const r = /ERROR: 0:(\d+)/.exec(i);
    if (r) {
        const a = parseInt(r[1]);
        return t.toUpperCase() + `

` + i + `

` + _x(s.getShaderSource(e), a)
    } else return i
}

function yx(s, e) {
    const t = xx(e);
    return "vec4 " + s + "( vec4 value ) { return LinearTo" + t[0] + t[1] + "; }"
}

function vx(s, e) {
    let t;
    switch (e) {
        case yp:
            t = "Linear";
            break;
        case vp:
            t = "Reinhard";
            break;
        case Sp:
            t = "OptimizedCineon";
            break;
        case Ou:
            t = "ACESFilmic";
            break;
        case wp:
            t = "Custom";
            break;
        default:
            console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear"
    }
    return "vec3 " + s + "( vec3 color ) { return " + t + "ToneMapping( color ); }"
}

function Sx(s) {
    return [s.extensionDerivatives || s.envMapCubeUVHeight || s.bumpMap || s.tangentSpaceNormalMap || s.clearcoatNormalMap || s.flatShading || s.shaderID === "physical" ? "#extension GL_OES_standard_derivatives : enable" : "", (s.extensionFragDepth || s.logarithmicDepthBuffer) && s.rendererExtensionFragDepth ? "#extension GL_EXT_frag_depth : enable" : "", s.extensionDrawBuffers && s.rendererExtensionDrawBuffers ? "#extension GL_EXT_draw_buffers : require" : "", (s.extensionShaderTextureLOD || s.envMap || s.transmission) && s.rendererExtensionShaderTextureLod ? "#extension GL_EXT_shader_texture_lod : enable" : ""].filter(pr).join(`
`)
}

function wx(s) {
    const e = [];
    for (const t in s) {
        const n = s[t];
        n !== !1 && e.push("#define " + t + " " + n)
    }
    return e.join(`
`)
}

function Mx(s, e) {
    const t = {},
        n = s.getProgramParameter(e, 35721);
    for (let i = 0; i < n; i++) {
        const r = s.getActiveAttrib(e, i),
            a = r.name;
        let o = 1;
        r.type === 35674 && (o = 2), r.type === 35675 && (o = 3), r.type === 35676 && (o = 4), t[a] = {
            type: r.type,
            location: s.getAttribLocation(e, a),
            locationSize: o
        }
    }
    return t
}

function pr(s) {
    return s !== ""
}

function Bh(s, e) {
    const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
    return s.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows)
}

function Fh(s, e) {
    return s.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection)
}
const bx = /^[ \t]*#include +<([\w\d./]+)>/gm;

function ul(s) {
    return s.replace(bx, Ex)
}

function Ex(s, e) {
    const t = Ee[e];
    if (t === void 0) throw new Error("Can not resolve #include <" + e + ">");
    return ul(t)
}
const Tx = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function kh(s) {
    return s.replace(Tx, Ax)
}

function Ax(s, e, t, n) {
    let i = "";
    for (let r = parseInt(e); r < parseInt(t); r++) i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
    return i
}

function Oh(s) {
    let e = "precision " + s.precision + ` float;
precision ` + s.precision + " int;";
    return s.precision === "highp" ? e += `
#define HIGH_PRECISION` : s.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : s.precision === "lowp" && (e += `
#define LOW_PRECISION`), e
}

function Cx(s) {
    let e = "SHADOWMAP_TYPE_BASIC";
    return s.shadowMapType === Pu ? e = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === Nu ? e = "SHADOWMAP_TYPE_PCF_SOFT" : s.shadowMapType === fr && (e = "SHADOWMAP_TYPE_VSM"), e
}

function Lx(s) {
    let e = "ENVMAP_TYPE_CUBE";
    if (s.envMap) switch (s.envMapMode) {
        case Ns:
        case Bs:
            e = "ENVMAP_TYPE_CUBE";
            break;
        case Xa:
            e = "ENVMAP_TYPE_CUBE_UV";
            break
    }
    return e
}

function Ix(s) {
    let e = "ENVMAP_MODE_REFLECTION";
    if (s.envMap) switch (s.envMapMode) {
        case Bs:
            e = "ENVMAP_MODE_REFRACTION";
            break
    }
    return e
}

function Rx(s) {
    let e = "ENVMAP_BLENDING_NONE";
    if (s.envMap) switch (s.combine) {
        case ku:
            e = "ENVMAP_BLENDING_MULTIPLY";
            break;
        case _p:
            e = "ENVMAP_BLENDING_MIX";
            break;
        case xp:
            e = "ENVMAP_BLENDING_ADD";
            break
    }
    return e
}

function Dx(s) {
    const e = s.envMapCubeUVHeight;
    if (e === null) return null;
    const t = Math.log2(e) - 2,
        n = 1 / e;
    return {
        texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)),
        texelHeight: n,
        maxMip: t
    }
}

function Px(s, e, t, n) {
    const i = s.getContext(),
        r = t.defines;
    let a = t.vertexShader,
        o = t.fragmentShader;
    const l = Cx(t),
        c = Lx(t),
        h = Ix(t),
        u = Rx(t),
        d = Dx(t),
        f = t.isWebGL2 ? "" : Sx(t),
        g = wx(r),
        m = i.createProgram();
    let p, _, E = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
    t.isRawShaderMaterial ? (p = [g].filter(pr).join(`
`), p.length > 0 && (p += `
`), _ = [f, g].filter(pr).join(`
`), _.length > 0 && (_ += `
`)) : (p = [Oh(t), "#define SHADER_NAME " + t.shaderName, g, t.instancing ? "#define USE_INSTANCING" : "", t.instancingColor ? "#define USE_INSTANCING_COLOR" : "", t.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "", t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.map ? "#define USE_MAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + h : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMap && t.objectSpaceNormalMap ? "#define OBJECTSPACE_NORMALMAP" : "", t.normalMap && t.tangentSpaceNormalMap ? "#define TANGENTSPACE_NORMALMAP" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.displacementMap && t.supportsVertexTextures ? "#define USE_DISPLACEMENTMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularIntensityMap ? "#define USE_SPECULARINTENSITYMAP" : "", t.specularColorMap ? "#define USE_SPECULARCOLORMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.sheenColorMap ? "#define USE_SHEENCOLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEENROUGHNESSMAP" : "", t.vertexTangents ? "#define USE_TANGENT" : "", t.vertexColors ? "#define USE_COLOR" : "", t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", t.vertexUvs ? "#define USE_UV" : "", t.uvsVertexOnly ? "#define UVS_VERTEX_ONLY" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.skinning ? "#define USE_SKINNING" : "", t.morphTargets ? "#define USE_MORPHTARGETS" : "", t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "", t.morphColors && t.isWebGL2 ? "#define USE_MORPHCOLORS" : "", t.morphTargetsCount > 0 && t.isWebGL2 ? "#define MORPHTARGETS_TEXTURE" : "", t.morphTargetsCount > 0 && t.isWebGL2 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "", t.morphTargetsCount > 0 && t.isWebGL2 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + l : "", t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", t.logarithmicDepthBuffer && t.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )", "	attribute vec3 morphTarget0;", "	attribute vec3 morphTarget1;", "	attribute vec3 morphTarget2;", "	attribute vec3 morphTarget3;", "	#ifdef USE_MORPHNORMALS", "		attribute vec3 morphNormal0;", "		attribute vec3 morphNormal1;", "		attribute vec3 morphNormal2;", "		attribute vec3 morphNormal3;", "	#else", "		attribute vec3 morphTarget4;", "		attribute vec3 morphTarget5;", "		attribute vec3 morphTarget6;", "		attribute vec3 morphTarget7;", "	#endif", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(pr).join(`
`), _ = [f, Oh(t), "#define SHADER_NAME " + t.shaderName, g, t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.map ? "#define USE_MAP" : "", t.matcap ? "#define USE_MATCAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + c : "", t.envMap ? "#define " + h : "", t.envMap ? "#define " + u : "", d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "", d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "", d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMap && t.objectSpaceNormalMap ? "#define OBJECTSPACE_NORMALMAP" : "", t.normalMap && t.tangentSpaceNormalMap ? "#define TANGENTSPACE_NORMALMAP" : "", t.clearcoat ? "#define USE_CLEARCOAT" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.iridescence ? "#define USE_IRIDESCENCE" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularIntensityMap ? "#define USE_SPECULARINTENSITYMAP" : "", t.specularColorMap ? "#define USE_SPECULARCOLORMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.alphaTest ? "#define USE_ALPHATEST" : "", t.sheen ? "#define USE_SHEEN" : "", t.sheenColorMap ? "#define USE_SHEENCOLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEENROUGHNESSMAP" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", t.vertexTangents ? "#define USE_TANGENT" : "", t.vertexColors || t.instancingColor ? "#define USE_COLOR" : "", t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", t.vertexUvs ? "#define USE_UV" : "", t.uvsVertexOnly ? "#define UVS_VERTEX_ONLY" : "", t.gradientMap ? "#define USE_GRADIENTMAP" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + l : "", t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", t.useLegacyLights ? "#define LEGACY_LIGHTS" : "", t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", t.logarithmicDepthBuffer && t.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", t.toneMapping !== qn ? "#define TONE_MAPPING" : "", t.toneMapping !== qn ? Ee.tonemapping_pars_fragment : "", t.toneMapping !== qn ? vx("toneMapping", t.toneMapping) : "", t.dithering ? "#define DITHERING" : "", t.opaque ? "#define OPAQUE" : "", Ee.encodings_pars_fragment, yx("linearToOutputTexel", t.outputEncoding), t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "", `
`].filter(pr).join(`
`)), a = ul(a), a = Bh(a, t), a = Fh(a, t), o = ul(o), o = Bh(o, t), o = Fh(o, t), a = kh(a), o = kh(o), t.isWebGL2 && t.isRawShaderMaterial !== !0 && (E = `#version 300 es
`, p = ["precision mediump sampler2DArray;", "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + p, _ = ["#define varying in", t.glslVersion === oh ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", t.glslVersion === oh ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + _);
    const y = E + p + a,
        S = E + _ + o,
        T = Ph(i, 35633, y),
        L = Ph(i, 35632, S);
    if (i.attachShader(m, T), i.attachShader(m, L), t.index0AttributeName !== void 0 ? i.bindAttribLocation(m, 0, t.index0AttributeName) : t.morphTargets === !0 && i.bindAttribLocation(m, 0, "position"), i.linkProgram(m), s.debug.checkShaderErrors) {
        const A = i.getProgramInfoLog(m).trim(),
            P = i.getShaderInfoLog(T).trim(),
            q = i.getShaderInfoLog(L).trim();
        let X = !0,
            F = !0;
        if (i.getProgramParameter(m, 35714) === !1) {
            X = !1;
            const D = Nh(i, T, "vertex"),
                U = Nh(i, L, "fragment");
            console.error("THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(m, 35715) + `

Program Info Log: ` + A + `
` + D + `
` + U)
        } else A !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", A) : (P === "" || q === "") && (F = !1);
        F && (this.diagnostics = {
            runnable: X,
            programLog: A,
            vertexShader: {
                log: P,
                prefix: p
            },
            fragmentShader: {
                log: q,
                prefix: _
            }
        })
    }
    i.deleteShader(T), i.deleteShader(L);
    let I;
    this.getUniforms = function() {
        return I === void 0 && (I = new ba(i, m)), I
    };
    let v;
    return this.getAttributes = function() {
        return v === void 0 && (v = Mx(i, m)), v
    }, this.destroy = function() {
        n.releaseStatesOfProgram(this), i.deleteProgram(m), this.program = void 0
    }, this.name = t.shaderName, this.id = gx++, this.cacheKey = e, this.usedTimes = 1, this.program = m, this.vertexShader = T, this.fragmentShader = L, this
}
let Nx = 0;
class Bx {
    constructor() {
        this.shaderCache = new Map, this.materialCache = new Map
    }
    update(e) {
        const t = e.vertexShader,
            n = e.fragmentShader,
            i = this._getShaderStage(t),
            r = this._getShaderStage(n),
            a = this._getShaderCacheForMaterial(e);
        return a.has(i) === !1 && (a.add(i), i.usedTimes++), a.has(r) === !1 && (a.add(r), r.usedTimes++), this
    }
    remove(e) {
        const t = this.materialCache.get(e);
        for (const n of t) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
        return this.materialCache.delete(e), this
    }
    getVertexShaderID(e) {
        return this._getShaderStage(e.vertexShader).id
    }
    getFragmentShaderID(e) {
        return this._getShaderStage(e.fragmentShader).id
    }
    dispose() {
        this.shaderCache.clear(), this.materialCache.clear()
    }
    _getShaderCacheForMaterial(e) {
        const t = this.materialCache;
        let n = t.get(e);
        return n === void 0 && (n = new Set, t.set(e, n)), n
    }
    _getShaderStage(e) {
        const t = this.shaderCache;
        let n = t.get(e);
        return n === void 0 && (n = new Fx(e), t.set(e, n)), n
    }
}
class Fx {
    constructor(e) {
        this.id = Nx++, this.code = e, this.usedTimes = 0
    }
}

function kx(s, e, t, n, i, r, a) {
    const o = new Yl,
        l = new Bx,
        c = [],
        h = i.isWebGL2,
        u = i.logarithmicDepthBuffer,
        d = i.vertexTextures;
    let f = i.precision;
    const g = {
        MeshDepthMaterial: "depth",
        MeshDistanceMaterial: "distanceRGBA",
        MeshNormalMaterial: "normal",
        MeshBasicMaterial: "basic",
        MeshLambertMaterial: "lambert",
        MeshPhongMaterial: "phong",
        MeshToonMaterial: "toon",
        MeshStandardMaterial: "physical",
        MeshPhysicalMaterial: "physical",
        MeshMatcapMaterial: "matcap",
        LineBasicMaterial: "basic",
        LineDashedMaterial: "dashed",
        PointsMaterial: "points",
        ShadowMaterial: "shadow",
        SpriteMaterial: "sprite"
    };

    function m(v, A, P, q, X) {
        const F = q.fog,
            D = X.geometry,
            U = v.isMeshStandardMaterial ? q.environment : null,
            j = (v.isMeshStandardMaterial ? t : e).get(v.envMap || U),
            Z = j && j.mapping === Xa ? j.image.height : null,
            H = g[v.type];
        v.precision !== null && (f = i.getMaxPrecision(v.precision), f !== v.precision && console.warn("THREE.WebGLProgram.getParameters:", v.precision, "not supported, using", f, "instead."));
        const J = D.morphAttributes.position || D.morphAttributes.normal || D.morphAttributes.color,
            Y = J !== void 0 ? J.length : 0;
        let ge = 0;
        D.morphAttributes.position !== void 0 && (ge = 1), D.morphAttributes.normal !== void 0 && (ge = 2), D.morphAttributes.color !== void 0 && (ge = 3);
        let k, K, ne, B;
        if (H) {
            const Ce = Tn[H];
            k = Ce.vertexShader, K = Ce.fragmentShader
        } else k = v.vertexShader, K = v.fragmentShader, l.update(v), ne = l.getVertexShaderID(v), B = l.getFragmentShaderID(v);
        const ce = s.getRenderTarget(),
            ae = v.alphaTest > 0,
            he = v.clearcoat > 0,
            ue = v.iridescence > 0;
        return {
            isWebGL2: h,
            shaderID: H,
            shaderName: v.type,
            vertexShader: k,
            fragmentShader: K,
            defines: v.defines,
            customVertexShaderID: ne,
            customFragmentShaderID: B,
            isRawShaderMaterial: v.isRawShaderMaterial === !0,
            glslVersion: v.glslVersion,
            precision: f,
            instancing: X.isInstancedMesh === !0,
            instancingColor: X.isInstancedMesh === !0 && X.instanceColor !== null,
            supportsVertexTextures: d,
            outputEncoding: ce === null ? s.outputEncoding : ce.isXRRenderTarget === !0 ? ce.texture.encoding : Oi,
            map: !!v.map,
            matcap: !!v.matcap,
            envMap: !!j,
            envMapMode: j && j.mapping,
            envMapCubeUVHeight: Z,
            lightMap: !!v.lightMap,
            aoMap: !!v.aoMap,
            emissiveMap: !!v.emissiveMap,
            bumpMap: !!v.bumpMap,
            normalMap: !!v.normalMap,
            objectSpaceNormalMap: v.normalMapType === Hp,
            tangentSpaceNormalMap: v.normalMapType === ql,
            decodeVideoTexture: !!v.map && v.map.isVideoTexture === !0 && v.map.encoding === Be,
            clearcoat: he,
            clearcoatMap: he && !!v.clearcoatMap,
            clearcoatRoughnessMap: he && !!v.clearcoatRoughnessMap,
            clearcoatNormalMap: he && !!v.clearcoatNormalMap,
            iridescence: ue,
            iridescenceMap: ue && !!v.iridescenceMap,
            iridescenceThicknessMap: ue && !!v.iridescenceThicknessMap,
            displacementMap: !!v.displacementMap,
            roughnessMap: !!v.roughnessMap,
            metalnessMap: !!v.metalnessMap,
            specularMap: !!v.specularMap,
            specularIntensityMap: !!v.specularIntensityMap,
            specularColorMap: !!v.specularColorMap,
            opaque: v.transparent === !1 && v.blending === Es,
            alphaMap: !!v.alphaMap,
            alphaTest: ae,
            gradientMap: !!v.gradientMap,
            sheen: v.sheen > 0,
            sheenColorMap: !!v.sheenColorMap,
            sheenRoughnessMap: !!v.sheenRoughnessMap,
            transmission: v.transmission > 0,
            transmissionMap: !!v.transmissionMap,
            thicknessMap: !!v.thicknessMap,
            combine: v.combine,
            vertexTangents: !!v.normalMap && !!D.attributes.tangent,
            vertexColors: v.vertexColors,
            vertexAlphas: v.vertexColors === !0 && !!D.attributes.color && D.attributes.color.itemSize === 4,
            vertexUvs: !!v.map || !!v.bumpMap || !!v.normalMap || !!v.specularMap || !!v.alphaMap || !!v.emissiveMap || !!v.roughnessMap || !!v.metalnessMap || !!v.clearcoatMap || !!v.clearcoatRoughnessMap || !!v.clearcoatNormalMap || !!v.iridescenceMap || !!v.iridescenceThicknessMap || !!v.displacementMap || !!v.transmissionMap || !!v.thicknessMap || !!v.specularIntensityMap || !!v.specularColorMap || !!v.sheenColorMap || !!v.sheenRoughnessMap,
            uvsVertexOnly: !(v.map || v.bumpMap || v.normalMap || v.specularMap || v.alphaMap || v.emissiveMap || v.roughnessMap || v.metalnessMap || v.clearcoatNormalMap || v.iridescenceMap || v.iridescenceThicknessMap || v.transmission > 0 || v.transmissionMap || v.thicknessMap || v.specularIntensityMap || v.specularColorMap || v.sheen > 0 || v.sheenColorMap || v.sheenRoughnessMap) && !!v.displacementMap,
            fog: !!F,
            useFog: v.fog === !0,
            fogExp2: F && F.isFogExp2,
            flatShading: !!v.flatShading,
            sizeAttenuation: v.sizeAttenuation,
            logarithmicDepthBuffer: u,
            skinning: X.isSkinnedMesh === !0,
            morphTargets: D.morphAttributes.position !== void 0,
            morphNormals: D.morphAttributes.normal !== void 0,
            morphColors: D.morphAttributes.color !== void 0,
            morphTargetsCount: Y,
            morphTextureStride: ge,
            numDirLights: A.directional.length,
            numPointLights: A.point.length,
            numSpotLights: A.spot.length,
            numSpotLightMaps: A.spotLightMap.length,
            numRectAreaLights: A.rectArea.length,
            numHemiLights: A.hemi.length,
            numDirLightShadows: A.directionalShadowMap.length,
            numPointLightShadows: A.pointShadowMap.length,
            numSpotLightShadows: A.spotShadowMap.length,
            numSpotLightShadowsWithMaps: A.numSpotLightShadowsWithMaps,
            numClippingPlanes: a.numPlanes,
            numClipIntersection: a.numIntersection,
            dithering: v.dithering,
            shadowMapEnabled: s.shadowMap.enabled && P.length > 0,
            shadowMapType: s.shadowMap.type,
            toneMapping: v.toneMapped ? s.toneMapping : qn,
            useLegacyLights: s.useLegacyLights,
            premultipliedAlpha: v.premultipliedAlpha,
            doubleSided: v.side === Ln,
            flipSided: v.side === Qt,
            useDepthPacking: !!v.depthPacking,
            depthPacking: v.depthPacking || 0,
            index0AttributeName: v.index0AttributeName,
            extensionDerivatives: v.extensions && v.extensions.derivatives,
            extensionFragDepth: v.extensions && v.extensions.fragDepth,
            extensionDrawBuffers: v.extensions && v.extensions.drawBuffers,
            extensionShaderTextureLOD: v.extensions && v.extensions.shaderTextureLOD,
            rendererExtensionFragDepth: h || n.has("EXT_frag_depth"),
            rendererExtensionDrawBuffers: h || n.has("WEBGL_draw_buffers"),
            rendererExtensionShaderTextureLod: h || n.has("EXT_shader_texture_lod"),
            customProgramCacheKey: v.customProgramCacheKey()
        }
    }

    function p(v) {
        const A = [];
        if (v.shaderID ? A.push(v.shaderID) : (A.push(v.customVertexShaderID), A.push(v.customFragmentShaderID)), v.defines !== void 0)
            for (const P in v.defines) A.push(P), A.push(v.defines[P]);
        return v.isRawShaderMaterial === !1 && (_(A, v), E(A, v), A.push(s.outputEncoding)), A.push(v.customProgramCacheKey), A.join()
    }

    function _(v, A) {
        v.push(A.precision), v.push(A.outputEncoding), v.push(A.envMapMode), v.push(A.envMapCubeUVHeight), v.push(A.combine), v.push(A.vertexUvs), v.push(A.fogExp2), v.push(A.sizeAttenuation), v.push(A.morphTargetsCount), v.push(A.morphAttributeCount), v.push(A.numDirLights), v.push(A.numPointLights), v.push(A.numSpotLights), v.push(A.numSpotLightMaps), v.push(A.numHemiLights), v.push(A.numRectAreaLights), v.push(A.numDirLightShadows), v.push(A.numPointLightShadows), v.push(A.numSpotLightShadows), v.push(A.numSpotLightShadowsWithMaps), v.push(A.shadowMapType), v.push(A.toneMapping), v.push(A.numClippingPlanes), v.push(A.numClipIntersection), v.push(A.depthPacking)
    }

    function E(v, A) {
        o.disableAll(), A.isWebGL2 && o.enable(0), A.supportsVertexTextures && o.enable(1), A.instancing && o.enable(2), A.instancingColor && o.enable(3), A.map && o.enable(4), A.matcap && o.enable(5), A.envMap && o.enable(6), A.lightMap && o.enable(7), A.aoMap && o.enable(8), A.emissiveMap && o.enable(9), A.bumpMap && o.enable(10), A.normalMap && o.enable(11), A.objectSpaceNormalMap && o.enable(12), A.tangentSpaceNormalMap && o.enable(13), A.clearcoat && o.enable(14), A.clearcoatMap && o.enable(15), A.clearcoatRoughnessMap && o.enable(16), A.clearcoatNormalMap && o.enable(17), A.iridescence && o.enable(18), A.iridescenceMap && o.enable(19), A.iridescenceThicknessMap && o.enable(20), A.displacementMap && o.enable(21), A.specularMap && o.enable(22), A.roughnessMap && o.enable(23), A.metalnessMap && o.enable(24), A.gradientMap && o.enable(25), A.alphaMap && o.enable(26), A.alphaTest && o.enable(27), A.vertexColors && o.enable(28), A.vertexAlphas && o.enable(29), A.vertexUvs && o.enable(30), A.vertexTangents && o.enable(31), A.uvsVertexOnly && o.enable(32), v.push(o.mask), o.disableAll(), A.fog && o.enable(0), A.useFog && o.enable(1), A.flatShading && o.enable(2), A.logarithmicDepthBuffer && o.enable(3), A.skinning && o.enable(4), A.morphTargets && o.enable(5), A.morphNormals && o.enable(6), A.morphColors && o.enable(7), A.premultipliedAlpha && o.enable(8), A.shadowMapEnabled && o.enable(9), A.useLegacyLights && o.enable(10), A.doubleSided && o.enable(11), A.flipSided && o.enable(12), A.useDepthPacking && o.enable(13), A.dithering && o.enable(14), A.specularIntensityMap && o.enable(15), A.specularColorMap && o.enable(16), A.transmission && o.enable(17), A.transmissionMap && o.enable(18), A.thicknessMap && o.enable(19), A.sheen && o.enable(20), A.sheenColorMap && o.enable(21), A.sheenRoughnessMap && o.enable(22), A.decodeVideoTexture && o.enable(23), A.opaque && o.enable(24), v.push(o.mask)
    }

    function y(v) {
        const A = g[v.type];
        let P;
        if (A) {
            const q = Tn[A];
            P = Mm.clone(q.uniforms)
        } else P = v.uniforms;
        return P
    }

    function S(v, A) {
        let P;
        for (let q = 0, X = c.length; q < X; q++) {
            const F = c[q];
            if (F.cacheKey === A) {
                P = F, ++P.usedTimes;
                break
            }
        }
        return P === void 0 && (P = new Px(s, A, v, r), c.push(P)), P
    }

    function T(v) {
        if (--v.usedTimes === 0) {
            const A = c.indexOf(v);
            c[A] = c[c.length - 1], c.pop(), v.destroy()
        }
    }

    function L(v) {
        l.remove(v)
    }

    function I() {
        l.dispose()
    }
    return {
        getParameters: m,
        getProgramCacheKey: p,
        getUniforms: y,
        acquireProgram: S,
        releaseProgram: T,
        releaseShaderCache: L,
        programs: c,
        dispose: I
    }
}

function Ox() {
    let s = new WeakMap;

    function e(r) {
        let a = s.get(r);
        return a === void 0 && (a = {}, s.set(r, a)), a
    }

    function t(r) {
        s.delete(r)
    }

    function n(r, a, o) {
        s.get(r)[a] = o
    }

    function i() {
        s = new WeakMap
    }
    return {
        get: e,
        remove: t,
        update: n,
        dispose: i
    }
}

function Ux(s, e) {
    return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.material.id !== e.material.id ? s.material.id - e.material.id : s.z !== e.z ? s.z - e.z : s.id - e.id
}

function Uh(s, e) {
    return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.z !== e.z ? e.z - s.z : s.id - e.id
}

function zh() {
    const s = [];
    let e = 0;
    const t = [],
        n = [],
        i = [];

    function r() {
        e = 0, t.length = 0, n.length = 0, i.length = 0
    }

    function a(u, d, f, g, m, p) {
        let _ = s[e];
        return _ === void 0 ? (_ = {
            id: u.id,
            object: u,
            geometry: d,
            material: f,
            groupOrder: g,
            renderOrder: u.renderOrder,
            z: m,
            group: p
        }, s[e] = _) : (_.id = u.id, _.object = u, _.geometry = d, _.material = f, _.groupOrder = g, _.renderOrder = u.renderOrder, _.z = m, _.group = p), e++, _
    }

    function o(u, d, f, g, m, p) {
        const _ = a(u, d, f, g, m, p);
        f.transmission > 0 ? n.push(_) : f.transparent === !0 ? i.push(_) : t.push(_)
    }

    function l(u, d, f, g, m, p) {
        const _ = a(u, d, f, g, m, p);
        f.transmission > 0 ? n.unshift(_) : f.transparent === !0 ? i.unshift(_) : t.unshift(_)
    }

    function c(u, d) {
        t.length > 1 && t.sort(u || Ux), n.length > 1 && n.sort(d || Uh), i.length > 1 && i.sort(d || Uh)
    }

    function h() {
        for (let u = e, d = s.length; u < d; u++) {
            const f = s[u];
            if (f.id === null) break;
            f.id = null, f.object = null, f.geometry = null, f.material = null, f.group = null
        }
    }
    return {
        opaque: t,
        transmissive: n,
        transparent: i,
        init: r,
        push: o,
        unshift: l,
        finish: h,
        sort: c
    }
}

function zx() {
    let s = new WeakMap;

    function e(n, i) {
        const r = s.get(n);
        let a;
        return r === void 0 ? (a = new zh, s.set(n, [a])) : i >= r.length ? (a = new zh, r.push(a)) : a = r[i], a
    }

    function t() {
        s = new WeakMap
    }
    return {
        get: e,
        dispose: t
    }
}

function Gx() {
    const s = {};
    return {
        get: function(e) {
            if (s[e.id] !== void 0) return s[e.id];
            let t;
            switch (e.type) {
                case "DirectionalLight":
                    t = {
                        direction: new M,
                        color: new pe
                    };
                    break;
                case "SpotLight":
                    t = {
                        position: new M,
                        direction: new M,
                        color: new pe,
                        distance: 0,
                        coneCos: 0,
                        penumbraCos: 0,
                        decay: 0
                    };
                    break;
                case "PointLight":
                    t = {
                        position: new M,
                        color: new pe,
                        distance: 0,
                        decay: 0
                    };
                    break;
                case "HemisphereLight":
                    t = {
                        direction: new M,
                        skyColor: new pe,
                        groundColor: new pe
                    };
                    break;
                case "RectAreaLight":
                    t = {
                        color: new pe,
                        position: new M,
                        halfWidth: new M,
                        halfHeight: new M
                    };
                    break
            }
            return s[e.id] = t, t
        }
    }
}

function Vx() {
    const s = {};
    return {
        get: function(e) {
            if (s[e.id] !== void 0) return s[e.id];
            let t;
            switch (e.type) {
                case "DirectionalLight":
                    t = {
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new ve
                    };
                    break;
                case "SpotLight":
                    t = {
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new ve
                    };
                    break;
                case "PointLight":
                    t = {
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new ve,
                        shadowCameraNear: 1,
                        shadowCameraFar: 1e3
                    };
                    break
            }
            return s[e.id] = t, t
        }
    }
}
let Hx = 0;

function Wx(s, e) {
    return (e.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (s.map ? 1 : 0)
}

function Xx(s, e) {
    const t = new Gx,
        n = Vx(),
        i = {
            version: 0,
            hash: {
                directionalLength: -1,
                pointLength: -1,
                spotLength: -1,
                rectAreaLength: -1,
                hemiLength: -1,
                numDirectionalShadows: -1,
                numPointShadows: -1,
                numSpotShadows: -1,
                numSpotMaps: -1
            },
            ambient: [0, 0, 0],
            probe: [],
            directional: [],
            directionalShadow: [],
            directionalShadowMap: [],
            directionalShadowMatrix: [],
            spot: [],
            spotLightMap: [],
            spotShadow: [],
            spotShadowMap: [],
            spotLightMatrix: [],
            rectArea: [],
            rectAreaLTC1: null,
            rectAreaLTC2: null,
            point: [],
            pointShadow: [],
            pointShadowMap: [],
            pointShadowMatrix: [],
            hemi: [],
            numSpotLightShadowsWithMaps: 0
        };
    for (let h = 0; h < 9; h++) i.probe.push(new M);
    const r = new M,
        a = new Te,
        o = new Te;

    function l(h, u) {
        let d = 0,
            f = 0,
            g = 0;
        for (let q = 0; q < 9; q++) i.probe[q].set(0, 0, 0);
        let m = 0,
            p = 0,
            _ = 0,
            E = 0,
            y = 0,
            S = 0,
            T = 0,
            L = 0,
            I = 0,
            v = 0;
        h.sort(Wx);
        const A = u === !0 ? Math.PI : 1;
        for (let q = 0, X = h.length; q < X; q++) {
            const F = h[q],
                D = F.color,
                U = F.intensity,
                j = F.distance,
                Z = F.shadow && F.shadow.map ? F.shadow.map.texture : null;
            if (F.isAmbientLight) d += D.r * U * A, f += D.g * U * A, g += D.b * U * A;
            else if (F.isLightProbe)
                for (let H = 0; H < 9; H++) i.probe[H].addScaledVector(F.sh.coefficients[H], U);
            else if (F.isDirectionalLight) {
                const H = t.get(F);
                if (H.color.copy(F.color).multiplyScalar(F.intensity * A), F.castShadow) {
                    const J = F.shadow,
                        Y = n.get(F);
                    Y.shadowBias = J.bias, Y.shadowNormalBias = J.normalBias, Y.shadowRadius = J.radius, Y.shadowMapSize = J.mapSize, i.directionalShadow[m] = Y, i.directionalShadowMap[m] = Z, i.directionalShadowMatrix[m] = F.shadow.matrix, S++
                }
                i.directional[m] = H, m++
            } else if (F.isSpotLight) {
                const H = t.get(F);
                H.position.setFromMatrixPosition(F.matrixWorld), H.color.copy(D).multiplyScalar(U * A), H.distance = j, H.coneCos = Math.cos(F.angle), H.penumbraCos = Math.cos(F.angle * (1 - F.penumbra)), H.decay = F.decay, i.spot[_] = H;
                const J = F.shadow;
                if (F.map && (i.spotLightMap[I] = F.map, I++, J.updateMatrices(F), F.castShadow && v++), i.spotLightMatrix[_] = J.matrix, F.castShadow) {
                    const Y = n.get(F);
                    Y.shadowBias = J.bias, Y.shadowNormalBias = J.normalBias, Y.shadowRadius = J.radius, Y.shadowMapSize = J.mapSize, i.spotShadow[_] = Y, i.spotShadowMap[_] = Z, L++
                }
                _++
            } else if (F.isRectAreaLight) {
                const H = t.get(F);
                H.color.copy(D).multiplyScalar(U), H.halfWidth.set(F.width * .5, 0, 0), H.halfHeight.set(0, F.height * .5, 0), i.rectArea[E] = H, E++
            } else if (F.isPointLight) {
                const H = t.get(F);
                if (H.color.copy(F.color).multiplyScalar(F.intensity * A), H.distance = F.distance, H.decay = F.decay, F.castShadow) {
                    const J = F.shadow,
                        Y = n.get(F);
                    Y.shadowBias = J.bias, Y.shadowNormalBias = J.normalBias, Y.shadowRadius = J.radius, Y.shadowMapSize = J.mapSize, Y.shadowCameraNear = J.camera.near, Y.shadowCameraFar = J.camera.far, i.pointShadow[p] = Y, i.pointShadowMap[p] = Z, i.pointShadowMatrix[p] = F.shadow.matrix, T++
                }
                i.point[p] = H, p++
            } else if (F.isHemisphereLight) {
                const H = t.get(F);
                H.skyColor.copy(F.color).multiplyScalar(U * A), H.groundColor.copy(F.groundColor).multiplyScalar(U * A), i.hemi[y] = H, y++
            }
        }
        E > 0 && (e.isWebGL2 || s.has("OES_texture_float_linear") === !0 ? (i.rectAreaLTC1 = te.LTC_FLOAT_1, i.rectAreaLTC2 = te.LTC_FLOAT_2) : s.has("OES_texture_half_float_linear") === !0 ? (i.rectAreaLTC1 = te.LTC_HALF_1, i.rectAreaLTC2 = te.LTC_HALF_2) : console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")), i.ambient[0] = d, i.ambient[1] = f, i.ambient[2] = g;
        const P = i.hash;
        (P.directionalLength !== m || P.pointLength !== p || P.spotLength !== _ || P.rectAreaLength !== E || P.hemiLength !== y || P.numDirectionalShadows !== S || P.numPointShadows !== T || P.numSpotShadows !== L || P.numSpotMaps !== I) && (i.directional.length = m, i.spot.length = _, i.rectArea.length = E, i.point.length = p, i.hemi.length = y, i.directionalShadow.length = S, i.directionalShadowMap.length = S, i.pointShadow.length = T, i.pointShadowMap.length = T, i.spotShadow.length = L, i.spotShadowMap.length = L, i.directionalShadowMatrix.length = S, i.pointShadowMatrix.length = T, i.spotLightMatrix.length = L + I - v, i.spotLightMap.length = I, i.numSpotLightShadowsWithMaps = v, P.directionalLength = m, P.pointLength = p, P.spotLength = _, P.rectAreaLength = E, P.hemiLength = y, P.numDirectionalShadows = S, P.numPointShadows = T, P.numSpotShadows = L, P.numSpotMaps = I, i.version = Hx++)
    }

    function c(h, u) {
        let d = 0,
            f = 0,
            g = 0,
            m = 0,
            p = 0;
        const _ = u.matrixWorldInverse;
        for (let E = 0, y = h.length; E < y; E++) {
            const S = h[E];
            if (S.isDirectionalLight) {
                const T = i.directional[d];
                T.direction.setFromMatrixPosition(S.matrixWorld), r.setFromMatrixPosition(S.target.matrixWorld), T.direction.sub(r), T.direction.transformDirection(_), d++
            } else if (S.isSpotLight) {
                const T = i.spot[g];
                T.position.setFromMatrixPosition(S.matrixWorld), T.position.applyMatrix4(_), T.direction.setFromMatrixPosition(S.matrixWorld), r.setFromMatrixPosition(S.target.matrixWorld), T.direction.sub(r), T.direction.transformDirection(_), g++
            } else if (S.isRectAreaLight) {
                const T = i.rectArea[m];
                T.position.setFromMatrixPosition(S.matrixWorld), T.position.applyMatrix4(_), o.identity(), a.copy(S.matrixWorld), a.premultiply(_), o.extractRotation(a), T.halfWidth.set(S.width * .5, 0, 0), T.halfHeight.set(0, S.height * .5, 0), T.halfWidth.applyMatrix4(o), T.halfHeight.applyMatrix4(o), m++
            } else if (S.isPointLight) {
                const T = i.point[f];
                T.position.setFromMatrixPosition(S.matrixWorld), T.position.applyMatrix4(_), f++
            } else if (S.isHemisphereLight) {
                const T = i.hemi[p];
                T.direction.setFromMatrixPosition(S.matrixWorld), T.direction.transformDirection(_), p++
            }
        }
    }
    return {
        setup: l,
        setupView: c,
        state: i
    }
}

function Gh(s, e) {
    const t = new Xx(s, e),
        n = [],
        i = [];

    function r() {
        n.length = 0, i.length = 0
    }

    function a(u) {
        n.push(u)
    }

    function o(u) {
        i.push(u)
    }

    function l(u) {
        t.setup(n, u)
    }

    function c(u) {
        t.setupView(n, u)
    }
    return {
        init: r,
        state: {
            lightsArray: n,
            shadowsArray: i,
            lights: t
        },
        setupLights: l,
        setupLightsView: c,
        pushLight: a,
        pushShadow: o
    }
}

function qx(s, e) {
    let t = new WeakMap;

    function n(r, a = 0) {
        const o = t.get(r);
        let l;
        return o === void 0 ? (l = new Gh(s, e), t.set(r, [l])) : a >= o.length ? (l = new Gh(s, e), o.push(l)) : l = o[a], l
    }

    function i() {
        t = new WeakMap
    }
    return {
        get: n,
        dispose: i
    }
}
class jx extends ln {
    constructor(e) {
        super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = Gp, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this
    }
}
class Yx extends ln {
    constructor(e) {
        super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.referencePosition = new M, this.nearDistance = 1, this.farDistance = 1e3, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.referencePosition.copy(e.referencePosition), this.nearDistance = e.nearDistance, this.farDistance = e.farDistance, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this
    }
}
const $x = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
    Kx = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;

function Zx(s, e, t) {
    let n = new $l;
    const i = new ve,
        r = new ve,
        a = new je,
        o = new jx({
            depthPacking: Vp
        }),
        l = new Yx,
        c = {},
        h = t.maxTextureSize,
        u = {
            [$n]: Qt,
            [Qt]: $n,
            [Ln]: Ln
        },
        d = new yt({
            defines: {
                VSM_SAMPLES: 8
            },
            uniforms: {
                shadow_pass: {
                    value: null
                },
                resolution: {
                    value: new ve
                },
                radius: {
                    value: 4
                }
            },
            vertexShader: $x,
            fragmentShader: Kx
        }),
        f = d.clone();
    f.defines.HORIZONTAL_PASS = 1;
    const g = new jt;
    g.setAttribute("position", new $e(new Float32Array([-1, -1, .5, 3, -1, .5, -1, 3, .5]), 3));
    const m = new ct(g, d),
        p = this;
    this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = Pu, this.render = function(S, T, L) {
        if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || S.length === 0) return;
        const I = s.getRenderTarget(),
            v = s.getActiveCubeFace(),
            A = s.getActiveMipmapLevel(),
            P = s.state;
        P.setBlending(hi), P.buffers.color.setClear(1, 1, 1, 1), P.buffers.depth.setTest(!0), P.setScissorTest(!1);
        for (let q = 0, X = S.length; q < X; q++) {
            const F = S[q],
                D = F.shadow;
            if (D === void 0) {
                console.warn("THREE.WebGLShadowMap:", F, "has no shadow.");
                continue
            }
            if (D.autoUpdate === !1 && D.needsUpdate === !1) continue;
            i.copy(D.mapSize);
            const U = D.getFrameExtents();
            if (i.multiply(U), r.copy(D.mapSize), (i.x > h || i.y > h) && (i.x > h && (r.x = Math.floor(h / U.x), i.x = r.x * U.x, D.mapSize.x = r.x), i.y > h && (r.y = Math.floor(h / U.y), i.y = r.y * U.y, D.mapSize.y = r.y)), D.map === null) {
                const Z = this.type !== fr ? {
                    minFilter: gt,
                    magFilter: gt
                } : {};
                D.map = new Ui(i.x, i.y, Z), D.map.texture.name = F.name + ".shadowMap", D.camera.updateProjectionMatrix()
            }
            s.setRenderTarget(D.map), s.clear();
            const j = D.getViewportCount();
            for (let Z = 0; Z < j; Z++) {
                const H = D.getViewport(Z);
                a.set(r.x * H.x, r.y * H.y, r.x * H.z, r.y * H.w), P.viewport(a), D.updateMatrices(F, Z), n = D.getFrustum(), y(T, L, D.camera, F, this.type)
            }
            D.isPointLightShadow !== !0 && this.type === fr && _(D, L), D.needsUpdate = !1
        }
        p.needsUpdate = !1, s.setRenderTarget(I, v, A)
    };

    function _(S, T) {
        const L = e.update(m);
        d.defines.VSM_SAMPLES !== S.blurSamples && (d.defines.VSM_SAMPLES = S.blurSamples, f.defines.VSM_SAMPLES = S.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), S.mapPass === null && (S.mapPass = new Ui(i.x, i.y)), d.uniforms.shadow_pass.value = S.map.texture, d.uniforms.resolution.value = S.mapSize, d.uniforms.radius.value = S.radius, s.setRenderTarget(S.mapPass), s.clear(), s.renderBufferDirect(T, null, L, d, m, null), f.uniforms.shadow_pass.value = S.mapPass.texture, f.uniforms.resolution.value = S.mapSize, f.uniforms.radius.value = S.radius, s.setRenderTarget(S.map), s.clear(), s.renderBufferDirect(T, null, L, f, m, null)
    }

    function E(S, T, L, I, v, A) {
        let P = null;
        const q = L.isPointLight === !0 ? S.customDistanceMaterial : S.customDepthMaterial;
        if (q !== void 0) P = q;
        else if (P = L.isPointLight === !0 ? l : o, s.localClippingEnabled && T.clipShadows === !0 && Array.isArray(T.clippingPlanes) && T.clippingPlanes.length !== 0 || T.displacementMap && T.displacementScale !== 0 || T.alphaMap && T.alphaTest > 0 || T.map && T.alphaTest > 0) {
            const X = P.uuid,
                F = T.uuid;
            let D = c[X];
            D === void 0 && (D = {}, c[X] = D);
            let U = D[F];
            U === void 0 && (U = P.clone(), D[F] = U), P = U
        }
        return P.visible = T.visible, P.wireframe = T.wireframe, A === fr ? P.side = T.shadowSide !== null ? T.shadowSide : T.side : P.side = T.shadowSide !== null ? T.shadowSide : u[T.side], P.alphaMap = T.alphaMap, P.alphaTest = T.alphaTest, P.map = T.map, P.clipShadows = T.clipShadows, P.clippingPlanes = T.clippingPlanes, P.clipIntersection = T.clipIntersection, P.displacementMap = T.displacementMap, P.displacementScale = T.displacementScale, P.displacementBias = T.displacementBias, P.wireframeLinewidth = T.wireframeLinewidth, P.linewidth = T.linewidth, L.isPointLight === !0 && P.isMeshDistanceMaterial === !0 && (P.referencePosition.setFromMatrixPosition(L.matrixWorld), P.nearDistance = I, P.farDistance = v), P
    }

    function y(S, T, L, I, v) {
        if (S.visible === !1) return;
        if (S.layers.test(T.layers) && (S.isMesh || S.isLine || S.isPoints) && (S.castShadow || S.receiveShadow && v === fr) && (!S.frustumCulled || n.intersectsObject(S))) {
            S.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse, S.matrixWorld);
            const q = e.update(S),
                X = S.material;
            if (Array.isArray(X)) {
                const F = q.groups;
                for (let D = 0, U = F.length; D < U; D++) {
                    const j = F[D],
                        Z = X[j.materialIndex];
                    if (Z && Z.visible) {
                        const H = E(S, Z, I, L.near, L.far, v);
                        s.renderBufferDirect(L, null, q, H, S, j)
                    }
                }
            } else if (X.visible) {
                const F = E(S, X, I, L.near, L.far, v);
                s.renderBufferDirect(L, null, q, F, S, null)
            }
        }
        const P = S.children;
        for (let q = 0, X = P.length; q < X; q++) y(P[q], T, L, I, v)
    }
}

function Jx(s, e, t) {
    const n = t.isWebGL2;

    function i() {
        let C = !1;
        const z = new je;
        let $ = null;
        const se = new je(0, 0, 0, 0);
        return {
            setMask: function(oe) {
                $ !== oe && !C && (s.colorMask(oe, oe, oe, oe), $ = oe)
            },
            setLocked: function(oe) {
                C = oe
            },
            setClear: function(oe, Ke, ft, Lt, Sn) {
                Sn === !0 && (oe *= Lt, Ke *= Lt, ft *= Lt), z.set(oe, Ke, ft, Lt), se.equals(z) === !1 && (s.clearColor(oe, Ke, ft, Lt), se.copy(z))
            },
            reset: function() {
                C = !1, $ = null, se.set(-1, 0, 0, 0)
            }
        }
    }

    function r() {
        let C = !1,
            z = null,
            $ = null,
            se = null;
        return {
            setTest: function(oe) {
                oe ? ae(2929) : he(2929)
            },
            setMask: function(oe) {
                z !== oe && !C && (s.depthMask(oe), z = oe)
            },
            setFunc: function(oe) {
                if ($ !== oe) {
                    switch (oe) {
                        case hp:
                            s.depthFunc(512);
                            break;
                        case up:
                            s.depthFunc(519);
                            break;
                        case dp:
                            s.depthFunc(513);
                            break;
                        case il:
                            s.depthFunc(515);
                            break;
                        case fp:
                            s.depthFunc(514);
                            break;
                        case pp:
                            s.depthFunc(518);
                            break;
                        case mp:
                            s.depthFunc(516);
                            break;
                        case gp:
                            s.depthFunc(517);
                            break;
                        default:
                            s.depthFunc(515)
                    }
                    $ = oe
                }
            },
            setLocked: function(oe) {
                C = oe
            },
            setClear: function(oe) {
                se !== oe && (s.clearDepth(oe), se = oe)
            },
            reset: function() {
                C = !1, z = null, $ = null, se = null
            }
        }
    }

    function a() {
        let C = !1,
            z = null,
            $ = null,
            se = null,
            oe = null,
            Ke = null,
            ft = null,
            Lt = null,
            Sn = null;
        return {
            setTest: function(it) {
                C || (it ? ae(2960) : he(2960))
            },
            setMask: function(it) {
                z !== it && !C && (s.stencilMask(it), z = it)
            },
            setFunc: function(it, en, wn) {
                ($ !== it || se !== en || oe !== wn) && (s.stencilFunc(it, en, wn), $ = it, se = en, oe = wn)
            },
            setOp: function(it, en, wn) {
                (Ke !== it || ft !== en || Lt !== wn) && (s.stencilOp(it, en, wn), Ke = it, ft = en, Lt = wn)
            },
            setLocked: function(it) {
                C = it
            },
            setClear: function(it) {
                Sn !== it && (s.clearStencil(it), Sn = it)
            },
            reset: function() {
                C = !1, z = null, $ = null, se = null, oe = null, Ke = null, ft = null, Lt = null, Sn = null
            }
        }
    }
    const o = new i,
        l = new r,
        c = new a,
        h = new WeakMap,
        u = new WeakMap;
    let d = {},
        f = {},
        g = new WeakMap,
        m = [],
        p = null,
        _ = !1,
        E = null,
        y = null,
        S = null,
        T = null,
        L = null,
        I = null,
        v = null,
        A = !1,
        P = null,
        q = null,
        X = null,
        F = null,
        D = null;
    const U = s.getParameter(35661);
    let j = !1,
        Z = 0;
    const H = s.getParameter(7938);
    H.indexOf("WebGL") !== -1 ? (Z = parseFloat(/^WebGL (\d)/.exec(H)[1]), j = Z >= 1) : H.indexOf("OpenGL ES") !== -1 && (Z = parseFloat(/^OpenGL ES (\d)/.exec(H)[1]), j = Z >= 2);
    let J = null,
        Y = {};
    const ge = s.getParameter(3088),
        k = s.getParameter(2978),
        K = new je().fromArray(ge),
        ne = new je().fromArray(k);

    function B(C, z, $) {
        const se = new Uint8Array(4),
            oe = s.createTexture();
        s.bindTexture(C, oe), s.texParameteri(C, 10241, 9728), s.texParameteri(C, 10240, 9728);
        for (let Ke = 0; Ke < $; Ke++) s.texImage2D(z + Ke, 0, 6408, 1, 1, 0, 6408, 5121, se);
        return oe
    }
    const ce = {};
    ce[3553] = B(3553, 3553, 1), ce[34067] = B(34067, 34069, 6), o.setClear(0, 0, 0, 1), l.setClear(1), c.setClear(0), ae(2929), l.setFunc(il), zt(!1), Ct(Pc), ae(2884), At(hi);

    function ae(C) {
        d[C] !== !0 && (s.enable(C), d[C] = !0)
    }

    function he(C) {
        d[C] !== !1 && (s.disable(C), d[C] = !1)
    }

    function ue(C, z) {
        return f[C] !== z ? (s.bindFramebuffer(C, z), f[C] = z, n && (C === 36009 && (f[36160] = z), C === 36160 && (f[36009] = z)), !0) : !1
    }

    function Se(C, z) {
        let $ = m,
            se = !1;
        if (C)
            if ($ = g.get(z), $ === void 0 && ($ = [], g.set(z, $)), C.isWebGLMultipleRenderTargets) {
                const oe = C.texture;
                if ($.length !== oe.length || $[0] !== 36064) {
                    for (let Ke = 0, ft = oe.length; Ke < ft; Ke++) $[Ke] = 36064 + Ke;
                    $.length = oe.length, se = !0
                }
            } else $[0] !== 36064 && ($[0] = 36064, se = !0);
        else $[0] !== 1029 && ($[0] = 1029, se = !0);
        se && (t.isWebGL2 ? s.drawBuffers($) : e.get("WEBGL_draw_buffers").drawBuffersWEBGL($))
    }

    function Ce(C) {
        return p !== C ? (s.useProgram(C), p = C, !0) : !1
    }
    const Ie = {
        [gs]: 32774,
        [Qf]: 32778,
        [ep]: 32779
    };
    if (n) Ie[Fc] = 32775, Ie[kc] = 32776;
    else {
        const C = e.get("EXT_blend_minmax");
        C !== null && (Ie[Fc] = C.MIN_EXT, Ie[kc] = C.MAX_EXT)
    }
    const ze = {
        [tp]: 0,
        [np]: 1,
        [ip]: 768,
        [Bu]: 770,
        [cp]: 776,
        [op]: 774,
        [rp]: 772,
        [sp]: 769,
        [Fu]: 771,
        [lp]: 775,
        [ap]: 773
    };

    function At(C, z, $, se, oe, Ke, ft, Lt) {
        if (C === hi) {
            _ === !0 && (he(3042), _ = !1);
            return
        }
        if (_ === !1 && (ae(3042), _ = !0), C !== Jf) {
            if (C !== E || Lt !== A) {
                if ((y !== gs || L !== gs) && (s.blendEquation(32774), y = gs, L = gs), Lt) switch (C) {
                    case Es:
                        s.blendFuncSeparate(1, 771, 1, 771);
                        break;
                    case br:
                        s.blendFunc(1, 1);
                        break;
                    case Nc:
                        s.blendFuncSeparate(0, 769, 0, 1);
                        break;
                    case Bc:
                        s.blendFuncSeparate(0, 768, 0, 770);
                        break;
                    default:
                        console.error("THREE.WebGLState: Invalid blending: ", C);
                        break
                } else switch (C) {
                    case Es:
                        s.blendFuncSeparate(770, 771, 1, 771);
                        break;
                    case br:
                        s.blendFunc(770, 1);
                        break;
                    case Nc:
                        s.blendFuncSeparate(0, 769, 0, 1);
                        break;
                    case Bc:
                        s.blendFunc(0, 768);
                        break;
                    default:
                        console.error("THREE.WebGLState: Invalid blending: ", C);
                        break
                }
                S = null, T = null, I = null, v = null, E = C, A = Lt
            }
            return
        }
        oe = oe || z, Ke = Ke || $, ft = ft || se, (z !== y || oe !== L) && (s.blendEquationSeparate(Ie[z], Ie[oe]), y = z, L = oe), ($ !== S || se !== T || Ke !== I || ft !== v) && (s.blendFuncSeparate(ze[$], ze[se], ze[Ke], ze[ft]), S = $, T = se, I = Ke, v = ft), E = C, A = !1
    }

    function cn(C, z) {
        C.side === Ln ? he(2884) : ae(2884);
        let $ = C.side === Qt;
        z && ($ = !$), zt($), C.blending === Es && C.transparent === !1 ? At(hi) : At(C.blending, C.blendEquation, C.blendSrc, C.blendDst, C.blendEquationAlpha, C.blendSrcAlpha, C.blendDstAlpha, C.premultipliedAlpha), l.setFunc(C.depthFunc), l.setTest(C.depthTest), l.setMask(C.depthWrite), o.setMask(C.colorWrite);
        const se = C.stencilWrite;
        c.setTest(se), se && (c.setMask(C.stencilWriteMask), c.setFunc(C.stencilFunc, C.stencilRef, C.stencilFuncMask), c.setOp(C.stencilFail, C.stencilZFail, C.stencilZPass)), Qe(C.polygonOffset, C.polygonOffsetFactor, C.polygonOffsetUnits), C.alphaToCoverage === !0 ? ae(32926) : he(32926)
    }

    function zt(C) {
        P !== C && (C ? s.frontFace(2304) : s.frontFace(2305), P = C)
    }

    function Ct(C) {
        C !== Kf ? (ae(2884), C !== q && (C === Pc ? s.cullFace(1029) : C === Zf ? s.cullFace(1028) : s.cullFace(1032))) : he(2884), q = C
    }

    function tt(C) {
        C !== X && (j && s.lineWidth(C), X = C)
    }

    function Qe(C, z, $) {
        C ? (ae(32823), (F !== z || D !== $) && (s.polygonOffset(z, $), F = z, D = $)) : he(32823)
    }

    function vn(C) {
        C ? ae(3089) : he(3089)
    }

    function hn(C) {
        C === void 0 && (C = 33984 + U - 1), J !== C && (s.activeTexture(C), J = C)
    }

    function b(C, z, $) {
        $ === void 0 && (J === null ? $ = 33984 + U - 1 : $ = J);
        let se = Y[$];
        se === void 0 && (se = {
            type: void 0,
            texture: void 0
        }, Y[$] = se), (se.type !== C || se.texture !== z) && (J !== $ && (s.activeTexture($), J = $), s.bindTexture(C, z || ce[C]), se.type = C, se.texture = z)
    }

    function x() {
        const C = Y[J];
        C !== void 0 && C.type !== void 0 && (s.bindTexture(C.type, null), C.type = void 0, C.texture = void 0)
    }

    function G() {
        try {
            s.compressedTexImage2D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function Q() {
        try {
            s.compressedTexImage3D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function ee() {
        try {
            s.texSubImage2D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function ie() {
        try {
            s.texSubImage3D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function _e() {
        try {
            s.compressedTexSubImage2D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function re() {
        try {
            s.compressedTexSubImage3D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function W() {
        try {
            s.texStorage2D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function we() {
        try {
            s.texStorage3D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function de() {
        try {
            s.texImage2D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function Me() {
        try {
            s.texImage3D.apply(s, arguments)
        } catch (C) {
            console.error("THREE.WebGLState:", C)
        }
    }

    function ye(C) {
        K.equals(C) === !1 && (s.scissor(C.x, C.y, C.z, C.w), K.copy(C))
    }

    function me(C) {
        ne.equals(C) === !1 && (s.viewport(C.x, C.y, C.z, C.w), ne.copy(C))
    }

    function ke(C, z) {
        let $ = u.get(z);
        $ === void 0 && ($ = new WeakMap, u.set(z, $));
        let se = $.get(C);
        se === void 0 && (se = s.getUniformBlockIndex(z, C.name), $.set(C, se))
    }

    function et(C, z) {
        const se = u.get(z).get(C);
        h.get(z) !== se && (s.uniformBlockBinding(z, se, C.__bindingPointIndex), h.set(z, se))
    }

    function dt() {
        s.disable(3042), s.disable(2884), s.disable(2929), s.disable(32823), s.disable(3089), s.disable(2960), s.disable(32926), s.blendEquation(32774), s.blendFunc(1, 0), s.blendFuncSeparate(1, 0, 1, 0), s.colorMask(!0, !0, !0, !0), s.clearColor(0, 0, 0, 0), s.depthMask(!0), s.depthFunc(513), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(519, 0, 4294967295), s.stencilOp(7680, 7680, 7680), s.clearStencil(0), s.cullFace(1029), s.frontFace(2305), s.polygonOffset(0, 0), s.activeTexture(33984), s.bindFramebuffer(36160, null), n === !0 && (s.bindFramebuffer(36009, null), s.bindFramebuffer(36008, null)), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), d = {}, J = null, Y = {}, f = {}, g = new WeakMap, m = [], p = null, _ = !1, E = null, y = null, S = null, T = null, L = null, I = null, v = null, A = !1, P = null, q = null, X = null, F = null, D = null, K.set(0, 0, s.canvas.width, s.canvas.height), ne.set(0, 0, s.canvas.width, s.canvas.height), o.reset(), l.reset(), c.reset()
    }
    return {
        buffers: {
            color: o,
            depth: l,
            stencil: c
        },
        enable: ae,
        disable: he,
        bindFramebuffer: ue,
        drawBuffers: Se,
        useProgram: Ce,
        setBlending: At,
        setMaterial: cn,
        setFlipSided: zt,
        setCullFace: Ct,
        setLineWidth: tt,
        setPolygonOffset: Qe,
        setScissorTest: vn,
        activeTexture: hn,
        bindTexture: b,
        unbindTexture: x,
        compressedTexImage2D: G,
        compressedTexImage3D: Q,
        texImage2D: de,
        texImage3D: Me,
        updateUBOMapping: ke,
        uniformBlockBinding: et,
        texStorage2D: W,
        texStorage3D: we,
        texSubImage2D: ee,
        texSubImage3D: ie,
        compressedTexSubImage2D: _e,
        compressedTexSubImage3D: re,
        scissor: ye,
        viewport: me,
        reset: dt
    }
}

function Qx(s, e, t, n, i, r, a) {
    const o = i.isWebGL2,
        l = i.maxTextures,
        c = i.maxCubemapSize,
        h = i.maxTextureSize,
        u = i.maxSamples,
        d = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null,
        f = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
        g = new WeakMap;
    let m;
    const p = new WeakMap;
    let _ = !1;
    try {
        _ = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null
    } catch {}

    function E(b, x) {
        return _ ? new OffscreenCanvas(b, x) : Lr("canvas")
    }

    function y(b, x, G, Q) {
        let ee = 1;
        if ((b.width > Q || b.height > Q) && (ee = Q / Math.max(b.width, b.height)), ee < 1 || x === !0)
            if (typeof HTMLImageElement < "u" && b instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && b instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && b instanceof ImageBitmap) {
                const ie = x ? qu : Math.floor,
                    _e = ie(ee * b.width),
                    re = ie(ee * b.height);
                m === void 0 && (m = E(_e, re));
                const W = G ? E(_e, re) : m;
                return W.width = _e, W.height = re, W.getContext("2d").drawImage(b, 0, 0, _e, re), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + b.width + "x" + b.height + ") to (" + _e + "x" + re + ")."), W
            } else return "data" in b && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + b.width + "x" + b.height + ")."), b;
        return b
    }

    function S(b) {
        return hl(b.width) && hl(b.height)
    }

    function T(b) {
        return o ? !1 : b.wrapS !== sn || b.wrapT !== sn || b.minFilter !== gt && b.minFilter !== Gt
    }

    function L(b, x) {
        return b.generateMipmaps && x && b.minFilter !== gt && b.minFilter !== Gt
    }

    function I(b) {
        s.generateMipmap(b)
    }

    function v(b, x, G, Q, ee = !1) {
        if (o === !1) return x;
        if (b !== null) {
            if (s[b] !== void 0) return s[b];
            console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + b + "'")
        }
        let ie = x;
        return x === 6403 && (G === 5126 && (ie = 33326), G === 5131 && (ie = 33325), G === 5121 && (ie = 33321)), x === 33319 && (G === 5126 && (ie = 33328), G === 5131 && (ie = 33327), G === 5121 && (ie = 33323)), x === 6408 && (G === 5126 && (ie = 34836), G === 5131 && (ie = 34842), G === 5121 && (ie = Q === Be && ee === !1 ? 35907 : 32856), G === 32819 && (ie = 32854), G === 32820 && (ie = 32855)), (ie === 33325 || ie === 33326 || ie === 33327 || ie === 33328 || ie === 34842 || ie === 34836) && e.get("EXT_color_buffer_float"), ie
    }

    function A(b, x, G) {
        return L(b, G) === !0 || b.isFramebufferTexture && b.minFilter !== gt && b.minFilter !== Gt ? Math.log2(Math.max(x.width, x.height)) + 1 : b.mipmaps !== void 0 && b.mipmaps.length > 0 ? b.mipmaps.length : b.isCompressedTexture && Array.isArray(b.image) ? x.mipmaps.length : 1
    }

    function P(b) {
        return b === gt || b === al || b === Ma ? 9728 : 9729
    }

    function q(b) {
        const x = b.target;
        x.removeEventListener("dispose", q), F(x), x.isVideoTexture && g.delete(x)
    }

    function X(b) {
        const x = b.target;
        x.removeEventListener("dispose", X), U(x)
    }

    function F(b) {
        const x = n.get(b);
        if (x.__webglInit === void 0) return;
        const G = b.source,
            Q = p.get(G);
        if (Q) {
            const ee = Q[x.__cacheKey];
            ee.usedTimes--, ee.usedTimes === 0 && D(b), Object.keys(Q).length === 0 && p.delete(G)
        }
        n.remove(b)
    }

    function D(b) {
        const x = n.get(b);
        s.deleteTexture(x.__webglTexture);
        const G = b.source,
            Q = p.get(G);
        delete Q[x.__cacheKey], a.memory.textures--
    }

    function U(b) {
        const x = b.texture,
            G = n.get(b),
            Q = n.get(x);
        if (Q.__webglTexture !== void 0 && (s.deleteTexture(Q.__webglTexture), a.memory.textures--), b.depthTexture && b.depthTexture.dispose(), b.isWebGLCubeRenderTarget)
            for (let ee = 0; ee < 6; ee++) s.deleteFramebuffer(G.__webglFramebuffer[ee]), G.__webglDepthbuffer && s.deleteRenderbuffer(G.__webglDepthbuffer[ee]);
        else {
            if (s.deleteFramebuffer(G.__webglFramebuffer), G.__webglDepthbuffer && s.deleteRenderbuffer(G.__webglDepthbuffer), G.__webglMultisampledFramebuffer && s.deleteFramebuffer(G.__webglMultisampledFramebuffer), G.__webglColorRenderbuffer)
                for (let ee = 0; ee < G.__webglColorRenderbuffer.length; ee++) G.__webglColorRenderbuffer[ee] && s.deleteRenderbuffer(G.__webglColorRenderbuffer[ee]);
            G.__webglDepthRenderbuffer && s.deleteRenderbuffer(G.__webglDepthRenderbuffer)
        }
        if (b.isWebGLMultipleRenderTargets)
            for (let ee = 0, ie = x.length; ee < ie; ee++) {
                const _e = n.get(x[ee]);
                _e.__webglTexture && (s.deleteTexture(_e.__webglTexture), a.memory.textures--), n.remove(x[ee])
            }
        n.remove(x), n.remove(b)
    }
    let j = 0;

    function Z() {
        j = 0
    }

    function H() {
        const b = j;
        return b >= l && console.warn("THREE.WebGLTextures: Trying to use " + b + " texture units while this GPU supports only " + l), j += 1, b
    }

    function J(b) {
        const x = [];
        return x.push(b.wrapS), x.push(b.wrapT), x.push(b.wrapR || 0), x.push(b.magFilter), x.push(b.minFilter), x.push(b.anisotropy), x.push(b.internalFormat), x.push(b.format), x.push(b.type), x.push(b.generateMipmaps), x.push(b.premultiplyAlpha), x.push(b.flipY), x.push(b.unpackAlignment), x.push(b.encoding), x.join()
    }

    function Y(b, x) {
        const G = n.get(b);
        if (b.isVideoTexture && vn(b), b.isRenderTargetTexture === !1 && b.version > 0 && G.__version !== b.version) {
            const Q = b.image;
            if (Q === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
            else if (Q.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
            else {
                he(G, b, x);
                return
            }
        }
        t.bindTexture(3553, G.__webglTexture, 33984 + x)
    }

    function ge(b, x) {
        const G = n.get(b);
        if (b.version > 0 && G.__version !== b.version) {
            he(G, b, x);
            return
        }
        t.bindTexture(35866, G.__webglTexture, 33984 + x)
    }

    function k(b, x) {
        const G = n.get(b);
        if (b.version > 0 && G.__version !== b.version) {
            he(G, b, x);
            return
        }
        t.bindTexture(32879, G.__webglTexture, 33984 + x)
    }

    function K(b, x) {
        const G = n.get(b);
        if (b.version > 0 && G.__version !== b.version) {
            ue(G, b, x);
            return
        }
        t.bindTexture(34067, G.__webglTexture, 33984 + x)
    }
    const ne = {
            [Fs]: 10497,
            [sn]: 33071,
            [Da]: 33648
        },
        B = {
            [gt]: 9728,
            [al]: 9984,
            [Ma]: 9986,
            [Gt]: 9729,
            [zu]: 9985,
            [Fi]: 9987
        };

    function ce(b, x, G) {
        if (G ? (s.texParameteri(b, 10242, ne[x.wrapS]), s.texParameteri(b, 10243, ne[x.wrapT]), (b === 32879 || b === 35866) && s.texParameteri(b, 32882, ne[x.wrapR]), s.texParameteri(b, 10240, B[x.magFilter]), s.texParameteri(b, 10241, B[x.minFilter])) : (s.texParameteri(b, 10242, 33071), s.texParameteri(b, 10243, 33071), (b === 32879 || b === 35866) && s.texParameteri(b, 32882, 33071), (x.wrapS !== sn || x.wrapT !== sn) && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."), s.texParameteri(b, 10240, P(x.magFilter)), s.texParameteri(b, 10241, P(x.minFilter)), x.minFilter !== gt && x.minFilter !== Gt && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")), e.has("EXT_texture_filter_anisotropic") === !0) {
            const Q = e.get("EXT_texture_filter_anisotropic");
            if (x.magFilter === gt || x.minFilter !== Ma && x.minFilter !== Fi || x.type === oi && e.has("OES_texture_float_linear") === !1 || o === !1 && x.type === Er && e.has("OES_texture_half_float_linear") === !1) return;
            (x.anisotropy > 1 || n.get(x).__currentAnisotropy) && (s.texParameterf(b, Q.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(x.anisotropy, i.getMaxAnisotropy())), n.get(x).__currentAnisotropy = x.anisotropy)
        }
    }

    function ae(b, x) {
        let G = !1;
        b.__webglInit === void 0 && (b.__webglInit = !0, x.addEventListener("dispose", q));
        const Q = x.source;
        let ee = p.get(Q);
        ee === void 0 && (ee = {}, p.set(Q, ee));
        const ie = J(x);
        if (ie !== b.__cacheKey) {
            ee[ie] === void 0 && (ee[ie] = {
                texture: s.createTexture(),
                usedTimes: 0
            }, a.memory.textures++, G = !0), ee[ie].usedTimes++;
            const _e = ee[b.__cacheKey];
            _e !== void 0 && (ee[b.__cacheKey].usedTimes--, _e.usedTimes === 0 && D(x)), b.__cacheKey = ie, b.__webglTexture = ee[ie].texture
        }
        return G
    }

    function he(b, x, G) {
        let Q = 3553;
        (x.isDataArrayTexture || x.isCompressedArrayTexture) && (Q = 35866), x.isData3DTexture && (Q = 32879);
        const ee = ae(b, x),
            ie = x.source;
        t.bindTexture(Q, b.__webglTexture, 33984 + G);
        const _e = n.get(ie);
        if (ie.version !== _e.__version || ee === !0) {
            t.activeTexture(33984 + G), s.pixelStorei(37440, x.flipY), s.pixelStorei(37441, x.premultiplyAlpha), s.pixelStorei(3317, x.unpackAlignment), s.pixelStorei(37443, 0);
            const re = T(x) && S(x.image) === !1;
            let W = y(x.image, re, !1, h);
            W = hn(x, W);
            const we = S(W) || o,
                de = r.convert(x.format, x.encoding);
            let Me = r.convert(x.type),
                ye = v(x.internalFormat, de, Me, x.encoding, x.isVideoTexture);
            ce(Q, x, we);
            let me;
            const ke = x.mipmaps,
                et = o && x.isVideoTexture !== !0,
                dt = _e.__version === void 0 || ee === !0,
                C = A(x, W, we);
            if (x.isDepthTexture) ye = 6402, o ? x.type === oi ? ye = 36012 : x.type === Ci ? ye = 33190 : x.type === Ts ? ye = 35056 : ye = 33189 : x.type === oi && console.error("WebGLRenderer: Floating point depth texture requires WebGL2."), x.format === Bi && ye === 6402 && x.type !== Gu && x.type !== Ci && (console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."), x.type = Ci, Me = r.convert(x.type)), x.format === ks && ye === 6402 && (ye = 34041, x.type !== Ts && (console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."), x.type = Ts, Me = r.convert(x.type))), dt && (et ? t.texStorage2D(3553, 1, ye, W.width, W.height) : t.texImage2D(3553, 0, ye, W.width, W.height, 0, de, Me, null));
            else if (x.isDataTexture)
                if (ke.length > 0 && we) {
                    et && dt && t.texStorage2D(3553, C, ye, ke[0].width, ke[0].height);
                    for (let z = 0, $ = ke.length; z < $; z++) me = ke[z], et ? t.texSubImage2D(3553, z, 0, 0, me.width, me.height, de, Me, me.data) : t.texImage2D(3553, z, ye, me.width, me.height, 0, de, Me, me.data);
                    x.generateMipmaps = !1
                } else et ? (dt && t.texStorage2D(3553, C, ye, W.width, W.height), t.texSubImage2D(3553, 0, 0, 0, W.width, W.height, de, Me, W.data)) : t.texImage2D(3553, 0, ye, W.width, W.height, 0, de, Me, W.data);
            else if (x.isCompressedTexture)
                if (x.isCompressedArrayTexture) {
                    et && dt && t.texStorage3D(35866, C, ye, ke[0].width, ke[0].height, W.depth);
                    for (let z = 0, $ = ke.length; z < $; z++) me = ke[z], x.format !== rn ? de !== null ? et ? t.compressedTexSubImage3D(35866, z, 0, 0, 0, me.width, me.height, W.depth, de, me.data, 0, 0) : t.compressedTexImage3D(35866, z, ye, me.width, me.height, W.depth, 0, me.data, 0, 0) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : et ? t.texSubImage3D(35866, z, 0, 0, 0, me.width, me.height, W.depth, de, Me, me.data) : t.texImage3D(35866, z, ye, me.width, me.height, W.depth, 0, de, Me, me.data)
                } else {
                    et && dt && t.texStorage2D(3553, C, ye, ke[0].width, ke[0].height);
                    for (let z = 0, $ = ke.length; z < $; z++) me = ke[z], x.format !== rn ? de !== null ? et ? t.compressedTexSubImage2D(3553, z, 0, 0, me.width, me.height, de, me.data) : t.compressedTexImage2D(3553, z, ye, me.width, me.height, 0, me.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : et ? t.texSubImage2D(3553, z, 0, 0, me.width, me.height, de, Me, me.data) : t.texImage2D(3553, z, ye, me.width, me.height, 0, de, Me, me.data)
                }
            else if (x.isDataArrayTexture) et ? (dt && t.texStorage3D(35866, C, ye, W.width, W.height, W.depth), t.texSubImage3D(35866, 0, 0, 0, 0, W.width, W.height, W.depth, de, Me, W.data)) : t.texImage3D(35866, 0, ye, W.width, W.height, W.depth, 0, de, Me, W.data);
            else if (x.isData3DTexture) et ? (dt && t.texStorage3D(32879, C, ye, W.width, W.height, W.depth), t.texSubImage3D(32879, 0, 0, 0, 0, W.width, W.height, W.depth, de, Me, W.data)) : t.texImage3D(32879, 0, ye, W.width, W.height, W.depth, 0, de, Me, W.data);
            else if (x.isFramebufferTexture) {
                if (dt)
                    if (et) t.texStorage2D(3553, C, ye, W.width, W.height);
                    else {
                        let z = W.width,
                            $ = W.height;
                        for (let se = 0; se < C; se++) t.texImage2D(3553, se, ye, z, $, 0, de, Me, null), z >>= 1, $ >>= 1
                    }
            } else if (ke.length > 0 && we) {
                et && dt && t.texStorage2D(3553, C, ye, ke[0].width, ke[0].height);
                for (let z = 0, $ = ke.length; z < $; z++) me = ke[z], et ? t.texSubImage2D(3553, z, 0, 0, de, Me, me) : t.texImage2D(3553, z, ye, de, Me, me);
                x.generateMipmaps = !1
            } else et ? (dt && t.texStorage2D(3553, C, ye, W.width, W.height), t.texSubImage2D(3553, 0, 0, 0, de, Me, W)) : t.texImage2D(3553, 0, ye, de, Me, W);
            L(x, we) && I(Q), _e.__version = ie.version, x.onUpdate && x.onUpdate(x)
        }
        b.__version = x.version
    }

    function ue(b, x, G) {
        if (x.image.length !== 6) return;
        const Q = ae(b, x),
            ee = x.source;
        t.bindTexture(34067, b.__webglTexture, 33984 + G);
        const ie = n.get(ee);
        if (ee.version !== ie.__version || Q === !0) {
            t.activeTexture(33984 + G), s.pixelStorei(37440, x.flipY), s.pixelStorei(37441, x.premultiplyAlpha), s.pixelStorei(3317, x.unpackAlignment), s.pixelStorei(37443, 0);
            const _e = x.isCompressedTexture || x.image[0].isCompressedTexture,
                re = x.image[0] && x.image[0].isDataTexture,
                W = [];
            for (let z = 0; z < 6; z++) !_e && !re ? W[z] = y(x.image[z], !1, !0, c) : W[z] = re ? x.image[z].image : x.image[z], W[z] = hn(x, W[z]);
            const we = W[0],
                de = S(we) || o,
                Me = r.convert(x.format, x.encoding),
                ye = r.convert(x.type),
                me = v(x.internalFormat, Me, ye, x.encoding),
                ke = o && x.isVideoTexture !== !0,
                et = ie.__version === void 0 || Q === !0;
            let dt = A(x, we, de);
            ce(34067, x, de);
            let C;
            if (_e) {
                ke && et && t.texStorage2D(34067, dt, me, we.width, we.height);
                for (let z = 0; z < 6; z++) {
                    C = W[z].mipmaps;
                    for (let $ = 0; $ < C.length; $++) {
                        const se = C[$];
                        x.format !== rn ? Me !== null ? ke ? t.compressedTexSubImage2D(34069 + z, $, 0, 0, se.width, se.height, Me, se.data) : t.compressedTexImage2D(34069 + z, $, me, se.width, se.height, 0, se.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : ke ? t.texSubImage2D(34069 + z, $, 0, 0, se.width, se.height, Me, ye, se.data) : t.texImage2D(34069 + z, $, me, se.width, se.height, 0, Me, ye, se.data)
                    }
                }
            } else {
                C = x.mipmaps, ke && et && (C.length > 0 && dt++, t.texStorage2D(34067, dt, me, W[0].width, W[0].height));
                for (let z = 0; z < 6; z++)
                    if (re) {
                        ke ? t.texSubImage2D(34069 + z, 0, 0, 0, W[z].width, W[z].height, Me, ye, W[z].data) : t.texImage2D(34069 + z, 0, me, W[z].width, W[z].height, 0, Me, ye, W[z].data);
                        for (let $ = 0; $ < C.length; $++) {
                            const oe = C[$].image[z].image;
                            ke ? t.texSubImage2D(34069 + z, $ + 1, 0, 0, oe.width, oe.height, Me, ye, oe.data) : t.texImage2D(34069 + z, $ + 1, me, oe.width, oe.height, 0, Me, ye, oe.data)
                        }
                    } else {
                        ke ? t.texSubImage2D(34069 + z, 0, 0, 0, Me, ye, W[z]) : t.texImage2D(34069 + z, 0, me, Me, ye, W[z]);
                        for (let $ = 0; $ < C.length; $++) {
                            const se = C[$];
                            ke ? t.texSubImage2D(34069 + z, $ + 1, 0, 0, Me, ye, se.image[z]) : t.texImage2D(34069 + z, $ + 1, me, Me, ye, se.image[z])
                        }
                    }
            }
            L(x, de) && I(34067), ie.__version = ee.version, x.onUpdate && x.onUpdate(x)
        }
        b.__version = x.version
    }

    function Se(b, x, G, Q, ee) {
        const ie = r.convert(G.format, G.encoding),
            _e = r.convert(G.type),
            re = v(G.internalFormat, ie, _e, G.encoding);
        n.get(x).__hasExternalTextures || (ee === 32879 || ee === 35866 ? t.texImage3D(ee, 0, re, x.width, x.height, x.depth, 0, ie, _e, null) : t.texImage2D(ee, 0, re, x.width, x.height, 0, ie, _e, null)), t.bindFramebuffer(36160, b), Qe(x) ? d.framebufferTexture2DMultisampleEXT(36160, Q, ee, n.get(G).__webglTexture, 0, tt(x)) : (ee === 3553 || ee >= 34069 && ee <= 34074) && s.framebufferTexture2D(36160, Q, ee, n.get(G).__webglTexture, 0), t.bindFramebuffer(36160, null)
    }

    function Ce(b, x, G) {
        if (s.bindRenderbuffer(36161, b), x.depthBuffer && !x.stencilBuffer) {
            let Q = 33189;
            if (G || Qe(x)) {
                const ee = x.depthTexture;
                ee && ee.isDepthTexture && (ee.type === oi ? Q = 36012 : ee.type === Ci && (Q = 33190));
                const ie = tt(x);
                Qe(x) ? d.renderbufferStorageMultisampleEXT(36161, ie, Q, x.width, x.height) : s.renderbufferStorageMultisample(36161, ie, Q, x.width, x.height)
            } else s.renderbufferStorage(36161, Q, x.width, x.height);
            s.framebufferRenderbuffer(36160, 36096, 36161, b)
        } else if (x.depthBuffer && x.stencilBuffer) {
            const Q = tt(x);
            G && Qe(x) === !1 ? s.renderbufferStorageMultisample(36161, Q, 35056, x.width, x.height) : Qe(x) ? d.renderbufferStorageMultisampleEXT(36161, Q, 35056, x.width, x.height) : s.renderbufferStorage(36161, 34041, x.width, x.height), s.framebufferRenderbuffer(36160, 33306, 36161, b)
        } else {
            const Q = x.isWebGLMultipleRenderTargets === !0 ? x.texture : [x.texture];
            for (let ee = 0; ee < Q.length; ee++) {
                const ie = Q[ee],
                    _e = r.convert(ie.format, ie.encoding),
                    re = r.convert(ie.type),
                    W = v(ie.internalFormat, _e, re, ie.encoding),
                    we = tt(x);
                G && Qe(x) === !1 ? s.renderbufferStorageMultisample(36161, we, W, x.width, x.height) : Qe(x) ? d.renderbufferStorageMultisampleEXT(36161, we, W, x.width, x.height) : s.renderbufferStorage(36161, W, x.width, x.height)
            }
        }
        s.bindRenderbuffer(36161, null)
    }

    function Ie(b, x) {
        if (x && x.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
        if (t.bindFramebuffer(36160, b), !(x.depthTexture && x.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
        (!n.get(x.depthTexture).__webglTexture || x.depthTexture.image.width !== x.width || x.depthTexture.image.height !== x.height) && (x.depthTexture.image.width = x.width, x.depthTexture.image.height = x.height, x.depthTexture.needsUpdate = !0), Y(x.depthTexture, 0);
        const Q = n.get(x.depthTexture).__webglTexture,
            ee = tt(x);
        if (x.depthTexture.format === Bi) Qe(x) ? d.framebufferTexture2DMultisampleEXT(36160, 36096, 3553, Q, 0, ee) : s.framebufferTexture2D(36160, 36096, 3553, Q, 0);
        else if (x.depthTexture.format === ks) Qe(x) ? d.framebufferTexture2DMultisampleEXT(36160, 33306, 3553, Q, 0, ee) : s.framebufferTexture2D(36160, 33306, 3553, Q, 0);
        else throw new Error("Unknown depthTexture format")
    }

    function ze(b) {
        const x = n.get(b),
            G = b.isWebGLCubeRenderTarget === !0;
        if (b.depthTexture && !x.__autoAllocateDepthBuffer) {
            if (G) throw new Error("target.depthTexture not supported in Cube render targets");
            Ie(x.__webglFramebuffer, b)
        } else if (G) {
            x.__webglDepthbuffer = [];
            for (let Q = 0; Q < 6; Q++) t.bindFramebuffer(36160, x.__webglFramebuffer[Q]), x.__webglDepthbuffer[Q] = s.createRenderbuffer(), Ce(x.__webglDepthbuffer[Q], b, !1)
        } else t.bindFramebuffer(36160, x.__webglFramebuffer), x.__webglDepthbuffer = s.createRenderbuffer(), Ce(x.__webglDepthbuffer, b, !1);
        t.bindFramebuffer(36160, null)
    }

    function At(b, x, G) {
        const Q = n.get(b);
        x !== void 0 && Se(Q.__webglFramebuffer, b, b.texture, 36064, 3553), G !== void 0 && ze(b)
    }

    function cn(b) {
        const x = b.texture,
            G = n.get(b),
            Q = n.get(x);
        b.addEventListener("dispose", X), b.isWebGLMultipleRenderTargets !== !0 && (Q.__webglTexture === void 0 && (Q.__webglTexture = s.createTexture()), Q.__version = x.version, a.memory.textures++);
        const ee = b.isWebGLCubeRenderTarget === !0,
            ie = b.isWebGLMultipleRenderTargets === !0,
            _e = S(b) || o;
        if (ee) {
            G.__webglFramebuffer = [];
            for (let re = 0; re < 6; re++) G.__webglFramebuffer[re] = s.createFramebuffer()
        } else {
            if (G.__webglFramebuffer = s.createFramebuffer(), ie)
                if (i.drawBuffers) {
                    const re = b.texture;
                    for (let W = 0, we = re.length; W < we; W++) {
                        const de = n.get(re[W]);
                        de.__webglTexture === void 0 && (de.__webglTexture = s.createTexture(), a.memory.textures++)
                    }
                } else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");
            if (o && b.samples > 0 && Qe(b) === !1) {
                const re = ie ? x : [x];
                G.__webglMultisampledFramebuffer = s.createFramebuffer(), G.__webglColorRenderbuffer = [], t.bindFramebuffer(36160, G.__webglMultisampledFramebuffer);
                for (let W = 0; W < re.length; W++) {
                    const we = re[W];
                    G.__webglColorRenderbuffer[W] = s.createRenderbuffer(), s.bindRenderbuffer(36161, G.__webglColorRenderbuffer[W]);
                    const de = r.convert(we.format, we.encoding),
                        Me = r.convert(we.type),
                        ye = v(we.internalFormat, de, Me, we.encoding, b.isXRRenderTarget === !0),
                        me = tt(b);
                    s.renderbufferStorageMultisample(36161, me, ye, b.width, b.height), s.framebufferRenderbuffer(36160, 36064 + W, 36161, G.__webglColorRenderbuffer[W])
                }
                s.bindRenderbuffer(36161, null), b.depthBuffer && (G.__webglDepthRenderbuffer = s.createRenderbuffer(), Ce(G.__webglDepthRenderbuffer, b, !0)), t.bindFramebuffer(36160, null)
            }
        }
        if (ee) {
            t.bindTexture(34067, Q.__webglTexture), ce(34067, x, _e);
            for (let re = 0; re < 6; re++) Se(G.__webglFramebuffer[re], b, x, 36064, 34069 + re);
            L(x, _e) && I(34067), t.unbindTexture()
        } else if (ie) {
            const re = b.texture;
            for (let W = 0, we = re.length; W < we; W++) {
                const de = re[W],
                    Me = n.get(de);
                t.bindTexture(3553, Me.__webglTexture), ce(3553, de, _e), Se(G.__webglFramebuffer, b, de, 36064 + W, 3553), L(de, _e) && I(3553)
            }
            t.unbindTexture()
        } else {
            let re = 3553;
            (b.isWebGL3DRenderTarget || b.isWebGLArrayRenderTarget) && (o ? re = b.isWebGL3DRenderTarget ? 32879 : 35866 : console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")), t.bindTexture(re, Q.__webglTexture), ce(re, x, _e), Se(G.__webglFramebuffer, b, x, 36064, re), L(x, _e) && I(re), t.unbindTexture()
        }
        b.depthBuffer && ze(b)
    }

    function zt(b) {
        const x = S(b) || o,
            G = b.isWebGLMultipleRenderTargets === !0 ? b.texture : [b.texture];
        for (let Q = 0, ee = G.length; Q < ee; Q++) {
            const ie = G[Q];
            if (L(ie, x)) {
                const _e = b.isWebGLCubeRenderTarget ? 34067 : 3553,
                    re = n.get(ie).__webglTexture;
                t.bindTexture(_e, re), I(_e), t.unbindTexture()
            }
        }
    }

    function Ct(b) {
        if (o && b.samples > 0 && Qe(b) === !1) {
            const x = b.isWebGLMultipleRenderTargets ? b.texture : [b.texture],
                G = b.width,
                Q = b.height;
            let ee = 16384;
            const ie = [],
                _e = b.stencilBuffer ? 33306 : 36096,
                re = n.get(b),
                W = b.isWebGLMultipleRenderTargets === !0;
            if (W)
                for (let we = 0; we < x.length; we++) t.bindFramebuffer(36160, re.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(36160, 36064 + we, 36161, null), t.bindFramebuffer(36160, re.__webglFramebuffer), s.framebufferTexture2D(36009, 36064 + we, 3553, null, 0);
            t.bindFramebuffer(36008, re.__webglMultisampledFramebuffer), t.bindFramebuffer(36009, re.__webglFramebuffer);
            for (let we = 0; we < x.length; we++) {
                ie.push(36064 + we), b.depthBuffer && ie.push(_e);
                const de = re.__ignoreDepthValues !== void 0 ? re.__ignoreDepthValues : !1;
                if (de === !1 && (b.depthBuffer && (ee |= 256), b.stencilBuffer && (ee |= 1024)), W && s.framebufferRenderbuffer(36008, 36064, 36161, re.__webglColorRenderbuffer[we]), de === !0 && (s.invalidateFramebuffer(36008, [_e]), s.invalidateFramebuffer(36009, [_e])), W) {
                    const Me = n.get(x[we]).__webglTexture;
                    s.framebufferTexture2D(36009, 36064, 3553, Me, 0)
                }
                s.blitFramebuffer(0, 0, G, Q, 0, 0, G, Q, ee, 9728), f && s.invalidateFramebuffer(36008, ie)
            }
            if (t.bindFramebuffer(36008, null), t.bindFramebuffer(36009, null), W)
                for (let we = 0; we < x.length; we++) {
                    t.bindFramebuffer(36160, re.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(36160, 36064 + we, 36161, re.__webglColorRenderbuffer[we]);
                    const de = n.get(x[we]).__webglTexture;
                    t.bindFramebuffer(36160, re.__webglFramebuffer), s.framebufferTexture2D(36009, 36064 + we, 3553, de, 0)
                }
            t.bindFramebuffer(36009, re.__webglMultisampledFramebuffer)
        }
    }

    function tt(b) {
        return Math.min(u, b.samples)
    }

    function Qe(b) {
        const x = n.get(b);
        return o && b.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && x.__useRenderToTexture !== !1
    }

    function vn(b) {
        const x = a.render.frame;
        g.get(b) !== x && (g.set(b, x), b.update())
    }

    function hn(b, x) {
        const G = b.encoding,
            Q = b.format,
            ee = b.type;
        return b.isCompressedTexture === !0 || b.isVideoTexture === !0 || b.format === cl || G !== Oi && (G === Be ? o === !1 ? e.has("EXT_sRGB") === !0 && Q === rn ? (b.format = cl, b.minFilter = Gt, b.generateMipmaps = !1) : x = Yu.sRGBToLinear(x) : (Q !== rn || ee !== ki) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture encoding:", G)), x
    }
    this.allocateTextureUnit = H, this.resetTextureUnits = Z, this.setTexture2D = Y, this.setTexture2DArray = ge, this.setTexture3D = k, this.setTextureCube = K, this.rebindTextures = At, this.setupRenderTarget = cn, this.updateRenderTargetMipmap = zt, this.updateMultisampleRenderTarget = Ct, this.setupDepthRenderbuffer = ze, this.setupFrameBufferTexture = Se, this.useMultisampledRTT = Qe
}

function ey(s, e, t) {
    const n = t.isWebGL2;

    function i(r, a = null) {
        let o;
        if (r === ki) return 5121;
        if (r === Tp) return 32819;
        if (r === Ap) return 32820;
        if (r === Mp) return 5120;
        if (r === bp) return 5122;
        if (r === Gu) return 5123;
        if (r === Ep) return 5124;
        if (r === Ci) return 5125;
        if (r === oi) return 5126;
        if (r === Er) return n ? 5131 : (o = e.get("OES_texture_half_float"), o !== null ? o.HALF_FLOAT_OES : null);
        if (r === Cp) return 6406;
        if (r === rn) return 6408;
        if (r === Vu) return 6409;
        if (r === Lp) return 6410;
        if (r === Bi) return 6402;
        if (r === ks) return 34041;
        if (r === cl) return o = e.get("EXT_sRGB"), o !== null ? o.SRGB_ALPHA_EXT : null;
        if (r === Ip) return 6403;
        if (r === Rp) return 36244;
        if (r === Dp) return 33319;
        if (r === Pp) return 33320;
        if (r === Np) return 36249;
        if (r === co || r === ho || r === uo || r === fo)
            if (a === Be)
                if (o = e.get("WEBGL_compressed_texture_s3tc_srgb"), o !== null) {
                    if (r === co) return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;
                    if (r === ho) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
                    if (r === uo) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
                    if (r === fo) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT
                } else return null;
        else if (o = e.get("WEBGL_compressed_texture_s3tc"), o !== null) {
            if (r === co) return o.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if (r === ho) return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if (r === uo) return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if (r === fo) return o.COMPRESSED_RGBA_S3TC_DXT5_EXT
        } else return null;
        if (r === Oc || r === Uc || r === zc || r === Gc)
            if (o = e.get("WEBGL_compressed_texture_pvrtc"), o !== null) {
                if (r === Oc) return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                if (r === Uc) return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                if (r === zc) return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                if (r === Gc) return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
            } else return null;
        if (r === Bp) return o = e.get("WEBGL_compressed_texture_etc1"), o !== null ? o.COMPRESSED_RGB_ETC1_WEBGL : null;
        if (r === Vc || r === Hc)
            if (o = e.get("WEBGL_compressed_texture_etc"), o !== null) {
                if (r === Vc) return a === Be ? o.COMPRESSED_SRGB8_ETC2 : o.COMPRESSED_RGB8_ETC2;
                if (r === Hc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : o.COMPRESSED_RGBA8_ETC2_EAC
            } else return null;
        if (r === Wc || r === Xc || r === qc || r === jc || r === Yc || r === $c || r === Kc || r === Zc || r === Jc || r === Qc || r === eh || r === th || r === nh || r === ih)
            if (o = e.get("WEBGL_compressed_texture_astc"), o !== null) {
                if (r === Wc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : o.COMPRESSED_RGBA_ASTC_4x4_KHR;
                if (r === Xc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : o.COMPRESSED_RGBA_ASTC_5x4_KHR;
                if (r === qc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : o.COMPRESSED_RGBA_ASTC_5x5_KHR;
                if (r === jc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : o.COMPRESSED_RGBA_ASTC_6x5_KHR;
                if (r === Yc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : o.COMPRESSED_RGBA_ASTC_6x6_KHR;
                if (r === $c) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : o.COMPRESSED_RGBA_ASTC_8x5_KHR;
                if (r === Kc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : o.COMPRESSED_RGBA_ASTC_8x6_KHR;
                if (r === Zc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : o.COMPRESSED_RGBA_ASTC_8x8_KHR;
                if (r === Jc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : o.COMPRESSED_RGBA_ASTC_10x5_KHR;
                if (r === Qc) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : o.COMPRESSED_RGBA_ASTC_10x6_KHR;
                if (r === eh) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : o.COMPRESSED_RGBA_ASTC_10x8_KHR;
                if (r === th) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : o.COMPRESSED_RGBA_ASTC_10x10_KHR;
                if (r === nh) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : o.COMPRESSED_RGBA_ASTC_12x10_KHR;
                if (r === ih) return a === Be ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : o.COMPRESSED_RGBA_ASTC_12x12_KHR
            } else return null;
        if (r === po)
            if (o = e.get("EXT_texture_compression_bptc"), o !== null) {
                if (r === po) return a === Be ? o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : o.COMPRESSED_RGBA_BPTC_UNORM_EXT
            } else return null;
        if (r === Fp || r === sh || r === rh || r === ah)
            if (o = e.get("EXT_texture_compression_rgtc"), o !== null) {
                if (r === po) return o.COMPRESSED_RED_RGTC1_EXT;
                if (r === sh) return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;
                if (r === rh) return o.COMPRESSED_RED_GREEN_RGTC2_EXT;
                if (r === ah) return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT
            } else return null;
        return r === Ts ? n ? 34042 : (o = e.get("WEBGL_depth_texture"), o !== null ? o.UNSIGNED_INT_24_8_WEBGL : null) : s[r] !== void 0 ? s[r] : null
    }
    return {
        convert: i
    }
}
class ty extends Bt {
    constructor(e = []) {
        super(), this.isArrayCamera = !0, this.cameras = e
    }
}
let Ii = class extends Ye {
    constructor() {
        super(), this.isGroup = !0, this.type = "Group"
    }
};
const ny = {
    type: "move"
};
class Uo {
    constructor() {
        this._targetRay = null, this._grip = null, this._hand = null
    }
    getHandSpace() {
        return this._hand === null && (this._hand = new Ii, this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
            pinching: !1
        }), this._hand
    }
    getTargetRaySpace() {
        return this._targetRay === null && (this._targetRay = new Ii, this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new M, this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new M), this._targetRay
    }
    getGripSpace() {
        return this._grip === null && (this._grip = new Ii, this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new M, this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new M), this._grip
    }
    dispatchEvent(e) {
        return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this
    }
    connect(e) {
        if (e && e.hand) {
            const t = this._hand;
            if (t)
                for (const n of e.hand.values()) this._getHandJoint(t, n)
        }
        return this.dispatchEvent({
            type: "connected",
            data: e
        }), this
    }
    disconnect(e) {
        return this.dispatchEvent({
            type: "disconnected",
            data: e
        }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this
    }
    update(e, t, n) {
        let i = null,
            r = null,
            a = null;
        const o = this._targetRay,
            l = this._grip,
            c = this._hand;
        if (e && t.session.visibilityState !== "visible-blurred") {
            if (c && e.hand) {
                a = !0;
                for (const m of e.hand.values()) {
                    const p = t.getJointPose(m, n),
                        _ = this._getHandJoint(c, m);
                    p !== null && (_.matrix.fromArray(p.transform.matrix), _.matrix.decompose(_.position, _.rotation, _.scale), _.jointRadius = p.radius), _.visible = p !== null
                }
                const h = c.joints["index-finger-tip"],
                    u = c.joints["thumb-tip"],
                    d = h.position.distanceTo(u.position),
                    f = .02,
                    g = .005;
                c.inputState.pinching && d > f + g ? (c.inputState.pinching = !1, this.dispatchEvent({
                    type: "pinchend",
                    handedness: e.handedness,
                    target: this
                })) : !c.inputState.pinching && d <= f - g && (c.inputState.pinching = !0, this.dispatchEvent({
                    type: "pinchstart",
                    handedness: e.handedness,
                    target: this
                }))
            } else l !== null && e.gripSpace && (r = t.getPose(e.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), r.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = !1, r.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = !1));
            o !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), i.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(i.linearVelocity)) : o.hasLinearVelocity = !1, i.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(i.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(ny)))
        }
        return o !== null && (o.visible = i !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = a !== null), this
    }
    _getHandJoint(e, t) {
        if (e.joints[t.jointName] === void 0) {
            const n = new Ii;
            n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n)
        }
        return e.joints[t.jointName]
    }
}
class iy extends wt {
    constructor(e, t, n, i, r, a, o, l, c, h) {
        if (h = h !== void 0 ? h : Bi, h !== Bi && h !== ks) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
        n === void 0 && h === Bi && (n = Ci), n === void 0 && h === ks && (n = Ts), super(null, i, r, a, o, l, h, n, c), this.isDepthTexture = !0, this.image = {
            width: e,
            height: t
        }, this.magFilter = o !== void 0 ? o : gt, this.minFilter = l !== void 0 ? l : gt, this.flipY = !1, this.generateMipmaps = !1
    }
}
class sy extends ji {
    constructor(e, t) {
        super();
        const n = this;
        let i = null,
            r = 1,
            a = null,
            o = "local-floor",
            l = 1,
            c = null,
            h = null,
            u = null,
            d = null,
            f = null,
            g = null;
        const m = t.getContextAttributes();
        let p = null,
            _ = null;
        const E = [],
            y = [],
            S = new Set,
            T = new Map,
            L = new Bt;
        L.layers.enable(1), L.viewport = new je;
        const I = new Bt;
        I.layers.enable(2), I.viewport = new je;
        const v = [L, I],
            A = new ty;
        A.layers.enable(1), A.layers.enable(2);
        let P = null,
            q = null;
        this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(k) {
            let K = E[k];
            return K === void 0 && (K = new Uo, E[k] = K), K.getTargetRaySpace()
        }, this.getControllerGrip = function(k) {
            let K = E[k];
            return K === void 0 && (K = new Uo, E[k] = K), K.getGripSpace()
        }, this.getHand = function(k) {
            let K = E[k];
            return K === void 0 && (K = new Uo, E[k] = K), K.getHandSpace()
        };

        function X(k) {
            const K = y.indexOf(k.inputSource);
            if (K === -1) return;
            const ne = E[K];
            ne !== void 0 && ne.dispatchEvent({
                type: k.type,
                data: k.inputSource
            })
        }

        function F() {
            i.removeEventListener("select", X), i.removeEventListener("selectstart", X), i.removeEventListener("selectend", X), i.removeEventListener("squeeze", X), i.removeEventListener("squeezestart", X), i.removeEventListener("squeezeend", X), i.removeEventListener("end", F), i.removeEventListener("inputsourceschange", D);
            for (let k = 0; k < E.length; k++) {
                const K = y[k];
                K !== null && (y[k] = null, E[k].disconnect(K))
            }
            P = null, q = null, e.setRenderTarget(p), f = null, d = null, u = null, i = null, _ = null, ge.stop(), n.isPresenting = !1, n.dispatchEvent({
                type: "sessionend"
            })
        }
        this.setFramebufferScaleFactor = function(k) {
            r = k, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")
        }, this.setReferenceSpaceType = function(k) {
            o = k, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")
        }, this.getReferenceSpace = function() {
            return c || a
        }, this.setReferenceSpace = function(k) {
            c = k
        }, this.getBaseLayer = function() {
            return d !== null ? d : f
        }, this.getBinding = function() {
            return u
        }, this.getFrame = function() {
            return g
        }, this.getSession = function() {
            return i
        }, this.setSession = async function(k) {
            if (i = k, i !== null) {
                if (p = e.getRenderTarget(), i.addEventListener("select", X), i.addEventListener("selectstart", X), i.addEventListener("selectend", X), i.addEventListener("squeeze", X), i.addEventListener("squeezestart", X), i.addEventListener("squeezeend", X), i.addEventListener("end", F), i.addEventListener("inputsourceschange", D), m.xrCompatible !== !0 && await t.makeXRCompatible(), i.renderState.layers === void 0 || e.capabilities.isWebGL2 === !1) {
                    const K = {
                        antialias: i.renderState.layers === void 0 ? m.antialias : !0,
                        alpha: m.alpha,
                        depth: m.depth,
                        stencil: m.stencil,
                        framebufferScaleFactor: r
                    };
                    f = new XRWebGLLayer(i, t, K), i.updateRenderState({
                        baseLayer: f
                    }), _ = new Ui(f.framebufferWidth, f.framebufferHeight, {
                        format: rn,
                        type: ki,
                        encoding: e.outputEncoding,
                        stencilBuffer: m.stencil
                    })
                } else {
                    let K = null,
                        ne = null,
                        B = null;
                    m.depth && (B = m.stencil ? 35056 : 33190, K = m.stencil ? ks : Bi, ne = m.stencil ? Ts : Ci);
                    const ce = {
                        colorFormat: 32856,
                        depthFormat: B,
                        scaleFactor: r
                    };
                    u = new XRWebGLBinding(i, t), d = u.createProjectionLayer(ce), i.updateRenderState({
                        layers: [d]
                    }), _ = new Ui(d.textureWidth, d.textureHeight, {
                        format: rn,
                        type: ki,
                        depthTexture: new iy(d.textureWidth, d.textureHeight, ne, void 0, void 0, void 0, void 0, void 0, void 0, K),
                        stencilBuffer: m.stencil,
                        encoding: e.outputEncoding,
                        samples: m.antialias ? 4 : 0
                    });
                    const ae = e.properties.get(_);
                    ae.__ignoreDepthValues = d.ignoreDepthValues
                }
                _.isXRRenderTarget = !0, this.setFoveation(l), c = null, a = await i.requestReferenceSpace(o), ge.setContext(i), ge.start(), n.isPresenting = !0, n.dispatchEvent({
                    type: "sessionstart"
                })
            }
        };

        function D(k) {
            for (let K = 0; K < k.removed.length; K++) {
                const ne = k.removed[K],
                    B = y.indexOf(ne);
                B >= 0 && (y[B] = null, E[B].disconnect(ne))
            }
            for (let K = 0; K < k.added.length; K++) {
                const ne = k.added[K];
                let B = y.indexOf(ne);
                if (B === -1) {
                    for (let ae = 0; ae < E.length; ae++)
                        if (ae >= y.length) {
                            y.push(ne), B = ae;
                            break
                        } else if (y[ae] === null) {
                        y[ae] = ne, B = ae;
                        break
                    }
                    if (B === -1) break
                }
                const ce = E[B];
                ce && ce.connect(ne)
            }
        }
        const U = new M,
            j = new M;

        function Z(k, K, ne) {
            U.setFromMatrixPosition(K.matrixWorld), j.setFromMatrixPosition(ne.matrixWorld);
            const B = U.distanceTo(j),
                ce = K.projectionMatrix.elements,
                ae = ne.projectionMatrix.elements,
                he = ce[14] / (ce[10] - 1),
                ue = ce[14] / (ce[10] + 1),
                Se = (ce[9] + 1) / ce[5],
                Ce = (ce[9] - 1) / ce[5],
                Ie = (ce[8] - 1) / ce[0],
                ze = (ae[8] + 1) / ae[0],
                At = he * Ie,
                cn = he * ze,
                zt = B / (-Ie + ze),
                Ct = zt * -Ie;
            K.matrixWorld.decompose(k.position, k.quaternion, k.scale), k.translateX(Ct), k.translateZ(zt), k.matrixWorld.compose(k.position, k.quaternion, k.scale), k.matrixWorldInverse.copy(k.matrixWorld).invert();
            const tt = he + zt,
                Qe = ue + zt,
                vn = At - Ct,
                hn = cn + (B - Ct),
                b = Se * ue / Qe * tt,
                x = Ce * ue / Qe * tt;
            k.projectionMatrix.makePerspective(vn, hn, b, x, tt, Qe)
        }

        function H(k, K) {
            K === null ? k.matrixWorld.copy(k.matrix) : k.matrixWorld.multiplyMatrices(K.matrixWorld, k.matrix), k.matrixWorldInverse.copy(k.matrixWorld).invert()
        }
        this.updateCamera = function(k) {
            if (i === null) return;
            A.near = I.near = L.near = k.near, A.far = I.far = L.far = k.far, (P !== A.near || q !== A.far) && (i.updateRenderState({
                depthNear: A.near,
                depthFar: A.far
            }), P = A.near, q = A.far);
            const K = k.parent,
                ne = A.cameras;
            H(A, K);
            for (let ce = 0; ce < ne.length; ce++) H(ne[ce], K);
            A.matrixWorld.decompose(A.position, A.quaternion, A.scale), k.matrix.copy(A.matrix), k.matrix.decompose(k.position, k.quaternion, k.scale);
            const B = k.children;
            for (let ce = 0, ae = B.length; ce < ae; ce++) B[ce].updateMatrixWorld(!0);
            ne.length === 2 ? Z(A, L, I) : A.projectionMatrix.copy(L.projectionMatrix)
        }, this.getCamera = function() {
            return A
        }, this.getFoveation = function() {
            if (!(d === null && f === null)) return l
        }, this.setFoveation = function(k) {
            l = k, d !== null && (d.fixedFoveation = k), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = k)
        }, this.getPlanes = function() {
            return S
        };
        let J = null;

        function Y(k, K) {
            if (h = K.getViewerPose(c || a), g = K, h !== null) {
                const ne = h.views;
                f !== null && (e.setRenderTargetFramebuffer(_, f.framebuffer), e.setRenderTarget(_));
                let B = !1;
                ne.length !== A.cameras.length && (A.cameras.length = 0, B = !0);
                for (let ce = 0; ce < ne.length; ce++) {
                    const ae = ne[ce];
                    let he = null;
                    if (f !== null) he = f.getViewport(ae);
                    else {
                        const Se = u.getViewSubImage(d, ae);
                        he = Se.viewport, ce === 0 && (e.setRenderTargetTextures(_, Se.colorTexture, d.ignoreDepthValues ? void 0 : Se.depthStencilTexture), e.setRenderTarget(_))
                    }
                    let ue = v[ce];
                    ue === void 0 && (ue = new Bt, ue.layers.enable(ce), ue.viewport = new je, v[ce] = ue), ue.matrix.fromArray(ae.transform.matrix), ue.projectionMatrix.fromArray(ae.projectionMatrix), ue.viewport.set(he.x, he.y, he.width, he.height), ce === 0 && A.matrix.copy(ue.matrix), B === !0 && A.cameras.push(ue)
                }
            }
            for (let ne = 0; ne < E.length; ne++) {
                const B = y[ne],
                    ce = E[ne];
                B !== null && ce !== void 0 && ce.update(B, K, c || a)
            }
            if (J && J(k, K), K.detectedPlanes) {
                n.dispatchEvent({
                    type: "planesdetected",
                    data: K.detectedPlanes
                });
                let ne = null;
                for (const B of S) K.detectedPlanes.has(B) || (ne === null && (ne = []), ne.push(B));
                if (ne !== null)
                    for (const B of ne) S.delete(B), T.delete(B), n.dispatchEvent({
                        type: "planeremoved",
                        data: B
                    });
                for (const B of K.detectedPlanes)
                    if (!S.has(B)) S.add(B), T.set(B, K.lastChangedTime), n.dispatchEvent({
                        type: "planeadded",
                        data: B
                    });
                    else {
                        const ce = T.get(B);
                        B.lastChangedTime > ce && (T.set(B, B.lastChangedTime), n.dispatchEvent({
                            type: "planechanged",
                            data: B
                        }))
                    }
            }
            g = null
        }
        const ge = new id;
        ge.setAnimationLoop(Y), this.setAnimationLoop = function(k) {
            J = k
        }, this.dispose = function() {}
    }
}

function ry(s, e) {
    function t(m, p) {
        p.color.getRGB(m.fogColor.value, ed(s)), p.isFog ? (m.fogNear.value = p.near, m.fogFar.value = p.far) : p.isFogExp2 && (m.fogDensity.value = p.density)
    }

    function n(m, p, _, E, y) {
        p.isMeshBasicMaterial || p.isMeshLambertMaterial ? i(m, p) : p.isMeshToonMaterial ? (i(m, p), h(m, p)) : p.isMeshPhongMaterial ? (i(m, p), c(m, p)) : p.isMeshStandardMaterial ? (i(m, p), u(m, p), p.isMeshPhysicalMaterial && d(m, p, y)) : p.isMeshMatcapMaterial ? (i(m, p), f(m, p)) : p.isMeshDepthMaterial ? i(m, p) : p.isMeshDistanceMaterial ? (i(m, p), g(m, p)) : p.isMeshNormalMaterial ? i(m, p) : p.isLineBasicMaterial ? (r(m, p), p.isLineDashedMaterial && a(m, p)) : p.isPointsMaterial ? o(m, p, _, E) : p.isSpriteMaterial ? l(m, p) : p.isShadowMaterial ? (m.color.value.copy(p.color), m.opacity.value = p.opacity) : p.isShaderMaterial && (p.uniformsNeedUpdate = !1)
    }

    function i(m, p) {
        m.opacity.value = p.opacity, p.color && m.diffuse.value.copy(p.color), p.emissive && m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity), p.map && (m.map.value = p.map), p.alphaMap && (m.alphaMap.value = p.alphaMap), p.bumpMap && (m.bumpMap.value = p.bumpMap, m.bumpScale.value = p.bumpScale, p.side === Qt && (m.bumpScale.value *= -1)), p.displacementMap && (m.displacementMap.value = p.displacementMap, m.displacementScale.value = p.displacementScale, m.displacementBias.value = p.displacementBias), p.emissiveMap && (m.emissiveMap.value = p.emissiveMap), p.normalMap && (m.normalMap.value = p.normalMap, m.normalScale.value.copy(p.normalScale), p.side === Qt && m.normalScale.value.negate()), p.specularMap && (m.specularMap.value = p.specularMap), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
        const _ = e.get(p).envMap;
        if (_ && (m.envMap.value = _, m.flipEnvMap.value = _.isCubeTexture && _.isRenderTargetTexture === !1 ? -1 : 1, m.reflectivity.value = p.reflectivity, m.ior.value = p.ior, m.refractionRatio.value = p.refractionRatio), p.lightMap) {
            m.lightMap.value = p.lightMap;
            const S = s.useLegacyLights === !0 ? Math.PI : 1;
            m.lightMapIntensity.value = p.lightMapIntensity * S
        }
        p.aoMap && (m.aoMap.value = p.aoMap, m.aoMapIntensity.value = p.aoMapIntensity);
        let E;
        p.map ? E = p.map : p.specularMap ? E = p.specularMap : p.displacementMap ? E = p.displacementMap : p.normalMap ? E = p.normalMap : p.bumpMap ? E = p.bumpMap : p.roughnessMap ? E = p.roughnessMap : p.metalnessMap ? E = p.metalnessMap : p.alphaMap ? E = p.alphaMap : p.emissiveMap ? E = p.emissiveMap : p.clearcoatMap ? E = p.clearcoatMap : p.clearcoatNormalMap ? E = p.clearcoatNormalMap : p.clearcoatRoughnessMap ? E = p.clearcoatRoughnessMap : p.iridescenceMap ? E = p.iridescenceMap : p.iridescenceThicknessMap ? E = p.iridescenceThicknessMap : p.specularIntensityMap ? E = p.specularIntensityMap : p.specularColorMap ? E = p.specularColorMap : p.transmissionMap ? E = p.transmissionMap : p.thicknessMap ? E = p.thicknessMap : p.sheenColorMap ? E = p.sheenColorMap : p.sheenRoughnessMap && (E = p.sheenRoughnessMap), E !== void 0 && (E.isWebGLRenderTarget && (E = E.texture), E.matrixAutoUpdate === !0 && E.updateMatrix(), m.uvTransform.value.copy(E.matrix));
        let y;
        p.aoMap ? y = p.aoMap : p.lightMap && (y = p.lightMap), y !== void 0 && (y.isWebGLRenderTarget && (y = y.texture), y.matrixAutoUpdate === !0 && y.updateMatrix(), m.uv2Transform.value.copy(y.matrix))
    }

    function r(m, p) {
        m.diffuse.value.copy(p.color), m.opacity.value = p.opacity
    }

    function a(m, p) {
        m.dashSize.value = p.dashSize, m.totalSize.value = p.dashSize + p.gapSize, m.scale.value = p.scale
    }

    function o(m, p, _, E) {
        m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, m.size.value = p.size * _, m.scale.value = E * .5, p.map && (m.map.value = p.map), p.alphaMap && (m.alphaMap.value = p.alphaMap), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
        let y;
        p.map ? y = p.map : p.alphaMap && (y = p.alphaMap), y !== void 0 && (y.matrixAutoUpdate === !0 && y.updateMatrix(), m.uvTransform.value.copy(y.matrix))
    }

    function l(m, p) {
        m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, m.rotation.value = p.rotation, p.map && (m.map.value = p.map), p.alphaMap && (m.alphaMap.value = p.alphaMap), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
        let _;
        p.map ? _ = p.map : p.alphaMap && (_ = p.alphaMap), _ !== void 0 && (_.matrixAutoUpdate === !0 && _.updateMatrix(), m.uvTransform.value.copy(_.matrix))
    }

    function c(m, p) {
        m.specular.value.copy(p.specular), m.shininess.value = Math.max(p.shininess, 1e-4)
    }

    function h(m, p) {
        p.gradientMap && (m.gradientMap.value = p.gradientMap)
    }

    function u(m, p) {
        m.roughness.value = p.roughness, m.metalness.value = p.metalness, p.roughnessMap && (m.roughnessMap.value = p.roughnessMap), p.metalnessMap && (m.metalnessMap.value = p.metalnessMap), e.get(p).envMap && (m.envMapIntensity.value = p.envMapIntensity)
    }

    function d(m, p, _) {
        m.ior.value = p.ior, p.sheen > 0 && (m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen), m.sheenRoughness.value = p.sheenRoughness, p.sheenColorMap && (m.sheenColorMap.value = p.sheenColorMap), p.sheenRoughnessMap && (m.sheenRoughnessMap.value = p.sheenRoughnessMap)), p.clearcoat > 0 && (m.clearcoat.value = p.clearcoat, m.clearcoatRoughness.value = p.clearcoatRoughness, p.clearcoatMap && (m.clearcoatMap.value = p.clearcoatMap), p.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = p.clearcoatRoughnessMap), p.clearcoatNormalMap && (m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale), m.clearcoatNormalMap.value = p.clearcoatNormalMap, p.side === Qt && m.clearcoatNormalScale.value.negate())), p.iridescence > 0 && (m.iridescence.value = p.iridescence, m.iridescenceIOR.value = p.iridescenceIOR, m.iridescenceThicknessMinimum.value = p.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = p.iridescenceThicknessRange[1], p.iridescenceMap && (m.iridescenceMap.value = p.iridescenceMap), p.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = p.iridescenceThicknessMap)), p.transmission > 0 && (m.transmission.value = p.transmission, m.transmissionSamplerMap.value = _.texture, m.transmissionSamplerSize.value.set(_.width, _.height), p.transmissionMap && (m.transmissionMap.value = p.transmissionMap), m.thickness.value = p.thickness, p.thicknessMap && (m.thicknessMap.value = p.thicknessMap), m.attenuationDistance.value = p.attenuationDistance, m.attenuationColor.value.copy(p.attenuationColor)), m.specularIntensity.value = p.specularIntensity, m.specularColor.value.copy(p.specularColor), p.specularIntensityMap && (m.specularIntensityMap.value = p.specularIntensityMap), p.specularColorMap && (m.specularColorMap.value = p.specularColorMap)
    }

    function f(m, p) {
        p.matcap && (m.matcap.value = p.matcap)
    }

    function g(m, p) {
        m.referencePosition.value.copy(p.referencePosition), m.nearDistance.value = p.nearDistance, m.farDistance.value = p.farDistance
    }
    return {
        refreshFogUniforms: t,
        refreshMaterialUniforms: n
    }
}

function ay(s, e, t, n) {
    let i = {},
        r = {},
        a = [];
    const o = t.isWebGL2 ? s.getParameter(35375) : 0;

    function l(E, y) {
        const S = y.program;
        n.uniformBlockBinding(E, S)
    }

    function c(E, y) {
        let S = i[E.id];
        S === void 0 && (g(E), S = h(E), i[E.id] = S, E.addEventListener("dispose", p));
        const T = y.program;
        n.updateUBOMapping(E, T);
        const L = e.render.frame;
        r[E.id] !== L && (d(E), r[E.id] = L)
    }

    function h(E) {
        const y = u();
        E.__bindingPointIndex = y;
        const S = s.createBuffer(),
            T = E.__size,
            L = E.usage;
        return s.bindBuffer(35345, S), s.bufferData(35345, T, L), s.bindBuffer(35345, null), s.bindBufferBase(35345, y, S), S
    }

    function u() {
        for (let E = 0; E < o; E++)
            if (a.indexOf(E) === -1) return a.push(E), E;
        return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0
    }

    function d(E) {
        const y = i[E.id],
            S = E.uniforms,
            T = E.__cache;
        s.bindBuffer(35345, y);
        for (let L = 0, I = S.length; L < I; L++) {
            const v = S[L];
            if (f(v, L, T) === !0) {
                const A = v.__offset,
                    P = Array.isArray(v.value) ? v.value : [v.value];
                let q = 0;
                for (let X = 0; X < P.length; X++) {
                    const F = P[X],
                        D = m(F);
                    typeof F == "number" ? (v.__data[0] = F, s.bufferSubData(35345, A + q, v.__data)) : F.isMatrix3 ? (v.__data[0] = F.elements[0], v.__data[1] = F.elements[1], v.__data[2] = F.elements[2], v.__data[3] = F.elements[0], v.__data[4] = F.elements[3], v.__data[5] = F.elements[4], v.__data[6] = F.elements[5], v.__data[7] = F.elements[0], v.__data[8] = F.elements[6], v.__data[9] = F.elements[7], v.__data[10] = F.elements[8], v.__data[11] = F.elements[0]) : (F.toArray(v.__data, q), q += D.storage / Float32Array.BYTES_PER_ELEMENT)
                }
                s.bufferSubData(35345, A, v.__data)
            }
        }
        s.bindBuffer(35345, null)
    }

    function f(E, y, S) {
        const T = E.value;
        if (S[y] === void 0) {
            if (typeof T == "number") S[y] = T;
            else {
                const L = Array.isArray(T) ? T : [T],
                    I = [];
                for (let v = 0; v < L.length; v++) I.push(L[v].clone());
                S[y] = I
            }
            return !0
        } else if (typeof T == "number") {
            if (S[y] !== T) return S[y] = T, !0
        } else {
            const L = Array.isArray(S[y]) ? S[y] : [S[y]],
                I = Array.isArray(T) ? T : [T];
            for (let v = 0; v < L.length; v++) {
                const A = L[v];
                if (A.equals(I[v]) === !1) return A.copy(I[v]), !0
            }
        }
        return !1
    }

    function g(E) {
        const y = E.uniforms;
        let S = 0;
        const T = 16;
        let L = 0;
        for (let I = 0, v = y.length; I < v; I++) {
            const A = y[I],
                P = {
                    boundary: 0,
                    storage: 0
                },
                q = Array.isArray(A.value) ? A.value : [A.value];
            for (let X = 0, F = q.length; X < F; X++) {
                const D = q[X],
                    U = m(D);
                P.boundary += U.boundary, P.storage += U.storage
            }
            if (A.__data = new Float32Array(P.storage / Float32Array.BYTES_PER_ELEMENT), A.__offset = S, I > 0) {
                L = S % T;
                const X = T - L;
                L !== 0 && X - P.boundary < 0 && (S += T - L, A.__offset = S)
            }
            S += P.storage
        }
        return L = S % T, L > 0 && (S += T - L), E.__size = S, E.__cache = {}, this
    }

    function m(E) {
        const y = {
            boundary: 0,
            storage: 0
        };
        return typeof E == "number" ? (y.boundary = 4, y.storage = 4) : E.isVector2 ? (y.boundary = 8, y.storage = 8) : E.isVector3 || E.isColor ? (y.boundary = 16, y.storage = 12) : E.isVector4 ? (y.boundary = 16, y.storage = 16) : E.isMatrix3 ? (y.boundary = 48, y.storage = 48) : E.isMatrix4 ? (y.boundary = 64, y.storage = 64) : E.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", E), y
    }

    function p(E) {
        const y = E.target;
        y.removeEventListener("dispose", p);
        const S = a.indexOf(y.__bindingPointIndex);
        a.splice(S, 1), s.deleteBuffer(i[y.id]), delete i[y.id], delete r[y.id]
    }

    function _() {
        for (const E in i) s.deleteBuffer(i[E]);
        a = [], i = {}, r = {}
    }
    return {
        bind: l,
        update: c,
        dispose: _
    }
}

function oy() {
    const s = Lr("canvas");
    return s.style.display = "block", s
}

function Jl(s = {}) {
    this.isWebGLRenderer = !0;
    const e = s.canvas !== void 0 ? s.canvas : oy(),
        t = s.context !== void 0 ? s.context : null,
        n = s.depth !== void 0 ? s.depth : !0,
        i = s.stencil !== void 0 ? s.stencil : !0,
        r = s.antialias !== void 0 ? s.antialias : !1,
        a = s.premultipliedAlpha !== void 0 ? s.premultipliedAlpha : !0,
        o = s.preserveDrawingBuffer !== void 0 ? s.preserveDrawingBuffer : !1,
        l = s.powerPreference !== void 0 ? s.powerPreference : "default",
        c = s.failIfMajorPerformanceCaveat !== void 0 ? s.failIfMajorPerformanceCaveat : !1;
    let h;
    t !== null ? h = t.getContextAttributes().alpha : h = s.alpha !== void 0 ? s.alpha : !1;
    let u = null,
        d = null;
    const f = [],
        g = [];
    this.domElement = e, this.debug = {
        checkShaderErrors: !0
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.outputEncoding = Oi, this.useLegacyLights = !0, this.toneMapping = qn, this.toneMappingExposure = 1;
    const m = this;
    let p = !1,
        _ = 0,
        E = 0,
        y = null,
        S = -1,
        T = null;
    const L = new je,
        I = new je;
    let v = null,
        A = e.width,
        P = e.height,
        q = 1,
        X = null,
        F = null;
    const D = new je(0, 0, A, P),
        U = new je(0, 0, A, P);
    let j = !1;
    const Z = new $l;
    let H = !1,
        J = !1,
        Y = null;
    const ge = new Te,
        k = new M,
        K = {
            background: null,
            fog: null,
            environment: null,
            overrideMaterial: null,
            isScene: !0
        };

    function ne() {
        return y === null ? q : 1
    }
    let B = t;

    function ce(w, N) {
        for (let O = 0; O < w.length; O++) {
            const R = w[O],
                V = e.getContext(R, N);
            if (V !== null) return V
        }
        return null
    }
    try {
        const w = {
            alpha: !0,
            depth: n,
            stencil: i,
            antialias: r,
            premultipliedAlpha: a,
            preserveDrawingBuffer: o,
            powerPreference: l,
            failIfMajorPerformanceCaveat: c
        };
        if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${Hl}`), e.addEventListener("webglcontextlost", Me, !1), e.addEventListener("webglcontextrestored", ye, !1), e.addEventListener("webglcontextcreationerror", me, !1), B === null) {
            const N = ["webgl2", "webgl", "experimental-webgl"];
            if (m.isWebGL1Renderer === !0 && N.shift(), B = ce(N, w), B === null) throw ce(N) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.")
        }
        B.getShaderPrecisionFormat === void 0 && (B.getShaderPrecisionFormat = function() {
            return {
                rangeMin: 1,
                rangeMax: 1,
                precision: 1
            }
        })
    } catch (w) {
        throw console.error("THREE.WebGLRenderer: " + w.message), w
    }
    let ae, he, ue, Se, Ce, Ie, ze, At, cn, zt, Ct, tt, Qe, vn, hn, b, x, G, Q, ee, ie, _e, re, W;

    function we() {
        ae = new x_(B), he = new d_(B, ae, s), ae.init(he), _e = new ey(B, ae, he), ue = new Jx(B, ae, he), Se = new S_, Ce = new Ox, Ie = new Qx(B, ae, ue, Ce, he, _e, Se), ze = new p_(m), At = new __(m), cn = new Im(B, he), re = new h_(B, ae, cn, he), zt = new y_(B, cn, Se, re), Ct = new E_(B, zt, cn, Se), Q = new b_(B, he, Ie), b = new f_(Ce), tt = new kx(m, ze, At, ae, he, re, b), Qe = new ry(m, Ce), vn = new zx, hn = new qx(ae, he), G = new c_(m, ze, At, ue, Ct, h, a), x = new Zx(m, Ct, he), W = new ay(B, Se, he, ue), ee = new u_(B, ae, Se, he), ie = new v_(B, ae, Se, he), Se.programs = tt.programs, m.capabilities = he, m.extensions = ae, m.properties = Ce, m.renderLists = vn, m.shadowMap = x, m.state = ue, m.info = Se
    }
    we();
    const de = new sy(m, B);
    this.xr = de, this.getContext = function() {
        return B
    }, this.getContextAttributes = function() {
        return B.getContextAttributes()
    }, this.forceContextLoss = function() {
        const w = ae.get("WEBGL_lose_context");
        w && w.loseContext()
    }, this.forceContextRestore = function() {
        const w = ae.get("WEBGL_lose_context");
        w && w.restoreContext()
    }, this.getPixelRatio = function() {
        return q
    }, this.setPixelRatio = function(w) {
        w !== void 0 && (q = w, this.setSize(A, P, !1))
    }, this.getSize = function(w) {
        return w.set(A, P)
    }, this.setSize = function(w, N, O = !0) {
        if (de.isPresenting) {
            console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
            return
        }
        A = w, P = N, e.width = Math.floor(w * q), e.height = Math.floor(N * q), O === !0 && (e.style.width = w + "px", e.style.height = N + "px"), this.setViewport(0, 0, w, N)
    }, this.getDrawingBufferSize = function(w) {
        return w.set(A * q, P * q).floor()
    }, this.setDrawingBufferSize = function(w, N, O) {
        A = w, P = N, q = O, e.width = Math.floor(w * O), e.height = Math.floor(N * O), this.setViewport(0, 0, w, N)
    }, this.getCurrentViewport = function(w) {
        return w.copy(L)
    }, this.getViewport = function(w) {
        return w.copy(D)
    }, this.setViewport = function(w, N, O, R) {
        w.isVector4 ? D.set(w.x, w.y, w.z, w.w) : D.set(w, N, O, R), ue.viewport(L.copy(D).multiplyScalar(q).floor())
    }, this.getScissor = function(w) {
        return w.copy(U)
    }, this.setScissor = function(w, N, O, R) {
        w.isVector4 ? U.set(w.x, w.y, w.z, w.w) : U.set(w, N, O, R), ue.scissor(I.copy(U).multiplyScalar(q).floor())
    }, this.getScissorTest = function() {
        return j
    }, this.setScissorTest = function(w) {
        ue.setScissorTest(j = w)
    }, this.setOpaqueSort = function(w) {
        X = w
    }, this.setTransparentSort = function(w) {
        F = w
    }, this.getClearColor = function(w) {
        return w.copy(G.getClearColor())
    }, this.setClearColor = function() {
        G.setClearColor.apply(G, arguments)
    }, this.getClearAlpha = function() {
        return G.getClearAlpha()
    }, this.setClearAlpha = function() {
        G.setClearAlpha.apply(G, arguments)
    }, this.clear = function(w = !0, N = !0, O = !0) {
        let R = 0;
        w && (R |= 16384), N && (R |= 256), O && (R |= 1024), B.clear(R)
    }, this.clearColor = function() {
        this.clear(!0, !1, !1)
    }, this.clearDepth = function() {
        this.clear(!1, !0, !1)
    }, this.clearStencil = function() {
        this.clear(!1, !1, !0)
    }, this.dispose = function() {
        e.removeEventListener("webglcontextlost", Me, !1), e.removeEventListener("webglcontextrestored", ye, !1), e.removeEventListener("webglcontextcreationerror", me, !1), vn.dispose(), hn.dispose(), Ce.dispose(), ze.dispose(), At.dispose(), Ct.dispose(), re.dispose(), W.dispose(), tt.dispose(), de.dispose(), de.removeEventListener("sessionstart", $), de.removeEventListener("sessionend", se), Y && (Y.dispose(), Y = null), oe.stop()
    };

    function Me(w) {
        w.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), p = !0
    }

    function ye() {
        console.log("THREE.WebGLRenderer: Context Restored."), p = !1;
        const w = Se.autoReset,
            N = x.enabled,
            O = x.autoUpdate,
            R = x.needsUpdate,
            V = x.type;
        we(), Se.autoReset = w, x.enabled = N, x.autoUpdate = O, x.needsUpdate = R, x.type = V
    }

    function me(w) {
        console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", w.statusMessage)
    }

    function ke(w) {
        const N = w.target;
        N.removeEventListener("dispose", ke), et(N)
    }

    function et(w) {
        dt(w), Ce.remove(w)
    }

    function dt(w) {
        const N = Ce.get(w).programs;
        N !== void 0 && (N.forEach(function(O) {
            tt.releaseProgram(O)
        }), w.isShaderMaterial && tt.releaseShaderCache(w))
    }
    this.renderBufferDirect = function(w, N, O, R, V, xe) {
        N === null && (N = K);
        const be = V.isMesh && V.matrixWorld.determinant() < 0,
            Ae = Lf(w, N, O, R, V);
        ue.setMaterial(R, be);
        let Le = O.index,
            Oe = 1;
        R.wireframe === !0 && (Le = zt.getWireframeAttribute(O), Oe = 2);
        const Re = O.drawRange,
            De = O.attributes.position;
        let rt = Re.start * Oe,
            Yt = (Re.start + Re.count) * Oe;
        xe !== null && (rt = Math.max(rt, xe.start * Oe), Yt = Math.min(Yt, (xe.start + xe.count) * Oe)), Le !== null ? (rt = Math.max(rt, 0), Yt = Math.min(Yt, Le.count)) : De != null && (rt = Math.max(rt, 0), Yt = Math.min(Yt, De.count));
        const Fn = Yt - rt;
        if (Fn < 0 || Fn === 1 / 0) return;
        re.setup(V, R, Ae, O, Le);
        let _i, at = ee;
        if (Le !== null && (_i = cn.get(Le), at = ie, at.setIndex(_i)), V.isMesh) R.wireframe === !0 ? (ue.setLineWidth(R.wireframeLinewidth * ne()), at.setMode(1)) : at.setMode(4);
        else if (V.isLine) {
            let Pe = R.linewidth;
            Pe === void 0 && (Pe = 1), ue.setLineWidth(Pe * ne()), V.isLineSegments ? at.setMode(1) : V.isLineLoop ? at.setMode(2) : at.setMode(3)
        } else V.isPoints ? at.setMode(0) : V.isSprite && at.setMode(4);
        if (V.isInstancedMesh) at.renderInstances(rt, Fn, V.count);
        else if (O.isInstancedBufferGeometry) {
            const Pe = O._maxInstanceCount !== void 0 ? O._maxInstanceCount : 1 / 0,
                ro = Math.min(O.instanceCount, Pe);
            at.renderInstances(rt, Fn, ro)
        } else at.render(rt, Fn)
    }, this.compile = function(w, N) {
        function O(R, V, xe) {
            R.transparent === !0 && R.side === Ln && R.forceSinglePass === !1 ? (R.side = Qt, R.needsUpdate = !0, en(R, V, xe), R.side = $n, R.needsUpdate = !0, en(R, V, xe), R.side = Ln) : en(R, V, xe)
        }
        d = hn.get(w), d.init(), g.push(d), w.traverseVisible(function(R) {
            R.isLight && R.layers.test(N.layers) && (d.pushLight(R), R.castShadow && d.pushShadow(R))
        }), d.setupLights(m.useLegacyLights), w.traverse(function(R) {
            const V = R.material;
            if (V)
                if (Array.isArray(V))
                    for (let xe = 0; xe < V.length; xe++) {
                        const be = V[xe];
                        O(be, w, R)
                    } else O(V, w, R)
        }), g.pop(), d = null
    };
    let C = null;

    function z(w) {
        C && C(w)
    }

    function $() {
        oe.stop()
    }

    function se() {
        oe.start()
    }
    const oe = new id;
    oe.setAnimationLoop(z), typeof self < "u" && oe.setContext(self), this.setAnimationLoop = function(w) {
        C = w, de.setAnimationLoop(w), w === null ? oe.stop() : oe.start()
    }, de.addEventListener("sessionstart", $), de.addEventListener("sessionend", se), this.render = function(w, N) {
        if (N !== void 0 && N.isCamera !== !0) {
            console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
            return
        }
        if (p === !0) return;
        w.matrixWorldAutoUpdate === !0 && w.updateMatrixWorld(), N.parent === null && N.matrixWorldAutoUpdate === !0 && N.updateMatrixWorld(), de.enabled === !0 && de.isPresenting === !0 && (de.cameraAutoUpdate === !0 && de.updateCamera(N), N = de.getCamera()), w.isScene === !0 && w.onBeforeRender(m, w, N, y), d = hn.get(w, g.length), d.init(), g.push(d), ge.multiplyMatrices(N.projectionMatrix, N.matrixWorldInverse), Z.setFromProjectionMatrix(ge), J = this.localClippingEnabled, H = b.init(this.clippingPlanes, J), u = vn.get(w, f.length), u.init(), f.push(u), Ke(w, N, 0, m.sortObjects), u.finish(), m.sortObjects === !0 && u.sort(X, F), H === !0 && b.beginShadows();
        const O = d.state.shadowsArray;
        if (x.render(O, w, N), H === !0 && b.endShadows(), this.info.autoReset === !0 && this.info.reset(), G.render(u, w), d.setupLights(m.useLegacyLights), N.isArrayCamera) {
            const R = N.cameras;
            for (let V = 0, xe = R.length; V < xe; V++) {
                const be = R[V];
                ft(u, w, be, be.viewport)
            }
        } else ft(u, w, N);
        y !== null && (Ie.updateMultisampleRenderTarget(y), Ie.updateRenderTargetMipmap(y)), w.isScene === !0 && w.onAfterRender(m, w, N), re.resetDefaultState(), S = -1, T = null, g.pop(), g.length > 0 ? d = g[g.length - 1] : d = null, f.pop(), f.length > 0 ? u = f[f.length - 1] : u = null
    };

    function Ke(w, N, O, R) {
        if (w.visible === !1) return;
        if (w.layers.test(N.layers)) {
            if (w.isGroup) O = w.renderOrder;
            else if (w.isLOD) w.autoUpdate === !0 && w.update(N);
            else if (w.isLight) d.pushLight(w), w.castShadow && d.pushShadow(w);
            else if (w.isSprite) {
                if (!w.frustumCulled || Z.intersectsSprite(w)) {
                    R && k.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ge);
                    const be = Ct.update(w),
                        Ae = w.material;
                    Ae.visible && u.push(w, be, Ae, O, k.z, null)
                }
            } else if ((w.isMesh || w.isLine || w.isPoints) && (w.isSkinnedMesh && w.skeleton.frame !== Se.render.frame && (w.skeleton.update(), w.skeleton.frame = Se.render.frame), !w.frustumCulled || Z.intersectsObject(w))) {
                R && k.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ge);
                const be = Ct.update(w),
                    Ae = w.material;
                if (Array.isArray(Ae)) {
                    const Le = be.groups;
                    for (let Oe = 0, Re = Le.length; Oe < Re; Oe++) {
                        const De = Le[Oe],
                            rt = Ae[De.materialIndex];
                        rt && rt.visible && u.push(w, be, rt, O, k.z, De)
                    }
                } else Ae.visible && u.push(w, be, Ae, O, k.z, null)
            }
        }
        const xe = w.children;
        for (let be = 0, Ae = xe.length; be < Ae; be++) Ke(xe[be], N, O, R)
    }

    function ft(w, N, O, R) {
        const V = w.opaque,
            xe = w.transmissive,
            be = w.transparent;
        d.setupLightsView(O), H === !0 && b.setGlobalState(m.clippingPlanes, O), xe.length > 0 && Lt(V, N, O), R && ue.viewport(L.copy(R)), V.length > 0 && Sn(V, N, O), xe.length > 0 && Sn(xe, N, O), be.length > 0 && Sn(be, N, O), ue.buffers.depth.setTest(!0), ue.buffers.depth.setMask(!0), ue.buffers.color.setMask(!0), ue.setPolygonOffset(!1)
    }

    function Lt(w, N, O) {
        const R = he.isWebGL2;
        Y === null && (Y = new Ui(1024, 1024, {
            generateMipmaps: !0,
            type: ae.has("EXT_color_buffer_half_float") ? Er : ki,
            minFilter: Fi,
            samples: R && r === !0 ? 4 : 0
        }));
        const V = m.getRenderTarget();
        m.setRenderTarget(Y), m.clear();
        const xe = m.toneMapping;
        m.toneMapping = qn, Sn(w, N, O), m.toneMapping = xe, Ie.updateMultisampleRenderTarget(Y), Ie.updateRenderTargetMipmap(Y), m.setRenderTarget(V)
    }

    function Sn(w, N, O) {
        const R = N.isScene === !0 ? N.overrideMaterial : null;
        for (let V = 0, xe = w.length; V < xe; V++) {
            const be = w[V],
                Ae = be.object,
                Le = be.geometry,
                Oe = R === null ? be.material : R,
                Re = be.group;
            Ae.layers.test(O.layers) && it(Ae, N, O, Le, Oe, Re)
        }
    }

    function it(w, N, O, R, V, xe) {
        w.onBeforeRender(m, N, O, R, V, xe), w.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse, w.matrixWorld), w.normalMatrix.getNormalMatrix(w.modelViewMatrix), V.onBeforeRender(m, N, O, R, w, xe), V.transparent === !0 && V.side === Ln && V.forceSinglePass === !1 ? (V.side = Qt, V.needsUpdate = !0, m.renderBufferDirect(O, N, R, V, w, xe), V.side = $n, V.needsUpdate = !0, m.renderBufferDirect(O, N, R, V, w, xe), V.side = Ln) : m.renderBufferDirect(O, N, R, V, w, xe), w.onAfterRender(m, N, O, R, V, xe)
    }

    function en(w, N, O) {
        N.isScene !== !0 && (N = K);
        const R = Ce.get(w),
            V = d.state.lights,
            xe = d.state.shadowsArray,
            be = V.state.version,
            Ae = tt.getParameters(w, V.state, xe, N, O),
            Le = tt.getProgramCacheKey(Ae);
        let Oe = R.programs;
        R.environment = w.isMeshStandardMaterial ? N.environment : null, R.fog = N.fog, R.envMap = (w.isMeshStandardMaterial ? At : ze).get(w.envMap || R.environment), Oe === void 0 && (w.addEventListener("dispose", ke), Oe = new Map, R.programs = Oe);
        let Re = Oe.get(Le);
        if (Re !== void 0) {
            if (R.currentProgram === Re && R.lightsStateVersion === be) return wn(w, Ae), Re
        } else Ae.uniforms = tt.getUniforms(w), w.onBuild(O, Ae, m), w.onBeforeCompile(Ae, m), Re = tt.acquireProgram(Ae, Le), Oe.set(Le, Re), R.uniforms = Ae.uniforms;
        const De = R.uniforms;
        (!w.isShaderMaterial && !w.isRawShaderMaterial || w.clipping === !0) && (De.clippingPlanes = b.uniform), wn(w, Ae), R.needsLights = Rf(w), R.lightsStateVersion = be, R.needsLights && (De.ambientLightColor.value = V.state.ambient, De.lightProbe.value = V.state.probe, De.directionalLights.value = V.state.directional, De.directionalLightShadows.value = V.state.directionalShadow, De.spotLights.value = V.state.spot, De.spotLightShadows.value = V.state.spotShadow, De.rectAreaLights.value = V.state.rectArea, De.ltc_1.value = V.state.rectAreaLTC1, De.ltc_2.value = V.state.rectAreaLTC2, De.pointLights.value = V.state.point, De.pointLightShadows.value = V.state.pointShadow, De.hemisphereLights.value = V.state.hemi, De.directionalShadowMap.value = V.state.directionalShadowMap, De.directionalShadowMatrix.value = V.state.directionalShadowMatrix, De.spotShadowMap.value = V.state.spotShadowMap, De.spotLightMatrix.value = V.state.spotLightMatrix, De.spotLightMap.value = V.state.spotLightMap, De.pointShadowMap.value = V.state.pointShadowMap, De.pointShadowMatrix.value = V.state.pointShadowMatrix);
        const rt = Re.getUniforms(),
            Yt = ba.seqWithValue(rt.seq, De);
        return R.currentProgram = Re, R.uniformsList = Yt, Re
    }

    function wn(w, N) {
        const O = Ce.get(w);
        O.outputEncoding = N.outputEncoding, O.instancing = N.instancing, O.skinning = N.skinning, O.morphTargets = N.morphTargets, O.morphNormals = N.morphNormals, O.morphColors = N.morphColors, O.morphTargetsCount = N.morphTargetsCount, O.numClippingPlanes = N.numClippingPlanes, O.numIntersection = N.numClipIntersection, O.vertexAlphas = N.vertexAlphas, O.vertexTangents = N.vertexTangents, O.toneMapping = N.toneMapping
    }

    function Lf(w, N, O, R, V) {
        N.isScene !== !0 && (N = K), Ie.resetTextureUnits();
        const xe = N.fog,
            be = R.isMeshStandardMaterial ? N.environment : null,
            Ae = y === null ? m.outputEncoding : y.isXRRenderTarget === !0 ? y.texture.encoding : Oi,
            Le = (R.isMeshStandardMaterial ? At : ze).get(R.envMap || be),
            Oe = R.vertexColors === !0 && !!O.attributes.color && O.attributes.color.itemSize === 4,
            Re = !!R.normalMap && !!O.attributes.tangent,
            De = !!O.morphAttributes.position,
            rt = !!O.morphAttributes.normal,
            Yt = !!O.morphAttributes.color,
            Fn = R.toneMapped ? m.toneMapping : qn,
            _i = O.morphAttributes.position || O.morphAttributes.normal || O.morphAttributes.color,
            at = _i !== void 0 ? _i.length : 0,
            Pe = Ce.get(R),
            ro = d.state.lights;
        if (H === !0 && (J === !0 || w !== T)) {
            const $t = w === T && R.id === S;
            b.setState(R, w, $t)
        }
        let pt = !1;
        R.version === Pe.__version ? (Pe.needsLights && Pe.lightsStateVersion !== ro.state.version || Pe.outputEncoding !== Ae || V.isInstancedMesh && Pe.instancing === !1 || !V.isInstancedMesh && Pe.instancing === !0 || V.isSkinnedMesh && Pe.skinning === !1 || !V.isSkinnedMesh && Pe.skinning === !0 || Pe.envMap !== Le || R.fog === !0 && Pe.fog !== xe || Pe.numClippingPlanes !== void 0 && (Pe.numClippingPlanes !== b.numPlanes || Pe.numIntersection !== b.numIntersection) || Pe.vertexAlphas !== Oe || Pe.vertexTangents !== Re || Pe.morphTargets !== De || Pe.morphNormals !== rt || Pe.morphColors !== Yt || Pe.toneMapping !== Fn || he.isWebGL2 === !0 && Pe.morphTargetsCount !== at) && (pt = !0) : (pt = !0, Pe.__version = R.version);
        let xi = Pe.currentProgram;
        pt === !0 && (xi = en(R, N, V));
        let Ac = !1,
            Zs = !1,
            ao = !1;
        const It = xi.getUniforms(),
            yi = Pe.uniforms;
        if (ue.useProgram(xi.program) && (Ac = !0, Zs = !0, ao = !0), R.id !== S && (S = R.id, Zs = !0), Ac || T !== w) {
            if (It.setValue(B, "projectionMatrix", w.projectionMatrix), he.logarithmicDepthBuffer && It.setValue(B, "logDepthBufFC", 2 / (Math.log(w.far + 1) / Math.LN2)), T !== w && (T = w, Zs = !0, ao = !0), R.isShaderMaterial || R.isMeshPhongMaterial || R.isMeshToonMaterial || R.isMeshStandardMaterial || R.envMap) {
                const $t = It.map.cameraPosition;
                $t !== void 0 && $t.setValue(B, k.setFromMatrixPosition(w.matrixWorld))
            }(R.isMeshPhongMaterial || R.isMeshToonMaterial || R.isMeshLambertMaterial || R.isMeshBasicMaterial || R.isMeshStandardMaterial || R.isShaderMaterial) && It.setValue(B, "isOrthographic", w.isOrthographicCamera === !0), (R.isMeshPhongMaterial || R.isMeshToonMaterial || R.isMeshLambertMaterial || R.isMeshBasicMaterial || R.isMeshStandardMaterial || R.isShaderMaterial || R.isShadowMaterial || V.isSkinnedMesh) && It.setValue(B, "viewMatrix", w.matrixWorldInverse)
        }
        if (V.isSkinnedMesh) {
            It.setOptional(B, V, "bindMatrix"), It.setOptional(B, V, "bindMatrixInverse");
            const $t = V.skeleton;
            $t && (he.floatVertexTextures ? ($t.boneTexture === null && $t.computeBoneTexture(), It.setValue(B, "boneTexture", $t.boneTexture, Ie), It.setValue(B, "boneTextureSize", $t.boneTextureSize)) : console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))
        }
        const oo = O.morphAttributes;
        if ((oo.position !== void 0 || oo.normal !== void 0 || oo.color !== void 0 && he.isWebGL2 === !0) && Q.update(V, O, xi), (Zs || Pe.receiveShadow !== V.receiveShadow) && (Pe.receiveShadow = V.receiveShadow, It.setValue(B, "receiveShadow", V.receiveShadow)), R.isMeshGouraudMaterial && R.envMap !== null && (yi.envMap.value = Le, yi.flipEnvMap.value = Le.isCubeTexture && Le.isRenderTargetTexture === !1 ? -1 : 1), Zs && (It.setValue(B, "toneMappingExposure", m.toneMappingExposure), Pe.needsLights && If(yi, ao), xe && R.fog === !0 && Qe.refreshFogUniforms(yi, xe), Qe.refreshMaterialUniforms(yi, R, q, P, Y), ba.upload(B, Pe.uniformsList, yi, Ie)), R.isShaderMaterial && R.uniformsNeedUpdate === !0 && (ba.upload(B, Pe.uniformsList, yi, Ie), R.uniformsNeedUpdate = !1), R.isSpriteMaterial && It.setValue(B, "center", V.center), It.setValue(B, "modelViewMatrix", V.modelViewMatrix), It.setValue(B, "normalMatrix", V.normalMatrix), It.setValue(B, "modelMatrix", V.matrixWorld), R.isShaderMaterial || R.isRawShaderMaterial) {
            const $t = R.uniformsGroups;
            for (let lo = 0, Df = $t.length; lo < Df; lo++)
                if (he.isWebGL2) {
                    const Cc = $t[lo];
                    W.update(Cc, xi), W.bind(Cc, xi)
                } else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")
        }
        return xi
    }

    function If(w, N) {
        w.ambientLightColor.needsUpdate = N, w.lightProbe.needsUpdate = N, w.directionalLights.needsUpdate = N, w.directionalLightShadows.needsUpdate = N, w.pointLights.needsUpdate = N, w.pointLightShadows.needsUpdate = N, w.spotLights.needsUpdate = N, w.spotLightShadows.needsUpdate = N, w.rectAreaLights.needsUpdate = N, w.hemisphereLights.needsUpdate = N
    }

    function Rf(w) {
        return w.isMeshLambertMaterial || w.isMeshToonMaterial || w.isMeshPhongMaterial || w.isMeshStandardMaterial || w.isShadowMaterial || w.isShaderMaterial && w.lights === !0
    }
    this.getActiveCubeFace = function() {
        return _
    }, this.getActiveMipmapLevel = function() {
        return E
    }, this.getRenderTarget = function() {
        return y
    }, this.setRenderTargetTextures = function(w, N, O) {
        Ce.get(w.texture).__webglTexture = N, Ce.get(w.depthTexture).__webglTexture = O;
        const R = Ce.get(w);
        R.__hasExternalTextures = !0, R.__hasExternalTextures && (R.__autoAllocateDepthBuffer = O === void 0, R.__autoAllocateDepthBuffer || ae.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), R.__useRenderToTexture = !1))
    }, this.setRenderTargetFramebuffer = function(w, N) {
        const O = Ce.get(w);
        O.__webglFramebuffer = N, O.__useDefaultFramebuffer = N === void 0
    }, this.setRenderTarget = function(w, N = 0, O = 0) {
        y = w, _ = N, E = O;
        let R = !0,
            V = null,
            xe = !1,
            be = !1;
        if (w) {
            const Le = Ce.get(w);
            Le.__useDefaultFramebuffer !== void 0 ? (ue.bindFramebuffer(36160, null), R = !1) : Le.__webglFramebuffer === void 0 ? Ie.setupRenderTarget(w) : Le.__hasExternalTextures && Ie.rebindTextures(w, Ce.get(w.texture).__webglTexture, Ce.get(w.depthTexture).__webglTexture);
            const Oe = w.texture;
            (Oe.isData3DTexture || Oe.isDataArrayTexture || Oe.isCompressedArrayTexture) && (be = !0);
            const Re = Ce.get(w).__webglFramebuffer;
            w.isWebGLCubeRenderTarget ? (V = Re[N], xe = !0) : he.isWebGL2 && w.samples > 0 && Ie.useMultisampledRTT(w) === !1 ? V = Ce.get(w).__webglMultisampledFramebuffer : V = Re, L.copy(w.viewport), I.copy(w.scissor), v = w.scissorTest
        } else L.copy(D).multiplyScalar(q).floor(), I.copy(U).multiplyScalar(q).floor(), v = j;
        if (ue.bindFramebuffer(36160, V) && he.drawBuffers && R && ue.drawBuffers(w, V), ue.viewport(L), ue.scissor(I), ue.setScissorTest(v), xe) {
            const Le = Ce.get(w.texture);
            B.framebufferTexture2D(36160, 36064, 34069 + N, Le.__webglTexture, O)
        } else if (be) {
            const Le = Ce.get(w.texture),
                Oe = N || 0;
            B.framebufferTextureLayer(36160, 36064, Le.__webglTexture, O || 0, Oe)
        }
        S = -1
    }, this.readRenderTargetPixels = function(w, N, O, R, V, xe, be) {
        if (!(w && w.isWebGLRenderTarget)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
            return
        }
        let Ae = Ce.get(w).__webglFramebuffer;
        if (w.isWebGLCubeRenderTarget && be !== void 0 && (Ae = Ae[be]), Ae) {
            ue.bindFramebuffer(36160, Ae);
            try {
                const Le = w.texture,
                    Oe = Le.format,
                    Re = Le.type;
                if (Oe !== rn && _e.convert(Oe) !== B.getParameter(35739)) {
                    console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
                    return
                }
                const De = Re === Er && (ae.has("EXT_color_buffer_half_float") || he.isWebGL2 && ae.has("EXT_color_buffer_float"));
                if (Re !== ki && _e.convert(Re) !== B.getParameter(35738) && !(Re === oi && (he.isWebGL2 || ae.has("OES_texture_float") || ae.has("WEBGL_color_buffer_float"))) && !De) {
                    console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
                    return
                }
                N >= 0 && N <= w.width - R && O >= 0 && O <= w.height - V && B.readPixels(N, O, R, V, _e.convert(Oe), _e.convert(Re), xe)
            } finally {
                const Le = y !== null ? Ce.get(y).__webglFramebuffer : null;
                ue.bindFramebuffer(36160, Le)
            }
        }
    }, this.copyFramebufferToTexture = function(w, N, O = 0) {
        const R = Math.pow(2, -O),
            V = Math.floor(N.image.width * R),
            xe = Math.floor(N.image.height * R);
        Ie.setTexture2D(N, 0), B.copyTexSubImage2D(3553, O, 0, 0, w.x, w.y, V, xe), ue.unbindTexture()
    }, this.copyTextureToTexture = function(w, N, O, R = 0) {
        const V = N.image.width,
            xe = N.image.height,
            be = _e.convert(O.format),
            Ae = _e.convert(O.type);
        Ie.setTexture2D(O, 0), B.pixelStorei(37440, O.flipY), B.pixelStorei(37441, O.premultiplyAlpha), B.pixelStorei(3317, O.unpackAlignment), N.isDataTexture ? B.texSubImage2D(3553, R, w.x, w.y, V, xe, be, Ae, N.image.data) : N.isCompressedTexture ? B.compressedTexSubImage2D(3553, R, w.x, w.y, N.mipmaps[0].width, N.mipmaps[0].height, be, N.mipmaps[0].data) : B.texSubImage2D(3553, R, w.x, w.y, be, Ae, N.image), R === 0 && O.generateMipmaps && B.generateMipmap(3553), ue.unbindTexture()
    }, this.copyTextureToTexture3D = function(w, N, O, R, V = 0) {
        if (m.isWebGL1Renderer) {
            console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");
            return
        }
        const xe = w.max.x - w.min.x + 1,
            be = w.max.y - w.min.y + 1,
            Ae = w.max.z - w.min.z + 1,
            Le = _e.convert(R.format),
            Oe = _e.convert(R.type);
        let Re;
        if (R.isData3DTexture) Ie.setTexture3D(R, 0), Re = 32879;
        else if (R.isDataArrayTexture) Ie.setTexture2DArray(R, 0), Re = 35866;
        else {
            console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
            return
        }
        B.pixelStorei(37440, R.flipY), B.pixelStorei(37441, R.premultiplyAlpha), B.pixelStorei(3317, R.unpackAlignment);
        const De = B.getParameter(3314),
            rt = B.getParameter(32878),
            Yt = B.getParameter(3316),
            Fn = B.getParameter(3315),
            _i = B.getParameter(32877),
            at = O.isCompressedTexture ? O.mipmaps[0] : O.image;
        B.pixelStorei(3314, at.width), B.pixelStorei(32878, at.height), B.pixelStorei(3316, w.min.x), B.pixelStorei(3315, w.min.y), B.pixelStorei(32877, w.min.z), O.isDataTexture || O.isData3DTexture ? B.texSubImage3D(Re, V, N.x, N.y, N.z, xe, be, Ae, Le, Oe, at.data) : O.isCompressedArrayTexture ? (console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."), B.compressedTexSubImage3D(Re, V, N.x, N.y, N.z, xe, be, Ae, Le, at.data)) : B.texSubImage3D(Re, V, N.x, N.y, N.z, xe, be, Ae, Le, Oe, at), B.pixelStorei(3314, De), B.pixelStorei(32878, rt), B.pixelStorei(3316, Yt), B.pixelStorei(3315, Fn), B.pixelStorei(32877, _i), V === 0 && R.generateMipmaps && B.generateMipmap(Re), ue.unbindTexture()
    }, this.initTexture = function(w) {
        w.isCubeTexture ? Ie.setTextureCube(w, 0) : w.isData3DTexture ? Ie.setTexture3D(w, 0) : w.isDataArrayTexture || w.isCompressedArrayTexture ? Ie.setTexture2DArray(w, 0) : Ie.setTexture2D(w, 0), ue.unbindTexture()
    }, this.resetState = function() {
        _ = 0, E = 0, y = null, ue.reset(), re.reset()
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
        detail: this
    }))
}
Object.defineProperties(Jl.prototype, {
    physicallyCorrectLights: {
        get: function() {
            return console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."), !this.useLegacyLights
        },
        set: function(s) {
            console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."), this.useLegacyLights = !s
        }
    }
});
class ly extends Jl {}
ly.prototype.isWebGL1Renderer = !0;
class cy extends Ye {
    constructor() {
        super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    copy(e, t) {
        return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t
    }
    get autoUpdate() {
        return console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."), this.matrixWorldAutoUpdate
    }
    set autoUpdate(e) {
        console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."), this.matrixWorldAutoUpdate = e
    }
}
class ld {
    constructor(e, t) {
        this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = ll, this.updateRange = {
            offset: 0,
            count: -1
        }, this.version = 0, this.uuid = xn()
    }
    onUploadCallback() {}
    set needsUpdate(e) {
        e === !0 && this.version++
    }
    setUsage(e) {
        return this.usage = e, this
    }
    copy(e) {
        return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this
    }
    copyAt(e, t, n) {
        e *= this.stride, n *= t.stride;
        for (let i = 0, r = this.stride; i < r; i++) this.array[e + i] = t.array[n + i];
        return this
    }
    set(e, t = 0) {
        return this.array.set(e, t), this
    }
    clone(e) {
        e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = xn()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
        const t = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),
            n = new this.constructor(t, this.stride);
        return n.setUsage(this.usage), n
    }
    onUpload(e) {
        return this.onUploadCallback = e, this
    }
    toJSON(e) {
        return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = xn()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
            uuid: this.uuid,
            buffer: this.array.buffer._uuid,
            type: this.array.constructor.name,
            stride: this.stride
        }
    }
}
const Dt = new M;
class Ir {
    constructor(e, t, n, i = !1) {
        this.isInterleavedBufferAttribute = !0, this.name = "", this.data = e, this.itemSize = t, this.offset = n, this.normalized = i
    }
    get count() {
        return this.data.count
    }
    get array() {
        return this.data.array
    }
    set needsUpdate(e) {
        this.data.needsUpdate = e
    }
    applyMatrix4(e) {
        for (let t = 0, n = this.data.count; t < n; t++) Dt.fromBufferAttribute(this, t), Dt.applyMatrix4(e), this.setXYZ(t, Dt.x, Dt.y, Dt.z);
        return this
    }
    applyNormalMatrix(e) {
        for (let t = 0, n = this.count; t < n; t++) Dt.fromBufferAttribute(this, t), Dt.applyNormalMatrix(e), this.setXYZ(t, Dt.x, Dt.y, Dt.z);
        return this
    }
    transformDirection(e) {
        for (let t = 0, n = this.count; t < n; t++) Dt.fromBufferAttribute(this, t), Dt.transformDirection(e), this.setXYZ(t, Dt.x, Dt.y, Dt.z);
        return this
    }
    setX(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.data.array[e * this.data.stride + this.offset] = t, this
    }
    setY(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.data.array[e * this.data.stride + this.offset + 1] = t, this
    }
    setZ(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.data.array[e * this.data.stride + this.offset + 2] = t, this
    }
    setW(e, t) {
        return this.normalized && (t = qe(t, this.array)), this.data.array[e * this.data.stride + this.offset + 3] = t, this
    }
    getX(e) {
        let t = this.data.array[e * this.data.stride + this.offset];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    getY(e) {
        let t = this.data.array[e * this.data.stride + this.offset + 1];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    getZ(e) {
        let t = this.data.array[e * this.data.stride + this.offset + 2];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    getW(e) {
        let t = this.data.array[e * this.data.stride + this.offset + 3];
        return this.normalized && (t = Wn(t, this.array)), t
    }
    setXY(e, t, n) {
        return e = e * this.data.stride + this.offset, this.normalized && (t = qe(t, this.array), n = qe(n, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this
    }
    setXYZ(e, t, n, i) {
        return e = e * this.data.stride + this.offset, this.normalized && (t = qe(t, this.array), n = qe(n, this.array), i = qe(i, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this
    }
    setXYZW(e, t, n, i, r) {
        return e = e * this.data.stride + this.offset, this.normalized && (t = qe(t, this.array), n = qe(n, this.array), i = qe(i, this.array), r = qe(r, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this.data.array[e + 3] = r, this
    }
    clone(e) {
        if (e === void 0) {
            console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
            const t = [];
            for (let n = 0; n < this.count; n++) {
                const i = n * this.data.stride + this.offset;
                for (let r = 0; r < this.itemSize; r++) t.push(this.data.array[i + r])
            }
            return new $e(new this.array.constructor(t), this.itemSize, this.normalized)
        } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new Ir(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized)
    }
    toJSON(e) {
        if (e === void 0) {
            console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
            const t = [];
            for (let n = 0; n < this.count; n++) {
                const i = n * this.data.stride + this.offset;
                for (let r = 0; r < this.itemSize; r++) t.push(this.data.array[i + r])
            }
            return {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: t,
                normalized: this.normalized
            }
        } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.toJSON(e)), {
            isInterleavedBufferAttribute: !0,
            itemSize: this.itemSize,
            data: this.data.uuid,
            offset: this.offset,
            normalized: this.normalized
        }
    }
}
class hy extends ln {
    constructor(e) {
        super(), this.isSpriteMaterial = !0, this.type = "SpriteMaterial", this.color = new pe(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = !0, this.transparent = !0, this.fog = !0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.rotation = e.rotation, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this
    }
}
let us;
const rr = new M,
    ds = new M,
    fs = new M,
    ps = new ve,
    ar = new ve,
    cd = new Te,
    fa = new M,
    or = new M,
    pa = new M,
    Vh = new ve,
    zo = new ve,
    Hh = new ve;
class Ql extends Ye {
    constructor(e) {
        if (super(), this.isSprite = !0, this.type = "Sprite", us === void 0) {
            us = new jt;
            const t = new Float32Array([-.5, -.5, 0, 0, 0, .5, -.5, 0, 1, 0, .5, .5, 0, 1, 1, -.5, .5, 0, 0, 1]),
                n = new ld(t, 5);
            us.setIndex([0, 1, 2, 0, 2, 3]), us.setAttribute("position", new Ir(n, 3, 0, !1)), us.setAttribute("uv", new Ir(n, 2, 3, !1))
        }
        this.geometry = us, this.material = e !== void 0 ? e : new hy, this.center = new ve(.5, .5)
    }
    raycast(e, t) {
        e.camera === null && console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'), ds.setFromMatrixScale(this.matrixWorld), cd.copy(e.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse, this.matrixWorld), fs.setFromMatrixPosition(this.modelViewMatrix), e.camera.isPerspectiveCamera && this.material.sizeAttenuation === !1 && ds.multiplyScalar(-fs.z);
        const n = this.material.rotation;
        let i, r;
        n !== 0 && (r = Math.cos(n), i = Math.sin(n));
        const a = this.center;
        ma(fa.set(-.5, -.5, 0), fs, a, ds, i, r), ma(or.set(.5, -.5, 0), fs, a, ds, i, r), ma(pa.set(.5, .5, 0), fs, a, ds, i, r), Vh.set(0, 0), zo.set(1, 0), Hh.set(1, 1);
        let o = e.ray.intersectTriangle(fa, or, pa, !1, rr);
        if (o === null && (ma(or.set(-.5, .5, 0), fs, a, ds, i, r), zo.set(0, 1), o = e.ray.intersectTriangle(fa, pa, or, !1, rr), o === null)) return;
        const l = e.ray.origin.distanceTo(rr);
        l < e.near || l > e.far || t.push({
            distance: l,
            point: rr.clone(),
            uv: An.getUV(rr, fa, or, pa, Vh, zo, Hh, new ve),
            face: null,
            object: this
        })
    }
    copy(e, t) {
        return super.copy(e, t), e.center !== void 0 && this.center.copy(e.center), this.material = e.material, this
    }
}

function ma(s, e, t, n, i, r) {
    ps.subVectors(s, t).addScalar(.5).multiply(n), i !== void 0 ? (ar.x = r * ps.x - i * ps.y, ar.y = i * ps.x + r * ps.y) : ar.copy(ps), s.copy(e), s.x += ar.x, s.y += ar.y, s.applyMatrix4(cd)
}
const Wh = new M,
    Xh = new je,
    qh = new je,
    uy = new M,
    jh = new Te;
class dy extends ct {
    constructor(e, t) {
        super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = "attached", this.bindMatrix = new Te, this.bindMatrixInverse = new Te
    }
    copy(e, t) {
        return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, this
    }
    bind(e, t) {
        this.skeleton = e, t === void 0 && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), t = this.matrixWorld), this.bindMatrix.copy(t), this.bindMatrixInverse.copy(t).invert()
    }
    pose() {
        this.skeleton.pose()
    }
    normalizeSkinWeights() {
        const e = new je,
            t = this.geometry.attributes.skinWeight;
        for (let n = 0, i = t.count; n < i; n++) {
            e.fromBufferAttribute(t, n);
            const r = 1 / e.manhattanLength();
            r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1, 0, 0, 0), t.setXYZW(n, e.x, e.y, e.z, e.w)
        }
    }
    updateMatrixWorld(e) {
        super.updateMatrixWorld(e), this.bindMode === "attached" ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === "detached" ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode)
    }
    boneTransform(e, t) {
        const n = this.skeleton,
            i = this.geometry;
        Xh.fromBufferAttribute(i.attributes.skinIndex, e), qh.fromBufferAttribute(i.attributes.skinWeight, e), Wh.copy(t).applyMatrix4(this.bindMatrix), t.set(0, 0, 0);
        for (let r = 0; r < 4; r++) {
            const a = qh.getComponent(r);
            if (a !== 0) {
                const o = Xh.getComponent(r);
                jh.multiplyMatrices(n.bones[o].matrixWorld, n.boneInverses[o]), t.addScaledVector(uy.copy(Wh).applyMatrix4(jh), a)
            }
        }
        return t.applyMatrix4(this.bindMatrixInverse)
    }
}
class hd extends Ye {
    constructor() {
        super(), this.isBone = !0, this.type = "Bone"
    }
}
class ud extends wt {
    constructor(e = null, t = 1, n = 1, i, r, a, o, l, c = gt, h = gt, u, d) {
        super(null, a, o, l, c, h, i, r, u, d), this.isDataTexture = !0, this.image = {
            data: e,
            width: t,
            height: n
        }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
    }
}
const Yh = new Te,
    fy = new Te;
class ec {
    constructor(e = [], t = []) {
        this.uuid = xn(), this.bones = e.slice(0), this.boneInverses = t, this.boneMatrices = null, this.boneTexture = null, this.boneTextureSize = 0, this.frame = -1, this.init()
    }
    init() {
        const e = this.bones,
            t = this.boneInverses;
        if (this.boneMatrices = new Float32Array(e.length * 16), t.length === 0) this.calculateInverses();
        else if (e.length !== t.length) {
            console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
            for (let n = 0, i = this.bones.length; n < i; n++) this.boneInverses.push(new Te)
        }
    }
    calculateInverses() {
        this.boneInverses.length = 0;
        for (let e = 0, t = this.bones.length; e < t; e++) {
            const n = new Te;
            this.bones[e] && n.copy(this.bones[e].matrixWorld).invert(), this.boneInverses.push(n)
        }
    }
    pose() {
        for (let e = 0, t = this.bones.length; e < t; e++) {
            const n = this.bones[e];
            n && n.matrixWorld.copy(this.boneInverses[e]).invert()
        }
        for (let e = 0, t = this.bones.length; e < t; e++) {
            const n = this.bones[e];
            n && (n.parent && n.parent.isBone ? (n.matrix.copy(n.parent.matrixWorld).invert(), n.matrix.multiply(n.matrixWorld)) : n.matrix.copy(n.matrixWorld), n.matrix.decompose(n.position, n.quaternion, n.scale))
        }
    }
    update() {
        const e = this.bones,
            t = this.boneInverses,
            n = this.boneMatrices,
            i = this.boneTexture;
        for (let r = 0, a = e.length; r < a; r++) {
            const o = e[r] ? e[r].matrixWorld : fy;
            Yh.multiplyMatrices(o, t[r]), Yh.toArray(n, r * 16)
        }
        i !== null && (i.needsUpdate = !0)
    }
    clone() {
        return new ec(this.bones, this.boneInverses)
    }
    computeBoneTexture() {
        let e = Math.sqrt(this.bones.length * 4);
        e = Xu(e), e = Math.max(e, 4);
        const t = new Float32Array(e * e * 4);
        t.set(this.boneMatrices);
        const n = new ud(t, e, e, rn, oi);
        return n.needsUpdate = !0, this.boneMatrices = t, this.boneTexture = n, this.boneTextureSize = e, this
    }
    getBoneByName(e) {
        for (let t = 0, n = this.bones.length; t < n; t++) {
            const i = this.bones[t];
            if (i.name === e) return i
        }
    }
    dispose() {
        this.boneTexture !== null && (this.boneTexture.dispose(), this.boneTexture = null)
    }
    fromJSON(e, t) {
        this.uuid = e.uuid;
        for (let n = 0, i = e.bones.length; n < i; n++) {
            const r = e.bones[n];
            let a = t[r];
            a === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", r), a = new hd), this.bones.push(a), this.boneInverses.push(new Te().fromArray(e.boneInverses[n]))
        }
        return this.init(), this
    }
    toJSON() {
        const e = {
            metadata: {
                version: 4.5,
                type: "Skeleton",
                generator: "Skeleton.toJSON"
            },
            bones: [],
            boneInverses: []
        };
        e.uuid = this.uuid;
        const t = this.bones,
            n = this.boneInverses;
        for (let i = 0, r = t.length; i < r; i++) {
            const a = t[i];
            e.bones.push(a.uuid);
            const o = n[i];
            e.boneInverses.push(o.toArray())
        }
        return e
    }
}
class $h extends $e {
    constructor(e, t, n, i = 1) {
        super(e, t, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = i
    }
    copy(e) {
        return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this
    }
    toJSON() {
        const e = super.toJSON();
        return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e
    }
}
const Kh = new Te,
    Zh = new Te,
    ga = [],
    py = new Te,
    lr = new ct;
class my extends ct {
    constructor(e, t, n) {
        super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new $h(new Float32Array(n * 16), 16), this.instanceColor = null, this.count = n, this.frustumCulled = !1;
        for (let i = 0; i < n; i++) this.setMatrixAt(i, py)
    }
    copy(e, t) {
        return super.copy(e, t), this.instanceMatrix.copy(e.instanceMatrix), e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()), this.count = e.count, this
    }
    getColorAt(e, t) {
        t.fromArray(this.instanceColor.array, e * 3)
    }
    getMatrixAt(e, t) {
        t.fromArray(this.instanceMatrix.array, e * 16)
    }
    raycast(e, t) {
        const n = this.matrixWorld,
            i = this.count;
        if (lr.geometry = this.geometry, lr.material = this.material, lr.material !== void 0)
            for (let r = 0; r < i; r++) {
                this.getMatrixAt(r, Kh), Zh.multiplyMatrices(n, Kh), lr.matrixWorld = Zh, lr.raycast(e, ga);
                for (let a = 0, o = ga.length; a < o; a++) {
                    const l = ga[a];
                    l.instanceId = r, l.object = this, t.push(l)
                }
                ga.length = 0
            }
    }
    setColorAt(e, t) {
        this.instanceColor === null && (this.instanceColor = new $h(new Float32Array(this.instanceMatrix.count * 3), 3)), t.toArray(this.instanceColor.array, e * 3)
    }
    setMatrixAt(e, t) {
        t.toArray(this.instanceMatrix.array, e * 16)
    }
    updateMorphTargets() {}
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
class dd extends ln {
    constructor(e) {
        super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new pe(16777215), this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.color.copy(e.color), this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this
    }
}
const Jh = new M,
    Qh = new M,
    eu = new Te,
    Go = new qa,
    _a = new Ws;
class tc extends Ye {
    constructor(e = new jt, t = new dd) {
        super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = t, this.updateMorphTargets()
    }
    copy(e, t) {
        return super.copy(e, t), this.material = e.material, this.geometry = e.geometry, this
    }
    computeLineDistances() {
        const e = this.geometry;
        if (e.index === null) {
            const t = e.attributes.position,
                n = [0];
            for (let i = 1, r = t.count; i < r; i++) Jh.fromBufferAttribute(t, i - 1), Qh.fromBufferAttribute(t, i), n[i] = n[i - 1], n[i] += Jh.distanceTo(Qh);
            e.setAttribute("lineDistance", new jn(n, 1))
        } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
        return this
    }
    raycast(e, t) {
        const n = this.geometry,
            i = this.matrixWorld,
            r = e.params.Line.threshold,
            a = n.drawRange;
        if (n.boundingSphere === null && n.computeBoundingSphere(), _a.copy(n.boundingSphere), _a.applyMatrix4(i), _a.radius += r, e.ray.intersectsSphere(_a) === !1) return;
        eu.copy(i).invert(), Go.copy(e.ray).applyMatrix4(eu);
        const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
            l = o * o,
            c = new M,
            h = new M,
            u = new M,
            d = new M,
            f = this.isLineSegments ? 2 : 1,
            g = n.index,
            p = n.attributes.position;
        if (g !== null) {
            const _ = Math.max(0, a.start),
                E = Math.min(g.count, a.start + a.count);
            for (let y = _, S = E - 1; y < S; y += f) {
                const T = g.getX(y),
                    L = g.getX(y + 1);
                if (c.fromBufferAttribute(p, T), h.fromBufferAttribute(p, L), Go.distanceSqToSegment(c, h, d, u) > l) continue;
                d.applyMatrix4(this.matrixWorld);
                const v = e.ray.origin.distanceTo(d);
                v < e.near || v > e.far || t.push({
                    distance: v,
                    point: u.clone().applyMatrix4(this.matrixWorld),
                    index: y,
                    face: null,
                    faceIndex: null,
                    object: this
                })
            }
        } else {
            const _ = Math.max(0, a.start),
                E = Math.min(p.count, a.start + a.count);
            for (let y = _, S = E - 1; y < S; y += f) {
                if (c.fromBufferAttribute(p, y), h.fromBufferAttribute(p, y + 1), Go.distanceSqToSegment(c, h, d, u) > l) continue;
                d.applyMatrix4(this.matrixWorld);
                const L = e.ray.origin.distanceTo(d);
                L < e.near || L > e.far || t.push({
                    distance: L,
                    point: u.clone().applyMatrix4(this.matrixWorld),
                    index: y,
                    face: null,
                    faceIndex: null,
                    object: this
                })
            }
        }
    }
    updateMorphTargets() {
        const t = this.geometry.morphAttributes,
            n = Object.keys(t);
        if (n.length > 0) {
            const i = t[n[0]];
            if (i !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let r = 0, a = i.length; r < a; r++) {
                    const o = i[r].name || String(r);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
                }
            }
        }
    }
}
const tu = new M,
    nu = new M;
class gy extends tc {
    constructor(e, t) {
        super(e, t), this.isLineSegments = !0, this.type = "LineSegments"
    }
    computeLineDistances() {
        const e = this.geometry;
        if (e.index === null) {
            const t = e.attributes.position,
                n = [];
            for (let i = 0, r = t.count; i < r; i += 2) tu.fromBufferAttribute(t, i), nu.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + tu.distanceTo(nu);
            e.setAttribute("lineDistance", new jn(n, 1))
        } else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
        return this
    }
}
class _y extends tc {
    constructor(e, t) {
        super(e, t), this.isLineLoop = !0, this.type = "LineLoop"
    }
}
class nc extends ln {
    constructor(e) {
        super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new pe(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this
    }
}
const iu = new Te,
    dl = new qa,
    xa = new Ws,
    ya = new M;
class $a extends Ye {
    constructor(e = new jt, t = new nc) {
        super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.updateMorphTargets()
    }
    copy(e, t) {
        return super.copy(e, t), this.material = e.material, this.geometry = e.geometry, this
    }
    raycast(e, t) {
        const n = this.geometry,
            i = this.matrixWorld,
            r = e.params.Points.threshold,
            a = n.drawRange;
        if (n.boundingSphere === null && n.computeBoundingSphere(), xa.copy(n.boundingSphere), xa.applyMatrix4(i), xa.radius += r, e.ray.intersectsSphere(xa) === !1) return;
        iu.copy(i).invert(), dl.copy(e.ray).applyMatrix4(iu);
        const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
            l = o * o,
            c = n.index,
            u = n.attributes.position;
        if (c !== null) {
            const d = Math.max(0, a.start),
                f = Math.min(c.count, a.start + a.count);
            for (let g = d, m = f; g < m; g++) {
                const p = c.getX(g);
                ya.fromBufferAttribute(u, p), su(ya, p, l, i, e, t, this)
            }
        } else {
            const d = Math.max(0, a.start),
                f = Math.min(u.count, a.start + a.count);
            for (let g = d, m = f; g < m; g++) ya.fromBufferAttribute(u, g), su(ya, g, l, i, e, t, this)
        }
    }
    updateMorphTargets() {
        const t = this.geometry.morphAttributes,
            n = Object.keys(t);
        if (n.length > 0) {
            const i = t[n[0]];
            if (i !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let r = 0, a = i.length; r < a; r++) {
                    const o = i[r].name || String(r);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
                }
            }
        }
    }
}

function su(s, e, t, n, i, r, a) {
    const o = dl.distanceSqToPoint(s);
    if (o < t) {
        const l = new M;
        dl.closestPointToPoint(s, l), l.applyMatrix4(n);
        const c = i.ray.origin.distanceTo(l);
        if (c < i.near || c > i.far) return;
        r.push({
            distance: c,
            distanceToRay: Math.sqrt(o),
            point: l,
            index: e,
            face: null,
            object: a
        })
    }
}
class xy {
    constructor() {
        this.type = "Curve", this.arcLengthDivisions = 200
    }
    getPoint() {
        return console.warn("THREE.Curve: .getPoint() not implemented."), null
    }
    getPointAt(e, t) {
        const n = this.getUtoTmapping(e);
        return this.getPoint(n, t)
    }
    getPoints(e = 5) {
        const t = [];
        for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
        return t
    }
    getSpacedPoints(e = 5) {
        const t = [];
        for (let n = 0; n <= e; n++) t.push(this.getPointAt(n / e));
        return t
    }
    getLength() {
        const e = this.getLengths();
        return e[e.length - 1]
    }
    getLengths(e = this.arcLengthDivisions) {
        if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths;
        this.needsUpdate = !1;
        const t = [];
        let n, i = this.getPoint(0),
            r = 0;
        t.push(0);
        for (let a = 1; a <= e; a++) n = this.getPoint(a / e), r += n.distanceTo(i), t.push(r), i = n;
        return this.cacheArcLengths = t, t
    }
    updateArcLengths() {
        this.needsUpdate = !0, this.getLengths()
    }
    getUtoTmapping(e, t) {
        const n = this.getLengths();
        let i = 0;
        const r = n.length;
        let a;
        t ? a = t : a = e * n[r - 1];
        let o = 0,
            l = r - 1,
            c;
        for (; o <= l;)
            if (i = Math.floor(o + (l - o) / 2), c = n[i] - a, c < 0) o = i + 1;
            else if (c > 0) l = i - 1;
        else {
            l = i;
            break
        }
        if (i = l, n[i] === a) return i / (r - 1);
        const h = n[i],
            d = n[i + 1] - h,
            f = (a - h) / d;
        return (i + f) / (r - 1)
    }
    getTangent(e, t) {
        let i = e - 1e-4,
            r = e + 1e-4;
        i < 0 && (i = 0), r > 1 && (r = 1);
        const a = this.getPoint(i),
            o = this.getPoint(r),
            l = t || (a.isVector2 ? new ve : new M);
        return l.copy(o).sub(a).normalize(), l
    }
    getTangentAt(e, t) {
        const n = this.getUtoTmapping(e);
        return this.getTangent(n, t)
    }
    computeFrenetFrames(e, t) {
        const n = new M,
            i = [],
            r = [],
            a = [],
            o = new M,
            l = new Te;
        for (let f = 0; f <= e; f++) {
            const g = f / e;
            i[f] = this.getTangentAt(g, new M)
        }
        r[0] = new M, a[0] = new M;
        let c = Number.MAX_VALUE;
        const h = Math.abs(i[0].x),
            u = Math.abs(i[0].y),
            d = Math.abs(i[0].z);
        h <= c && (c = h, n.set(1, 0, 0)), u <= c && (c = u, n.set(0, 1, 0)), d <= c && n.set(0, 0, 1), o.crossVectors(i[0], n).normalize(), r[0].crossVectors(i[0], o), a[0].crossVectors(i[0], r[0]);
        for (let f = 1; f <= e; f++) {
            if (r[f] = r[f - 1].clone(), a[f] = a[f - 1].clone(), o.crossVectors(i[f - 1], i[f]), o.length() > Number.EPSILON) {
                o.normalize();
                const g = Math.acos(St(i[f - 1].dot(i[f]), -1, 1));
                r[f].applyMatrix4(l.makeRotationAxis(o, g))
            }
            a[f].crossVectors(i[f], r[f])
        }
        if (t === !0) {
            let f = Math.acos(St(r[0].dot(r[e]), -1, 1));
            f /= e, i[0].dot(o.crossVectors(r[0], r[e])) > 0 && (f = -f);
            for (let g = 1; g <= e; g++) r[g].applyMatrix4(l.makeRotationAxis(i[g], f * g)), a[g].crossVectors(i[g], r[g])
        }
        return {
            tangents: i,
            normals: r,
            binormals: a
        }
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        return this.arcLengthDivisions = e.arcLengthDivisions, this
    }
    toJSON() {
        const e = {
            metadata: {
                version: 4.5,
                type: "Curve",
                generator: "Curve.toJSON"
            }
        };
        return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e
    }
    fromJSON(e) {
        return this.arcLengthDivisions = e.arcLengthDivisions, this
    }
}

function ic() {
    let s = 0,
        e = 0,
        t = 0,
        n = 0;

    function i(r, a, o, l) {
        s = r, e = o, t = -3 * r + 3 * a - 2 * o - l, n = 2 * r - 2 * a + o + l
    }
    return {
        initCatmullRom: function(r, a, o, l, c) {
            i(a, o, c * (o - r), c * (l - a))
        },
        initNonuniformCatmullRom: function(r, a, o, l, c, h, u) {
            let d = (a - r) / c - (o - r) / (c + h) + (o - a) / h,
                f = (o - a) / h - (l - a) / (h + u) + (l - o) / u;
            d *= h, f *= h, i(a, o, d, f)
        },
        calc: function(r) {
            const a = r * r,
                o = a * r;
            return s + e * r + t * a + n * o
        }
    }
}
const va = new M,
    Vo = new ic,
    Ho = new ic,
    Wo = new ic;
class yy extends xy {
    constructor(e = [], t = !1, n = "centripetal", i = .5) {
        super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = n, this.tension = i
    }
    getPoint(e, t = new M) {
        const n = t,
            i = this.points,
            r = i.length,
            a = (r - (this.closed ? 0 : 1)) * e;
        let o = Math.floor(a),
            l = a - o;
        this.closed ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / r) + 1) * r : l === 0 && o === r - 1 && (o = r - 2, l = 1);
        let c, h;
        this.closed || o > 0 ? c = i[(o - 1) % r] : (va.subVectors(i[0], i[1]).add(i[0]), c = va);
        const u = i[o % r],
            d = i[(o + 1) % r];
        if (this.closed || o + 2 < r ? h = i[(o + 2) % r] : (va.subVectors(i[r - 1], i[r - 2]).add(i[r - 1]), h = va), this.curveType === "centripetal" || this.curveType === "chordal") {
            const f = this.curveType === "chordal" ? .5 : .25;
            let g = Math.pow(c.distanceToSquared(u), f),
                m = Math.pow(u.distanceToSquared(d), f),
                p = Math.pow(d.distanceToSquared(h), f);
            m < 1e-4 && (m = 1), g < 1e-4 && (g = m), p < 1e-4 && (p = m), Vo.initNonuniformCatmullRom(c.x, u.x, d.x, h.x, g, m, p), Ho.initNonuniformCatmullRom(c.y, u.y, d.y, h.y, g, m, p), Wo.initNonuniformCatmullRom(c.z, u.z, d.z, h.z, g, m, p)
        } else this.curveType === "catmullrom" && (Vo.initCatmullRom(c.x, u.x, d.x, h.x, this.tension), Ho.initCatmullRom(c.y, u.y, d.y, h.y, this.tension), Wo.initCatmullRom(c.z, u.z, d.z, h.z, this.tension));
        return n.set(Vo.calc(l), Ho.calc(l), Wo.calc(l)), n
    }
    copy(e) {
        super.copy(e), this.points = [];
        for (let t = 0, n = e.points.length; t < n; t++) {
            const i = e.points[t];
            this.points.push(i.clone())
        }
        return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this
    }
    toJSON() {
        const e = super.toJSON();
        e.points = [];
        for (let t = 0, n = this.points.length; t < n; t++) {
            const i = this.points[t];
            e.points.push(i.toArray())
        }
        return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e
    }
    fromJSON(e) {
        super.fromJSON(e), this.points = [];
        for (let t = 0, n = e.points.length; t < n; t++) {
            const i = e.points[t];
            this.points.push(new M().fromArray(i))
        }
        return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this
    }
}
class qs extends ln {
    constructor(e) {
        super(), this.isMeshStandardMaterial = !0, this.defines = {
            STANDARD: ""
        }, this.type = "MeshStandardMaterial", this.color = new pe(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new pe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = ql, this.normalScale = new ve(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.defines = {
            STANDARD: ""
        }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this
    }
}
class $i extends qs {
    constructor(e) {
        super(), this.isMeshPhysicalMaterial = !0, this.defines = {
            STANDARD: "",
            PHYSICAL: ""
        }, this.type = "MeshPhysicalMaterial", this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new ve(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
            get: function() {
                return St(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1)
            },
            set: function(t) {
                this.ior = (1 + .4 * t) / (1 - .4 * t)
            }
        }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new pe(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new pe(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new pe(1, 1, 1), this.specularColorMap = null, this._sheen = 0, this._clearcoat = 0, this._iridescence = 0, this._transmission = 0, this.setValues(e)
    }
    get sheen() {
        return this._sheen
    }
    set sheen(e) {
        this._sheen > 0 != e > 0 && this.version++, this._sheen = e
    }
    get clearcoat() {
        return this._clearcoat
    }
    set clearcoat(e) {
        this._clearcoat > 0 != e > 0 && this.version++, this._clearcoat = e
    }
    get iridescence() {
        return this._iridescence
    }
    set iridescence(e) {
        this._iridescence > 0 != e > 0 && this.version++, this._iridescence = e
    }
    get transmission() {
        return this._transmission
    }
    set transmission(e) {
        this._transmission > 0 != e > 0 && this.version++, this._transmission = e
    }
    copy(e) {
        return super.copy(e), this.defines = {
            STANDARD: "",
            PHYSICAL: ""
        }, this.clearcoat = e.clearcoat, this.clearcoatMap = e.clearcoatMap, this.clearcoatRoughness = e.clearcoatRoughness, this.clearcoatRoughnessMap = e.clearcoatRoughnessMap, this.clearcoatNormalMap = e.clearcoatNormalMap, this.clearcoatNormalScale.copy(e.clearcoatNormalScale), this.ior = e.ior, this.iridescence = e.iridescence, this.iridescenceMap = e.iridescenceMap, this.iridescenceIOR = e.iridescenceIOR, this.iridescenceThicknessRange = [...e.iridescenceThicknessRange], this.iridescenceThicknessMap = e.iridescenceThicknessMap, this.sheen = e.sheen, this.sheenColor.copy(e.sheenColor), this.sheenColorMap = e.sheenColorMap, this.sheenRoughness = e.sheenRoughness, this.sheenRoughnessMap = e.sheenRoughnessMap, this.transmission = e.transmission, this.transmissionMap = e.transmissionMap, this.thickness = e.thickness, this.thicknessMap = e.thicknessMap, this.attenuationDistance = e.attenuationDistance, this.attenuationColor.copy(e.attenuationColor), this.specularIntensity = e.specularIntensity, this.specularIntensityMap = e.specularIntensityMap, this.specularColor.copy(e.specularColor), this.specularColorMap = e.specularColorMap, this
    }
}
class sc extends ln {
    constructor(e) {
        super(), this.isMeshToonMaterial = !0, this.defines = {
            TOON: ""
        }, this.type = "MeshToonMaterial", this.color = new pe(16777215), this.map = null, this.gradientMap = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new pe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = ql, this.normalScale = new ve(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.alphaMap = null, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.color.copy(e.color), this.map = e.map, this.gradientMap = e.gradientMap, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.alphaMap = e.alphaMap, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this
    }
}

function ti(s, e, t) {
    return fd(s) ? new s.constructor(s.subarray(e, t !== void 0 ? t : s.length)) : s.slice(e, t)
}

function Sa(s, e, t) {
    return !s || !t && s.constructor === e ? s : typeof e.BYTES_PER_ELEMENT == "number" ? new e(s) : Array.prototype.slice.call(s)
}

function fd(s) {
    return ArrayBuffer.isView(s) && !(s instanceof DataView)
}

function vy(s) {
    function e(i, r) {
        return s[i] - s[r]
    }
    const t = s.length,
        n = new Array(t);
    for (let i = 0; i !== t; ++i) n[i] = i;
    return n.sort(e), n
}

function ru(s, e, t) {
    const n = s.length,
        i = new s.constructor(n);
    for (let r = 0, a = 0; a !== n; ++r) {
        const o = t[r] * e;
        for (let l = 0; l !== e; ++l) i[a++] = s[o + l]
    }
    return i
}

function pd(s, e, t, n) {
    let i = 1,
        r = s[0];
    for (; r !== void 0 && r[n] === void 0;) r = s[i++];
    if (r === void 0) return;
    let a = r[n];
    if (a !== void 0)
        if (Array.isArray(a))
            do a = r[n], a !== void 0 && (e.push(r.time), t.push.apply(t, a)), r = s[i++]; while (r !== void 0);
        else if (a.toArray !== void 0)
        do a = r[n], a !== void 0 && (e.push(r.time), a.toArray(t, t.length)), r = s[i++]; while (r !== void 0);
    else
        do a = r[n], a !== void 0 && (e.push(r.time), t.push(a)), r = s[i++]; while (r !== void 0)
}
class Hr {
    constructor(e, t, n, i) {
        this.parameterPositions = e,
         this._cachedIndex = 0,
         this.resultBuffer = i !== void 0 ? i : new t.constructor(n),
         this.sampleValues = t,
         this.valueSize = n,
         this.settings = null,
         this.DefaultSettings_ = {}
    }
    evaluate(e) {
        const t = this.parameterPositions;
        let n = this._cachedIndex,
        
            i = t[n],
            
            r = t[n - 1];
        e: {
            t: {
                let a;n: {
                    i: if (!(e < i)) {
                        for (let o = n + 2;;) {
                            if (i === void 0) {
                                if (e < r) break i;
                                return n = t.length,
                                 this._cachedIndex = n,
                                 this.copySampleValue_(n - 1)
                            }
                            if (n === o) break;
                            if (r = i, i = t[++n], e < i) break t
                        }
                        a = t.length;
                        break n
                    }if (!(e >= r)) {
                        const o = t[1];
                        e < o && (n = 2, r = o);
                        for (let l = n - 2;;) {
                            if (r === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
                            if (n === l) break;
                            if (i = r, r = t[--n - 1], e >= r) break t
                        }
                        a = n, n = 0;
                        break n
                    }
                    break e
                }
                for (; n < a;) {
                    const o = n + a >>> 1;
                    e < t[o] ? a = o : n = o + 1
                }
                if (i = t[n], r = t[n - 1], r === void 0) return this._cachedIndex = 0,
                this.copySampleValue_(0);
                if (i === void 0) return n = t.length,
                this._cachedIndex = n,
                this.copySampleValue_(n - 1)
            }
            this._cachedIndex = n,
            this.intervalChanged_(n, r, i)
        }
        return this.interpolate_(n, r, e, i)
    }
    getSettings_() {
        return this.settings || this.DefaultSettings_
    }
    copySampleValue_(e) {
        const t = this.resultBuffer,
            n = this.sampleValues,
            i = this.valueSize,
            r = e * i;
        for (let a = 0; a !== i; ++a) t[a] = n[r + a];
        return t
    }
    interpolate_() {
        throw new Error("call to abstract method")
    }
    intervalChanged_() {}
}
class Sy extends Hr {
    constructor(e, t, n, i) {
        super(e, t, n, i), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
            endingStart: vs,
            endingEnd: vs
        }
    }
    intervalChanged_(e, t, n) {
        const i = this.parameterPositions;
        let r = e - 2,
            a = e + 1,
            o = i[r],
            l = i[a];
        if (o === void 0) switch (this.getSettings_().endingStart) {
            case Ss:
                r = e, o = 2 * t - n;
                break;
            case Pa:
                r = i.length - 2, o = t + i[r] - i[r + 1];
                break;
            default:
                r = e, o = n
        }
        if (l === void 0) switch (this.getSettings_().endingEnd) {
            case Ss:
                a = e, l = 2 * n - t;
                break;
            case Pa:
                a = 1, l = n + i[1] - i[0];
                break;
            default:
                a = e - 1, l = t
        }
        const c = (n - t) * .5,
            h = this.valueSize;
        this._weightPrev = c / (t - o), this._weightNext = c / (l - n), this._offsetPrev = r * h, this._offsetNext = a * h
    }
    interpolate_(e, t, n, i) {
        const r = this.resultBuffer,
            a = this.sampleValues,
            o = this.valueSize,
            l = e * o,
            c = l - o,
            h = this._offsetPrev,
            u = this._offsetNext,
            d = this._weightPrev,
            f = this._weightNext,
            g = (n - t) / (i - t),
            m = g * g,
            p = m * g,
            _ = -d * p + 2 * d * m - d * g,
            E = (1 + d) * p + (-1.5 - 2 * d) * m + (-.5 + d) * g + 1,
            y = (-1 - f) * p + (1.5 + f) * m + .5 * g,
            S = f * p - f * m;
        for (let T = 0; T !== o; ++T) r[T] = _ * a[h + T] + E * a[c + T] + y * a[l + T] + S * a[u + T];
        return r
    }
}
class md extends Hr {
    constructor(e, t, n, i) {
        super(e, t, n, i)
    }
    interpolate_(e, t, n, i) {
        const r = this.resultBuffer,
            a = this.sampleValues,
            o = this.valueSize,
            l = e * o,
            c = l - o,
            h = (n - t) / (i - t),
            u = 1 - h;
        for (let d = 0; d !== o; ++d) r[d] = a[c + d] * u + a[l + d] * h;
        return r
    }
}
class wy extends Hr {
    constructor(e, t, n, i) {
        super(e, t, n, i)
    }
    interpolate_(e) {
        return this.copySampleValue_(e - 1)
    }
}
class Bn {
    constructor(e, t, n, i) {
        if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
        if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
        this.name = e, this.times = Sa(t, this.TimeBufferType), this.values = Sa(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation)
    }
    static toJSON(e) {
        const t = e.constructor;
        let n;
        if (t.toJSON !== this.toJSON) n = t.toJSON(e);
        else {
            n = {
                name: e.name,
                times: Sa(e.times, Array),
                values: Sa(e.values, Array)
            };
            const i = e.getInterpolation();
            i !== e.DefaultInterpolation && (n.interpolation = i)
        }
        return n.type = e.ValueTypeName, n
    }
    InterpolantFactoryMethodDiscrete(e) {
        return new wy(this.times, this.values, this.getValueSize(), e)
    }
    InterpolantFactoryMethodLinear(e) {
        return new md(this.times, this.values, this.getValueSize(), e)
    }
    InterpolantFactoryMethodSmooth(e) {
        return new Sy(this.times, this.values, this.getValueSize(), e)
    }
    setInterpolation(e) {
        let t;
        switch (e) {
            case Tr:
                t = this.InterpolantFactoryMethodDiscrete;
                break;
            case Os:
                t = this.InterpolantFactoryMethodLinear;
                break;
            case mo:
                t = this.InterpolantFactoryMethodSmooth;
                break
        }
        if (t === void 0) {
            const n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
            if (this.createInterpolant === void 0)
                if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
                else throw new Error(n);
            return console.warn("THREE.KeyframeTrack:", n), this
        }
        return this.createInterpolant = t, this
    }
    getInterpolation() {
        switch (this.createInterpolant) {
            case this.InterpolantFactoryMethodDiscrete:
                return Tr;
            case this.InterpolantFactoryMethodLinear:
                return Os;
            case this.InterpolantFactoryMethodSmooth:
                return mo
        }
    }
    getValueSize() {
        return this.values.length / this.times.length
    }
    shift(e) {
        if (e !== 0) {
            const t = this.times;
            for (let n = 0, i = t.length; n !== i; ++n) t[n] += e
        }
        return this
    }
    scale(e) {
        if (e !== 1) {
            const t = this.times;
            for (let n = 0, i = t.length; n !== i; ++n) t[n] *= e
        }
        return this
    }
    trim(e, t) {
        const n = this.times,
            i = n.length;
        let r = 0,
            a = i - 1;
        for (; r !== i && n[r] < e;) ++r;
        for (; a !== -1 && n[a] > t;) --a;
        if (++a, r !== 0 || a !== i) {
            r >= a && (a = Math.max(a, 1), r = a - 1);
            const o = this.getValueSize();
            this.times = ti(n, r, a), this.values = ti(this.values, r * o, a * o)
        }
        return this
    }
    validate() {
        let e = !0;
        const t = this.getValueSize();
        t - Math.floor(t) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), e = !1);
        const n = this.times,
            i = this.values,
            r = n.length;
        r === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), e = !1);
        let a = null;
        for (let o = 0; o !== r; o++) {
            const l = n[o];
            if (typeof l == "number" && isNaN(l)) {
                console.error("THREE.KeyframeTrack: Time is not a valid number.", this, o, l), e = !1;
                break
            }
            if (a !== null && a > l) {
                console.error("THREE.KeyframeTrack: Out of order keys.", this, o, l, a), e = !1;
                break
            }
            a = l
        }
        if (i !== void 0 && fd(i))
            for (let o = 0, l = i.length; o !== l; ++o) {
                const c = i[o];
                if (isNaN(c)) {
                    console.error("THREE.KeyframeTrack: Value is not a valid number.", this, o, c), e = !1;
                    break
                }
            }
        return e
    }
    optimize() {
        const e = ti(this.times),
            t = ti(this.values),
            n = this.getValueSize(),
            i = this.getInterpolation() === mo,
            r = e.length - 1;
        let a = 1;
        for (let o = 1; o < r; ++o) {
            let l = !1;
            const c = e[o],
                h = e[o + 1];
            if (c !== h && (o !== 1 || c !== e[0]))
                if (i) l = !0;
                else {
                    const u = o * n,
                        d = u - n,
                        f = u + n;
                    for (let g = 0; g !== n; ++g) {
                        const m = t[u + g];
                        if (m !== t[d + g] || m !== t[f + g]) {
                            l = !0;
                            break
                        }
                    }
                } if (l) {
                if (o !== a) {
                    e[a] = e[o];
                    const u = o * n,
                        d = a * n;
                    for (let f = 0; f !== n; ++f) t[d + f] = t[u + f]
                }++a
            }
        }
        if (r > 0) {
            e[a] = e[r];
            for (let o = r * n, l = a * n, c = 0; c !== n; ++c) t[l + c] = t[o + c];
            ++a
        }
        return a !== e.length ? (this.times = ti(e, 0, a), this.values = ti(t, 0, a * n)) : (this.times = e, this.values = t), this
    }
    clone() {
        const e = ti(this.times, 0),
            t = ti(this.values, 0),
            n = this.constructor,
            i = new n(this.name, e, t);
        return i.createInterpolant = this.createInterpolant, i
    }
}
Bn.prototype.TimeBufferType = Float32Array;
Bn.prototype.ValueBufferType = Float32Array;
Bn.prototype.DefaultInterpolation = Os;
class js extends Bn {}
js.prototype.ValueTypeName = "bool";
js.prototype.ValueBufferType = Array;
js.prototype.DefaultInterpolation = Tr;
js.prototype.InterpolantFactoryMethodLinear = void 0;
js.prototype.InterpolantFactoryMethodSmooth = void 0;
class gd extends Bn {}
gd.prototype.ValueTypeName = "color";
class Rr extends Bn {}
Rr.prototype.ValueTypeName = "number";
class My extends Hr {
    constructor(e, t, n, i) {
        super(e, t, n, i)
    }
    interpolate_(e, t, n, i) {
        const r = this.resultBuffer,
            a = this.sampleValues,
            o = this.valueSize,
            l = (n - t) / (i - t);
        let c = e * o;
        for (let h = c + o; c !== h; c += 4) Wt.slerpFlat(r, 0, a, c - o, a, c, l);
        return r
    }
}
class zi extends Bn {
    InterpolantFactoryMethodLinear(e) {
        return new My(this.times, this.values, this.getValueSize(), e)
    }
}
zi.prototype.ValueTypeName = "quaternion";
zi.prototype.DefaultInterpolation = Os;
zi.prototype.InterpolantFactoryMethodSmooth = void 0;
class Ys extends Bn {}
Ys.prototype.ValueTypeName = "string";
Ys.prototype.ValueBufferType = Array;
Ys.prototype.DefaultInterpolation = Tr;
Ys.prototype.InterpolantFactoryMethodLinear = void 0;
Ys.prototype.InterpolantFactoryMethodSmooth = void 0;
class Dr extends Bn {}
Dr.prototype.ValueTypeName = "vector";
class fl {
    constructor(e, t = -1, n, i = Xl) {
        this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = xn(), this.duration < 0 && this.resetDuration()
    }
    static parse(e) {
        const t = [],
            n = e.tracks,
            i = 1 / (e.fps || 1);
        for (let a = 0, o = n.length; a !== o; ++a) t.push(Ey(n[a]).scale(i));
        const r = new this(e.name, e.duration, t, e.blendMode);
        return r.uuid = e.uuid, r
    }
    static toJSON(e) {
        const t = [],
            n = e.tracks,
            i = {
                name: e.name,
                duration: e.duration,
                tracks: t,
                uuid: e.uuid,
                blendMode: e.blendMode
            };
        for (let r = 0, a = n.length; r !== a; ++r) t.push(Bn.toJSON(n[r]));
        return i
    }
    static CreateFromMorphTargetSequence(e, t, n, i) {
        const r = t.length,
            a = [];
        for (let o = 0; o < r; o++) {
            let l = [],
                c = [];
            l.push((o + r - 1) % r, o, (o + 1) % r), c.push(0, 1, 0);
            const h = vy(l);
            l = ru(l, 1, h), c = ru(c, 1, h), !i && l[0] === 0 && (l.push(r), c.push(c[0])), a.push(new Rr(".morphTargetInfluences[" + t[o].name + "]", l, c).scale(1 / n))
        }
        return new this(e, -1, a)
    }
    static findByName(e, t) {
        let n = e;
        if (!Array.isArray(e)) {
            const i = e;
            n = i.geometry && i.geometry.animations || i.animations
        }
        for (let i = 0; i < n.length; i++)
            if (n[i].name === t) return n[i];
        return null
    }
    static CreateClipsFromMorphTargetSequences(e, t, n) {
        const i = {},
            r = /^([\w-]*?)([\d]+)$/;
        for (let o = 0, l = e.length; o < l; o++) {
            const c = e[o],
                h = c.name.match(r);
            if (h && h.length > 1) {
                const u = h[1];
                let d = i[u];
                d || (i[u] = d = []), d.push(c)
            }
        }
        const a = [];
        for (const o in i) a.push(this.CreateFromMorphTargetSequence(o, i[o], t, n));
        return a
    }
    static parseAnimation(e, t) {
        if (!e) return console.error("THREE.AnimationClip: No animation in JSONLoader data."), null;
        const n = function(u, d, f, g, m) {
                if (f.length !== 0) {
                    const p = [],
                        _ = [];
                    pd(f, p, _, g), p.length !== 0 && m.push(new u(d, p, _))
                }
            },
            i = [],
            r = e.name || "default",
            a = e.fps || 30,
            o = e.blendMode;
        let l = e.length || -1;
        const c = e.hierarchy || [];
        for (let u = 0; u < c.length; u++) {
            const d = c[u].keys;
            if (!(!d || d.length === 0))
                if (d[0].morphTargets) {
                    const f = {};
                    let g;
                    for (g = 0; g < d.length; g++)
                        if (d[g].morphTargets)
                            for (let m = 0; m < d[g].morphTargets.length; m++) f[d[g].morphTargets[m]] = -1;
                    for (const m in f) {
                        const p = [],
                            _ = [];
                        for (let E = 0; E !== d[g].morphTargets.length; ++E) {
                            const y = d[g];
                            p.push(y.time), _.push(y.morphTarget === m ? 1 : 0)
                        }
                        i.push(new Rr(".morphTargetInfluence[" + m + "]", p, _))
                    }
                    l = f.length * a
                } else {
                    const f = ".bones[" + t[u].name + "]";
                    n(Dr, f + ".position", d, "pos", i), n(zi, f + ".quaternion", d, "rot", i), n(Dr, f + ".scale", d, "scl", i)
                }
        }
        return i.length === 0 ? null : new this(r, l, i, o)
    }
    resetDuration() {
        const e = this.tracks;
        let t = 0;
        for (let n = 0, i = e.length; n !== i; ++n) {
            const r = this.tracks[n];
            t = Math.max(t, r.times[r.times.length - 1])
        }
        return this.duration = t, this
    }
    trim() {
        for (let e = 0; e < this.tracks.length; e++) this.tracks[e].trim(0, this.duration);
        return this
    }
    validate() {
        let e = !0;
        for (let t = 0; t < this.tracks.length; t++) e = e && this.tracks[t].validate();
        return e
    }
    optimize() {
        for (let e = 0; e < this.tracks.length; e++) this.tracks[e].optimize();
        return this
    }
    clone() {
        const e = [];
        for (let t = 0; t < this.tracks.length; t++) e.push(this.tracks[t].clone());
        return new this.constructor(this.name, this.duration, e, this.blendMode)
    }
    toJSON() {
        return this.constructor.toJSON(this)
    }
}

function by(s) {
    switch (s.toLowerCase()) {
        case "scalar":
        case "double":
        case "float":
        case "number":
        case "integer":
            return Rr;
        case "vector":
        case "vector2":
        case "vector3":
        case "vector4":
            return Dr;
        case "color":
            return gd;
        case "quaternion":
            return zi;
        case "bool":
        case "boolean":
            return js;
        case "string":
            return Ys
    }
    throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + s)
}

function Ey(s) {
    if (s.type === void 0) throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
    const e = by(s.type);
    if (s.times === void 0) {
        const t = [],
            n = [];
        pd(s.keys, t, n, "value"), s.times = t, s.values = n
    }
    return e.parse !== void 0 ? e.parse(s) : new e(s.name, s.times, s.values, s.interpolation)
}
const zs = {
    enabled: !1,
    files: {},
    add: function(s, e) {
        this.enabled !== !1 && (this.files[s] = e)
    },
    get: function(s) {
        if (this.enabled !== !1) return this.files[s]
    },
    remove: function(s) {
        delete this.files[s]
    },
    clear: function() {
        this.files = {}
    }
};
class Ty {
    constructor(e, t, n) {
        const i = this;
        let r = !1,
            a = 0,
            o = 0,
            l;
        const c = [];
        this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this.itemStart = function(h) {
            o++, r === !1 && i.onStart !== void 0 && i.onStart(h, a, o), r = !0
        }, this.itemEnd = function(h) {
            a++, i.onProgress !== void 0 && i.onProgress(h, a, o), a === o && (r = !1, i.onLoad !== void 0 && i.onLoad())
        }, this.itemError = function(h) {
            i.onError !== void 0 && i.onError(h)
        }, this.resolveURL = function(h) {
            return l ? l(h) : h
        }, this.setURLModifier = function(h) {
            return l = h, this
        }, this.addHandler = function(h, u) {
            return c.push(h, u), this
        }, this.removeHandler = function(h) {
            const u = c.indexOf(h);
            return u !== -1 && c.splice(u, 2), this
        }, this.getHandler = function(h) {
            for (let u = 0, d = c.length; u < d; u += 2) {
                const f = c[u],
                    g = c[u + 1];
                if (f.global && (f.lastIndex = 0), f.test(h)) return g
            }
            return null
        }
    }
}
const Ay = new Ty;
class $s {
    constructor(e) {
        this.manager = e !== void 0 ? e : Ay, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {}
    }
    load() {}
    loadAsync(e, t) {
        const n = this;
        return new Promise(function(i, r) {
            n.load(e, i, t, r)
        })
    }
    parse() {}
    setCrossOrigin(e) {
        return this.crossOrigin = e, this
    }
    setWithCredentials(e) {
        return this.withCredentials = e, this
    }
    setPath(e) {
        return this.path = e, this
    }
    setResourcePath(e) {
        return this.resourcePath = e, this
    }
    setRequestHeader(e) {
        return this.requestHeader = e, this
    }
}
const Vn = {};
class Cy extends Error {
    constructor(e, t) {
        super(e), this.response = t
    }
}
class Ka extends $s {
    constructor(e) {
        super(e)
    }
    load(e, t, n, i) {
        e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
        const r = zs.get(e);
        if (r !== void 0) return this.manager.itemStart(e), setTimeout(() => {
            t && t(r), this.manager.itemEnd(e)
        }, 0), r;
        if (Vn[e] !== void 0) {
            Vn[e].push({
                onLoad: t,
                onProgress: n,
                onError: i
            });
            return
        }
        Vn[e] = [], Vn[e].push({
            onLoad: t,
            onProgress: n,
            onError: i
        });
        // console.log("e:::",e);
        
        const a = new Request(e, {
                headers: new Headers(this.requestHeader),
                credentials: this.withCredentials ? "include" : "same-origin"
            }),
            o = this.mimeType,
            l = this.responseType;
        fetch(a).then(c => {
            if (c.status === 200 || c.status === 0) {
                if (c.status === 0 && console.warn("THREE.FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || c.body === void 0 || c.body.getReader === void 0) return c;
                const h = Vn[e],
                    u = c.body.getReader(),
                    d = c.headers.get("Content-Length") || c.headers.get("X-File-Size"),
                    f = d ? parseInt(d) : 0,
                    g = f !== 0;
                let m = 0;
                const p = new ReadableStream({
                    start(_) {
                        E();

                        function E() {
                            u.read().then(({
                                done: y,
                                value: S
                            }) => {
                                if (y) _.close();
                                else {
                                    m += S.byteLength;
                                    const T = new ProgressEvent("progress", {
                                        lengthComputable: g,
                                        loaded: m,
                                        total: f
                                    });
                                    for (let L = 0, I = h.length; L < I; L++) {
                                        const v = h[L];
                                        v.onProgress && v.onProgress(T)
                                    }
                                    _.enqueue(S), E()
                                }
                            })
                        }
                    }
                });
                return new Response(p)
            } else throw new Cy(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`, c)
        }).then(c => {
            switch (l) {
                case "arraybuffer":
                    return c.arrayBuffer();
                case "blob":
                    return c.blob();
                case "document":
                    return c.text().then(h => new DOMParser().parseFromString(h, o));
                case "json":
                    return c.json();
                default:
                    if (o === void 0) return c.text();
                    {
                        const u = /charset="?([^;"\s]*)"?/i.exec(o),
                            d = u && u[1] ? u[1].toLowerCase() : void 0,
                            f = new TextDecoder(d);
                        return c.arrayBuffer().then(g => f.decode(g))
                    }
            }
        }).then(c => {
            zs.add(e, c);
            const h = Vn[e];
            delete Vn[e];
            for (let u = 0, d = h.length; u < d; u++) {
                const f = h[u];
                f.onLoad && f.onLoad(c)
            }
        }).catch(c => {
            const h = Vn[e];
            if (h === void 0) throw this.manager.itemError(e), c;
            delete Vn[e];
            for (let u = 0, d = h.length; u < d; u++) {
                const f = h[u];
                f.onError && f.onError(c)
            }
            this.manager.itemError(e)
        }).finally(() => {
            this.manager.itemEnd(e)
        }), this.manager.itemStart(e)
    }
    setResponseType(e) {
        return this.responseType = e, this
    }
    setMimeType(e) {
        return this.mimeType = e, this
    }
}
class Ly extends $s {
    constructor(e) {
        super(e)
    }
    load(e, t, n, i) {
        this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
        const r = this,
            a = zs.get(e);
        if (a !== void 0) return r.manager.itemStart(e), setTimeout(function() {
            t && t(a), r.manager.itemEnd(e)
        }, 0), a;
        const o = Lr("img");

        function l() {
            h(), zs.add(e, this), t && t(this), r.manager.itemEnd(e)
        }

        function c(u) {
            h(), i && i(u), r.manager.itemError(e), r.manager.itemEnd(e)
        }

        function h() {
            o.removeEventListener("load", l, !1), o.removeEventListener("error", c, !1)
        }
        return o.addEventListener("load", l, !1), o.addEventListener("error", c, !1), e.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (o.crossOrigin = this.crossOrigin), r.manager.itemStart(e), o.src = e, o
    }
}
class qt extends $s {
    constructor(e) {
        super(e)
    }
    load(e, t, n, i) {
        const r = new wt,
            a = new Ly(this.manager);
        return a.setCrossOrigin(this.crossOrigin), a.setPath(this.path), a.load(e, function(o) {
            r.image = o, r.needsUpdate = !0, t !== void 0 && t(r)
        }, n, i), r
    }
}
class Za extends Ye {
    constructor(e, t = 1) {
        super(), this.isLight = !0, this.type = "Light", this.color = new pe(e), this.intensity = t
    }
    dispose() {}
    copy(e, t) {
        return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), t
    }
}
const Xo = new Te,
    au = new M,
    ou = new M;
class rc {
    constructor(e) {
        this.camera = e, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new ve(512, 512), this.map = null, this.mapPass = null, this.matrix = new Te, this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new $l, this._frameExtents = new ve(1, 1), this._viewportCount = 1, this._viewports = [new je(0, 0, 1, 1)]
    }
    getViewportCount() {
        return this._viewportCount
    }
    getFrustum() {
        return this._frustum
    }
    updateMatrices(e) {
        const t = this.camera,
            n = this.matrix;
        au.setFromMatrixPosition(e.matrixWorld), t.position.copy(au), ou.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(ou), t.updateMatrixWorld(), Xo.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Xo), n.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), n.multiply(Xo)
    }
    getViewport(e) {
        return this._viewports[e]
    }
    getFrameExtents() {
        return this._frameExtents
    }
    dispose() {
        this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose()
    }
    copy(e) {
        return this.camera = e.camera.clone(), this.bias = e.bias, this.radius = e.radius, this.mapSize.copy(e.mapSize), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    toJSON() {
        const e = {};
        return this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e
    }
}
class Iy extends rc {
    constructor() {
        super(new Bt(50, 1, .5, 500)), this.isSpotLightShadow = !0, this.focus = 1
    }
    updateMatrices(e) {
        const t = this.camera,
            n = Cr * 2 * e.angle * this.focus,
            i = this.mapSize.width / this.mapSize.height,
            r = e.distance || t.far;
        (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e)
    }
    copy(e) {
        return super.copy(e), this.focus = e.focus, this
    }
}
class Ry extends Za {
    constructor(e, t, n = 0, i = Math.PI / 3, r = 0, a = 2) {
        super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(Ye.DEFAULT_UP), this.updateMatrix(), this.target = new Ye, this.distance = n, this.angle = i, this.penumbra = r, this.decay = a, this.map = null, this.shadow = new Iy
    }
    get power() {
        return this.intensity * Math.PI
    }
    set power(e) {
        this.intensity = e / Math.PI
    }
    dispose() {
        this.shadow.dispose()
    }
    copy(e, t) {
        return super.copy(e, t), this.distance = e.distance, this.angle = e.angle, this.penumbra = e.penumbra, this.decay = e.decay, this.target = e.target.clone(), this.shadow = e.shadow.clone(), this
    }
}
const lu = new Te,
    cr = new M,
    qo = new M;
class Dy extends rc {
    constructor() {
        super(new Bt(90, 1, .5, 500)), this.isPointLightShadow = !0, this._frameExtents = new ve(4, 2), this._viewportCount = 6, this._viewports = [new je(2, 1, 1, 1), new je(0, 1, 1, 1), new je(3, 1, 1, 1), new je(1, 1, 1, 1), new je(3, 0, 1, 1), new je(1, 0, 1, 1)], this._cubeDirections = [new M(1, 0, 0), new M(-1, 0, 0), new M(0, 0, 1), new M(0, 0, -1), new M(0, 1, 0), new M(0, -1, 0)], this._cubeUps = [new M(0, 1, 0), new M(0, 1, 0), new M(0, 1, 0), new M(0, 1, 0), new M(0, 0, 1), new M(0, 0, -1)]
    }
    updateMatrices(e, t = 0) {
        const n = this.camera,
            i = this.matrix,
            r = e.distance || n.far;
        r !== n.far && (n.far = r, n.updateProjectionMatrix()), cr.setFromMatrixPosition(e.matrixWorld), n.position.copy(cr), qo.copy(n.position), qo.add(this._cubeDirections[t]), n.up.copy(this._cubeUps[t]), n.lookAt(qo), n.updateMatrixWorld(), i.makeTranslation(-cr.x, -cr.y, -cr.z), lu.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(lu)
    }
}
class Py extends Za {
    constructor(e, t, n = 0, i = 2) {
        super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = i, this.shadow = new Dy
    }
    get power() {
        return this.intensity * 4 * Math.PI
    }
    set power(e) {
        this.intensity = e / (4 * Math.PI)
    }
    dispose() {
        this.shadow.dispose()
    }
    copy(e, t) {
        return super.copy(e, t), this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this
    }
}
class Ny extends rc {
    constructor() {
        super(new Kl(-5, 5, 5, -5, .5, 500)), this.isDirectionalLightShadow = !0
    }
}
class _d extends Za {
    constructor(e, t) {
        super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Ye.DEFAULT_UP), this.updateMatrix(), this.target = new Ye, this.shadow = new Ny
    }
    dispose() {
        this.shadow.dispose()
    }
    copy(e) {
        return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this
    }
}
class By extends Za {
    constructor(e, t) {
        super(e, t), this.isAmbientLight = !0, this.type = "AmbientLight"
    }
}
class pl {
    static decodeText(e) {
        if (typeof TextDecoder < "u") return new TextDecoder().decode(e);
        let t = "";
        for (let n = 0, i = e.length; n < i; n++) t += String.fromCharCode(e[n]);
        try {
            return decodeURIComponent(escape(t))
        } catch {
            return t
        }
    }
    static extractUrlBase(e) {
        const t = e.lastIndexOf("/");
        return t === -1 ? "./" : e.slice(0, t + 1)
    }
    static resolveURL(e, t) {
        return typeof e != "string" || e === "" ? "" : (/^https?:\/\//i.test(t) && /^\//.test(e) && (t = t.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), /^(https?:)?\/\//i.test(e) || /^data:.*,.*$/i.test(e) || /^blob:.*$/i.test(e) ? e : t + e)
    }
}
class Fy extends $s {
    constructor(e) {
        super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = {
            premultiplyAlpha: "none"
        }
    }
    setOptions(e) {
        return this.options = e, this
    }
    load(e, t, n, i) {
        e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
        const r = this,
            a = zs.get(e);
        if (a !== void 0) return r.manager.itemStart(e), setTimeout(function() {
            t && t(a), r.manager.itemEnd(e)
        }, 0), a;
        const o = {};
        o.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include", o.headers = this.requestHeader, fetch(e, o).then(function(l) {
            return l.blob()
        }).then(function(l) {
            return createImageBitmap(l, Object.assign(r.options, {
                colorSpaceConversion: "none"
            }))
        }).then(function(l) {
            zs.add(e, l), t && t(l), r.manager.itemEnd(e)
        }).catch(function(l) {
            i && i(l), r.manager.itemError(e), r.manager.itemEnd(e)
        }), r.manager.itemStart(e)
    }
}
let wa;
class xd {
    static getContext() {
        return wa === void 0 && (wa = new(window.AudioContext || window.webkitAudioContext)), wa
    }
    static setContext(e) {
        wa = e
    }
}
class ky extends $s {
    constructor(e) {
        super(e)
    }
    load(e, t, n, i) {
        const r = this,
            a = new Ka(this.manager);
        a.setResponseType("arraybuffer"), a.setPath(this.path), a.setRequestHeader(this.requestHeader), a.setWithCredentials(this.withCredentials), a.load(e, function(o) {
            try {
                const l = o.slice(0);
                xd.getContext().decodeAudioData(l, function(h) {
                    t(h)
                })
            } catch (l) {
                i ? i(l) : console.error(l), r.manager.itemError(e)
            }
        }, n, i)
    }
}
class Wr {
    constructor(e = !0) {
        this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1
    }
    start() {
        this.startTime = cu(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0
    }
    stop() {
        this.getElapsedTime(), this.running = !1, this.autoStart = !1
    }
    getElapsedTime() {
        return this.getDelta(), this.elapsedTime
    }
    getDelta() {
        let e = 0;
        if (this.autoStart && !this.running) return this.start(), 0;
        if (this.running) {
            const t = cu();
            e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e
        }
        return e
    }
}

function cu() {
    return (typeof performance > "u" ? Date : performance).now()
}
const Mi = new M,
    hu = new Wt,
    Oy = new M,
    bi = new M;
class Uy extends Ye {
    constructor() {
        super(), this.type = "AudioListener", this.context = xd.getContext(), this.gain = this.context.createGain(), this.gain.connect(this.context.destination), this.filter = null, this.timeDelta = 0, this._clock = new Wr
    }
    getInput() {
        return this.gain
    }
    removeFilter() {
        return this.filter !== null && (this.gain.disconnect(this.filter), this.filter.disconnect(this.context.destination), this.gain.connect(this.context.destination), this.filter = null), this
    }
    getFilter() {
        return this.filter
    }
    setFilter(e) {
        return this.filter !== null ? (this.gain.disconnect(this.filter), this.filter.disconnect(this.context.destination)) : this.gain.disconnect(this.context.destination), this.filter = e, this.gain.connect(this.filter), this.filter.connect(this.context.destination), this
    }
    getMasterVolume() {
        return this.gain.gain.value
    }
    setMasterVolume(e) {
        return this.gain.gain.setTargetAtTime(e, this.context.currentTime, .01), this
    }
    updateMatrixWorld(e) {
        super.updateMatrixWorld(e);
        const t = this.context.listener,
            n = this.up;
        if (this.timeDelta = this._clock.getDelta(), this.matrixWorld.decompose(Mi, hu, Oy), bi.set(0, 0, -1).applyQuaternion(hu), t.positionX) {
            const i = this.context.currentTime + this.timeDelta;
            t.positionX.linearRampToValueAtTime(Mi.x, i), t.positionY.linearRampToValueAtTime(Mi.y, i), t.positionZ.linearRampToValueAtTime(Mi.z, i), t.forwardX.linearRampToValueAtTime(bi.x, i), t.forwardY.linearRampToValueAtTime(bi.y, i), t.forwardZ.linearRampToValueAtTime(bi.z, i), t.upX.linearRampToValueAtTime(n.x, i), t.upY.linearRampToValueAtTime(n.y, i), t.upZ.linearRampToValueAtTime(n.z, i)
        } else t.setPosition(Mi.x, Mi.y, Mi.z), t.setOrientation(bi.x, bi.y, bi.z, n.x, n.y, n.z)
    }
}
class pn extends Ye {
    constructor(e) {
        super(), this.type = "Audio", this.listener = e, this.context = e.context, this.gain = this.context.createGain(), this.gain.connect(e.getInput()), this.autoplay = !1, this.buffer = null, this.detune = 0, this.loop = !1, this.loopStart = 0, this.loopEnd = 0, this.offset = 0, this.duration = void 0, this.playbackRate = 1, this.isPlaying = !1, this.hasPlaybackControl = !0, this.source = null, this.sourceType = "empty", this._startedAt = 0, this._progress = 0, this._connected = !1, this.filters = []
    }
    getOutput() {
        return this.gain
    }
    setNodeSource(e) {
        return this.hasPlaybackControl = !1, this.sourceType = "audioNode", this.source = e, this.connect(), this
    }
    setMediaElementSource(e) {
        return this.hasPlaybackControl = !1, this.sourceType = "mediaNode", this.source = this.context.createMediaElementSource(e), this.connect(), this
    }
    setMediaStreamSource(e) {
        return this.hasPlaybackControl = !1, this.sourceType = "mediaStreamNode", this.source = this.context.createMediaStreamSource(e), this.connect(), this
    }
    setBuffer(e) {
        return this.buffer = e, this.sourceType = "buffer", this.autoplay && this.play(), this
    }
    play(e = 0) {
        if (this.isPlaying === !0) {
            console.warn("THREE.Audio: Audio is already playing.");
            return
        }
        if (this.hasPlaybackControl === !1) {
            console.warn("THREE.Audio: this Audio has no playback control.");
            return
        }
        this._startedAt = this.context.currentTime + e;
        const t = this.context.createBufferSource();
        return t.buffer = this.buffer, t.loop = this.loop, t.loopStart = this.loopStart, t.loopEnd = this.loopEnd, t.onended = this.onEnded.bind(this), t.start(this._startedAt, this._progress + this.offset, this.duration), this.isPlaying = !0, this.source = t, this.setDetune(this.detune), this.setPlaybackRate(this.playbackRate), this.connect()
    }
    pause() {
        if (this.hasPlaybackControl === !1) {
            console.warn("THREE.Audio: this Audio has no playback control.");
            return
        }
        return this.isPlaying === !0 && (this._progress += Math.max(this.context.currentTime - this._startedAt, 0) * this.playbackRate, this.loop === !0 && (this._progress = this._progress % (this.duration || this.buffer.duration)), this.source.stop(), this.source.onended = null, this.isPlaying = !1), this
    }
    stop() {
        if (this.hasPlaybackControl === !1) {
            console.warn("THREE.Audio: this Audio has no playback control.");
            return
        }
        return this._progress = 0, this.source !== null && (this.source.stop(), this.source.onended = null), this.isPlaying = !1, this
    }
    connect() {
        if (this.filters.length > 0) {
            this.source.connect(this.filters[0]);
            for (let e = 1, t = this.filters.length; e < t; e++) this.filters[e - 1].connect(this.filters[e]);
            this.filters[this.filters.length - 1].connect(this.getOutput())
        } else this.source.connect(this.getOutput());
        return this._connected = !0, this
    }
    disconnect() {
        if (this.filters.length > 0) {
            this.source.disconnect(this.filters[0]);
            for (let e = 1, t = this.filters.length; e < t; e++) this.filters[e - 1].disconnect(this.filters[e]);
            this.filters[this.filters.length - 1].disconnect(this.getOutput())
        } else this.source.disconnect(this.getOutput());
        return this._connected = !1, this
    }
    getFilters() {
        return this.filters
    }
    setFilters(e) {
        return e || (e = []), this._connected === !0 ? (this.disconnect(), this.filters = e.slice(), this.connect()) : this.filters = e.slice(), this
    }
    setDetune(e) {
        if (this.detune = e, this.source.detune !== void 0) return this.isPlaying === !0 && this.source.detune.setTargetAtTime(this.detune, this.context.currentTime, .01), this
    }
    getDetune() {
        return this.detune
    }
    getFilter() {
        return this.getFilters()[0]
    }
    setFilter(e) {
        return this.setFilters(e ? [e] : [])
    }
    setPlaybackRate(e) {
        if (this.hasPlaybackControl === !1) {
            console.warn("THREE.Audio: this Audio has no playback control.");
            return
        }
        return this.playbackRate = e, this.isPlaying === !0 && this.source.playbackRate.setTargetAtTime(this.playbackRate, this.context.currentTime, .01), this
    }
    getPlaybackRate() {
        return this.playbackRate
    }
    onEnded() {
        this.isPlaying = !1
    }
    getLoop() {
        return this.hasPlaybackControl === !1 ? (console.warn("THREE.Audio: this Audio has no playback control."), !1) : this.loop
    }
    setLoop(e) {
        if (this.hasPlaybackControl === !1) {
            console.warn("THREE.Audio: this Audio has no playback control.");
            return
        }
        return this.loop = e, this.isPlaying === !0 && (this.source.loop = this.loop), this
    }
    setLoopStart(e) {
        return this.loopStart = e, this
    }
    setLoopEnd(e) {
        return this.loopEnd = e, this
    }
    getVolume() {
        return this.gain.gain.value
    }
    setVolume(e) {
        return this.gain.gain.setTargetAtTime(e, this.context.currentTime, .01), this
    }
}
class zy {
    constructor(e, t, n) {
        this.binding = e, this.valueSize = n;
        let i, r, a;
        switch (t) {
            case "quaternion":
                i = this._slerp, r = this._slerpAdditive, a = this._setAdditiveIdentityQuaternion, this.buffer = new Float64Array(n * 6), this._workIndex = 5;
                break;
            case "string":
            case "bool":
                i = this._select, r = this._select, a = this._setAdditiveIdentityOther, this.buffer = new Array(n * 5);
                break;
            default:
                i = this._lerp, r = this._lerpAdditive, a = this._setAdditiveIdentityNumeric, this.buffer = new Float64Array(n * 5)
        }
        this._mixBufferRegion = i, this._mixBufferRegionAdditive = r, this._setIdentity = a, this._origIndex = 3, this._addIndex = 4, this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, this.useCount = 0, this.referenceCount = 0
    }
    accumulate(e, t) {
        const n = this.buffer,
            i = this.valueSize,
            r = e * i + i;
        let a = this.cumulativeWeight;
        if (a === 0) {
            for (let o = 0; o !== i; ++o) n[r + o] = n[o];
            a = t
        } else {
            a += t;
            const o = t / a;
            this._mixBufferRegion(n, r, 0, o, i)
        }
        this.cumulativeWeight = a
    }
    accumulateAdditive(e) {
        const t = this.buffer,
            n = this.valueSize,
            i = n * this._addIndex;
        this.cumulativeWeightAdditive === 0 && this._setIdentity(), this._mixBufferRegionAdditive(t, i, 0, e, n), this.cumulativeWeightAdditive += e
    }
    apply(e) {
        const t = this.valueSize,
            n = this.buffer,
            i = e * t + t,
            r = this.cumulativeWeight,
            a = this.cumulativeWeightAdditive,
            o = this.binding;
        if (this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, r < 1) {
            const l = t * this._origIndex;
            this._mixBufferRegion(n, i, l, 1 - r, t)
        }
        a > 0 && this._mixBufferRegionAdditive(n, i, this._addIndex * t, 1, t);
        for (let l = t, c = t + t; l !== c; ++l)
            if (n[l] !== n[l + t]) {
                o.setValue(n, i);
                break
            }
    }
    saveOriginalState() {
        const e = this.binding,
            t = this.buffer,
            n = this.valueSize,
            i = n * this._origIndex;
        e.getValue(t, i);
        for (let r = n, a = i; r !== a; ++r) t[r] = t[i + r % n];
        this._setIdentity(), this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0
    }
    restoreOriginalState() {
        const e = this.valueSize * 3;
        this.binding.setValue(this.buffer, e)
    }
    _setAdditiveIdentityNumeric() {
        const e = this._addIndex * this.valueSize,
            t = e + this.valueSize;
        for (let n = e; n < t; n++) this.buffer[n] = 0
    }
    _setAdditiveIdentityQuaternion() {
        this._setAdditiveIdentityNumeric(), this.buffer[this._addIndex * this.valueSize + 3] = 1
    }
    _setAdditiveIdentityOther() {
        const e = this._origIndex * this.valueSize,
            t = this._addIndex * this.valueSize;
        for (let n = 0; n < this.valueSize; n++) this.buffer[t + n] = this.buffer[e + n]
    }
    _select(e, t, n, i, r) {
        if (i >= .5)
            for (let a = 0; a !== r; ++a) e[t + a] = e[n + a]
    }
    _slerp(e, t, n, i) {
        Wt.slerpFlat(e, t, e, t, e, n, i)
    }
    _slerpAdditive(e, t, n, i, r) {
        const a = this._workIndex * r;
        Wt.multiplyQuaternionsFlat(e, a, e, t, e, n), Wt.slerpFlat(e, t, e, t, e, a, i)
    }
    _lerp(e, t, n, i, r) {
        const a = 1 - i;
        for (let o = 0; o !== r; ++o) {
            const l = t + o;
            e[l] = e[l] * a + e[n + o] * i
        }
    }
    _lerpAdditive(e, t, n, i, r) {
        for (let a = 0; a !== r; ++a) {
            const o = t + a;
            e[o] = e[o] + e[n + a] * i
        }
    }
}
const ac = "\\[\\]\\.:\\/",
    Gy = new RegExp("[" + ac + "]", "g"),
    oc = "[^" + ac + "]",
    Vy = "[^" + ac.replace("\\.", "") + "]",
    Hy = /((?:WC+[\/:])*)/.source.replace("WC", oc),
    Wy = /(WCOD+)?/.source.replace("WCOD", Vy),
    Xy = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", oc),
    qy = /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", oc),
    jy = new RegExp("^" + Hy + Wy + Xy + qy + "$"),
    Yy = ["material", "materials", "bones", "map"];
class $y {
    constructor(e, t, n) {
        const i = n || Ge.parseTrackName(t);
        this._targetGroup = e, this._bindings = e.subscribe_(t, i)
    }
    getValue(e, t) {
        this.bind();
        const n = this._targetGroup.nCachedObjects_,
            i = this._bindings[n];
        i !== void 0 && i.getValue(e, t)
    }
    setValue(e, t) {
        const n = this._bindings;
        for (let i = this._targetGroup.nCachedObjects_, r = n.length; i !== r; ++i) n[i].setValue(e, t)
    }
    bind() {
        const e = this._bindings;
        for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind()
    }
    unbind() {
        const e = this._bindings;
        for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind()
    }
}
class Ge {
    constructor(e, t, n) {
        this.path = t, this.parsedPath = n || Ge.parseTrackName(t), this.node = Ge.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
    }
    static create(e, t, n) {
        return e && e.isAnimationObjectGroup ? new Ge.Composite(e, t, n) : new Ge(e, t, n)
    }
    static sanitizeNodeName(e) {
        return e.replace(/\s/g, "_").replace(Gy, "")
    }
    static parseTrackName(e) {
        const t = jy.exec(e);
        if (t === null) throw new Error("PropertyBinding: Cannot parse trackName: " + e);
        const n = {
                nodeName: t[2],
                objectName: t[3],
                objectIndex: t[4],
                propertyName: t[5],
                propertyIndex: t[6]
            },
            i = n.nodeName && n.nodeName.lastIndexOf(".");
        if (i !== void 0 && i !== -1) {
            const r = n.nodeName.substring(i + 1);
            Yy.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, i), n.objectName = r)
        }
        if (n.propertyName === null || n.propertyName.length === 0) throw new Error("PropertyBinding: can not parse propertyName from trackName: " + e);
        return n
    }
    static findNode(e, t) {
        if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid) return e;
        if (e.skeleton) {
            const n = e.skeleton.getBoneByName(t);
            if (n !== void 0) return n
        }
        if (e.children) {
            const n = function(r) {
                    for (let a = 0; a < r.length; a++) {
                        const o = r[a];
                        if (o.name === t || o.uuid === t) return o;
                        const l = n(o.children);
                        if (l) return l
                    }
                    return null
                },
                i = n(e.children);
            if (i) return i
        }
        return null
    }
    _getValue_unavailable() {}
    _setValue_unavailable() {}
    _getValue_direct(e, t) {
        e[t] = this.targetObject[this.propertyName]
    }
    _getValue_array(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) e[t++] = n[i]
    }
    _getValue_arrayElement(e, t) {
        e[t] = this.resolvedProperty[this.propertyIndex]
    }
    _getValue_toArray(e, t) {
        this.resolvedProperty.toArray(e, t)
    }
    _setValue_direct(e, t) {
        this.targetObject[this.propertyName] = e[t]
    }
    _setValue_direct_setNeedsUpdate(e, t) {
        this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
        this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_array(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++]
    }
    _setValue_array_setNeedsUpdate(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++];
        this.targetObject.needsUpdate = !0
    }
    _setValue_array_setMatrixWorldNeedsUpdate(e, t) {
        const n = this.resolvedProperty;
        for (let i = 0, r = n.length; i !== r; ++i) n[i] = e[t++];
        this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_arrayElement(e, t) {
        this.resolvedProperty[this.propertyIndex] = e[t]
    }
    _setValue_arrayElement_setNeedsUpdate(e, t) {
        this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
        this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_fromArray(e, t) {
        this.resolvedProperty.fromArray(e, t)
    }
    _setValue_fromArray_setNeedsUpdate(e, t) {
        this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
        this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _getValue_unbound(e, t) {
        this.bind(), this.getValue(e, t)
    }
    _setValue_unbound(e, t) {
        this.bind(), this.setValue(e, t)
    }
    bind() {
        let e = this.node;
        const t = this.parsedPath,
            n = t.objectName,
            i = t.propertyName;
        let r = t.propertyIndex;
        if (e || (e = Ge.findNode(this.rootNode, t.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
            console.error("THREE.PropertyBinding: Trying to update node for track: " + this.path + " but it wasn't found.");
            return
        }
        if (n) {
            let c = t.objectIndex;
            switch (n) {
                case "materials":
                    if (!e.material) {
                        console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
                        return
                    }
                    if (!e.material.materials) {
                        console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
                        return
                    }
                    e = e.material.materials;
                    break;
                case "bones":
                    if (!e.skeleton) {
                        console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
                        return
                    }
                    e = e.skeleton.bones;
                    for (let h = 0; h < e.length; h++)
                        if (e[h].name === c) {
                            c = h;
                            break
                        } break;
                case "map":
                    if ("map" in e) {
                        e = e.map;
                        break
                    }
                    if (!e.material) {
                        console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
                        return
                    }
                    if (!e.material.map) {
                        console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
                        return
                    }
                    e = e.material.map;
                    break;
                default:
                    if (e[n] === void 0) {
                        console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
                        return
                    }
                    e = e[n]
            }
            if (c !== void 0) {
                if (e[c] === void 0) {
                    console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, e);
                    return
                }
                e = e[c]
            }
        }
        const a = e[i];
        if (a === void 0) {
            const c = t.nodeName;
            console.error("THREE.PropertyBinding: Trying to update property for track: " + c + "." + i + " but it wasn't found.", e);
            return
        }
        let o = this.Versioning.None;
        this.targetObject = e, e.needsUpdate !== void 0 ? o = this.Versioning.NeedsUpdate : e.matrixWorldNeedsUpdate !== void 0 && (o = this.Versioning.MatrixWorldNeedsUpdate);
        let l = this.BindingType.Direct;
        if (r !== void 0) {
            if (i === "morphTargetInfluences") {
                if (!e.geometry) {
                    console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
                    return
                }
                if (!e.geometry.morphAttributes) {
                    console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
                    return
                }
                e.morphTargetDictionary[r] !== void 0 && (r = e.morphTargetDictionary[r])
            }
            l = this.BindingType.ArrayElement, this.resolvedProperty = a, this.propertyIndex = r
        } else a.fromArray !== void 0 && a.toArray !== void 0 ? (l = this.BindingType.HasFromToArray, this.resolvedProperty = a) : Array.isArray(a) ? (l = this.BindingType.EntireArray, this.resolvedProperty = a) : this.propertyName = i;
        this.getValue = this.GetterByBindingType[l], this.setValue = this.SetterByBindingTypeAndVersioning[l][o]
    }
    unbind() {
        this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
    }
}
Ge.Composite = $y;
Ge.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
};
Ge.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
};
Ge.prototype.GetterByBindingType = [Ge.prototype._getValue_direct, Ge.prototype._getValue_array, Ge.prototype._getValue_arrayElement, Ge.prototype._getValue_toArray];
Ge.prototype.SetterByBindingTypeAndVersioning = [
    [Ge.prototype._setValue_direct, Ge.prototype._setValue_direct_setNeedsUpdate, Ge.prototype._setValue_direct_setMatrixWorldNeedsUpdate],
    [Ge.prototype._setValue_array, Ge.prototype._setValue_array_setNeedsUpdate, Ge.prototype._setValue_array_setMatrixWorldNeedsUpdate],
    [Ge.prototype._setValue_arrayElement, Ge.prototype._setValue_arrayElement_setNeedsUpdate, Ge.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],
    [Ge.prototype._setValue_fromArray, Ge.prototype._setValue_fromArray_setNeedsUpdate, Ge.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]
];
class Ky {
    constructor(e, t, n = null, i = t.blendMode) {
        this._mixer = e, this._clip = t, this._localRoot = n, this.blendMode = i;
        const r = t.tracks,
            a = r.length,
            o = new Array(a),
            l = {
                endingStart: vs,
                endingEnd: vs
            };
        for (let c = 0; c !== a; ++c) {
            const h = r[c].createInterpolant(null);
            o[c] = h, h.settings = l
        }
        this._interpolantSettings = l, this._interpolants = o, this._propertyBindings = new Array(a), this._cacheIndex = null, this._byClipCacheIndex = null, this._timeScaleInterpolant = null, this._weightInterpolant = null, this.loop = kp, this._loopCount = -1, this._startTime = null, this.time = 0, this.timeScale = 1, this._effectiveTimeScale = 1, this.weight = 1, this._effectiveWeight = 1, this.repetitions = 1 / 0, this.paused = !1, this.enabled = !0, this.clampWhenFinished = !1, this.zeroSlopeAtStart = !0, this.zeroSlopeAtEnd = !0
    }
    play() {
        return this._mixer._activateAction(this), this
    }
    stop() {
        return this._mixer._deactivateAction(this), this.reset()
    }
    reset() {
        return this.paused = !1, this.enabled = !0, this.time = 0, this._loopCount = -1, this._startTime = null, this.stopFading().stopWarping()
    }
    isRunning() {
        return this.enabled && !this.paused && this.timeScale !== 0 && this._startTime === null && this._mixer._isActiveAction(this)
    }
    isScheduled() {
        return this._mixer._isActiveAction(this)
    }
    startAt(e) {
        return this._startTime = e, this
    }
    setLoop(e, t) {
        return this.loop = e, this.repetitions = t, this
    }
    setEffectiveWeight(e) {
        return this.weight = e, this._effectiveWeight = this.enabled ? e : 0, this.stopFading()
    }
    getEffectiveWeight() {
        return this._effectiveWeight
    }
    fadeIn(e) {
        return this._scheduleFading(e, 0, 1)
    }
    fadeOut(e) {
        return this._scheduleFading(e, 1, 0)
    }
    crossFadeFrom(e, t, n) {
        if (e.fadeOut(t), this.fadeIn(t), n) {
            const i = this._clip.duration,
                r = e._clip.duration,
                a = r / i,
                o = i / r;
            e.warp(1, a, t), this.warp(o, 1, t)
        }
        return this
    }
    crossFadeTo(e, t, n) {
        return e.crossFadeFrom(this, t, n)
    }
    stopFading() {
        const e = this._weightInterpolant;
        return e !== null && (this._weightInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this
    }
    setEffectiveTimeScale(e) {
        return this.timeScale = e, this._effectiveTimeScale = this.paused ? 0 : e, this.stopWarping()
    }
    getEffectiveTimeScale() {
        return this._effectiveTimeScale
    }
    setDuration(e) {
        return this.timeScale = this._clip.duration / e, this.stopWarping()
    }
    syncWith(e) {
        return this.time = e.time, this.timeScale = e.timeScale, this.stopWarping()
    }
    halt(e) {
        return this.warp(this._effectiveTimeScale, 0, e)
    }
    warp(e, t, n) {
        const i = this._mixer,
            r = i.time,
            a = this.timeScale;
        let o = this._timeScaleInterpolant;
        o === null && (o = i._lendControlInterpolant(), this._timeScaleInterpolant = o);
        const l = o.parameterPositions,
            c = o.sampleValues;
        return l[0] = r, l[1] = r + n, c[0] = e / a, c[1] = t / a, this
    }
    stopWarping() {
        const e = this._timeScaleInterpolant;
        return e !== null && (this._timeScaleInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this
    }
    getMixer() {
        return this._mixer
    }
    getClip() {
        return this._clip
    }
    getRoot() {
        return this._localRoot || this._mixer._root
    }
    _update(e, t, n, i) {
        if (!this.enabled) {
            this._updateWeight(e);
            return
        }
        const r = this._startTime;
        if (r !== null) {
            const l = (e - r) * n;
            l < 0 || n === 0 ? t = 0 : (this._startTime = null, t = n * l)
        }
        t *= this._updateTimeScale(e);
        const a = this._updateTime(t),
            o = this._updateWeight(e);
        if (o > 0) {
            const l = this._interpolants,
                c = this._propertyBindings;
            switch (this.blendMode) {
                case Up:
                    for (let h = 0, u = l.length; h !== u; ++h) l[h].evaluate(a), c[h].accumulateAdditive(o);
                    break;
                case Xl:
                default:
                    for (let h = 0, u = l.length; h !== u; ++h) l[h].evaluate(a), c[h].accumulate(i, o)
            }
        }
    }
    _updateWeight(e) {
        let t = 0;
        if (this.enabled) {
            t = this.weight;
            const n = this._weightInterpolant;
            if (n !== null) {
                const i = n.evaluate(e)[0];
                t *= i, e > n.parameterPositions[1] && (this.stopFading(), i === 0 && (this.enabled = !1))
            }
        }
        return this._effectiveWeight = t, t
    }
    _updateTimeScale(e) {
        let t = 0;
        if (!this.paused) {
            t = this.timeScale;
            const n = this._timeScaleInterpolant;
            if (n !== null) {
                const i = n.evaluate(e)[0];
                t *= i, e > n.parameterPositions[1] && (this.stopWarping(), t === 0 ? this.paused = !0 : this.timeScale = t)
            }
        }
        return this._effectiveTimeScale = t, t
    }
    _updateTime(e) {
        const t = this._clip.duration,
            n = this.loop;
        let i = this.time + e,
            r = this._loopCount;
        const a = n === Op;
        if (e === 0) return r === -1 ? i : a && (r & 1) === 1 ? t - i : i;
        if (n === Wl) {
            r === -1 && (this._loopCount = 0, this._setEndings(!0, !0, !1));
            e: {
                if (i >= t) i = t;
                else if (i < 0) i = 0;
                else {
                    this.time = i;
                    break e
                }
                this.clampWhenFinished ? this.paused = !0 : this.enabled = !1,
                this.time = i,
                this._mixer.dispatchEvent({
                    type: "finished",
                    action: this,
                    direction: e < 0 ? -1 : 1
                })
            }
        } else {
            if (r === -1 && (e >= 0 ? (r = 0, this._setEndings(!0, this.repetitions === 0, a)) : this._setEndings(this.repetitions === 0, !0, a)), i >= t || i < 0) {
                const o = Math.floor(i / t);
                i -= t * o, r += Math.abs(o);
                const l = this.repetitions - r;
                if (l <= 0) this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, i = e > 0 ? t : 0, this.time = i, this._mixer.dispatchEvent({
                    type: "finished",
                    action: this,
                    direction: e > 0 ? 1 : -1
                });
                else {
                    if (l === 1) {
                        const c = e < 0;
                        this._setEndings(c, !c, a)
                    } else this._setEndings(!1, !1, a);
                    this._loopCount = r, this.time = i, this._mixer.dispatchEvent({
                        type: "loop",
                        action: this,
                        loopDelta: o
                    })
                }
            } else this.time = i;
            if (a && (r & 1) === 1) return t - i
        }
        return i
    }
    _setEndings(e, t, n) {
        const i = this._interpolantSettings;
        n ? (i.endingStart = Ss, i.endingEnd = Ss) : (e ? i.endingStart = this.zeroSlopeAtStart ? Ss : vs : i.endingStart = Pa, t ? i.endingEnd = this.zeroSlopeAtEnd ? Ss : vs : i.endingEnd = Pa)
    }
    _scheduleFading(e, t, n) {
        const i = this._mixer,
            r = i.time;
        let a = this._weightInterpolant;
        a === null && (a = i._lendControlInterpolant(), this._weightInterpolant = a);
        const o = a.parameterPositions,
            l = a.sampleValues;
        return o[0] = r, l[0] = t, o[1] = r + e, l[1] = n, this
    }
}
const Zy = new Float32Array(1);
class yd extends ji {
    constructor(e) {
        super(), this._root = e, this._initMemoryManager(), this._accuIndex = 0, this.time = 0, this.timeScale = 1
    }
    _bindAction(e, t) {
        const n = e._localRoot || this._root,
            i = e._clip.tracks,
            r = i.length,
            a = e._propertyBindings,
            o = e._interpolants,
            l = n.uuid,
            c = this._bindingsByRootAndName;
        let h = c[l];
        h === void 0 && (h = {}, c[l] = h);
        for (let u = 0; u !== r; ++u) {
            const d = i[u],
                f = d.name;
            let g = h[f];
            if (g !== void 0) ++g.referenceCount, a[u] = g;
            else {
                if (g = a[u], g !== void 0) {
                    g._cacheIndex === null && (++g.referenceCount, this._addInactiveBinding(g, l, f));
                    continue
                }
                const m = t && t._propertyBindings[u].binding.parsedPath;
                g = new zy(Ge.create(n, f, m), d.ValueTypeName, d.getValueSize()), ++g.referenceCount, this._addInactiveBinding(g, l, f), a[u] = g
            }
            o[u].resultBuffer = g.buffer
        }
    }
    _activateAction(e) {
        if (!this._isActiveAction(e)) {
            if (e._cacheIndex === null) {
                const n = (e._localRoot || this._root).uuid,
                    i = e._clip.uuid,
                    r = this._actionsByClip[i];
                this._bindAction(e, r && r.knownActions[0]), this._addInactiveAction(e, i, n)
            }
            const t = e._propertyBindings;
            for (let n = 0, i = t.length; n !== i; ++n) {
                const r = t[n];
                r.useCount++ === 0 && (this._lendBinding(r), r.saveOriginalState())
            }
            this._lendAction(e)
        }
    }
    _deactivateAction(e) {
        if (this._isActiveAction(e)) {
            const t = e._propertyBindings;
            for (let n = 0, i = t.length; n !== i; ++n) {
                const r = t[n];
                --r.useCount === 0 && (r.restoreOriginalState(), this._takeBackBinding(r))
            }
            this._takeBackAction(e)
        }
    }
    _initMemoryManager() {
        this._actions = [], this._nActiveActions = 0, this._actionsByClip = {}, this._bindings = [], this._nActiveBindings = 0, this._bindingsByRootAndName = {}, this._controlInterpolants = [], this._nActiveControlInterpolants = 0;
        const e = this;
        this.stats = {
            actions: {
                get total() {
                    return e._actions.length
                },
                get inUse() {
                    return e._nActiveActions
                }
            },
            bindings: {
                get total() {
                    return e._bindings.length
                },
                get inUse() {
                    return e._nActiveBindings
                }
            },
            controlInterpolants: {
                get total() {
                    return e._controlInterpolants.length
                },
                get inUse() {
                    return e._nActiveControlInterpolants
                }
            }
        }
    }
    _isActiveAction(e) {
        const t = e._cacheIndex;
        return t !== null && t < this._nActiveActions
    }
    _addInactiveAction(e, t, n) {
        const i = this._actions,
            r = this._actionsByClip;
        let a = r[t];
        if (a === void 0) a = {
            knownActions: [e],
            actionByRoot: {}
        }, e._byClipCacheIndex = 0, r[t] = a;
        else {
            const o = a.knownActions;
            e._byClipCacheIndex = o.length, o.push(e)
        }
        e._cacheIndex = i.length, i.push(e), a.actionByRoot[n] = e
    }
    _removeInactiveAction(e) {
        const t = this._actions,
            n = t[t.length - 1],
            i = e._cacheIndex;
        n._cacheIndex = i, t[i] = n, t.pop(), e._cacheIndex = null;
        const r = e._clip.uuid,
            a = this._actionsByClip,
            o = a[r],
            l = o.knownActions,
            c = l[l.length - 1],
            h = e._byClipCacheIndex;
        c._byClipCacheIndex = h, l[h] = c, l.pop(), e._byClipCacheIndex = null;
        const u = o.actionByRoot,
            d = (e._localRoot || this._root).uuid;
        delete u[d], l.length === 0 && delete a[r], this._removeInactiveBindingsForAction(e)
    }
    _removeInactiveBindingsForAction(e) {
        const t = e._propertyBindings;
        for (let n = 0, i = t.length; n !== i; ++n) {
            const r = t[n];
            --r.referenceCount === 0 && this._removeInactiveBinding(r)
        }
    }
    _lendAction(e) {
        const t = this._actions,
            n = e._cacheIndex,
            i = this._nActiveActions++,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _takeBackAction(e) {
        const t = this._actions,
            n = e._cacheIndex,
            i = --this._nActiveActions,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _addInactiveBinding(e, t, n) {
        const i = this._bindingsByRootAndName,
            r = this._bindings;
        let a = i[t];
        a === void 0 && (a = {}, i[t] = a), a[n] = e, e._cacheIndex = r.length, r.push(e)
    }
    _removeInactiveBinding(e) {
        const t = this._bindings,
            n = e.binding,
            i = n.rootNode.uuid,
            r = n.path,
            a = this._bindingsByRootAndName,
            o = a[i],
            l = t[t.length - 1],
            c = e._cacheIndex;
        l._cacheIndex = c, t[c] = l, t.pop(), delete o[r], Object.keys(o).length === 0 && delete a[i]
    }
    _lendBinding(e) {
        const t = this._bindings,
            n = e._cacheIndex,
            i = this._nActiveBindings++,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _takeBackBinding(e) {
        const t = this._bindings,
            n = e._cacheIndex,
            i = --this._nActiveBindings,
            r = t[i];
        e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r
    }
    _lendControlInterpolant() {
        const e = this._controlInterpolants,
            t = this._nActiveControlInterpolants++;
        let n = e[t];
        return n === void 0 && (n = new md(new Float32Array(2), new Float32Array(2), 1, Zy), n.__cacheIndex = t, e[t] = n), n
    }
    _takeBackControlInterpolant(e) {
        const t = this._controlInterpolants,
            n = e.__cacheIndex,
            i = --this._nActiveControlInterpolants,
            r = t[i];
        e.__cacheIndex = i, t[i] = e, r.__cacheIndex = n, t[n] = r
    }
    clipAction(e, t, n) {
        const i = t || this._root,
            r = i.uuid;
        let a = typeof e == "string" ? fl.findByName(i, e) : e;
        const o = a !== null ? a.uuid : e,
            l = this._actionsByClip[o];
        let c = null;
        if (n === void 0 && (a !== null ? n = a.blendMode : n = Xl), l !== void 0) {
            const u = l.actionByRoot[r];
            if (u !== void 0 && u.blendMode === n) return u;
            c = l.knownActions[0], a === null && (a = c._clip)
        }
        if (a === null) return null;
        const h = new Ky(this, a, t, n);
        return this._bindAction(h, c), this._addInactiveAction(h, o, r), h
    }
    existingAction(e, t) {
        const n = t || this._root,
            i = n.uuid,
            r = typeof e == "string" ? fl.findByName(n, e) : e,
            a = r ? r.uuid : e,
            o = this._actionsByClip[a];
        return o !== void 0 && o.actionByRoot[i] || null
    }
    stopAllAction() {
        const e = this._actions,
            t = this._nActiveActions;
        for (let n = t - 1; n >= 0; --n) e[n].stop();
        return this
    }
    update(e) {
        e *= this.timeScale;
        const t = this._actions,
            n = this._nActiveActions,
            i = this.time += e,
            r = Math.sign(e),
            a = this._accuIndex ^= 1;
        for (let c = 0; c !== n; ++c) t[c]._update(i, e, r, a);
        const o = this._bindings,
            l = this._nActiveBindings;
        for (let c = 0; c !== l; ++c) o[c].apply(a);
        return this
    }
    setTime(e) {
        this.time = 0;
        for (let t = 0; t < this._actions.length; t++) this._actions[t].time = 0;
        return this.update(e)
    }
    getRoot() {
        return this._root
    }
    uncacheClip(e) {
        const t = this._actions,
            n = e.uuid,
            i = this._actionsByClip,
            r = i[n];
        if (r !== void 0) {
            const a = r.knownActions;
            for (let o = 0, l = a.length; o !== l; ++o) {
                const c = a[o];
                this._deactivateAction(c);
                const h = c._cacheIndex,
                    u = t[t.length - 1];
                c._cacheIndex = null, c._byClipCacheIndex = null, u._cacheIndex = h, t[h] = u, t.pop(), this._removeInactiveBindingsForAction(c)
            }
            delete i[n]
        }
    }
    uncacheRoot(e) {
        const t = e.uuid,
            n = this._actionsByClip;
        for (const a in n) {
            const o = n[a].actionByRoot,
                l = o[t];
            l !== void 0 && (this._deactivateAction(l), this._removeInactiveAction(l))
        }
        const i = this._bindingsByRootAndName,
            r = i[t];
        if (r !== void 0)
            for (const a in r) {
                const o = r[a];
                o.restoreOriginalState(), this._removeInactiveBinding(o)
            }
    }
    uncacheAction(e, t) {
        const n = this.existingAction(e, t);
        n !== null && (this._deactivateAction(n), this._removeInactiveAction(n))
    }
}
class Jy {
    constructor(e, t, n = 0, i = 1 / 0) {
        this.ray = new qa(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new Yl, this.params = {
            Mesh: {},
            Line: {
                threshold: 1
            },
            LOD: {},
            Points: {
                threshold: 1
            },
            Sprite: {}
        }
    }
    set(e, t) {
        this.ray.set(e, t)
    }
    setFromCamera(e, t) {
        t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, .5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type)
    }
    intersectObject(e, t = !0, n = []) {
        return ml(e, this, n, t), n.sort(uu), n
    }
    intersectObjects(e, t = !0, n = []) {
        for (let i = 0, r = e.length; i < r; i++) ml(e[i], this, n, t);
        return n.sort(uu), n
    }
}

function uu(s, e) {
    return s.distance - e.distance
}

function ml(s, e, t, n) {
    if (s.layers.test(e.layers) && s.raycast(e, t), n === !0) {
        const i = s.children;
        for (let r = 0, a = i.length; r < a; r++) ml(i[r], e, t, !0)
    }
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
    detail: {
        revision: Hl
    }
}));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Hl);
class Qy {
    constructor(e) {
        this.animate = this.animate.bind(this), this.effectEnded = !1, this.particleSystem = null, this.startAnimation(), this.explosion = null, this.textureLoader = new qt, this.particleTexture = this.textureLoader.load("./textures/smoke_01.png"), this.isEffectActive = !1, this.clock = new Wr, this.createMergeEffect(e), this.animate()
    }
    createExplosion(e) {
        const n = new jt,
            i = new Float32Array(20 * 3),
            r = new Float32Array(20 * 3),
            a = new Float32Array(20);
        for (let l = 0; l < 20; l++) {
            i[l * 3] = 0, i[l * 3 + 1] = 0, i[l * 3 + 2] = 0;
            const c = Math.random() * Math.PI * 2,
                h = Math.random() * 1 + .5;
            r[l * 3] = Math.cos(c) * h, r[l * 3 + 1] = Math.sin(c) * h, r[l * 3 + 2] = (Math.random() - .5) * h, a[l] = Math.random() * 1 + 1
        }
        n.setAttribute("position", new $e(i, 3)), n.setAttribute("velocity", new $e(r, 3)), n.setAttribute("lifetime", new $e(a, 1));
        const o = new nc({
            color: 16737792,
            size: 15,
            map: this.particleTexture,
            transparent: !0,
            opacity: 1,
            blending: br,
            depthWrite: !1
        });
        return this.particleSystem = new $a(n, o), this.particleSystem.userData = {
            age: new Float32Array(20),
            initialSize: o.size
        }, this.particleSystem
    }
    destroyMergeEffect() {
        this.particleSystem.geometry && this.particleSystem.geometry.dispose(), this.particleSystem.material && (Array.isArray(this.particleSystem.material) ? this.particleSystem.material.forEach(e => {
            e.map && e.map.dispose(), e.dispose()
        }) : (this.particleSystem.material.map && this.particleSystem.material.map.dispose(), this.particleSystem.material.dispose())), Ue.remove(this.particleSystem), this.effectEnded = !0
    }
    animateExplosion(e, t) {
        const n = e.geometry.attributes.position.array,
            i = e.geometry.attributes.velocity.array,
            r = e.geometry.attributes.lifetime.array,
            a = e.userData.age,
            o = e.userData.initialSize,
            l = .98;
        let c = !0;
        this.isEffectActive = !1;
        for (let h = 0; h < n.length; h += 3) {
            n[h] += i[h] * t, n[h + 1] += i[h + 1] * t, n[h + 2] += i[h + 2] * t, i[h] *= l, i[h + 1] *= l, i[h + 2] *= l, a[h / 3] += t;
            const u = a[h / 3] / r[h / 3];
            u >= 1 ? n[h] = n[h + 1] = n[h + 2] = 1 / 0 : (c = !1, e.material.opacity = 1 - u, e.material.size = o * (1 - u), this.isEffectActive = !0)
        }
        e.geometry.attributes.position.needsUpdate = !0, c && this.destroyMergeEffect()
    }
    createMergeEffect(e) {
        this.isEffectActive = !0, this.explosion = this.createExplosion(e), this.explosion.position.set(e.x, e.y + 1, e.z), Ue.add(this.explosion)
    }
    animate() {
        if (this.effectEnded || (requestAnimationFrame(this.animate), this.explosion === null)) return;
        const e = this.clock.getDelta();
        this.animateExplosion(this.explosion, e)
    }
    startAnimation() {
        requestAnimationFrame(this.animate)
    }
}
const ev = "GameDist";
let du = !1;
const bs = class bs {
    constructor() {
        if (bs.instance) return bs.instance;
        this.sdk = new $f, bs.instance = this, localStorage.setItem("sdkInitialized", "true"), this.sdk.setup({
            onLoaded: () => {
                this.load()
            },
            orientationType: mn.Ignore,
            type: ev,
            gid: "9ec75b0c2e184d00ad68f9de4a5d0496"
        })
    }
    load() {
        console.log("GameService init"), console.log("Platform is either Yandex or GD"), Vt.init(this.sdk).then(() => {
            this.sdk.warmAds()
        }).finally(() => {
            if (!du) {
                const e = localStorage.getItem("firstOpen");
                (e == "null" || e === "true") && localStorage.setItem("firstOpen", "false"), du = !0, Tc(!1, !0), kw(), this.sdk.gameReady(), Tf(), wf(!0)
            }
        })
    }
    yandexCloudLoad() {
        console.log("GameService yandexCloudLoad"), !Ur && (Iw(), setTimeout(() => {
            this.yandexCloudLoad()
        }, 500))
    }
};
Ve(bs, "instance", null);
let Ri = bs;
const lc = {
    en: {
        font: "english_font",
        CONTINUE: "CONTINUE",
        FIGHT: "FIGHT",
        LEVEL: "LEVEL",
        RANGE: "RANGE",
        MELEE: "MELEE",
        AD: "AD",
        SPEED: "SPEED",
        HEROES: "HEROES",
        Settings: "Settings",
        MUSIC: "MUSIC",
        SOUND: "SOUND",
        SUCCESS: "SUCCESS",
        FAIL: "FAIL",
        LevelCompletionBonus: "Level completion bonus",
        YourEarnings: "Your earnings",
        GET3XCOIN: "GET 3X COIN",
        NOTHANKS: "NO THANKS",
        LOADING: "Loading...",
        CLAIM: "CLAIM",
        FREECOIN: "GET FREE COIN",
        Leaderboard: "Leader",
        DESERT: "DESERT",
        MINE: "MINE",
        VOLCANO: "VOLCANO",
        CHINESE: "CHINESE",
        AZTEC: "AZTEC",
        ON: "ON",
        OFF: "OFF",
        x3COINCOLLECTED: "3x Coin Collected",
        GET: "GET",
        GETREWARD: "GET REWARD",
        RewardedWarningDescription: "Watch ad to get reward",
        WATCH: "WATCH",
        SHOWINGADS: "SHOWING ADS",
        REWARD_RECEIVED: "REWARD RECEIVED",
        FREE: "FREE",
        Archer: "Archer",
        Sage: "Sage",
        Trickster: "Trickster",
        Astronaut: "Astronaut",
        Punk: "Punk",
        Scientist: "Scientist",
        Robot: "Robot",
        Terminator: "Terminator",
        Alien: "Alien",
        Cyclope: "Cyclope",
        Giant: "Giant",
        Skeleton: "Skeleton",
        Bedouin: "Bedouin",
        Viking: "Viking",
        Miner: "Miner",
        Ninja: "Ninja",
        Venom: "Venom",
        Dark_Lord: "Dark Lord",
        Golem: "Golem",
        Crystal: "Crystal",
        King: "King",
        Champion: "Champion"
    },
    ru: {
        font: "russian_font",
        CONTINUE: "ПРОДОЛЖЕНИЕ",
        FIGHT: "ДРАТЬСЯ",
        LEVEL: "УРОВЕНЬ",
        RANGE: "ЛУЧНИК",
        MELEE: "ВОИН",
        AD: "РЕКЛАМА",
        SPEED: "СКОРОСТЬ",
        HEROES: "ГЕРОИ",
        Settings: "Настройки",
        MUSIC: "МУЗЫКА",
        SOUND: "ЗВУК",
        SUCCESS: "ПОБЕДА",
        FAIL: "НЕУДАЧА",
        LevelCompletionBonus: "Бонус за завершение уровня",
        YourEarnings: "Ваш доход",
        GET3XCOIN: "ПОЛУЧИТЬ 3Х МОНЕТЫ",
        NOTHANKS: "НЕТ, СПАСИБО",
        LOADING: "ЗАГРУЗКА...",
        CLAIM: "ЗАБРАТЬ",
        FREECOIN: "БЕСПЛАТНЫЕ МОНЕТЫ",
        Leaderboard: "Лидеры",
        DESERT: "ПУСТЫНЯ",
        MINE: "ШАХТА",
        VOLCANO: "ВУЛКАН",
        CHINESE: "КИТАЙ",
        AZTEC: "АЦТЕКИ",
        ON: "Вкл",
        OFF: "Выкл",
        x3COINCOLLECTED: "3x Монеты Собрано",
        GET: "Получить",
        GETREWARD: "Получить награду",
        RewardedWarningDescription: "Смотри рекламу и получи награду",
        WATCH: "СМОТРЕТЬ",
        SHOWINGADS: "ПОКАЗ РЕКЛАМЫ",
        REWARD_RECEIVED: "НАГРАДА ПОЛУЧЕНА",
        FREE: "БЕСПЛАТНО",
        Archer: "Лучник",
        Sage: "Мудрец",
        Trickster: "Обманщик",
        Astronaut: "Космонавт",
        Punk: "Панк",
        Scientist: "Ученый",
        Robot: "Робот",
        Terminator: "Терминатор",
        Alien: "Инопланетянин",
        Cyclope: "Циклоп",
        Giant: "Гигант",
        Skeleton: "Скелет",
        Bedouin: "Бедуин",
        Viking: "Викинг",
        Miner: "Шахтер",
        Ninja: "Ниндзя",
        Venom: "Яд",
        Dark_Lord: "Темный Лорд",
        Golem: "Голем",
        Crystal: "Кристалл",
        King: "Король",
        Champion: "Чемпион"
    }
};
let ci = "ru";

function tv(s) {
    ci = s, document.querySelectorAll("[data-key]").forEach(e => {
        const t = e.getAttribute("data-key");
        e.textContent = lc[s][t], e.style.fontFamily = vt()
    })
}

function vt() {
    return lc[ci].font
}

function nv() {
    window.getTranslation = Xn, console.log(Ri.platformName), console.log(Ri.platformName == "yandex"), console.log(Ri.platformName === "yandex"), window.location.hostname.includes("localhost") ? ci = "en" : Ri.platformName === "yandex" && Vt.Splash.lang() == "ru" ? ci = "ru" : ci = "en", tv(ci)
}

function Xn(s) {
    return lc[ci][s]
}
var Fe = Object.freeze({
        Linear: Object.freeze({
            None: function(s) {
                return s
            },
            In: function(s) {
                return s
            },
            Out: function(s) {
                return s
            },
            InOut: function(s) {
                return s
            }
        }),
        Quadratic: Object.freeze({
            In: function(s) {
                return s * s
            },
            Out: function(s) {
                return s * (2 - s)
            },
            InOut: function(s) {
                return (s *= 2) < 1 ? .5 * s * s : -.5 * (--s * (s - 2) - 1)
            }
        }),
        Cubic: Object.freeze({
            In: function(s) {
                return s * s * s
            },
            Out: function(s) {
                return --s * s * s + 1
            },
            InOut: function(s) {
                return (s *= 2) < 1 ? .5 * s * s * s : .5 * ((s -= 2) * s * s + 2)
            }
        }),
        Quartic: Object.freeze({
            In: function(s) {
                return s * s * s * s
            },
            Out: function(s) {
                return 1 - --s * s * s * s
            },
            InOut: function(s) {
                return (s *= 2) < 1 ? .5 * s * s * s * s : -.5 * ((s -= 2) * s * s * s - 2)
            }
        }),
        Quintic: Object.freeze({
            In: function(s) {
                return s * s * s * s * s
            },
            Out: function(s) {
                return --s * s * s * s * s + 1
            },
            InOut: function(s) {
                return (s *= 2) < 1 ? .5 * s * s * s * s * s : .5 * ((s -= 2) * s * s * s * s + 2)
            }
        }),
        Sinusoidal: Object.freeze({
            In: function(s) {
                return 1 - Math.sin((1 - s) * Math.PI / 2)
            },
            Out: function(s) {
                return Math.sin(s * Math.PI / 2)
            },
            InOut: function(s) {
                return .5 * (1 - Math.sin(Math.PI * (.5 - s)))
            }
        }),
        Exponential: Object.freeze({
            In: function(s) {
                return s === 0 ? 0 : Math.pow(1024, s - 1)
            },
            Out: function(s) {
                return s === 1 ? 1 : 1 - Math.pow(2, -10 * s)
            },
            InOut: function(s) {
                return s === 0 ? 0 : s === 1 ? 1 : (s *= 2) < 1 ? .5 * Math.pow(1024, s - 1) : .5 * (-Math.pow(2, -10 * (s - 1)) + 2)
            }
        }),
        Circular: Object.freeze({
            In: function(s) {
                return 1 - Math.sqrt(1 - s * s)
            },
            Out: function(s) {
                return Math.sqrt(1 - --s * s)
            },
            InOut: function(s) {
                return (s *= 2) < 1 ? -.5 * (Math.sqrt(1 - s * s) - 1) : .5 * (Math.sqrt(1 - (s -= 2) * s) + 1)
            }
        }),
        Elastic: Object.freeze({
            In: function(s) {
                return s === 0 ? 0 : s === 1 ? 1 : -Math.pow(2, 10 * (s - 1)) * Math.sin((s - 1.1) * 5 * Math.PI)
            },
            Out: function(s) {
                return s === 0 ? 0 : s === 1 ? 1 : Math.pow(2, -10 * s) * Math.sin((s - .1) * 5 * Math.PI) + 1
            },
            InOut: function(s) {
                return s === 0 ? 0 : s === 1 ? 1 : (s *= 2, s < 1 ? -.5 * Math.pow(2, 10 * (s - 1)) * Math.sin((s - 1.1) * 5 * Math.PI) : .5 * Math.pow(2, -10 * (s - 1)) * Math.sin((s - 1.1) * 5 * Math.PI) + 1)
            }
        }),
        Back: Object.freeze({
            In: function(s) {
                var e = 1.70158;
                return s === 1 ? 1 : s * s * ((e + 1) * s - e)
            },
            Out: function(s) {
                var e = 1.70158;
                return s === 0 ? 0 : --s * s * ((e + 1) * s + e) + 1
            },
            InOut: function(s) {
                var e = 2.5949095;
                return (s *= 2) < 1 ? .5 * (s * s * ((e + 1) * s - e)) : .5 * ((s -= 2) * s * ((e + 1) * s + e) + 2)
            }
        }),
        Bounce: Object.freeze({
            In: function(s) {
                return 1 - Fe.Bounce.Out(1 - s)
            },
            Out: function(s) {
                return s < 1 / 2.75 ? 7.5625 * s * s : s < 2 / 2.75 ? 7.5625 * (s -= 1.5 / 2.75) * s + .75 : s < 2.5 / 2.75 ? 7.5625 * (s -= 2.25 / 2.75) * s + .9375 : 7.5625 * (s -= 2.625 / 2.75) * s + .984375
            },
            InOut: function(s) {
                return s < .5 ? Fe.Bounce.In(s * 2) * .5 : Fe.Bounce.Out(s * 2 - 1) * .5 + .5
            }
        }),
        generatePow: function(s) {
            return s === void 0 && (s = 4), s = s < Number.EPSILON ? Number.EPSILON : s, s = s > 1e4 ? 1e4 : s, {
                In: function(e) {
                    return Math.pow(e, s)
                },
                Out: function(e) {
                    return 1 - Math.pow(1 - e, s)
                },
                InOut: function(e) {
                    return e < .5 ? Math.pow(e * 2, s) / 2 : (1 - Math.pow(2 - e * 2, s)) / 2 + .5
                }
            }
        }
    }),
    mr = function() {
        return performance.now()
    },
    vd = function() {
        function s() {
            for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
            this._tweens = {}, this._tweensAddedDuringUpdate = {}, this.add.apply(this, e)
        }
        return s.prototype.getAll = function() {
            var e = this;
            return Object.keys(this._tweens).map(function(t) {
                return e._tweens[t]
            })
        }, s.prototype.removeAll = function() {
            this._tweens = {}
        }, s.prototype.add = function() {
            for (var e, t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
            for (var i = 0, r = t; i < r.length; i++) {
                var a = r[i];
                (e = a._group) === null || e === void 0 || e.remove(a), a._group = this, this._tweens[a.getId()] = a, this._tweensAddedDuringUpdate[a.getId()] = a
            }
        }, s.prototype.remove = function() {
            for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
            for (var n = 0, i = e; n < i.length; n++) {
                var r = i[n];
                r._group = void 0, delete this._tweens[r.getId()], delete this._tweensAddedDuringUpdate[r.getId()]
            }
        }, s.prototype.allStopped = function() {
            return this.getAll().every(function(e) {
                return !e.isPlaying()
            })
        }, s.prototype.update = function(e, t) {
            e === void 0 && (e = mr()), t === void 0 && (t = !0);
            var n = Object.keys(this._tweens);
            if (n.length !== 0)
                for (; n.length > 0;) {
                    this._tweensAddedDuringUpdate = {};
                    for (var i = 0; i < n.length; i++) {
                        var r = this._tweens[n[i]],
                            a = !t;
                        r && r.update(e, a) === !1 && !t && this.remove(r)
                    }
                    n = Object.keys(this._tweensAddedDuringUpdate)
                }
        }, s
    }(),
    Ms = {
        Linear: function(s, e) {
            var t = s.length - 1,
                n = t * e,
                i = Math.floor(n),
                r = Ms.Utils.Linear;
            return e < 0 ? r(s[0], s[1], n) : e > 1 ? r(s[t], s[t - 1], t - n) : r(s[i], s[i + 1 > t ? t : i + 1], n - i)
        },
        Bezier: function(s, e) {
            for (var t = 0, n = s.length - 1, i = Math.pow, r = Ms.Utils.Bernstein, a = 0; a <= n; a++) t += i(1 - e, n - a) * i(e, a) * s[a] * r(n, a);
            return t
        },
        CatmullRom: function(s, e) {
            var t = s.length - 1,
                n = t * e,
                i = Math.floor(n),
                r = Ms.Utils.CatmullRom;
            return s[0] === s[t] ? (e < 0 && (i = Math.floor(n = t * (1 + e))), r(s[(i - 1 + t) % t], s[i], s[(i + 1) % t], s[(i + 2) % t], n - i)) : e < 0 ? s[0] - (r(s[0], s[0], s[1], s[1], -n) - s[0]) : e > 1 ? s[t] - (r(s[t], s[t], s[t - 1], s[t - 1], n - t) - s[t]) : r(s[i ? i - 1 : 0], s[i], s[t < i + 1 ? t : i + 1], s[t < i + 2 ? t : i + 2], n - i)
        },
        Utils: {
            Linear: function(s, e, t) {
                return (e - s) * t + s
            },
            Bernstein: function(s, e) {
                var t = Ms.Utils.Factorial;
                return t(s) / t(e) / t(s - e)
            },
            Factorial: function() {
                var s = [1];
                return function(e) {
                    var t = 1;
                    if (s[e]) return s[e];
                    for (var n = e; n > 1; n--) t *= n;
                    return s[e] = t, t
                }
            }(),
            CatmullRom: function(s, e, t, n, i) {
                var r = (t - s) * .5,
                    a = (n - e) * .5,
                    o = i * i,
                    l = i * o;
                return (2 * e - 2 * t + r + a) * l + (-3 * e + 3 * t - 2 * r - a) * o + r * i + e
            }
        }
    },
    iv = function() {
        function s() {}
        return s.nextId = function() {
            return s._nextId++
        }, s._nextId = 0, s
    }(),
    gl = new vd,
    Xe = function() {
        function s(e, t) {
            this._isPaused = !1, this._pauseStart = 0, this._valuesStart = {}, this._valuesEnd = {}, this._valuesStartRepeat = {}, this._duration = 1e3, this._isDynamic = !1, this._initialRepeat = 0, this._repeat = 0, this._yoyo = !1, this._isPlaying = !1, this._reversed = !1, this._delayTime = 0, this._startTime = 0, this._easingFunction = Fe.Linear.None, this._interpolationFunction = Ms.Linear, this._chainedTweens = [], this._onStartCallbackFired = !1, this._onEveryStartCallbackFired = !1, this._id = iv.nextId(), this._isChainStopped = !1, this._propertiesAreSetUp = !1, this._goToEnd = !1, this._object = e, typeof t == "object" ? (this._group = t, t.add(this)) : t === !0 && (this._group = gl, gl.add(this))
        }
        return s.prototype.getId = function() {
            return this._id
        }, s.prototype.isPlaying = function() {
            return this._isPlaying
        }, s.prototype.isPaused = function() {
            return this._isPaused
        }, s.prototype.getDuration = function() {
            return this._duration
        }, s.prototype.to = function(e, t) {
            if (t === void 0 && (t = 1e3), this._isPlaying) throw new Error("Can not call Tween.to() while Tween is already started or paused. Stop the Tween first.");
            return this._valuesEnd = e, this._propertiesAreSetUp = !1, this._duration = t < 0 ? 0 : t, this
        }, s.prototype.duration = function(e) {
            return e === void 0 && (e = 1e3), this._duration = e < 0 ? 0 : e, this
        }, s.prototype.dynamic = function(e) {
            return e === void 0 && (e = !1), this._isDynamic = e, this
        }, s.prototype.start = function(e, t) {
            if (e === void 0 && (e = mr()), t === void 0 && (t = !1), this._isPlaying) return this;
            if (this._repeat = this._initialRepeat, this._reversed) {
                this._reversed = !1;
                for (var n in this._valuesStartRepeat) this._swapEndStartRepeatValues(n), this._valuesStart[n] = this._valuesStartRepeat[n]
            }
            if (this._isPlaying = !0, this._isPaused = !1, this._onStartCallbackFired = !1, this._onEveryStartCallbackFired = !1, this._isChainStopped = !1, this._startTime = e, this._startTime += this._delayTime, !this._propertiesAreSetUp || t) {
                if (this._propertiesAreSetUp = !0, !this._isDynamic) {
                    var i = {};
                    for (var r in this._valuesEnd) i[r] = this._valuesEnd[r];
                    this._valuesEnd = i
                }
                this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat, t)
            }
            return this
        }, s.prototype.startFromCurrentValues = function(e) {
            return this.start(e, !0)
        }, s.prototype._setupProperties = function(e, t, n, i, r) {
            for (var a in n) {
                var o = e[a],
                    l = Array.isArray(o),
                    c = l ? "array" : typeof o,
                    h = !l && Array.isArray(n[a]);
                if (!(c === "undefined" || c === "function")) {
                    if (h) {
                        var u = n[a];
                        if (u.length === 0) continue;
                        for (var d = [o], f = 0, g = u.length; f < g; f += 1) {
                            var m = this._handleRelativeValue(o, u[f]);
                            if (isNaN(m)) {
                                h = !1, console.warn("Found invalid interpolation list. Skipping.");
                                break
                            }
                            d.push(m)
                        }
                        h && (n[a] = d)
                    }
                    if ((c === "object" || l) && o && !h) {
                        t[a] = l ? [] : {};
                        var p = o;
                        for (var _ in p) t[a][_] = p[_];
                        i[a] = l ? [] : {};
                        var u = n[a];
                        if (!this._isDynamic) {
                            var E = {};
                            for (var _ in u) E[_] = u[_];
                            n[a] = u = E
                        }
                        this._setupProperties(p, t[a], u, i[a], r)
                    } else(typeof t[a] > "u" || r) && (t[a] = o), l || (t[a] *= 1), h ? i[a] = n[a].slice().reverse() : i[a] = t[a] || 0
                }
            }
        }, s.prototype.stop = function() {
            return this._isChainStopped || (this._isChainStopped = !0, this.stopChainedTweens()), this._isPlaying ? (this._isPlaying = !1, this._isPaused = !1, this._onStopCallback && this._onStopCallback(this._object), this) : this
        }, s.prototype.end = function() {
            return this._goToEnd = !0, this.update(this._startTime + this._duration), this
        }, s.prototype.pause = function(e) {
            return e === void 0 && (e = mr()), this._isPaused || !this._isPlaying ? this : (this._isPaused = !0, this._pauseStart = e, this)
        }, s.prototype.resume = function(e) {
            return e === void 0 && (e = mr()), !this._isPaused || !this._isPlaying ? this : (this._isPaused = !1, this._startTime += e - this._pauseStart, this._pauseStart = 0, this)
        }, s.prototype.stopChainedTweens = function() {
            for (var e = 0, t = this._chainedTweens.length; e < t; e++) this._chainedTweens[e].stop();
            return this
        }, s.prototype.group = function(e) {
            return e ? (e.add(this), this) : (console.warn("tween.group() without args has been removed, use group.add(tween) instead."), this)
        }, s.prototype.remove = function() {
            var e;
            return (e = this._group) === null || e === void 0 || e.remove(this), this
        }, s.prototype.delay = function(e) {
            return e === void 0 && (e = 0), this._delayTime = e, this
        }, s.prototype.repeat = function(e) {
            return e === void 0 && (e = 0), this._initialRepeat = e, this._repeat = e, this
        }, s.prototype.repeatDelay = function(e) {
            return this._repeatDelayTime = e, this
        }, s.prototype.yoyo = function(e) {
            return e === void 0 && (e = !1), this._yoyo = e, this
        }, s.prototype.easing = function(e) {
            return e === void 0 && (e = Fe.Linear.None), this._easingFunction = e, this
        }, s.prototype.interpolation = function(e) {
            return e === void 0 && (e = Ms.Linear), this._interpolationFunction = e, this
        }, s.prototype.chain = function() {
            for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
            return this._chainedTweens = e, this
        }, s.prototype.onStart = function(e) {
            return this._onStartCallback = e, this
        }, s.prototype.onEveryStart = function(e) {
            return this._onEveryStartCallback = e, this
        }, s.prototype.onUpdate = function(e) {
            return this._onUpdateCallback = e, this
        }, s.prototype.onRepeat = function(e) {
            return this._onRepeatCallback = e, this
        }, s.prototype.onComplete = function(e) {
            return this._onCompleteCallback = e, this
        }, s.prototype.onStop = function(e) {
            return this._onStopCallback = e, this
        }, s.prototype.update = function(e, t) {
            var n = this,
                i;
            if (e === void 0 && (e = mr()), t === void 0 && (t = s.autoStartOnUpdate), this._isPaused) return !0;
            var r;
            if (!this._goToEnd && !this._isPlaying)
                if (t) this.start(e, !0);
                else return !1;
            if (this._goToEnd = !1, e < this._startTime) return !0;
            this._onStartCallbackFired === !1 && (this._onStartCallback && this._onStartCallback(this._object), this._onStartCallbackFired = !0), this._onEveryStartCallbackFired === !1 && (this._onEveryStartCallback && this._onEveryStartCallback(this._object), this._onEveryStartCallbackFired = !0);
            var a = e - this._startTime,
                o = this._duration + ((i = this._repeatDelayTime) !== null && i !== void 0 ? i : this._delayTime),
                l = this._duration + this._repeat * o,
                c = function() {
                    if (n._duration === 0 || a > l) return 1;
                    var m = Math.trunc(a / o),
                        p = a - m * o,
                        _ = Math.min(p / n._duration, 1);
                    return _ === 0 && a === n._duration ? 1 : _
                },
                h = c(),
                u = this._easingFunction(h);
            if (this._updateProperties(this._object, this._valuesStart, this._valuesEnd, u), this._onUpdateCallback && this._onUpdateCallback(this._object, h), this._duration === 0 || a >= this._duration)
                if (this._repeat > 0) {
                    var d = Math.min(Math.trunc((a - this._duration) / o) + 1, this._repeat);
                    isFinite(this._repeat) && (this._repeat -= d);
                    for (r in this._valuesStartRepeat) !this._yoyo && typeof this._valuesEnd[r] == "string" && (this._valuesStartRepeat[r] = this._valuesStartRepeat[r] + parseFloat(this._valuesEnd[r])), this._yoyo && this._swapEndStartRepeatValues(r), this._valuesStart[r] = this._valuesStartRepeat[r];
                    return this._yoyo && (this._reversed = !this._reversed), this._startTime += o * d, this._onRepeatCallback && this._onRepeatCallback(this._object), this._onEveryStartCallbackFired = !1, !0
                } else {
                    this._onCompleteCallback && this._onCompleteCallback(this._object);
                    for (var f = 0, g = this._chainedTweens.length; f < g; f++) this._chainedTweens[f].start(this._startTime + this._duration, !1);
                    return this._isPlaying = !1, !1
                } return !0
        }, s.prototype._updateProperties = function(e, t, n, i) {
            for (var r in n)
                if (t[r] !== void 0) {
                    var a = t[r] || 0,
                        o = n[r],
                        l = Array.isArray(e[r]),
                        c = Array.isArray(o),
                        h = !l && c;
                    h ? e[r] = this._interpolationFunction(o, i) : typeof o == "object" && o ? this._updateProperties(e[r], a, o, i) : (o = this._handleRelativeValue(a, o), typeof o == "number" && (e[r] = a + (o - a) * i))
                }
        }, s.prototype._handleRelativeValue = function(e, t) {
            return typeof t != "string" ? t : t.charAt(0) === "+" || t.charAt(0) === "-" ? e + parseFloat(t) : parseFloat(t)
        }, s.prototype._swapEndStartRepeatValues = function(e) {
            var t = this._valuesStartRepeat[e],
                n = this._valuesEnd[e];
            typeof n == "string" ? this._valuesStartRepeat[e] = this._valuesStartRepeat[e] + parseFloat(n) : this._valuesStartRepeat[e] = this._valuesEnd[e], this._valuesEnd[e] = t
        }, s.autoStartOnUpdate = !1, s
    }(),
    Dn = gl;
Dn.getAll.bind(Dn);
Dn.removeAll.bind(Dn);
Dn.add.bind(Dn);
Dn.remove.bind(Dn);
Dn.update.bind(Dn);
let fe = 1,
    Sd = 1,
    Ki, Tt = !0,
    nt = !0,
    Di, ri, _l, Pi, xl, yl;
document.getElementById("settings-button").addEventListener("click", sv);
document.getElementById("settings-close-button").addEventListener("click", rv);
document.getElementById("music-toggle-button").addEventListener("click", av);
document.getElementById("sound-toggle-button").addEventListener("click", ov);
document.getElementById("game-speed-button").addEventListener("click", cv);

function sv() {
    Ut(), 
    _w(),
    Sd = fe, 
    fe = 0, 
    Mc(), 
    document.getElementById("settings-panel").style.display = "block", 
    Ki = !0
}

function rv() {
    Ut(), fe = Sd, Mc(), document.getElementById("settings-panel").style.display = "none", Ki = !1
}

function av() {
    // bg
    Tt = typeof __woso !="undefined" && !__woso.SoundManager.isSound;

    if (Ut(), Di.style.right !== "0%" && Di.style.right !== "50%") return;
    Tt = !Tt, Di.src = Tt ? "./sprites/main_menu/ON.png" : "./sprites/main_menu/OFF.png", Tt ? Ze.play() : Ze.stop(), localStorage.setItem("music", Tt);
    const s = {
            right: Tt ? 50 : 0
        },
        e = {
            right: Tt ? 0 : 50
        };
    new Xe(s, He).to(e, 200).easing(Fe.Quadratic.InOut).onUpdate(function() {
        Di.style.right = `${s.right}%`
    }).start()
}


function ov() {

    nt = typeof __woso !="undefined" && !__woso.SoundManager.isSound;

    if (Ut(), ri.style.right !== "0%" && ri.style.right !== "50%") return;
    nt = !nt, ri.style.right = nt ? "0%" : "50%", ri.src = nt ? "./sprites/main_menu/ON.png" : "./sprites/main_menu/OFF.png", localStorage.setItem("sound", nt);
    const s = {
            right: nt ? 50 : 0
        },
        e = {
            right: nt ? 0 : 50
        };
    new Xe(s, He).to(e, 200).easing(Fe.Quadratic.InOut).onUpdate(function() {
        ri.style.right = `${s.right}%`
    }).start()
}

function lv() {
    // test
    // sv();
    //Tt
    let s = localStorage.getItem("music");
    s = (typeof __woso !="undefined" && __woso.SoundManager.isSound.toString());
    s != null && (Tt = s === "true");

    let e = localStorage.getItem("sound");
    e = (typeof __woso !="undefined" && __woso.SoundManager.isSound.toString());

    e != null && (nt = e === "true"), 
    Di = document.getElementById("music-toggle-img"), 
    ri = document.getElementById("sound-toggle-img"), 
    Di.style.right = Tt ? "0%" : "50%", 
    ri.style.right = nt ? "0%" : "50%", 
    Di.src = Tt ? "./sprites/main_menu/ON.png" : "./sprites/main_menu/OFF.png", 
    ri.src = nt ? "./sprites/main_menu/ON.png" : "./sprites/main_menu/OFF.png", 
    _l = document.getElementById("game-speed-text"), 
    Pi = document.getElementById("game-speed-number-text"), 
    xl = document.getElementById("game-speed-button-bg"), 
    yl = document.getElementById("speed-icon");
    const t = localStorage.getItem("game_speed");
    t != null && t !== "undefined" && (fe = parseInt(t, 10)), 
    Pi.textContent = `${fe}X`, 
    Pi.style.fontFamily = vt(), 
    Pi.style.color = _l.style.color = fe == 1 ? "#754107" : "#651600", 
    xl.src = fe == 1 ? "./sprites/main_menu/Speed_1X_Button.png" : "./sprites/main_menu/Speed_2X_Button.png", 
    yl.src = fe == 1 ? "./sprites/main_menu/Speed_1X_Icon.png" : "./sprites/main_menu/Speed_2X_Icon.png"
}

function cv() {
    Ut(), fe = fe === 1 ? 2 : 1, localStorage.setItem("game_speed", fe), Pi.textContent = `${fe}X`, Pi.style.fontFamily = vt(), Pi.style.color = _l.style.color = fe === 1 ? "#754107" : "#651600", xl.src = fe === 1 ? "./sprites/main_menu/Speed_1X_Button.png" : "./sprites/main_menu/Speed_2X_Button.png", yl.src = fe === 1 ? "./sprites/main_menu/Speed_1X_Icon.png" : "./sprites/main_menu/Speed_2X_Icon.png", Mc()
}
class hv {
    constructor(e, t, n, i = 100) {
        this.scene = e, this.level = n, this.particleCount = i, this.positions = new Float32Array(this.particleCount * 3), this.sizes = new Float32Array(this.particleCount), this.opacity = new Float32Array(this.particleCount), this.colors = new Float32Array(this.particleCount * 3), this.age = new Float32Array(this.particleCount), this.velocities = new Float32Array(this.particleCount * 3), this.lifetime = 0;
        const r = new jt;
        for (let o = 0; o < this.particleCount; o++) {
            this.positions[o * 3] = t.x, this.positions[o * 3 + 1] = t.y, this.positions[o * 3 + 2] = t.z;
            const l = new M((Math.random() - .5) * 3, (Math.random() - .5) * 3, (Math.random() - .5) * 3).normalize().multiplyScalar(Math.random() * 2);
            this.velocities[o * 3] = l.x * .1, this.velocities[o * 3 + 1] = l.y * .1, this.velocities[o * 3 + 2] = l.z * .1, this.sizes[o] = 10, this.opacity[o] = 1, this.age[o] = 0;
            const c = zd[this.level - 1];
            this.colors[o * 3] = c[0], this.colors[o * 3 + 1] = c[1], this.colors[o * 3 + 2] = c[2]
        }
        r.setAttribute("position", new $e(this.positions, 3)), r.setAttribute("size", new $e(this.sizes, 1)), r.setAttribute("opacity", new $e(this.opacity, 1)), r.setAttribute("color", new $e(this.colors, 3));
        const a = new yt({
            uniforms: {
                pointTexture: {
                    value: new qt().load("./textures/spark1.png")
                }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                attribute vec3 color;
                varying float vOpacity;
                varying vec3 vColor;
                void main() {
                    vOpacity = opacity;
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);  // Adjust size based on distance
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vOpacity;
                varying vec3 vColor;
                void main() {
                    gl_FragColor = vec4(vColor, vOpacity);
                    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                    if (gl_FragColor.a < 0.1) discard;
                }
            `,
            blending: br,
            depthTest: !1,
            transparent: !0
        });
        this.particles = new $a(r, a), this.scene.add(this.particles)
    }
    update() {
        const e = this.particles.geometry.attributes.position.array,
            t = this.particles.geometry.attributes.size.array,
            n = this.particles.geometry.attributes.opacity.array,
            i = this.velocities,
            r = this.age;
        for (let a = 0; a < this.particleCount; a++) e[a * 3] += i[a * 3] * fe, e[a * 3 + 1] += i[a * 3 + 1] * fe, e[a * 3 + 2] += i[a * 3 + 2] * fe, t[a] -= .5 * fe, n[a] -= .1 * fe, r[a] += .02 * fe, t[a] < 0 && (t[a] = 0), n[a] < 0 && (n[a] = 0);
        this.particles.geometry.attributes.size.needsUpdate = !0, this.particles.geometry.attributes.opacity.needsUpdate = !0, this.particles.geometry.attributes.position.needsUpdate = !0, this.lifetime += .02 * fe, this.lifetime > 2 && this.scene.remove(this.particles)
    }
}
let Na = [];
class uv {
    constructor(e, t, n, i, r, a = .6, o = 100) {
        Ve(this, "soundEffects", []);
        this.scene = e, this.particleCount = o, this.particlesIndex = 0, this.maxParticleSize = 5 + (r - 1) * 2, this.minParticleSize = 1, this.startPosition = t.clone(), this.level = r, this.target = n, this.damageAmount = i, this.currentPosition = t.clone(), this.exploded = !1, this.explosionStarted = !1, this.speed = a * fe, this.lifetime = 0;
        const l = new jt;
        this.positions = new Float32Array(this.particleCount * 3), this.sizes = new Float32Array(this.particleCount), this.opacity = new Float32Array(this.particleCount), this.colors = new Float32Array(this.particleCount * 3), this.age = new Float32Array(this.particleCount), this.velocities = new Float32Array(this.particleCount * 3), this.prepareSoundEffect();
        for (let h = 0; h < this.particleCount; h++) this.positions[h * 3] = this.startPosition.x, this.positions[h * 3 + 1] = this.startPosition.y, this.positions[h * 3 + 2] = this.startPosition.z, this.sizes[h] = 0, this.opacity[h] = 0, this.age[h] = 0;
        l.setAttribute("position", new $e(this.positions, 3)), l.setAttribute("size", new $e(this.sizes, 1)), l.setAttribute("opacity", new $e(this.opacity, 1)), l.setAttribute("color", new $e(this.colors, 3));
        const c = new yt({
            uniforms: {
                pointTexture: {
                    value: new qt().load("./textures/spark1.png")
                }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                attribute vec3 color;
                varying float vOpacity;
                varying vec3 vColor;
                void main() {
                    vOpacity = opacity;
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);  // Boyut
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vOpacity;
                varying vec3 vColor;
                void main() {
                    gl_FragColor = vec4(vColor, vOpacity);
                    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                    if (gl_FragColor.a < 0.1) discard;
                }
            `,
            blending: br,
            depthTest: !1,
            transparent: !0
        });
        this.particles = new $a(l, c), this.scene.add(this.particles), this.prevPosition = this.startPosition.clone()
    }
    prepareSoundEffect() {
        const e = ["explosion_1.wav", "explosion_2.wav", "explosion_3.wav"];
        for (let t = 0; t < e.length; t++) {
            const n = `./audio_clips/${e[t]}`;
            Jt.load(n, (function(i) {
                const r = new pn(an);
                r.setBuffer(i), r.setVolume(.3), this.soundEffects.push(r)
            }).bind(this))
        }
    }
    explode(e) {
        if (!this.exploded && (this.explosionStarted = !0, this.target.takeDamage(this.damageAmount), this.explosion = new hv(this.scene, this.currentPosition, this.level, this.particleCount), nt)) {
            const t = Math.floor(Math.random() * this.soundEffects.length);
            t < this.soundEffects.length && this.soundEffects[t].play()
        }
    }
    updateParticles(e) {
        const t = this.particles.geometry.attributes.position.array,
            n = this.particles.geometry.attributes.size.array,
            i = this.particles.geometry.attributes.opacity.array,
            r = this.particles.geometry.attributes.color.array,
            a = this.age;
        if (this.explosionStarted) {
            const o = this.velocities;
            for (let l = 0; l < this.particleCount; l++) a[l] < 1 && (t[l * 3] += o[l * 3] * .1 * fe, t[l * 3 + 1] += o[l * 3 + 1] * .1 * fe, t[l * 3 + 2] += o[l * 3 + 2] * .1 * fe), n[l] -= .1 * fe, i[l] -= .01 * fe, n[l] < 0 && (n[l] = 0), i[l] < 0 && (i[l] = 0);
            this.lifetime += .01 * fe, this.lifetime > 2 && (this.scene.remove(this.particles), Na = Na.filter(l => l !== this))
        } else {
            const o = this.currentPosition.distanceTo(this.prevPosition),
                l = Math.ceil(o * 20);
            for (let u = 0; u < l; u++) {
                const d = u / l,
                    f = (Math.random() - .5) * .1 * this.level;
                t[this.particlesIndex * 3] = _s.lerp(this.prevPosition.x, this.currentPosition.x, d) + f, t[this.particlesIndex * 3 + 1] = _s.lerp(this.prevPosition.y, this.currentPosition.y, d) + f, t[this.particlesIndex * 3 + 2] = _s.lerp(this.prevPosition.z, this.currentPosition.z, d) + f, n[this.particlesIndex] = this.maxParticleSize, i[this.particlesIndex] = 1, a[this.particlesIndex] = 0;
                const g = zd[this.level - 1];
                r[this.particlesIndex * 3] = g[0], r[this.particlesIndex * 3 + 1] = g[1], r[this.particlesIndex * 3 + 2] = g[2], this.particlesIndex = (this.particlesIndex + 1) % this.particleCount
            }
            const c = this.target.cube.position.clone();
            c.y = 1, this.currentPosition.distanceTo(c) < .4 * fe && this.explode(c);
            const h = new M().subVectors(c, this.currentPosition).normalize();
            this.prevPosition.copy(this.currentPosition), this.currentPosition.add(h.multiplyScalar(this.speed))
        }
        this.explosion && this.explosion.update();
        for (let o = 0; o < this.particleCount; o++) {
            a[o] += .05 * fe;
            const l = Math.min(1, a[o]);
            n[o] = _s.lerp(this.maxParticleSize, this.minParticleSize, l), i[o] = _s.lerp(1, 0, l)
        }
        this.particles.geometry.attributes.size.needsUpdate = !0, this.particles.geometry.attributes.opacity.needsUpdate = !0, this.particles.geometry.attributes.color.needsUpdate = !0, this.particles.geometry.attributes.position.needsUpdate = !0
    }
}

function wd(s, e, t, n, i) {
    const r = new uv(s, e, t, n, i);
    Na.push(r)
}

function dv(s) {
    Na.forEach(e => {
        e.updateParticles(s)
    })
}

function Md() {
    requestAnimationFrame(Md);
    const s = Date.now();
    dv(s)
}

function fv() {
    Md()
}
fv();

function fu(s, e) {
    if (e === zp) return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), s;
    if (e === ol || e === Hu) {
        let t = s.getIndex();
        if (t === null) {
            const a = [],
                o = s.getAttribute("position");
            if (o !== void 0) {
                for (let l = 0; l < o.count; l++) a.push(l);
                s.setIndex(a), t = s.getIndex()
            } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), s
        }
        const n = t.count - 2,
            i = [];
        if (e === ol)
            for (let a = 1; a <= n; a++) i.push(t.getX(0)), i.push(t.getX(a)), i.push(t.getX(a + 1));
        else
            for (let a = 0; a < n; a++) a % 2 === 0 ? (i.push(t.getX(a)), i.push(t.getX(a + 1)), i.push(t.getX(a + 2))) : (i.push(t.getX(a + 2)), i.push(t.getX(a + 1)), i.push(t.getX(a)));
        i.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
        const r = s.clone();
        return r.setIndex(i), r.clearGroups(), r
    } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), s
}
class Ja extends $s {
    constructor(e) {
        super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
            return new xv(t)
        }), this.register(function(t) {
            return new Ev(t)
        }), this.register(function(t) {
            return new Tv(t)
        }), this.register(function(t) {
            return new Av(t)
        }), this.register(function(t) {
            return new vv(t)
        }), this.register(function(t) {
            return new Sv(t)
        }), this.register(function(t) {
            return new wv(t)
        }), this.register(function(t) {
            return new Mv(t)
        }), this.register(function(t) {
            return new _v(t)
        }), this.register(function(t) {
            return new bv(t)
        }), this.register(function(t) {
            return new yv(t)
        }), this.register(function(t) {
            return new mv(t)
        }), this.register(function(t) {
            return new Cv(t)
        }), this.register(function(t) {
            return new Lv(t)
        })
    }
    load(e, t, n, i) {
        const r = this;
        let a;
        this.resourcePath !== "" ? a = this.resourcePath : this.path !== "" ? a = this.path : a = pl.extractUrlBase(e), this.manager.itemStart(e);
        const o = function(c) {
                i ? i(c) : console.error(c), r.manager.itemError(e), r.manager.itemEnd(e)
            },
            l = new Ka(this.manager);
        l.setPath(this.path), l.setResponseType("arraybuffer"), l.setRequestHeader(this.requestHeader), l.setWithCredentials(this.withCredentials), l.load(e, function(c) {
            try {
                r.parse(c, a, function(h) {
                    t(h), r.manager.itemEnd(e)
                }, o)
            } catch (h) {
                o(h)
            }
        }, n, o)
    }
    setDRACOLoader(e) {
        return this.dracoLoader = e, this
    }
    setDDSLoader() {
        throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')
    }
    setKTX2Loader(e) {
        return this.ktx2Loader = e, this
    }
    setMeshoptDecoder(e) {
        return this.meshoptDecoder = e, this
    }
    register(e) {
        return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this
    }
    unregister(e) {
        return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this
    }
    parse(e, t, n, i) {
        let r;
        const a = {},
            o = {},
            l = new TextDecoder;
        if (typeof e == "string") r = JSON.parse(e);
        else if (e instanceof ArrayBuffer)
            if (l.decode(new Uint8Array(e, 0, 4)) === bd) {
                try {
                    a[Ne.KHR_BINARY_GLTF] = new Iv(e)
                } catch (u) {
                    i && i(u);
                    return
                }
                r = JSON.parse(a[Ne.KHR_BINARY_GLTF].content)
            } else r = JSON.parse(l.decode(e));
        else r = e;
        if (r.asset === void 0 || r.asset.version[0] < 2) {
            i && i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
            return
        }
        const c = new Hv(r, {
            path: t || this.resourcePath || "",
            crossOrigin: this.crossOrigin,
            requestHeader: this.requestHeader,
            manager: this.manager,
            ktx2Loader: this.ktx2Loader,
            meshoptDecoder: this.meshoptDecoder
        });
        c.fileLoader.setRequestHeader(this.requestHeader);
        for (let h = 0; h < this.pluginCallbacks.length; h++) {
            const u = this.pluginCallbacks[h](c);
            o[u.name] = u, a[u.name] = !0
        }
        if (r.extensionsUsed)
            for (let h = 0; h < r.extensionsUsed.length; ++h) {
                const u = r.extensionsUsed[h],
                    d = r.extensionsRequired || [];
                switch (u) {
                    case Ne.KHR_MATERIALS_UNLIT:
                        a[u] = new gv;
                        break;
                    case Ne.KHR_DRACO_MESH_COMPRESSION:
                        a[u] = new Rv(r, this.dracoLoader);
                        break;
                    case Ne.KHR_TEXTURE_TRANSFORM:
                        a[u] = new Dv;
                        break;
                    case Ne.KHR_MESH_QUANTIZATION:
                        a[u] = new Pv;
                        break;
                    default:
                        d.indexOf(u) >= 0 && o[u] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + u + '".')
                }
            }
        c.setExtensions(a), c.setPlugins(o), c.parse(n, i)
    }
    parseAsync(e, t) {
        const n = this;
        return new Promise(function(i, r) {
            n.parse(e, t, i, r)
        })
    }
}

function pv() {
    let s = {};
    return {
        get: function(e) {
            return s[e]
        },
        add: function(e, t) {
            s[e] = t
        },
        remove: function(e) {
            delete s[e]
        },
        removeAll: function() {
            s = {}
        }
    }
}
const Ne = {
    KHR_BINARY_GLTF: "KHR_binary_glTF",
    KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
    KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
    KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
    KHR_MATERIALS_IOR: "KHR_materials_ior",
    KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
    KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
    KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
    KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
    KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
    KHR_MATERIALS_VOLUME: "KHR_materials_volume",
    KHR_TEXTURE_BASISU: "KHR_texture_basisu",
    KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
    KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
    KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
    EXT_TEXTURE_WEBP: "EXT_texture_webp",
    EXT_TEXTURE_AVIF: "EXT_texture_avif",
    EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
    EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class mv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_LIGHTS_PUNCTUAL, this.cache = {
            refs: {},
            uses: {}
        }
    }
    _markDefs() {
        const e = this.parser,
            t = this.parser.json.nodes || [];
        for (let n = 0, i = t.length; n < i; n++) {
            const r = t[n];
            r.extensions && r.extensions[this.name] && r.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, r.extensions[this.name].light)
        }
    }
    _loadLight(e) {
        const t = this.parser,
            n = "light:" + e;
        let i = t.cache.get(n);
        if (i) return i;
        const r = t.json,
            l = ((r.extensions && r.extensions[this.name] || {}).lights || [])[e];
        let c;
        const h = new pe(16777215);
        l.color !== void 0 && h.fromArray(l.color);
        const u = l.range !== void 0 ? l.range : 0;
        switch (l.type) {
            case "directional":
                c = new _d(h), c.target.position.set(0, 0, -1), c.add(c.target);
                break;
            case "point":
                c = new Py(h), c.distance = u;
                break;
            case "spot":
                c = new Ry(h), c.distance = u, l.spot = l.spot || {}, l.spot.innerConeAngle = l.spot.innerConeAngle !== void 0 ? l.spot.innerConeAngle : 0, l.spot.outerConeAngle = l.spot.outerConeAngle !== void 0 ? l.spot.outerConeAngle : Math.PI / 4, c.angle = l.spot.outerConeAngle, c.penumbra = 1 - l.spot.innerConeAngle / l.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
                break;
            default:
                throw new Error("THREE.GLTFLoader: Unexpected light type: " + l.type)
        }
        return c.position.set(0, 0, 0), c.decay = 2, ii(c, l), l.intensity !== void 0 && (c.intensity = l.intensity), c.name = t.createUniqueName(l.name || "light_" + e), i = Promise.resolve(c), t.cache.add(n, i), i
    }
    getDependency(e, t) {
        if (e === "light") return this._loadLight(t)
    }
    createNodeAttachment(e) {
        const t = this,
            n = this.parser,
            r = n.json.nodes[e],
            o = (r.extensions && r.extensions[this.name] || {}).light;
        return o === void 0 ? null : this._loadLight(o).then(function(l) {
            return n._getNodeRef(t.cache, o, l)
        })
    }
}
class gv {
    constructor() {
        this.name = Ne.KHR_MATERIALS_UNLIT
    }
    getMaterialType() {
        return Li
    }
    extendParams(e, t, n) {
        const i = [];
        e.color = new pe(1, 1, 1), e.opacity = 1;
        const r = t.pbrMetallicRoughness;
        if (r) {
            if (Array.isArray(r.baseColorFactor)) {
                const a = r.baseColorFactor;
                e.color.fromArray(a), e.opacity = a[3]
            }
            r.baseColorTexture !== void 0 && i.push(n.assignTexture(e, "map", r.baseColorTexture, Be))
        }
        return Promise.all(i)
    }
}
class _v {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_EMISSIVE_STRENGTH
    }
    extendMaterialParams(e, t) {
        const i = this.parser.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = i.extensions[this.name].emissiveStrength;
        return r !== void 0 && (t.emissiveIntensity = r), Promise.resolve()
    }
}
class xv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_CLEARCOAT
    }
    getMaterialType(e) {
        const n = this.parser.json.materials[e];
        return !n.extensions || !n.extensions[this.name] ? null : $i
    }
    extendMaterialParams(e, t) {
        const n = this.parser,
            i = n.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = [],
            a = i.extensions[this.name];
        if (a.clearcoatFactor !== void 0 && (t.clearcoat = a.clearcoatFactor), a.clearcoatTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatMap", a.clearcoatTexture)), a.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = a.clearcoatRoughnessFactor), a.clearcoatRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatRoughnessMap", a.clearcoatRoughnessTexture)), a.clearcoatNormalTexture !== void 0 && (r.push(n.assignTexture(t, "clearcoatNormalMap", a.clearcoatNormalTexture)), a.clearcoatNormalTexture.scale !== void 0)) {
            const o = a.clearcoatNormalTexture.scale;
            t.clearcoatNormalScale = new ve(o, o)
        }
        return Promise.all(r)
    }
}
class yv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_IRIDESCENCE
    }
    getMaterialType(e) {
        const n = this.parser.json.materials[e];
        return !n.extensions || !n.extensions[this.name] ? null : $i
    }
    extendMaterialParams(e, t) {
        const n = this.parser,
            i = n.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = [],
            a = i.extensions[this.name];
        return a.iridescenceFactor !== void 0 && (t.iridescence = a.iridescenceFactor), a.iridescenceTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceMap", a.iridescenceTexture)), a.iridescenceIor !== void 0 && (t.iridescenceIOR = a.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), a.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = a.iridescenceThicknessMinimum), a.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = a.iridescenceThicknessMaximum), a.iridescenceThicknessTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceThicknessMap", a.iridescenceThicknessTexture)), Promise.all(r)
    }
}
class vv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_SHEEN
    }
    getMaterialType(e) {
        const n = this.parser.json.materials[e];
        return !n.extensions || !n.extensions[this.name] ? null : $i
    }
    extendMaterialParams(e, t) {
        const n = this.parser,
            i = n.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = [];
        t.sheenColor = new pe(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
        const a = i.extensions[this.name];
        return a.sheenColorFactor !== void 0 && t.sheenColor.fromArray(a.sheenColorFactor), a.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = a.sheenRoughnessFactor), a.sheenColorTexture !== void 0 && r.push(n.assignTexture(t, "sheenColorMap", a.sheenColorTexture, Be)), a.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "sheenRoughnessMap", a.sheenRoughnessTexture)), Promise.all(r)
    }
}
class Sv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_TRANSMISSION
    }
    getMaterialType(e) {
        const n = this.parser.json.materials[e];
        return !n.extensions || !n.extensions[this.name] ? null : $i
    }
    extendMaterialParams(e, t) {
        const n = this.parser,
            i = n.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = [],
            a = i.extensions[this.name];
        return a.transmissionFactor !== void 0 && (t.transmission = a.transmissionFactor), a.transmissionTexture !== void 0 && r.push(n.assignTexture(t, "transmissionMap", a.transmissionTexture)), Promise.all(r)
    }
}
class wv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_VOLUME
    }
    getMaterialType(e) {
        const n = this.parser.json.materials[e];
        return !n.extensions || !n.extensions[this.name] ? null : $i
    }
    extendMaterialParams(e, t) {
        const n = this.parser,
            i = n.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = [],
            a = i.extensions[this.name];
        t.thickness = a.thicknessFactor !== void 0 ? a.thicknessFactor : 0, a.thicknessTexture !== void 0 && r.push(n.assignTexture(t, "thicknessMap", a.thicknessTexture)), t.attenuationDistance = a.attenuationDistance || 1 / 0;
        const o = a.attenuationColor || [1, 1, 1];
        return t.attenuationColor = new pe(o[0], o[1], o[2]), Promise.all(r)
    }
}
class Mv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_IOR
    }
    getMaterialType(e) {
        const n = this.parser.json.materials[e];
        return !n.extensions || !n.extensions[this.name] ? null : $i
    }
    extendMaterialParams(e, t) {
        const i = this.parser.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = i.extensions[this.name];
        return t.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve()
    }
}
class bv {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_MATERIALS_SPECULAR
    }
    getMaterialType(e) {
        const n = this.parser.json.materials[e];
        return !n.extensions || !n.extensions[this.name] ? null : $i
    }
    extendMaterialParams(e, t) {
        const n = this.parser,
            i = n.json.materials[e];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const r = [],
            a = i.extensions[this.name];
        t.specularIntensity = a.specularFactor !== void 0 ? a.specularFactor : 1, a.specularTexture !== void 0 && r.push(n.assignTexture(t, "specularIntensityMap", a.specularTexture));
        const o = a.specularColorFactor || [1, 1, 1];
        return t.specularColor = new pe(o[0], o[1], o[2]), a.specularColorTexture !== void 0 && r.push(n.assignTexture(t, "specularColorMap", a.specularColorTexture, Be)), Promise.all(r)
    }
}
class Ev {
    constructor(e) {
        this.parser = e, this.name = Ne.KHR_TEXTURE_BASISU
    }
    loadTexture(e) {
        const t = this.parser,
            n = t.json,
            i = n.textures[e];
        if (!i.extensions || !i.extensions[this.name]) return null;
        const r = i.extensions[this.name],
            a = t.options.ktx2Loader;
        if (!a) {
            if (n.extensionsRequired && n.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
            return null
        }
        return t.loadTextureImage(e, r.source, a)
    }
}
class Tv {
    constructor(e) {
        this.parser = e, this.name = Ne.EXT_TEXTURE_WEBP, this.isSupported = null
    }
    loadTexture(e) {
        const t = this.name,
            n = this.parser,
            i = n.json,
            r = i.textures[e];
        if (!r.extensions || !r.extensions[t]) return null;
        const a = r.extensions[t],
            o = i.images[a.source];
        let l = n.textureLoader;
        if (o.uri) {
            const c = n.options.manager.getHandler(o.uri);
            c !== null && (l = c)
        }
        return this.detectSupport().then(function(c) {
            if (c) return n.loadTextureImage(e, a.source, l);
            if (i.extensionsRequired && i.extensionsRequired.indexOf(t) >= 0) throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
            return n.loadTexture(e)
        })
    }
    detectSupport() {
        return this.isSupported || (this.isSupported = new Promise(function(e) {
            const t = new Image;
            t.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", t.onload = t.onerror = function() {
                e(t.height === 1)
            }
        })), this.isSupported
    }
}
class Av {
    constructor(e) {
        this.parser = e, this.name = Ne.EXT_TEXTURE_AVIF, this.isSupported = null
    }
    loadTexture(e) {
        const t = this.name,
            n = this.parser,
            i = n.json,
            r = i.textures[e];
        if (!r.extensions || !r.extensions[t]) return null;
        const a = r.extensions[t],
            o = i.images[a.source];
        let l = n.textureLoader;
        if (o.uri) {
            const c = n.options.manager.getHandler(o.uri);
            c !== null && (l = c)
        }
        return this.detectSupport().then(function(c) {
            if (c) return n.loadTextureImage(e, a.source, l);
            if (i.extensionsRequired && i.extensionsRequired.indexOf(t) >= 0) throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
            return n.loadTexture(e)
        })
    }
    detectSupport() {
        return this.isSupported || (this.isSupported = new Promise(function(e) {
            const t = new Image;
            t.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=", t.onload = t.onerror = function() {
                e(t.height === 1)
            }
        })), this.isSupported
    }
}
class Cv {
    constructor(e) {
        this.name = Ne.EXT_MESHOPT_COMPRESSION, this.parser = e
    }
    loadBufferView(e) {
        const t = this.parser.json,
            n = t.bufferViews[e];
        if (n.extensions && n.extensions[this.name]) {
            const i = n.extensions[this.name],
                r = this.parser.getDependency("buffer", i.buffer),
                a = this.parser.options.meshoptDecoder;
            if (!a || !a.supported) {
                if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
                return null
            }
            return r.then(function(o) {
                const l = i.byteOffset || 0,
                    c = i.byteLength || 0,
                    h = i.count,
                    u = i.byteStride,
                    d = new Uint8Array(o, l, c);
                return a.decodeGltfBufferAsync ? a.decodeGltfBufferAsync(h, u, d, i.mode, i.filter).then(function(f) {
                    return f.buffer
                }) : a.ready.then(function() {
                    const f = new ArrayBuffer(h * u);
                    return a.decodeGltfBuffer(new Uint8Array(f), h, u, d, i.mode, i.filter), f
                })
            })
        } else return null
    }
}
class Lv {
    constructor(e) {
        this.name = Ne.EXT_MESH_GPU_INSTANCING, this.parser = e
    }
    createNodeMesh(e) {
        const t = this.parser.json,
            n = t.nodes[e];
        if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0) return null;
        const i = t.meshes[n.mesh];
        for (const c of i.primitives)
            if (c.mode !== nn.TRIANGLES && c.mode !== nn.TRIANGLE_STRIP && c.mode !== nn.TRIANGLE_FAN && c.mode !== void 0) return null;
        const a = n.extensions[this.name].attributes,
            o = [],
            l = {};
        for (const c in a) o.push(this.parser.getDependency("accessor", a[c]).then(h => (l[c] = h, l[c])));
        return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then(c => {
            const h = c.pop(),
                u = h.isGroup ? h.children : [h],
                d = c[0].count,
                f = [];
            for (const g of u) {
                const m = new Te,
                    p = new M,
                    _ = new Wt,
                    E = new M(1, 1, 1),
                    y = new my(g.geometry, g.material, d);
                for (let S = 0; S < d; S++) l.TRANSLATION && p.fromBufferAttribute(l.TRANSLATION, S), l.ROTATION && _.fromBufferAttribute(l.ROTATION, S), l.SCALE && E.fromBufferAttribute(l.SCALE, S), y.setMatrixAt(S, m.compose(p, _, E));
                for (const S in l) S !== "TRANSLATION" && S !== "ROTATION" && S !== "SCALE" && g.geometry.setAttribute(S, l[S]);
                Ye.prototype.copy.call(y, g), y.frustumCulled = !1, this.parser.assignFinalMaterial(y), f.push(y)
            }
            return h.isGroup ? (h.clear(), h.add(...f), h) : f[0]
        }))
    }
}
const bd = "glTF",
    hr = 12,
    pu = {
        JSON: 1313821514,
        BIN: 5130562
    };
class Iv {
    constructor(e) {
        this.name = Ne.KHR_BINARY_GLTF, this.content = null, this.body = null;
        const t = new DataView(e, 0, hr),
            n = new TextDecoder;
        if (this.header = {
                magic: n.decode(new Uint8Array(e.slice(0, 4))),
                version: t.getUint32(4, !0),
                length: t.getUint32(8, !0)
            }, this.header.magic !== bd) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
        if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
        const i = this.header.length - hr,
            r = new DataView(e, hr);
        let a = 0;
        for (; a < i;) {
            const o = r.getUint32(a, !0);
            a += 4;
            const l = r.getUint32(a, !0);
            if (a += 4, l === pu.JSON) {
                const c = new Uint8Array(e, hr + a, o);
                this.content = n.decode(c)
            } else if (l === pu.BIN) {
                const c = hr + a;
                this.body = e.slice(c, c + o)
            }
            a += o
        }
        if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.")
    }
}
class Rv {
    constructor(e, t) {
        if (!t) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
        this.name = Ne.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload()
    }
    decodePrimitive(e, t) {
        const n = this.json,
            i = this.dracoLoader,
            r = e.extensions[this.name].bufferView,
            a = e.extensions[this.name].attributes,
            o = {},
            l = {},
            c = {};
        for (const h in a) {
            const u = vl[h] || h.toLowerCase();
            o[u] = a[h]
        }
        for (const h in e.attributes) {
            const u = vl[h] || h.toLowerCase();
            if (a[h] !== void 0) {
                const d = n.accessors[e.attributes[h]],
                    f = Cs[d.componentType];
                c[u] = f.name, l[u] = d.normalized === !0
            }
        }
        return t.getDependency("bufferView", r).then(function(h) {
            return new Promise(function(u) {
                i.decodeDracoFile(h, function(d) {
                    for (const f in d.attributes) {
                        const g = d.attributes[f],
                            m = l[f];
                        m !== void 0 && (g.normalized = m)
                    }
                    u(d)
                }, o, c)
            })
        })
    }
}
class Dv {
    constructor() {
        this.name = Ne.KHR_TEXTURE_TRANSFORM
    }
    extendTexture(e, t) {
        return t.texCoord !== void 0 && console.warn('THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.'), t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e
    }
}
class Pv {
    constructor() {
        this.name = Ne.KHR_MESH_QUANTIZATION
    }
}
class Ed extends Hr {
    constructor(e, t, n, i) {
        super(e, t, n, i)
    }
    copySampleValue_(e) {
        const t = this.resultBuffer,
            n = this.sampleValues,
            i = this.valueSize,
            r = e * i * 3 + i;
        for (let a = 0; a !== i; a++) t[a] = n[r + a];
        return t
    }
    interpolate_(e, t, n, i) {
        const r = this.resultBuffer,
            a = this.sampleValues,
            o = this.valueSize,
            l = o * 2,
            c = o * 3,
            h = i - t,
            u = (n - t) / h,
            d = u * u,
            f = d * u,
            g = e * c,
            m = g - c,
            p = -2 * f + 3 * d,
            _ = f - d,
            E = 1 - p,
            y = _ - d + u;
        for (let S = 0; S !== o; S++) {
            const T = a[m + S + o],
                L = a[m + S + l] * h,
                I = a[g + S + o],
                v = a[g + S] * h;
            r[S] = E * T + y * L + p * I + _ * v
        }
        return r
    }
}
const Nv = new Wt;
class Bv extends Ed {
    interpolate_(e, t, n, i) {
        const r = super.interpolate_(e, t, n, i);
        return Nv.fromArray(r).normalize().toArray(r), r
    }
}
const nn = {
        FLOAT: 5126,
        FLOAT_MAT3: 35675,
        FLOAT_MAT4: 35676,
        FLOAT_VEC2: 35664,
        FLOAT_VEC3: 35665,
        FLOAT_VEC4: 35666,
        LINEAR: 9729,
        REPEAT: 10497,
        SAMPLER_2D: 35678,
        POINTS: 0,
        LINES: 1,
        LINE_LOOP: 2,
        LINE_STRIP: 3,
        TRIANGLES: 4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN: 6,
        UNSIGNED_BYTE: 5121,
        UNSIGNED_SHORT: 5123
    },
    Cs = {
        5120: Int8Array,
        5121: Uint8Array,
        5122: Int16Array,
        5123: Uint16Array,
        5125: Uint32Array,
        5126: Float32Array
    },
    mu = {
        9728: gt,
        9729: Gt,
        9984: al,
        9985: zu,
        9986: Ma,
        9987: Fi
    },
    gu = {
        33071: sn,
        33648: Da,
        10497: Fs
    },
    jo = {
        SCALAR: 1,
        VEC2: 2,
        VEC3: 3,
        VEC4: 4,
        MAT2: 4,
        MAT3: 9,
        MAT4: 16
    },
    vl = {
        POSITION: "position",
        NORMAL: "normal",
        TANGENT: "tangent",
        TEXCOORD_0: "uv",
        TEXCOORD_1: "uv2",
        COLOR_0: "color",
        WEIGHTS_0: "skinWeight",
        JOINTS_0: "skinIndex"
    },
    ni = {
        scale: "scale",
        translation: "position",
        rotation: "quaternion",
        weights: "morphTargetInfluences"
    },
    Fv = {
        CUBICSPLINE: void 0,
        LINEAR: Os,
        STEP: Tr
    },
    Yo = {
        OPAQUE: "OPAQUE",
        MASK: "MASK",
        BLEND: "BLEND"
    };

function kv(s) {
    return s.DefaultMaterial === void 0 && (s.DefaultMaterial = new qs({
        color: 16777215,
        emissive: 0,
        metalness: 1,
        roughness: 1,
        transparent: !1,
        depthTest: !0,
        side: $n
    })), s.DefaultMaterial
}

function ur(s, e, t) {
    for (const n in t.extensions) s[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n])
}

function ii(s, e) {
    e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(s.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras))
}

function Ov(s, e, t) {
    let n = !1,
        i = !1,
        r = !1;
    for (let c = 0, h = e.length; c < h; c++) {
        const u = e[c];
        if (u.POSITION !== void 0 && (n = !0), u.NORMAL !== void 0 && (i = !0), u.COLOR_0 !== void 0 && (r = !0), n && i && r) break
    }
    if (!n && !i && !r) return Promise.resolve(s);
    const a = [],
        o = [],
        l = [];
    for (let c = 0, h = e.length; c < h; c++) {
        const u = e[c];
        if (n) {
            const d = u.POSITION !== void 0 ? t.getDependency("accessor", u.POSITION) : s.attributes.position;
            a.push(d)
        }
        if (i) {
            const d = u.NORMAL !== void 0 ? t.getDependency("accessor", u.NORMAL) : s.attributes.normal;
            o.push(d)
        }
        if (r) {
            const d = u.COLOR_0 !== void 0 ? t.getDependency("accessor", u.COLOR_0) : s.attributes.color;
            l.push(d)
        }
    }
    return Promise.all([Promise.all(a), Promise.all(o), Promise.all(l)]).then(function(c) {
        const h = c[0],
            u = c[1],
            d = c[2];
        return n && (s.morphAttributes.position = h), i && (s.morphAttributes.normal = u), r && (s.morphAttributes.color = d), s.morphTargetsRelative = !0, s
    })
}

function Uv(s, e) {
    if (s.updateMorphTargets(), e.weights !== void 0)
        for (let t = 0, n = e.weights.length; t < n; t++) s.morphTargetInfluences[t] = e.weights[t];
    if (e.extras && Array.isArray(e.extras.targetNames)) {
        const t = e.extras.targetNames;
        if (s.morphTargetInfluences.length === t.length) {
            s.morphTargetDictionary = {};
            for (let n = 0, i = t.length; n < i; n++) s.morphTargetDictionary[t[n]] = n
        } else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")
    }
}

function zv(s) {
    const e = s.extensions && s.extensions[Ne.KHR_DRACO_MESH_COMPRESSION];
    let t;
    return e ? t = "draco:" + e.bufferView + ":" + e.indices + ":" + _u(e.attributes) : t = s.indices + ":" + _u(s.attributes) + ":" + s.mode, t
}

function _u(s) {
    let e = "";
    const t = Object.keys(s).sort();
    for (let n = 0, i = t.length; n < i; n++) e += t[n] + ":" + s[t[n]] + ";";
    return e
}

function Sl(s) {
    switch (s) {
        case Int8Array:
            return 1 / 127;
        case Uint8Array:
            return 1 / 255;
        case Int16Array:
            return 1 / 32767;
        case Uint16Array:
            return 1 / 65535;
        default:
            throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")
    }
}

function Gv(s) {
    return s.search(/\.jpe?g($|\?)/i) > 0 || s.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : s.search(/\.webp($|\?)/i) > 0 || s.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png"
}
const Vv = new Te;
class Hv {
    constructor(e = {}, t = {}) {
        this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new pv, this.associations = new Map, this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = {
            refs: {},
            uses: {}
        }, this.cameraCache = {
            refs: {},
            uses: {}
        }, this.lightCache = {
            refs: {},
            uses: {}
        }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
        let n = !1,
            i = !1,
            r = -1;
        typeof navigator < "u" && (n = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) === !0, i = navigator.userAgent.indexOf("Firefox") > -1, r = i ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1), typeof createImageBitmap > "u" || n || i && r < 98 ? this.textureLoader = new qt(this.options.manager) : this.textureLoader = new Fy(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new Ka(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0)
    }
    setExtensions(e) {
        this.extensions = e
    }
    setPlugins(e) {
        this.plugins = e
    }
    parse(e, t) {
        const n = this,
            i = this.json,
            r = this.extensions;
        this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(a) {
            return a._markDefs && a._markDefs()
        }), Promise.all(this._invokeAll(function(a) {
            return a.beforeRoot && a.beforeRoot()
        })).then(function() {
            return Promise.all([n.getDependencies("scene"), n.getDependencies("animation"), n.getDependencies("camera")])
        }).then(function(a) {
            const o = {
                scene: a[0][i.scene || 0],
                scenes: a[0],
                animations: a[1],
                cameras: a[2],
                asset: i.asset,
                parser: n,
                userData: {}
            };
            ur(r, o, i), ii(o, i), Promise.all(n._invokeAll(function(l) {
                return l.afterRoot && l.afterRoot(o)
            })).then(function() {
                e(o)
            })
        }).catch(t)
    }
    _markDefs() {
        const e = this.json.nodes || [],
            t = this.json.skins || [],
            n = this.json.meshes || [];
        for (let i = 0, r = t.length; i < r; i++) {
            const a = t[i].joints;
            for (let o = 0, l = a.length; o < l; o++) e[a[o]].isBone = !0
        }
        for (let i = 0, r = e.length; i < r; i++) {
            const a = e[i];
            a.mesh !== void 0 && (this._addNodeRef(this.meshCache, a.mesh), a.skin !== void 0 && (n[a.mesh].isSkinnedMesh = !0)), a.camera !== void 0 && this._addNodeRef(this.cameraCache, a.camera)
        }
    }
    _addNodeRef(e, t) {
        t !== void 0 && (e.refs[t] === void 0 && (e.refs[t] = e.uses[t] = 0), e.refs[t]++)
    }
    _getNodeRef(e, t, n) {
        if (e.refs[t] <= 1) return n;
        const i = n.clone(),
            r = (a, o) => {
                const l = this.associations.get(a);
                l != null && this.associations.set(o, l);
                for (const [c, h] of a.children.entries()) r(h, o.children[c])
            };
        return r(n, i), i.name += "_instance_" + e.uses[t]++, i
    }
    _invokeOne(e) {
        const t = Object.values(this.plugins);
        t.push(this);
        for (let n = 0; n < t.length; n++) {
            const i = e(t[n]);
            if (i) return i
        }
        return null
    }
    _invokeAll(e) {
        const t = Object.values(this.plugins);
        t.unshift(this);
        const n = [];
        for (let i = 0; i < t.length; i++) {
            const r = e(t[i]);
            r && n.push(r)
        }
        return n
    }
    getDependency(e, t) {
        const n = e + ":" + t;
        let i = this.cache.get(n);
        if (!i) {
            switch (e) {
                case "scene":
                    i = this.loadScene(t);
                    break;
                case "node":
                    i = this._invokeOne(function(r) {
                        return r.loadNode && r.loadNode(t)
                    });
                    break;
                case "mesh":
                    i = this._invokeOne(function(r) {
                        return r.loadMesh && r.loadMesh(t)
                    });
                    break;
                case "accessor":
                    i = this.loadAccessor(t);
                    break;
                case "bufferView":
                    i = this._invokeOne(function(r) {
                        return r.loadBufferView && r.loadBufferView(t)
                    });
                    break;
                case "buffer":
                    i = this.loadBuffer(t);
                    break;
                case "material":
                    i = this._invokeOne(function(r) {
                        return r.loadMaterial && r.loadMaterial(t)
                    });
                    break;
                case "texture":
                    i = this._invokeOne(function(r) {
                        return r.loadTexture && r.loadTexture(t)
                    });
                    break;
                case "skin":
                    i = this.loadSkin(t);
                    break;
                case "animation":
                    i = this._invokeOne(function(r) {
                        return r.loadAnimation && r.loadAnimation(t)
                    });
                    break;
                case "camera":
                    i = this.loadCamera(t);
                    break;
                default:
                    if (i = this._invokeOne(function(r) {
                            return r != this && r.getDependency && r.getDependency(e, t)
                        }), !i) throw new Error("Unknown type: " + e);
                    break
            }
            this.cache.add(n, i)
        }
        return i
    }
    getDependencies(e) {
        let t = this.cache.get(e);
        if (!t) {
            const n = this,
                i = this.json[e + (e === "mesh" ? "es" : "s")] || [];
            t = Promise.all(i.map(function(r, a) {
                return n.getDependency(e, a)
            })), this.cache.add(e, t)
        }
        return t
    }
    loadBuffer(e) {
        const t = this.json.buffers[e],
            n = this.fileLoader;
        if (t.type && t.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + t.type + " buffer type is not supported.");
        if (t.uri === void 0 && e === 0) return Promise.resolve(this.extensions[Ne.KHR_BINARY_GLTF].body);
        const i = this.options;
        return new Promise(function(r, a) {
            n.load(pl.resolveURL(t.uri, i.path), r, void 0, function() {
                a(new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'))
            })
        })
    }
    loadBufferView(e) {
        const t = this.json.bufferViews[e];
        return this.getDependency("buffer", t.buffer).then(function(n) {
            const i = t.byteLength || 0,
                r = t.byteOffset || 0;
            return n.slice(r, r + i)
        })
    }
    loadAccessor(e) {
        const t = this,
            n = this.json,
            i = this.json.accessors[e];
        if (i.bufferView === void 0 && i.sparse === void 0) {
            const a = jo[i.type],
                o = Cs[i.componentType],
                l = i.normalized === !0,
                c = new o(i.count * a);
            return Promise.resolve(new $e(c, a, l))
        }
        const r = [];
        return i.bufferView !== void 0 ? r.push(this.getDependency("bufferView", i.bufferView)) : r.push(null), i.sparse !== void 0 && (r.push(this.getDependency("bufferView", i.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", i.sparse.values.bufferView))), Promise.all(r).then(function(a) {
            const o = a[0],
                l = jo[i.type],
                c = Cs[i.componentType],
                h = c.BYTES_PER_ELEMENT,
                u = h * l,
                d = i.byteOffset || 0,
                f = i.bufferView !== void 0 ? n.bufferViews[i.bufferView].byteStride : void 0,
                g = i.normalized === !0;
            let m, p;
            if (f && f !== u) {
                const _ = Math.floor(d / f),
                    E = "InterleavedBuffer:" + i.bufferView + ":" + i.componentType + ":" + _ + ":" + i.count;
                let y = t.cache.get(E);
                y || (m = new c(o, _ * f, i.count * f / h), y = new ld(m, f / h), t.cache.add(E, y)), p = new Ir(y, l, d % f / h, g)
            } else o === null ? m = new c(i.count * l) : m = new c(o, d, i.count * l), p = new $e(m, l, g);
            if (i.sparse !== void 0) {
                const _ = jo.SCALAR,
                    E = Cs[i.sparse.indices.componentType],
                    y = i.sparse.indices.byteOffset || 0,
                    S = i.sparse.values.byteOffset || 0,
                    T = new E(a[1], y, i.sparse.count * _),
                    L = new c(a[2], S, i.sparse.count * l);
                o !== null && (p = new $e(p.array.slice(), p.itemSize, p.normalized));
                for (let I = 0, v = T.length; I < v; I++) {
                    const A = T[I];
                    if (p.setX(A, L[I * l]), l >= 2 && p.setY(A, L[I * l + 1]), l >= 3 && p.setZ(A, L[I * l + 2]), l >= 4 && p.setW(A, L[I * l + 3]), l >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")
                }
            }
            return p
        })
    }
    loadTexture(e) {
        const t = this.json,
            n = this.options,
            r = t.textures[e].source,
            a = t.images[r];
        let o = this.textureLoader;
        if (a.uri) {
            const l = n.manager.getHandler(a.uri);
            l !== null && (o = l)
        }
        return this.loadTextureImage(e, r, o)
    }
    loadTextureImage(e, t, n) {
        const i = this,
            r = this.json,
            a = r.textures[e],
            o = r.images[t],
            l = (o.uri || o.bufferView) + ":" + a.sampler;
        if (this.textureCache[l]) return this.textureCache[l];
        const c = this.loadImageSource(t, n).then(function(h) {
            h.flipY = !1, h.name = a.name || o.name || "";
            const d = (r.samplers || {})[a.sampler] || {};
            return h.magFilter = mu[d.magFilter] || Gt, h.minFilter = mu[d.minFilter] || Fi, h.wrapS = gu[d.wrapS] || Fs, h.wrapT = gu[d.wrapT] || Fs, i.associations.set(h, {
                textures: e
            }), h
        }).catch(function() {
            return null
        });
        return this.textureCache[l] = c, c
    }
    loadImageSource(e, t) {
        const n = this,
            i = this.json,
            r = this.options;
        if (this.sourceCache[e] !== void 0) return this.sourceCache[e].then(u => u.clone());
        const a = i.images[e],
            o = self.URL || self.webkitURL;
        let l = a.uri || "",
            c = !1;
        if (a.bufferView !== void 0) l = n.getDependency("bufferView", a.bufferView).then(function(u) {
            c = !0;
            const d = new Blob([u], {
                type: a.mimeType
            });
            return l = o.createObjectURL(d), l
        });
        else if (a.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
        const h = Promise.resolve(l).then(function(u) {
            return new Promise(function(d, f) {
                let g = d;
                t.isImageBitmapLoader === !0 && (g = function(m) {
                    const p = new wt(m);
                    p.needsUpdate = !0, d(p)
                }), t.load(pl.resolveURL(u, r.path), g, void 0, f)
            })
        }).then(function(u) {
            return c === !0 && o.revokeObjectURL(l), u.userData.mimeType = a.mimeType || Gv(a.uri), u
        }).catch(function(u) {
            throw console.error("THREE.GLTFLoader: Couldn't load texture", l), u
        });
        return this.sourceCache[e] = h, h
    }
    assignTexture(e, t, n, i) {
        const r = this;
        return this.getDependency("texture", n.index).then(function(a) {
            if (!a) return null;
            if (n.texCoord !== void 0 && n.texCoord != 0 && !(t === "aoMap" && n.texCoord == 1) && console.warn("THREE.GLTFLoader: Custom UV set " + n.texCoord + " for texture " + t + " not yet supported."), r.extensions[Ne.KHR_TEXTURE_TRANSFORM]) {
                const o = n.extensions !== void 0 ? n.extensions[Ne.KHR_TEXTURE_TRANSFORM] : void 0;
                if (o) {
                    const l = r.associations.get(a);
                    a = r.extensions[Ne.KHR_TEXTURE_TRANSFORM].extendTexture(a, o), r.associations.set(a, l)
                }
            }
            return i !== void 0 && (a.encoding = i), e[t] = a, a
        })
    }
    assignFinalMaterial(e) {
        const t = e.geometry;
        let n = e.material;
        const i = t.attributes.tangent === void 0,
            r = t.attributes.color !== void 0,
            a = t.attributes.normal === void 0;
        if (e.isPoints) {
            const o = "PointsMaterial:" + n.uuid;
            let l = this.cache.get(o);
            l || (l = new nc, ln.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, l.sizeAttenuation = !1, this.cache.add(o, l)), n = l
        } else if (e.isLine) {
            const o = "LineBasicMaterial:" + n.uuid;
            let l = this.cache.get(o);
            l || (l = new dd, ln.prototype.copy.call(l, n), l.color.copy(n.color), this.cache.add(o, l)), n = l
        }
        if (i || r || a) {
            let o = "ClonedMaterial:" + n.uuid + ":";
            i && (o += "derivative-tangents:"), r && (o += "vertex-colors:"), a && (o += "flat-shading:");
            let l = this.cache.get(o);
            l || (l = n.clone(), r && (l.vertexColors = !0), a && (l.flatShading = !0), i && (l.normalScale && (l.normalScale.y *= -1), l.clearcoatNormalScale && (l.clearcoatNormalScale.y *= -1)), this.cache.add(o, l), this.associations.set(l, this.associations.get(n))), n = l
        }
        n.aoMap && t.attributes.uv2 === void 0 && t.attributes.uv !== void 0 && t.setAttribute("uv2", t.attributes.uv), e.material = n
    }
    getMaterialType() {
        return qs
    }
    loadMaterial(e) {
        const t = this,
            n = this.json,
            i = this.extensions,
            r = n.materials[e];
        let a;
        const o = {},
            l = r.extensions || {},
            c = [];
        if (l[Ne.KHR_MATERIALS_UNLIT]) {
            const u = i[Ne.KHR_MATERIALS_UNLIT];
            a = u.getMaterialType(), c.push(u.extendParams(o, r, t))
        } else {
            const u = r.pbrMetallicRoughness || {};
            if (o.color = new pe(1, 1, 1), o.opacity = 1, Array.isArray(u.baseColorFactor)) {
                const d = u.baseColorFactor;
                o.color.fromArray(d), o.opacity = d[3]
            }
            u.baseColorTexture !== void 0 && c.push(t.assignTexture(o, "map", u.baseColorTexture, Be)), o.metalness = u.metallicFactor !== void 0 ? u.metallicFactor : 1, o.roughness = u.roughnessFactor !== void 0 ? u.roughnessFactor : 1, u.metallicRoughnessTexture !== void 0 && (c.push(t.assignTexture(o, "metalnessMap", u.metallicRoughnessTexture)), c.push(t.assignTexture(o, "roughnessMap", u.metallicRoughnessTexture))), a = this._invokeOne(function(d) {
                return d.getMaterialType && d.getMaterialType(e)
            }), c.push(Promise.all(this._invokeAll(function(d) {
                return d.extendMaterialParams && d.extendMaterialParams(e, o)
            })))
        }
        r.doubleSided === !0 && (o.side = Ln);
        const h = r.alphaMode || Yo.OPAQUE;
        if (h === Yo.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, h === Yo.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : .5)), r.normalTexture !== void 0 && a !== Li && (c.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new ve(1, 1), r.normalTexture.scale !== void 0)) {
            const u = r.normalTexture.scale;
            o.normalScale.set(u, u)
        }
        return r.occlusionTexture !== void 0 && a !== Li && (c.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && a !== Li && (o.emissive = new pe().fromArray(r.emissiveFactor)), r.emissiveTexture !== void 0 && a !== Li && c.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, Be)), Promise.all(c).then(function() {
            const u = new a(o);
            return r.name && (u.name = r.name), ii(u, r), t.associations.set(u, {
                materials: e
            }), r.extensions && ur(i, u, r), u
        })
    }
    createUniqueName(e) {
        const t = Ge.sanitizeNodeName(e || "");
        let n = t;
        for (let i = 1; this.nodeNamesUsed[n]; ++i) n = t + "_" + i;
        return this.nodeNamesUsed[n] = !0, n
    }
    loadGeometries(e) {
        const t = this,
            n = this.extensions,
            i = this.primitiveCache;

        function r(o) {
            return n[Ne.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(l) {
                return xu(l, o, t)
            })
        }
        const a = [];
        for (let o = 0, l = e.length; o < l; o++) {
            const c = e[o],
                h = zv(c),
                u = i[h];
            if (u) a.push(u.promise);
            else {
                let d;
                c.extensions && c.extensions[Ne.KHR_DRACO_MESH_COMPRESSION] ? d = r(c) : d = xu(new jt, c, t), i[h] = {
                    primitive: c,
                    promise: d
                }, a.push(d)
            }
        }
        return Promise.all(a)
    }
    loadMesh(e) {
        const t = this,
            n = this.json,
            i = this.extensions,
            r = n.meshes[e],
            a = r.primitives,
            o = [];
        for (let l = 0, c = a.length; l < c; l++) {
            const h = a[l].material === void 0 ? kv(this.cache) : this.getDependency("material", a[l].material);
            o.push(h)
        }
        return o.push(t.loadGeometries(a)), Promise.all(o).then(function(l) {
            const c = l.slice(0, l.length - 1),
                h = l[l.length - 1],
                u = [];
            for (let f = 0, g = h.length; f < g; f++) {
                const m = h[f],
                    p = a[f];
                let _;
                const E = c[f];
                if (p.mode === nn.TRIANGLES || p.mode === nn.TRIANGLE_STRIP || p.mode === nn.TRIANGLE_FAN || p.mode === void 0) _ = r.isSkinnedMesh === !0 ? new dy(m, E) : new ct(m, E), _.isSkinnedMesh === !0 && _.normalizeSkinWeights(), p.mode === nn.TRIANGLE_STRIP ? _.geometry = fu(_.geometry, Hu) : p.mode === nn.TRIANGLE_FAN && (_.geometry = fu(_.geometry, ol));
                else if (p.mode === nn.LINES) _ = new gy(m, E);
                else if (p.mode === nn.LINE_STRIP) _ = new tc(m, E);
                else if (p.mode === nn.LINE_LOOP) _ = new _y(m, E);
                else if (p.mode === nn.POINTS) _ = new $a(m, E);
                else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + p.mode);
                Object.keys(_.geometry.morphAttributes).length > 0 && Uv(_, r), _.name = t.createUniqueName(r.name || "mesh_" + e), ii(_, r), p.extensions && ur(i, _, p), t.assignFinalMaterial(_), u.push(_)
            }
            for (let f = 0, g = u.length; f < g; f++) t.associations.set(u[f], {
                meshes: e,
                primitives: f
            });
            if (u.length === 1) return u[0];
            const d = new Ii;
            t.associations.set(d, {
                meshes: e
            });
            for (let f = 0, g = u.length; f < g; f++) d.add(u[f]);
            return d
        })
    }
    loadCamera(e) {
        let t;
        const n = this.json.cameras[e],
            i = n[n.type];
        if (!i) {
            console.warn("THREE.GLTFLoader: Missing camera parameters.");
            return
        }
        return n.type === "perspective" ? t = new Bt(_s.radToDeg(i.yfov), i.aspectRatio || 1, i.znear || 1, i.zfar || 2e6) : n.type === "orthographic" && (t = new Kl(-i.xmag, i.xmag, i.ymag, -i.ymag, i.znear, i.zfar)), n.name && (t.name = this.createUniqueName(n.name)), ii(t, n), Promise.resolve(t)
    }
    loadSkin(e) {
        const t = this.json.skins[e],
            n = [];
        for (let i = 0, r = t.joints.length; i < r; i++) n.push(this._loadNodeShallow(t.joints[i]));
        return t.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", t.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(i) {
            const r = i.pop(),
                a = i,
                o = [],
                l = [];
            for (let c = 0, h = a.length; c < h; c++) {
                const u = a[c];
                if (u) {
                    o.push(u);
                    const d = new Te;
                    r !== null && d.fromArray(r.array, c * 16), l.push(d)
                } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[c])
            }
            return new ec(o, l)
        })
    }
    loadAnimation(e) {
        const n = this.json.animations[e],
            i = [],
            r = [],
            a = [],
            o = [],
            l = [];
        for (let c = 0, h = n.channels.length; c < h; c++) {
            const u = n.channels[c],
                d = n.samplers[u.sampler],
                f = u.target,
                g = f.node,
                m = n.parameters !== void 0 ? n.parameters[d.input] : d.input,
                p = n.parameters !== void 0 ? n.parameters[d.output] : d.output;
            i.push(this.getDependency("node", g)), r.push(this.getDependency("accessor", m)), a.push(this.getDependency("accessor", p)), o.push(d), l.push(f)
        }
        return Promise.all([Promise.all(i), Promise.all(r), Promise.all(a), Promise.all(o), Promise.all(l)]).then(function(c) {
            const h = c[0],
                u = c[1],
                d = c[2],
                f = c[3],
                g = c[4],
                m = [];
            for (let _ = 0, E = h.length; _ < E; _++) {
                const y = h[_],
                    S = u[_],
                    T = d[_],
                    L = f[_],
                    I = g[_];
                if (y === void 0) continue;
                y.updateMatrix();
                let v;
                switch (ni[I.path]) {
                    case ni.weights:
                        v = Rr;
                        break;
                    case ni.rotation:
                        v = zi;
                        break;
                    case ni.position:
                    case ni.scale:
                    default:
                        v = Dr;
                        break
                }
                const A = y.name ? y.name : y.uuid,
                    P = L.interpolation !== void 0 ? Fv[L.interpolation] : Os,
                    q = [];
                ni[I.path] === ni.weights ? y.traverse(function(F) {
                    F.morphTargetInfluences && q.push(F.name ? F.name : F.uuid)
                }) : q.push(A);
                let X = T.array;
                if (T.normalized) {
                    const F = Sl(X.constructor),
                        D = new Float32Array(X.length);
                    for (let U = 0, j = X.length; U < j; U++) D[U] = X[U] * F;
                    X = D
                }
                for (let F = 0, D = q.length; F < D; F++) {
                    const U = new v(q[F] + "." + ni[I.path], S.array, X, P);
                    L.interpolation === "CUBICSPLINE" && (U.createInterpolant = function(Z) {
                        const H = this instanceof zi ? Bv : Ed;
                        return new H(this.times, this.values, this.getValueSize() / 3, Z)
                    }, U.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0), m.push(U)
                }
            }
            const p = n.name ? n.name : "animation_" + e;
            return new fl(p, void 0, m)
        })
    }
    createNodeMesh(e) {
        const t = this.json,
            n = this,
            i = t.nodes[e];
        return i.mesh === void 0 ? null : n.getDependency("mesh", i.mesh).then(function(r) {
            const a = n._getNodeRef(n.meshCache, i.mesh, r);
            return i.weights !== void 0 && a.traverse(function(o) {
                if (o.isMesh)
                    for (let l = 0, c = i.weights.length; l < c; l++) o.morphTargetInfluences[l] = i.weights[l]
            }), a
        })
    }
    loadNode(e) {
        const t = this.json,
            n = this,
            i = t.nodes[e],
            r = n._loadNodeShallow(e),
            a = [],
            o = i.children || [];
        for (let c = 0, h = o.length; c < h; c++) a.push(n.getDependency("node", o[c]));
        const l = i.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", i.skin);
        return Promise.all([r, Promise.all(a), l]).then(function(c) {
            const h = c[0],
                u = c[1],
                d = c[2];
            d !== null && h.traverse(function(f) {
                f.isSkinnedMesh && f.bind(d, Vv)
            });
            for (let f = 0, g = u.length; f < g; f++) h.add(u[f]);
            return h
        })
    }
    _loadNodeShallow(e) {
        const t = this.json,
            n = this.extensions,
            i = this;
        if (this.nodeCache[e] !== void 0) return this.nodeCache[e];
        const r = t.nodes[e],
            a = r.name ? i.createUniqueName(r.name) : "",
            o = [],
            l = i._invokeOne(function(c) {
                return c.createNodeMesh && c.createNodeMesh(e)
            });
        return l && o.push(l), r.camera !== void 0 && o.push(i.getDependency("camera", r.camera).then(function(c) {
            return i._getNodeRef(i.cameraCache, r.camera, c)
        })), i._invokeAll(function(c) {
            return c.createNodeAttachment && c.createNodeAttachment(e)
        }).forEach(function(c) {
            o.push(c)
        }), this.nodeCache[e] = Promise.all(o).then(function(c) {
            let h;
            if (r.isBone === !0 ? h = new hd : c.length > 1 ? h = new Ii : c.length === 1 ? h = c[0] : h = new Ye, h !== c[0])
                for (let u = 0, d = c.length; u < d; u++) h.add(c[u]);
            if (r.name && (h.userData.name = r.name, h.name = a), ii(h, r), r.extensions && ur(n, h, r), r.matrix !== void 0) {
                const u = new Te;
                u.fromArray(r.matrix), h.applyMatrix4(u)
            } else r.translation !== void 0 && h.position.fromArray(r.translation), r.rotation !== void 0 && h.quaternion.fromArray(r.rotation), r.scale !== void 0 && h.scale.fromArray(r.scale);
            return i.associations.has(h) || i.associations.set(h, {}), i.associations.get(h).nodes = e, h
        }), this.nodeCache[e]
    }
    loadScene(e) {
        const t = this.extensions,
            n = this.json.scenes[e],
            i = this,
            r = new Ii;
        n.name && (r.name = i.createUniqueName(n.name)), ii(r, n), n.extensions && ur(t, r, n);
        const a = n.nodes || [],
            o = [];
        for (let l = 0, c = a.length; l < c; l++) o.push(i.getDependency("node", a[l]));
        return Promise.all(o).then(function(l) {
            for (let h = 0, u = l.length; h < u; h++) r.add(l[h]);
            const c = h => {
                const u = new Map;
                for (const [d, f] of i.associations)(d instanceof ln || d instanceof wt) && u.set(d, f);
                return h.traverse(d => {
                    const f = i.associations.get(d);
                    f != null && u.set(d, f)
                }), u
            };
            return i.associations = c(r), r
        })
    }
}

function Wv(s, e, t) {
    const n = e.attributes,
        i = new Rn;
    if (n.POSITION !== void 0) {
        const o = t.json.accessors[n.POSITION],
            l = o.min,
            c = o.max;
        if (l !== void 0 && c !== void 0) {
            if (i.set(new M(l[0], l[1], l[2]), new M(c[0], c[1], c[2])), o.normalized) {
                const h = Sl(Cs[o.componentType]);
                i.min.multiplyScalar(h), i.max.multiplyScalar(h)
            }
        } else {
            console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
            return
        }
    } else return;
    const r = e.targets;
    if (r !== void 0) {
        const o = new M,
            l = new M;
        for (let c = 0, h = r.length; c < h; c++) {
            const u = r[c];
            if (u.POSITION !== void 0) {
                const d = t.json.accessors[u.POSITION],
                    f = d.min,
                    g = d.max;
                if (f !== void 0 && g !== void 0) {
                    if (l.setX(Math.max(Math.abs(f[0]), Math.abs(g[0]))), l.setY(Math.max(Math.abs(f[1]), Math.abs(g[1]))), l.setZ(Math.max(Math.abs(f[2]), Math.abs(g[2]))), d.normalized) {
                        const m = Sl(Cs[d.componentType]);
                        l.multiplyScalar(m)
                    }
                    o.max(l)
                } else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")
            }
        }
        i.expandByVector(o)
    }
    s.boundingBox = i;
    const a = new Ws;
    i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, s.boundingSphere = a
}

function xu(s, e, t) {
    const n = e.attributes,
        i = [];

    function r(a, o) {
        return t.getDependency("accessor", a).then(function(l) {
            s.setAttribute(o, l)
        })
    }
    for (const a in n) {
        const o = vl[a] || a.toLowerCase();
        o in s.attributes || i.push(r(n[a], o))
    }
    if (e.indices !== void 0 && !s.index) {
        const a = t.getDependency("accessor", e.indices).then(function(o) {
            s.setIndex(o)
        });
        i.push(a)
    }
    return ii(s, e), Wv(s, e, t), Promise.all(i).then(function() {
        return e.targets !== void 0 ? Ov(s, e.targets, t) : s
    })
}
const Xv = new Ja;
class Td {
    constructor(e, t, n, i) {
        this.speed = 20, this.hitRange = 1, this.target = null, this.moving = !1, this.owner = e, this.model = null, this.rightHand = e.rightHand;
        const r = Fr[n - 1],
            a = this;
        Xv.load(`models/${r}/scene.gltf`, (function(o) {
            const l = o;
            o.scene.traverse(c => {
                c.castShadow = !0, c.layers.set(1)
            }), l.scene.position.set(0, 2, 0), l.scene.scale.set(1, 1, 1), l.userData.name = `Arrow ${n}`, this.model = l.scene, Ue.add(this.model), this.model.scale.set(0, 0, 0), this.animate(a)
        }).bind(this))
    }
    shoot(e) {
        this.moving = !0, this.target = e, this.model.position.copy(this.owner.rightHand.getWorldPosition(new M)), this.model.quaternion.copy(this.owner.rightHand.getWorldQuaternion(new Wt)), this.model.scale.set(1, 1, 1)
    }
    moveTowards() {
        const e = this.target.cube.position.x - this.model.position.x,
            t = this.target.cube.position.z - this.model.position.z,
            n = Math.sqrt(e * e + t * t);
        if (n > this.hitRange) {
            if (this.target.isDying) {
                this.moving = !1, this.target = null;
                return
            }
            this.model.position.x += e / n * this.speed * mi, this.model.position.z += t / n * this.speed * mi, this.model.lookAt(this.target.cube.position)
        } else this.target.takeDamage(this.owner.attackPower), this.moving = !1, this.target = null, this.model.scale.set(0, 0, 0)
    }
    destroyArrow() {
        Ue.remove(this.model), so(this.model)
    }
    animate(e) {
        this.moving ? this.moveTowards() : (this.model.position.copy(this.owner.rightHand.getWorldPosition(new M)), this.model.quaternion.copy(this.owner.rightHand.getWorldQuaternion(new Wt))), requestAnimationFrame(() => this.animate(e))
    }
}
const qv = new Ja,
    Qa = [],
    Ad = [],
    jv = new Wr;
let Cd, Ld;
$v();
class Yv {
    constructor(e, t, n, i, r, a) {
        Ve(this, "beingDragged", !1);
        Ve(this, "mixer", null);
        Ve(this, "boundingBox", new Rn(new M, new M));
        Ve(this, "speed", 4);
        Ve(this, "attackRange", 1.7);
        Ve(this, "animations", []);
        Ve(this, "isDying", !1);
        Ve(this, "canAttack", !0);
        Ve(this, "damageGiven", !1);
        Ve(this, "rightHand", null);
        Ve(this, "damageEffectActive", !1);
        Ve(this, "soundEffects", []);
        Ve(this, "deathTimeOutId", null);
        if (n === -1) return;
        this.characterInfo = r, this.soldierType = i, this.arrow = null, this.newCharacterUnlocked = a, this.model = null, this.target = null, this.spawnPosIndex = n, this.position = e, this.attackPower = i === "M" ? 5 + ef[t - 1] : 5 + tf[t - 1], this.maxHealth = i === "M" ? Jd[t - 1] : Qd[t - 1], this.health = this.maxHealth, this.characterLevel = t;
        const o = new Yi(1.5, 2, 1.5);
        this.boundingBox = o.boundingBox;
        const l = new qs({
            color: 6526446
        });
        this.cube = new ct(o, l), this.cube.layers.set(2), this.cube.position.set(e.x, 0, e.z), this.cube.rotation.y += Math.PI, l.transparent = !0, l.opacity = 0, this.cube.userData.draggable = !0, this.cube.userData.beingDragged = !1, this.cube.userData.playerCharacter = !0, this.cube.userData.level = t, this.cube.userData.name = "Cube" + t, this.cube.userData.spawnPosIndex = n, kt[n] = !1, Ue.add(this.cube), this.prepareSoundEffect(), this.boundingBox = new Rn(new M, new M), this.boundingBox.setFromObject(this.cube), this.arrangeRadialHealthBarMaterials(), Ad.push(this);
        const c = this,
            h = i === "M" ? qr[this.characterLevel - 1] : jr[this.characterLevel - 1];
        Is(!1), qv.load(`models/${h}/scene.gltf`, (function(u) {
            Rs();
            const d = u;
            this.model = d.scene, u.scene.traverse(g => {
                if (g.receiveShadow = !0, g.castShadow = !0, g.layers.set(1), g.name === "muzzle" && g.scale.set(0, 0, 0), g.isMesh) {
                    const m = g.material;
                    g.material.color.copy(new pe(16777215));
                    const p = new sc({
                        color: m.color,
                        map: m.map,
                        normalMap: m.normalMap,
                        gradientMap: null
                    });
                    g.material = p
                }
            }), c.cube.add(d.scene), d.scene.scale.set(1, 1, 1), d.userData.name = "Player Character", c.cube.add(d.scene), d.scene.position.set(0, 0, 0), c.createCharacterIcon(), c.createHealthBar(), c.cube.updateMatrixWorld(!0), c.boundingBox.setFromObject(c.cube), c.mixer = new yd(d.scene), c.mixer.clipAction(d.animations[2]).play(), c.animations = d.animations, Qa.push(c.mixer), this.rightHand = d.scene.getObjectByName("mixamorigRightHandIndex1"), this.soldierType === "R" && this.createArrow(), this.newCharacterUnlocked && (mc.style.display = "block"), ew(this, this.newCharacterUnlocked), df(!0)
        }).bind(this))
    }
    healthBarFollow() {
        this.healthBar === null || this.healthBar === void 0 || (this.healthBar.position.set(this.cube.position.x, this.cube.position.y + 2.5, this.cube.position.z), this.healthBarBG.position.set(this.cube.position.x, this.cube.position.y + 2.5, this.cube.position.z), this.healthBar.rotation.set(We.rotation.x, 0, 0), this.healthBarBG.rotation.set(We.rotation.x, 0, 0))
    }
    prepareSoundEffect() {
        const e = ["melee_hit_1.mp3"],
            t = ["shoot_1.wav", "shoot_2.wav", "shoot_3.wav", "shoot_4.wav"],
            n = this.soldierType === "M" ? e : t;
        for (let r = 0; r < n.length; r++) {
            const a = `./audio_clips/${n[r]}`;
            Jt.load(a, (function(o) {
                const l = new pn(an);
                l.setBuffer(o), l.setVolume(.3), this.soundEffects.push(l)
            }).bind(this))
        }
        Jt.load("./audio_clips/death.mp3", (function(r) {
            this.deathSoundEffect = new pn(an), this.deathSoundEffect.setBuffer(r), this.deathSoundEffect.setVolume(.3)
        }).bind(this))
    }
    shoot(e, t) {
        if (this.arrow != null) this.arrow.shoot(e);
        else {
            const n = Fr[this.characterLevel - 1],
                [i, r] = n.split("-");
            if (r != null && r === "particle") {
                const a = new M;
                this.cube.getWorldDirection(a);
                const o = new M().copy(this.cube.position).add(a.multiplyScalar(1));
                if (o.y = 1, wd(Ue, o, this.target, this.attackPower, this.characterLevel), nt) {
                    const l = Math.floor(Math.random() * this.soundEffects.length);
                    this.soundEffects[l].play()
                }
            }
        }
    }
    startCombat() {
        this.healthBarMesh.scale.set(1, 1, 1), this.healthBarBGMesh.scale.set(1, 1, 1), Ue.add(this.characterIcon), Ec(this.characterIcon)
    }
    createArrow() {
        if (this.soldierType !== "R") return;
        const e = Fr[this.characterLevel - 1],
            [t, n] = e.split("-");
        n != null && n === "particle" || this.arrow === null && (this.arrow = new Td(this, null, this.characterLevel))
    }
    arrangeRadialHealthBarMaterials() {
        const e = new qt().load("./sprites/health_bar/green_progress_radial.png");
        this.healthBarMaterial = new yt({
            uniforms: {
                health: {
                    value: 1
                },
                color: {
                    value: new pe(0)
                },
                tex: {
                    value: e
                }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float health;
              uniform sampler2D tex;
              uniform vec3 color;
              varying vec2 vUv;
        
              void main() {
                // Texture'ı al
                vec4 texColor = texture2D(tex, vUv);
                
                // Merkezden olan uzaklığı hesapla
                float dist = distance(vUv, vec2(0.5, 0.5));
        
                // Daire içine sağlık yüzdesine göre çiz
                if (dist < 0.5) {
                  float angle = atan(vUv.y - 0.5, vUv.x - 0.5) + 3.141592653589793;
                  float healthAngle = 6.28318530718 * health; // 2 * Pi * health
                  
                  if (angle < healthAngle) {
                    gl_FragColor = texColor;  // Sağlık olan alan: texture ile boyanacak
                  } else {
                    gl_FragColor = vec4(0.2, 0.2, 0.2, 0.0);  // Sağlık olmayan alan
                  }
                } else {
                  discard; // Çizim alanı dışındaki pikselleri yok say
                }
              }
            `,
            transparent: !0,
            opacity: 1,
            polygonOffset: !0,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: .1
        });
        const t = new qt().load("./sprites/health_bar/black_progress_radial.png");
        this.healthBarBgMaterial = new yt({
            uniforms: {
                health: {
                    value: 1
                },
                color: {
                    value: new pe(0)
                },
                tex: {
                    value: t
                }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float health;
              uniform sampler2D tex;
              uniform vec3 color;
              varying vec2 vUv;
        
              void main() {
                // Texture'ı al
                vec4 texColor = texture2D(tex, vUv);
                
                // Merkezden olan uzaklığı hesapla
                float dist = distance(vUv, vec2(0.5, 0.5));
        
                // Daire içine sağlık yüzdesine göre çiz
                if (dist < 0.5) {
                  float angle = atan(vUv.y - 0.5, vUv.x - 0.5) + 3.141592653589793;
                  float healthAngle = 6.28318530718 * health; // 2 * Pi * health
                  
                  if (angle < healthAngle) {
                    gl_FragColor = texColor;  // Sağlık olan alan: texture ile boyanacak
                  } else {
                    gl_FragColor = vec4(0.2, 0.2, 0.2, 0.0);  // Sağlık olmayan alan
                  }
                } else {
                  discard; // Çizim alanı dışındaki pikselleri yok say
                }
              }
            `,
            transparent: !0,
            opacity: .2,
            polygonOffset: !0,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        })
    }
    createCharacterIcon() {
        this.characterIcon = new Ql(this.soldierType === "R" ? Ld : Cd), this.soldierType === "R" ? this.characterIcon.scale.set(.525, .525, .525) : this.characterIcon.scale.set(.65, .65, .65), this.characterIcon.position.set(0, 2.5, .25), Ue.add(this.characterIcon), this.characterIcon.rotation.set(1, Math.PI, 0), this.cube.add(this.characterIcon)
    }
    createHealthBar() {
        const e = new di(.3, .3);
        this.healthBarMesh = new ct(e, this.healthBarMaterial), this.healthBarMesh.position.set(0, 3.2, 0), this.cube.add(this.healthBarMesh), this.healthBarMesh.rotation.set(1, Math.PI, 0);
        const t = new di(.375, .375);
        this.healthBarBGMesh = new ct(t, this.healthBarBgMaterial), this.healthBarBGMesh.position.set(0, 0, -.05), this.healthBarMesh.add(this.healthBarBGMesh), this.healthBarBGMesh.rotation.set(0, 0, 0), Ue.add(this.healthBarMesh), this.healthBarMesh.scale.set(0, 0, 0), this.healthBarFollow()
    }
    removeHealthBar() {
        Wa(this.healthBarMesh), Wa(this.healthBarBGMesh)
    }
    healthBarFollow() {
        this.healthBarMesh !== void 0 && (this.healthBarMesh.position.set(this.cube.position.x, this.cube.position.y + this.characterLevel % 2 === 0 ? 2.7 : 2.4, this.cube.position.z), this.healthBarMesh.rotation.set(We.rotation.x, 0, 0))
    }
    moveTowards(e) {
        if (this.isDying || this.soldierType === "R" || fe === 0) return;
        const t = e.cube.position.x - this.cube.position.x,
            n = e.cube.position.z - this.cube.position.z,
            i = Math.sqrt(t * t + n * n);
        i > this.attackRange && (this.cube.position.x += t / i * this.speed * mi * fe, this.cube.position.z += n / i * this.speed * mi * fe, this.cube.lookAt(e.cube.position), this.healthBarFollow(), this.stopAllAnimations(4), this.mixer.clipAction(this.animations[4]).play())
    }
    distanceTo(e) {
        const t = e.cube.position.x - this.cube.position.x,
            n = e.cube.position.z - this.cube.position.z;
        return Math.sqrt(t * t + n * n)
    }
    attack(e) {
        !this.canAttack || this.isDying || fe === 0 || (this.target = e, (this.distanceTo(e) <= this.attackRange || this.soldierType === "R") && (this.cube.lookAt(e.cube.position), this.healthBarFollow(), this.stopAllAnimations(0), this.mixer.clipAction(this.animations[0]).play(), this.canAttack = !1, this.soldierType === "M" ? setTimeout(() => {
            e.takeDamage(this.attackPower), nt && this.soundEffects[0].play()
        }, this.animations[0].duration * 550 / fe) : (setTimeout(() => {
            this.shoot(e, this.characterLevel)
        }, this.animations[0].duration * 1e3 * ka[this.characterLevel - 1] / fe), this.arrow !== null && setTimeout(() => {
            this.arrow.model.scale.set(1, 1, 1)
        }, this.animations[0].duration * 1e3 * ka[this.characterLevel - 1] * .3 / fe)), setTimeout(() => {
            this.canAttack = !0
        }, this.animations[0].duration * 1e3 / fe)))
    }
    takeDamage(e) {
        if (this.health <= 0) return;
        const t = this.health;
        this.health -= e, this.health <= 0 && (this.health = 0, this.die()), this.healthBarMesh.material.uniforms.health.value = this.health / this.maxHealth;
        const n = this.health;
        Aw(t - n), this.activateDamageEffect()
    }
    die() {
        this.isDying = !0, this.stopAllAnimations(1);
        const e = this.mixer.clipAction(this.animations[1]);
        e.setLoop(Wl), e.clampWhenFinished = !0, e.play(), nt && this.deathSoundEffect.play(), this.removeHealthBar(), this.deathTimeOutId = setTimeout(() => {
            Kd(this.cube)
        }, this.animations[1].duration * 1e3)
    }
    stopAllAnimations(e) {
        for (let t = 0; t < this.animations.length; t++) {
            if (t === e) continue;
            this.mixer.clipAction(this.animations[t]).stop()
        }
    }
    endCombat() {
        if (this.isDying) return;
        this.stopAllAnimations(3), this.mixer.clipAction(this.animations[3]).play()
    }
    toggleHighlightEffect(e) {
        this.model !== null && this.model.traverse(t => {
            t.isMesh && (t.material.emissive = new pe(e ? 128 : 0), t.material.emissiveIntensity = e ? 6 : 0)
        })
    }
    toggleGrayEffect(e) {
        if (this.model === null) return;
        const t = new pe(16777215),
            n = new pe(4210752);
        this.model.traverse(i => {
            i.isMesh && i.material.color.copy(e ? n : t)
        })
    }
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.cube)
    }
    destroyCharacter() {
        this.arrow !== null && this.arrow.destroyArrow(), Ue.remove(this.boundingBox), Ue.remove(this.cube), so(this.model), this.removeHealthBar()
    }
    activateDamageEffect() {
        if (this.damageEffectActive) return;
        this.damageEffectActive = !0;
        const e = new pe(16777215),
            t = new pe(13697055);
        this.model.traverse(function(n) {
            n.isMesh && n.material.color.copy(t)
        }), setTimeout(() => {
            this.model.traverse(function(n) {
                n.isMesh && n.material.color.copy(e)
            }), this.damageEffectActive = !1
        }, 150)
    }
    fade() {
        const t = (performance.now() - this.startTime) / 1e3;
        this.model.traverse(function(n) {
            n.isMesh && (n.material.opacity = Math.max(1 - t, 0))
        }), t < 1 && requestAnimationFrame(() => this.fade())
    }
    prepareForCharacterUnlockScreen() {
        this.model.traverse(t => {
            t.isMesh && t.name === "weapon" && t.scale.set(0, 0, 0)
        }), this.cube.position.set(100, 0, 0), this.cube.rotation.y -= Math.PI, this.healthBarMesh.scale.set(0, 0, 0), this.healthBarBGMesh.scale.set(0, 0, 0), this.stopAllAnimations(3), this.mixer.clipAction(this.animations[3]).play()
    }
    removeCharacterFromUnlockScreen() {
        this.model.traverse(t => {
            t.isMesh && t.name === "weapon" && t.scale.set(1, 1, 1)
        }), this.cube.position.copy(this.position), this.cube.rotation.y += Math.PI, this.stopAllAnimations(2), this.mixer.clipAction(this.animations[2]).play()
    }
}

function Id() {
    Qa.forEach(s => {
        s.timeScale = fe
    })
}

function $v() {
    Kv()
}

function Kv() {
    const s = new qt().load("./sprites/health_bar/range_info_icon.png");
    Ld = new yt({
        uniforms: {
            map: {
                value: s
            },
            opacity: {
                value: 1
            }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float opacity;
          varying vec2 vUv;
      
          void main() {
            vec4 color = texture2D(map, vUv);
      
            // Eğer alpha kanalı varsa texture'daki alpha kanalını kullanarak şeffaflığı işliyoruz
            if (color.a < 0.1) discard; // Neredeyse tamamen şeffaf olan pikselleri render etme
            gl_FragColor = vec4(color.rgb, color.a * opacity); // Alpha kanalını texture'dan al
          }
        `,
        transparent: !0,
        depthTest: !1,
        depthWrite: !1
    });
    const e = new qt().load("./sprites/health_bar/melee_info_icon.png");
    Cd = new yt({
        uniforms: {
            map: {
                value: e
            },
            opacity: {
                value: 1
            }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float opacity;
          varying vec2 vUv;
      
          void main() {
            vec4 color = texture2D(map, vUv);
      
            // Eğer alpha kanalı varsa texture'daki alpha kanalını kullanarak şeffaflığı işliyoruz
            if (color.a < 0.1) discard; // Neredeyse tamamen şeffaf olan pikselleri render etme
            gl_FragColor = vec4(color.rgb, color.a * opacity); // Alpha kanalını texture'dan al
          }
        `,
        transparent: !0,
        depthTest: !1,
        depthWrite: !1
    })
}

function Rd(s) {
    const e = jv.getDelta();
    Qa.forEach(t => {
        t.update(e)
    }), Ad.forEach(t => {
        t.healthBarFollow()
    }), requestAnimationFrame(Rd)
}
Rd();
const Zv = new Ja,
    eo = [],
    Jv = new Wr;
let Dd, Pd;
tS();
class Qv {
    constructor(e, t, n, i) {
        Ve(this, "characterLevel", null);
        Ve(this, "beingDragged", !1);
        Ve(this, "mixer", null);
        Ve(this, "boundingBox", new Rn(new M, new M));
        Ve(this, "speed", 4);
        Ve(this, "attackRange", 1.7);
        Ve(this, "animations", []);
        Ve(this, "isDying", !1);
        Ve(this, "canAttack", !0);
        Ve(this, "rightHand", null);
        Ve(this, "soundEffects", []);
        Ve(this, "deathSoundEffect", null);
        Ve(this, "deathTimeOutId", null);
        if (n === -1) return;
        this.soldierType = i, this.arrow = null, this.model = null, this.spawnPosIndex = n, this.position = e, this.attackPower = i === "M" ? ef[t - 1] : tf[t - 1], this.maxHealth = i === "M" ? Jd[t - 1] : Qd[t - 1], this.health = this.maxHealth, this.characterLevel = t;
        const r = new Yi(1, 1, 1);
        this.boundingBox = r.boundingBox;
        const a = new qs({
            color: VS[t - 1]
        });
        this.cube = new ct(r, a), this.cube.layers.set(2), this.cube.position.set(e.x, 0, e.z), a.transparent = !0, a.opacity = 0, this.cube.userData.enemyCharacter = !0, this.cube.userData.level = t, this.cube.userData.name = "Cube" + t, this.cube.userData.spawnPosIndex = n, Va[n] = !1, Ue.add(this.cube), this.prepareSoundEffect(), this.boundingBox = new Rn(new M, new M), this.boundingBox.setFromObject(this.cube), this.arrangeRadialHealthBarMaterials();
        const o = this,
            l = i === "M" ? qr[this.characterLevel - 1] : jr[this.characterLevel - 1];
        Is(), Zv.load(`models/${l}/scene.gltf`, (function(c) {
            Rs(), o.loadedModel = c;
            const h = o.loadedModel;
            this.model = h.scene, eS(h), c.scene.traverse(d => {
                d.receiveShadow = !0, d.castShadow = !0, d.layers.set(1), d.name === "muzzle" && d.scale.set(0, 0, 0)
            }), o.cube.add(h.scene), h.scene.scale.set(1, 1, 1), h.userData.name = "Enemy Character", o.cube.add(h.scene), h.scene.position.set(0, 0, 0), o.createCharacterIcon(), o.createHealthBar(), o.cube.updateMatrixWorld(!0), o.boundingBox.setFromObject(o.cube), o.mixer = new yd(h.scene), o.mixer.clipAction(h.animations[2]).play(), o.animations = h.animations, eo.push(o.mixer), this.rightHand = h.scene.getObjectByName("mixamorigRightHandIndex1"), this.soldierType === "R" && this.createArrow(), df(!1), h.scene.traverse(function(d) {
                if (d.isMesh) {
                    const f = d.material,
                        g = new sc({
                            color: f.color,
                            map: f.map,
                            normalMap: f.normalMap,
                            gradientMap: null
                        });
                    d.material = g
                }
            })
        }).bind(this))
    }
    prepareSoundEffect() {
        const e = ["melee_hit_1.mp3"],
            t = ["shoot_1.wav", "shoot_2.wav", "shoot_3.wav", "shoot_4.wav"],
            n = this.soldierType === "M" ? e : t;
        for (let r = 0; r < n.length; r++) {
            const a = `./audio_clips/${n[r]}`;
            Jt.load(a, (function(o) {
                const l = new pn(an);
                l.setBuffer(o), l.setVolume(.3), this.soundEffects.push(l)
            }).bind(this))
        }
        Jt.load("./audio_clips/death.mp3", (function(r) {
            this.deathSoundEffect = new pn(an), this.deathSoundEffect.setBuffer(r), this.deathSoundEffect.setVolume(.3)
        }).bind(this))
    }
    shoot(e, t) {
        if (this.arrow != null) this.arrow.shoot(e);
        else {
            const n = Fr[this.characterLevel - 1],
                [i, r] = n.split("-");
            if (r != null && r === "particle") {
                const a = new M;
                this.cube.getWorldDirection(a);
                const o = new M().copy(this.cube.position).add(a.multiplyScalar(1));
                if (o.y = 1, wd(Ue, o, this.target, this.attackPower, this.characterLevel), nt) {
                    const l = Math.floor(Math.random() * this.soundEffects.length);
                    this.soundEffects[l].play()
                }
            }
        }
    }
    startCombat() {
        this.healthBarMesh.scale.set(1, 1, 1), this.healthBarBGMesh.scale.set(1, 1, 1), Ue.add(this.characterIcon), Ec(this.characterIcon)
    }
    createArrow() {
        if (this.soldierType !== "R") return;
        const e = Fr[this.characterLevel - 1],
            [t, n] = e.split("-");
        n != null && n === "particle" || this.arrow === null && (this.arrow = new Td(this, null, this.characterLevel))
    }
    arrangeRadialHealthBarMaterials() {
        const e = new qt().load("./sprites/health_bar/red_progress_radial.png");
        this.healthBarMaterial = new yt({
            uniforms: {
                health: {
                    value: 1
                },
                color: {
                    value: new pe(0)
                },
                tex: {
                    value: e
                }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float health;
              uniform sampler2D tex;
              uniform vec3 color;
              varying vec2 vUv;
        
              void main() {
                // Texture'ı al
                vec4 texColor = texture2D(tex, vUv);
                
                // Merkezden olan uzaklığı hesapla
                float dist = distance(vUv, vec2(0.5, 0.5));
        
                // Daire içine sağlık yüzdesine göre çiz
                if (dist < 0.5) {
                  float angle = atan(vUv.y - 0.5, vUv.x - 0.5) + 3.141592653589793;
                  float healthAngle = 6.28318530718 * health; // 2 * Pi * health
                  
                  if (angle < healthAngle) {
                    gl_FragColor = texColor;  // Sağlık olan alan: texture ile boyanacak
                  } else {
                    gl_FragColor = vec4(0.2, 0.2, 0.2, 0.0);  // Sağlık olmayan alan
                  }
                } else {
                  discard; // Çizim alanı dışındaki pikselleri yok say
                }
              }
            `,
            transparent: !0,
            opacity: 1
        });
        const t = new qt().load("./sprites/health_bar/black_progress_radial.png");
        this.healthBarBgMaterial = new yt({
            uniforms: {
                health: {
                    value: 1
                },
                color: {
                    value: new pe(0)
                },
                tex: {
                    value: t
                }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float health;
              uniform sampler2D tex;
              uniform vec3 color;
              varying vec2 vUv;
        
              void main() {
                // Texture'ı al
                vec4 texColor = texture2D(tex, vUv);
                
                // Merkezden olan uzaklığı hesapla
                float dist = distance(vUv, vec2(0.5, 0.5));
        
                // Daire içine sağlık yüzdesine göre çiz
                if (dist < 0.5) {
                  float angle = atan(vUv.y - 0.5, vUv.x - 0.5) + 3.141592653589793;
                  float healthAngle = 6.28318530718 * health; // 2 * Pi * health
                  
                  if (angle < healthAngle) {
                    gl_FragColor = texColor;  // Sağlık olan alan: texture ile boyanacak
                  } else {
                    gl_FragColor = vec4(0.2, 0.2, 0.2, 0.0);  // Sağlık olmayan alan
                  }
                } else {
                  discard; // Çizim alanı dışındaki pikselleri yok say
                }
              }
            `,
            transparent: !0,
            opacity: .2
        })
    }
    createCharacterIcon() {
        this.characterIcon = new Ql(this.soldierType === "R" ? Pd : Dd), this.characterIcon.scale.set(.65, .65, .65), this.characterIcon.position.set(0, 2.5, 0), Ue.add(this.characterIcon), this.characterIcon.rotation.set(We.rotation.x, 0, 0), this.cube.add(this.characterIcon)
    }
    createHealthBar() {
        const e = new di(.3, .3);
        this.healthBarMesh = new ct(e, this.healthBarMaterial), this.healthBarMesh.position.set(0, 3.2, 0), this.cube.add(this.healthBarMesh), this.healthBarMesh.rotation.set(1, Math.PI, 0);
        const t = new di(.375, .375);
        this.healthBarBGMesh = new ct(t, this.healthBarBgMaterial), this.healthBarBGMesh.position.set(0, 0, -.05), this.healthBarMesh.add(this.healthBarBGMesh), this.healthBarBGMesh.rotation.set(0, 0, 0), Ue.add(this.healthBarMesh), this.healthBarMesh.scale.set(0, 0, 0), this.healthBarFollow()
    }
    removeHealthBar() {
        Wa(this.healthBarMesh), Wa(this.healthBarBGMesh)
    }
    healthBarFollow() {
        this.healthBarMesh !== void 0 && (this.healthBarMesh.position.set(this.cube.position.x, this.cube.position.y + this.characterLevel % 2 === 0 ? 2.7 : 2.4, this.cube.position.z), this.healthBarMesh.rotation.set(We.rotation.x, 0, 0))
    }
    moveTowards(e) {
        if (this.isDying || this.soldierType === "R" || fe === 0) return;
        const t = e.cube.position.x - this.position.x,
            n = e.cube.position.z - this.position.z,
            i = Math.sqrt(t * t + n * n);
        i > this.attackRange && (this.position.x += t / i * this.speed * mi * fe, this.position.z += n / i * this.speed * mi * fe, this.cube.lookAt(e.cube.position), this.healthBarFollow(), this.stopAllAnimations(4), this.mixer.clipAction(this.animations[4]).play()), this.cube.position.set(this.position.x, this.position.y, this.position.z)
    }
    distanceTo(e) {
        const t = e.cube.position.x - this.position.x,
            n = e.cube.position.z - this.position.z;
        return Math.sqrt(t * t + n * n)
    }
    attack(e) {
        !this.canAttack || this.isDying || fe === 0 || (this.target = e, (this.distanceTo(e) <= this.attackRange || this.soldierType === "R") && (this.cube.lookAt(e.cube.position), this.healthBarFollow(), this.stopAllAnimations(0), this.mixer.clipAction(this.animations[0]).play(), this.canAttack = !1, this.soldierType === "M" ? setTimeout(() => {
            e.takeDamage(this.attackPower), nt && this.soundEffects[0].play()
        }, this.animations[0].duration * 1e3 / 2 / fe) : (setTimeout(() => {
            this.shoot(e, this.characterLevel)
        }, this.animations[0].duration * 1e3 * ka[this.characterLevel - 1] / fe), this.arrow !== null && setTimeout(() => {
            this.arrow.model.scale.set(1, 1, 1)
        }, this.animations[0].duration * 1e3 * ka[this.characterLevel - 1] * .3 / fe)), setTimeout(() => {
            this.canAttack = !0
        }, this.animations[0].duration * 1e3 / fe)))
    }
    takeDamage(e) {
        if (this.health <= 0) return;
        const t = this.health,
            n = e * 1.25;
        qi(n), lw(n), this.health -= e, this.health <= 0 && (this.health = 0, this.die()), this.healthBarMesh.material.uniforms.health.value = this.health / this.maxHealth;
        const i = this.health;
        Cw(t - i), this.activateDamageEffect()
    }
    die() {
        this.isDying = !0, this.stopAllAnimations(1);
        const e = this.mixer.clipAction(this.animations[1]);
        e.setLoop(Wl), e.clampWhenFinished = !0, e.play(), nt && this.deathSoundEffect.play(), this.removeHealthBar(), this.deathTimeOutId = setTimeout(() => {
            Kd(this.cube)
        }, this.animations[1].duration * 1e3)
    }
    stopAllAnimations(e) {
        for (let t = 0; t < this.animations.length; t++) {
            if (t === e) continue;
            this.mixer.clipAction(this.animations[t]).stop()
        }
    }
    endCombat() {
        if (this.isDying) return;
        this.stopAllAnimations(3), this.mixer.clipAction(this.animations[3]).play()
    }
    activateHighlightEffect() {}
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.cube)
    }
    destroyCharacter() {
        this.arrow !== null && this.arrow.destroyArrow(), Ue.remove(this.boundingBox), Ue.remove(this.cube), so(this.model), this.removeHealthBar()
    }
    activateDamageEffect() {
        if (this.damageEffectActive) return;
        this.damageEffectActive = !0;
        const e = new pe(16777215),
            t = new pe(14551590);
        this.model.traverse(function(n) {
            n.isMesh && n.material.color.copy(t)
        }), setTimeout(() => {
            this.model.traverse(function(n) {
                n.isMesh && n.material.color.copy(e)
            }), this.damageEffectActive = !1
        }, 150)
    }
}

function eS(s) {
    if (s.material && (s.material.side = Ln), !!s.children)
        for (let e = 0; e < s.children.length; e++) Utilities.setMaterialsOnGLTF(s.children[e])
}

function Nd() {
    eo.forEach(s => {
        s.timeScale = fe
    })
}

function tS() {
    nS()
}

function nS() {
    const s = new qt().load("./sprites/health_bar/range_info_icon.png");
    Pd = new yt({
        uniforms: {
            map: {
                value: s
            },
            opacity: {
                value: 1
            }
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
            // vUv = uv;

            // // Sağdan küçülme için sol tarafı sabit tutarak pozisyonu ayarlıyoruz
            // vec3 pos = position;
            // pos.x = position.x * 0.5 + 0.5;  // Solu sabit tut, sağdan küçül

            // gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
        fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
            vec4 color = texture2D(map, vUv);
            gl_FragColor = vec4(color.rgb, color.a * opacity);
        }
        `,
        transparent: !0,
        depthTest: !1,
        depthWrite: !1
    });
    const e = new qt().load("./sprites/health_bar/melee_info_icon.png");
    Dd = new yt({
        uniforms: {
            map: {
                value: e
            },
            opacity: {
                value: 1
            }
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
        fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
            vec4 color = texture2D(map, vUv);
            gl_FragColor = vec4(color.rgb, color.a * opacity);
        }
        `,
        transparent: !0,
        depthTest: !1,
        depthWrite: !1
    })
}

function Bd() {
    const s = Jv.getDelta();
    eo.forEach(e => {
        e.update(s)
    }), requestAnimationFrame(Bd)
}
Bd();
let Xr, to, Fd, kd, cc, hc, Ba, Fa, uc, dc, wl, Ml;
iS();

function iS() {
    Xr = document.getElementById("success-panel"), to = document.getElementById("fail-panel"), Fd = document.getElementById("success-shine-img"), kd = document.getElementById("fail-shine-img"), cc = document.getElementById("get-more-coin-container-success"), hc = document.getElementById("get-more-coin-container-fail"), Ba = document.getElementById("no-thanks-button-success"), Fa = document.getElementById("no-thanks-button-fail"), uc = document.getElementById("continue-container-success"), dc = document.getElementById("continue-container-fail"), document.getElementById("earned-coin-text-success"), document.getElementById("earned-coin-text-fail"), wl = document.getElementById("success-coin-img"), Ml = document.getElementById("fail-coin-img"), document.getElementById("no-thanks-button-success").addEventListener("click", fS), document.getElementById("no-thanks-button-fail").addEventListener("click", pS), document.getElementById("get-more-coin-button-success").addEventListener("click", uS), document.getElementById("get-more-coin-button-fail").addEventListener("click", dS), document.getElementById("continue-button-success").addEventListener("click", cS), document.getElementById("continue-button-fail").addEventListener("click", hS), setTimeout(() => {
        sS(), rS()
    }, 100)
}

function sS() {
    const s = {
            scale: new M(1, 1, 1)
        },
        e = {
            scale: new M(1.15, 1.15, 1.15)
        },
        t = new Xe(s, He).to(e, 1e3).easing(Fe.Quadratic.Out).onUpdate(function() {
            const i = s.scale.x,
                r = s.scale.y;
            wl.style.transform = `translateX(-50%) translateY(-50%) scale(${i}, ${r})`, Ml.style.transform = `translateX(-50%) translateY(-50%) scale(${i}, ${r})`
        }),
        n = new Xe(s, He).to({
            scale: new M(1, 1, 1)
        }, 1e3).easing(Fe.Quadratic.In).onUpdate(function() {
            const i = s.scale.x,
                r = s.scale.y;
            wl.style.transform = `translateX(-50%) translateY(-50%) scale(${i}, ${r})`, Ml.style.transform = `translateX(-50%) translateY(-50%) scale(${i}, ${r})`
        });
    t.chain(n), n.chain(t), t.start()
}

function rS() {
    const s = {
            rotationZ: 0
        },
        e = {
            rotationZ: 360
        };
    new Xe(s, He).to(e, 8e3).easing(Fe.Linear.None).onUpdate(function() {
        Fd.style.transform = `translateX(-50%) translateY(-50%) rotateZ(${s.rotationZ}deg)`, kd.style.transform = `translateX(-50%) translateY(-50%) rotateZ(${s.rotationZ}deg)`
    }).repeat(1 / 0).start()
}

function aS() {
    Xr.style.display === "block" ? oS() : lS()
}

function oS() {
    cc.style.display = "none", Ba.style.display = "none", uc.style.display = "block"
}

function lS() {
    hc.style.display = "none", Fa.style.display = "none", dc.style.display = "block"
}

function cS() {
    Xr.style.display = "none", io()
}

function hS() {
    to.style.display = "none", io()
}
async function uS() {
    Ks("triple_coin_reward", 0)
}
async function dS() {
    Ks("triple_coin_reward", 0)
}

function fS() {
    Xr.style.display = "none", io()
}

function pS() {
    to.style.display = "none", io()
}

function mS() {
    Ba.style.display = "none", uc.style.display = "none", setTimeout(() => {
        Xr.style.display = "block", cc.style.display = "block"
    }, 1500 / fe), setTimeout(() => {
        Ba.style.display = "block"
    }, 2500 / fe)
}

function gS() {
    Fa.style.display = "none", dc.style.display = "none", setTimeout(() => {
        to.style.display = "block", hc.style.display = "block"
    }, 1500 / fe), setTimeout(() => {
        Fa.style.display = "block"
    }, 2500 / fe)
}
let Pr = null,
    Nr = null,
    Yn = null,
    bl = null,
    El = null,
    Tl = null,
    Ea = null,
    Ta = null,
    Aa = null,
    yu, on, ui = null,
    Br = !1,
    Al = !1,
    Od = !1,
    fc = !1,
    Ud;

function _S() {
    const s = localStorage.getItem("tutorialCompleted");
    s != null && parseInt(s, 10) === 1 || (Nr = document.getElementById("range-menu-button"), Pr = document.getElementById("melee-menu-button"), Yn = document.getElementById("fight-menu-button"), bl = document.getElementById("heroes-button-panel"), El = document.getElementById("game-speed-panel"), Tl = document.getElementById("free-coin"), Ea = document.getElementById("range-button-hand-icon"), Ta = document.getElementById("melee-button-hand-icon"), Aa = document.getElementById("fight-button-hand-icon"), document.getElementById("free-coin-chest"), Nr.style.display = Pr.style.display = bl.style.display = El.style.display = Tl.style.display = "none", Ea.style.display = Ta.style.display = Aa.style.display = "block", Ud = Yn.style.left, Yn.style.left = "35%", $o(Ea), $o(Ta), $o(Aa), MS())
}

function xS() {
    Yn.style.display = "none", Nr.style.display = "flex"
}

function yS() {
    Yn.style.display = "none", Pr.style.display = "flex", Od = !0
}

function vS() {
    if (Br) return;
    Br = !0, Nr.style.display = "none";
    let s;
    for (let i = 0; i < le.length; i++) le[i].characterInfo === "1_M_1" && (s = le[i].cube.position);
    on.position.set(s.x, 1, s.z), on.scale.set(1, 1, 1);
    const e = new M(Nt[12].x, 0, Nt[12].z),
        t = {
            x: s.x + .5,
            y: s.y,
            z: s.z + .5
        },
        n = {
            x: e.x + .5,
            y: e.y,
            z: e.z + .5
        };
    ui = new Xe(t, He).to({
        x: n.x,
        y: n.y,
        z: n.z
    }, 1750).easing(Fe.Quadratic.InOut).onUpdate(function(i) {
        on.position.set(i.x, i.y, i.z)
    }).repeat(1 / 0).start()
}

function vu() {
    Br && (Br = !1, ui != null && ui.stop(), on.scale.set(0, 0, 0), Yn.style.display = "flex")
}

function Cl() {
    if (Br) return;
    Al = !0, ui != null && ui.stop();
    let s = null,
        e = null;
    for (let i = 0; i < le.length; i++)
        if (le[i].characterInfo === "1_M_1")
            if (e === null) e = le[i].cube.position;
            else {
                s = le[i].cube.position;
                break
            } if (s === null || e === null) return;
    on.scale.set(1, 1, 1), Pr.style.display = "none";
    const t = {
            x: s.x + .5,
            y: s.y,
            z: s.z + .5
        },
        n = {
            x: e.x + .5,
            y: e.y,
            z: e.z + .5
        };
    ui = new Xe(t, He).to({
        x: n.x,
        y: n.y,
        z: n.z
    }, 1750).easing(Fe.Quadratic.InOut).onUpdate(function(i) {
        on.position.set(i.x, i.y, i.z)
    }).repeat(1 / 0).start()
}

function SS() {
    Al && (Al = !1, ui !== null && ui.stop(), on.scale.set(0, 0, 0), Ec(on), Yn.style.display = "flex", fc = !0)
}

function wS() {
    fc = !1, Nr.style.display = Pr.style.display = Yn.style.display = "flex", bl.style.display = El.style.display = Tl.style.display = "block", Ea.style.display = Ta.style.display = Aa.style.display = "none", Yn.style.left = Ud, localStorage.setItem("tutorialCompleted", 1)
}

function $o(s) {
    const t = {
            rotation: 30
        },
        n = {
            rotation: -10
        },
        i = {
            scale: 1
        },
        r = {
            scale: 1.35
        };
    new Xe(t, He).to(n, 1e3).easing(Fe.Linear.None).onUpdate(function() {
        s.style.transform = `translate(-20%, -15%) rotate(${t.rotation}deg) scale(${i.scale})`
    }).repeat(1 / 0).start(), new Xe(i, He).to(r, 1e3).easing(Fe.Linear.None).onUpdate(function() {
        s.style.transform = `translate(-20%, -15%) rotate(${t.rotation}deg) scale(${i.scale})`
    }).repeat(1 / 0).start();
    const a = {
            left: 70
        },
        o = {
            left: 65
        };
    new Xe(a, He).to(o, 1e3).easing(Fe.Linear.None).onUpdate(function() {
        s.style.left = `${a.left}%`
    }).repeat(1 / 0).start()
}

function MS() {
    const s = new qt().load("./sprites/tutorial/hand_icon.png");
    yu = new yt({
        uniforms: {
            map: {
                value: s
            },
            opacity: {
                value: 1
            }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float opacity;
          varying vec2 vUv;
      
          void main() {
            vec4 color = texture2D(map, vUv);
      
            // Eğer alpha kanalı varsa texture'daki alpha kanalını kullanarak şeffaflığı işliyoruz
            if (color.a < 0.1) discard; // Neredeyse tamamen şeffaf olan pikselleri render etme
            gl_FragColor = vec4(color.rgb, color.a * opacity); // Alpha kanalını texture'dan al
          }
        `,
        transparent: !0,
        depthTest: !1,
        depthWrite: !1
    }), setTimeout(() => {
        on = new Ql(yu), Ue.add(on), on.rotation.set(We.rotation.x, 0, 0), on.scale.set(0, 0, 0)
    }, 100)
}
new Ri;
const He = new vd;
let le = [],
    In = [],
    qr = ["skeleton_1", "skeleton_2", "bedouin_1", "bedouin_2", "viking_1", "viking_2", "worker_1", "worker_2", "ninja_1", "ninja_2", "venom_1", "venom_2", "darthvader_1", "darthvader_2", "golem_1", "golem_2", "crystal_1", "crystal_2", "king_1", "king_2", "thanos_1", "thanos_2"],
    jr = ["archer_1", "archer_2", "yoda_1", "yoda_2", "joker_1", "joker_2", "astronaut_1", "astronaut_2", "punk_1", "punk_2", "scientist_1", "scientist_2", "robot_1", "robot_2", "terminator_1", "terminator_2", "alien_1", "alien_2", "cyclope_1", "cyclope_2", "giant_1", "giant_2"],
    Fr = ["fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle", "fireball-particle"],
    ka = [.62, .62, .3, .3, .5, .5, .35, .35, .35, .35, .35, .35, .35, .35, .35, .35, .35, .35, .35, .35, .35, .35],
    zd = [
        [1, .5, 0],
        [.2, .8, 0],
        [0, .2, .7],
        [1, .2, 0],
        [.8, .125, .8],
        [.8, .6, .2],
        [.8, .2, 0],
        [.6, .5, .3],
        [.6, .8, 0],
        [0, .8, .6],
        [.7, .7, .2],
        [.3, .4, .5],
        [1, .5, 0],
        [.2, .8, 0],
        [0, .2, .7],
        [1, .2, 0],
        [.8, .125, .8],
        [.8, .6, .2],
        [.8, .2, 0],
        [.6, .5, .3],
        [.6, .8, 0],
        [0, .8, .6]
    ],
    fi = !1,
    kr = !0;
const Ll = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    Il = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
let gn = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    _n = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const Oa = document.getElementById("splash-screen"),
    bS = document.getElementById("showing-ads-panel"),
    Gd = document.getElementById("main-menu"),
    Su = document.getElementById("fight-menu-button"),
    Gs = document.getElementById("melee-soldier-upgrade-cost"),
    Vs = document.getElementById("range-soldier-upgrade-cost"),
    wu = 24,
    Mu = 36,
    ES = document.getElementById("chest-icon"),
    TS = document.getElementById("coin-icon"),
    Ua = document.getElementsByClassName("free-coin-animated");
document.getElementById("game-speed-panel");
const Rl = [],
    ms = ["DESERT", "MINE", "VOLCANO", "CHINESE", "AZTEC"],
    AS = document.getElementById("current-map-icon"),
    CS = document.getElementById("next-map-icon"),
    bu = document.getElementById("current-map-text"),
    Eu = document.getElementById("next-map-text");
let Or = 0,
    za = 0;
const Vd = document.getElementById("player-health-bar-full"),
    Hd = document.getElementById("enemy-health-bar-full");
let Ca = 0,
    La = 0,
    xs = 0,
    ys = 0;
const pc = new M(0, 45, 22);
let ai = 0;
const Wd = 120;
let si = Wd;
const Tu = document.getElementById("free-coin-remaining-time-text"),
    Dl = document.getElementById("free-coin");
let gr, Ia;
const Au = document.getElementById("coin-text");
let _r, Ko = 0,
    Zo = performance.now();

function LS() {
    const s = performance.now();
    Ko++, s > Zo + 1e3 && (_r = Ko * 1e3 / (s - Zo), Zo = s, Ko = 0)
}

function Xd() {
    setTimeout(() => {
        _r > 55 ? xt.setPixelRatio(2) : _r > 50 ? xt.setPixelRatio(1.8) : _r > 45 ? xt.setPixelRatio(1.5) : _r > 40 && xt.setPixelRatio(1.3)
    }, 1e3)
}
const Ue = new cy,
    We = new Bt(20, window.innerWidth / window.innerHeight, .1, 1e3);
let Cu = null,
    mc, pi = !1,
    Pl = !1,
    Ga = 0,
    gc = 0,
    Ur = !1,
    Ot = 50,
    Xt = 1,
    Ni = 0,
    gi = !1,
    Gi, Vi, Hi, Wi, zr, Gr, Sr = null,
    Ls = null,
    wr = null,
    Mr = null,
    Nl = [];
const qd = new Wr;
let mi = qd.getDelta(),
    Zi;
const xt = new Jl({
    antialias: !0,
    preserveDrawingBuffer: !0
});
xt.setClearColor(0, 1);
xt.setPixelRatio(window.devicePixelRatio);
xt.shadowMap.enabled = !0;
xt.shadowMap.type = Nu;
xt.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(xt.domElement);
document.body.style.userSelect = "none";
document.documentElement.style.overscrollBehavior = "none";
document.body.style.overscrollBehavior = "none";
xt.outputEncoding = Be;
xt.toneMapping = Ou;
xt.toneMappingExposure = .6;
window.addEventListener("resize", _c);
window.addEventListener("orientationchange", _c);

function _c() {
    We.aspect = window.innerWidth / window.innerHeight, We.aspect < .8 ? We.fov = 20 + (.8 - We.aspect) * 40 : We.fov = 20, xt.setSize(window.innerWidth, window.innerHeight), We.updateProjectionMatrix()
}
_c();
const an = new Uy;
We.add(an);
const Ze = new pn(an),
    Jt = new ky,
    jd = document.getElementById("rewarded-warning-panel");
document.getElementById("rewarded-warning-button").addEventListener("click", yw);
document.getElementById("rewarded-warning-close-button").addEventListener("click", bc);
const Yd = document.getElementById("reward-received-panel");
document.getElementById("continue-button-reward-received").addEventListener("click", DS);
let bn, Bl;
IS();

function IS() {
    Pw(), Nw(), bf() ? xt.setPixelRatio(1.2) : xt.setPixelRatio(window.devicePixelRatio), xt.setPixelRatio(1.2), Dw(), BS(), Ew(), localStorage.getItem("MergeHeroes_level") == null && Rw(), Cu = new qt, Cu.load("./textures/TEX_ColorPalette_128.png"), mc = document.getElementById("character-unlock-continue-button"), Gi = document.getElementById("range-soldier-ads"), Vi = document.getElementById("melee-soldier-ads"), Hi = document.getElementById("range-soldier-upgrade"), Wi = document.getElementById("melee-soldier-upgrade"), zr = document.getElementById("earned-coin-text-success"), Gr = document.getElementById("earned-coin-text-fail");
    for (let i = 0; i < Ua.length; i++) Jt.load("./audio_clips/free_coin.mp3", function(a) {
        const o = new pn(an);
        o.setBuffer(a), o.setVolume(.4), Nl.push(o)
    });
    Jt.load("./audio_clips/chest_open.mp3", function(i) {
        Mr = new pn(an), Mr.setBuffer(i), Mr.setVolume(.4)
    }), Jt.load("./audio_clips/merge.mp3", function(i) {
        Sr = new pn(an), Sr.setBuffer(i), Sr.setVolume(.3)
    }), Jt.load("./audio_clips/button_click.mp3", function(i) {
        Ls = new pn(an), Ls.setBuffer(i), Ls.setVolume(.3)
    }), Jt.load("./audio_clips/character_unlock.wav", function(i) {
        wr = new pn(an), wr.setBuffer(i), wr.setVolume(.3)
    });
    for (let i = 0; i < 10; i++) {
        const r = `level-circle-${i+1}`,
            a = document.getElementById(r);
        Rl.push(a)
    }
}

function RS(s, e) {
    let t = Vr();
    s ? (wc(t, e + 1), _n[e - 1] = 0, localStorage.setItem("watchedVideoAmountToUnlockRangeCharacters", JSON.stringify(_n))) : (Sc(t, e + 1), gn[e - 1] = 0, localStorage.setItem("watchedVideoAmountToUnlockMeleeCharacters", JSON.stringify(gn)))
}

function DS() {
    if (bc(), Zd(), bn === "range_soldier") {
        let s = Vr();
        wc(s)
    } else if (bn === "melee_soldier") {
        let s = Vr();
        Sc(s)
    } else if (bn === "triple_coin_reward") Ol(!0), qi(Ni * 2), aS(), zr.textContent = Xn("x3COINCOLLECTED"), Gr.textContent = Xn("x3COINCOLLECTED"), zr.style.fontFamily = vt(), Gr.style.fontFamily = vt();
    else if (bn === "free-coin") qi(Bl), Ol(!0);
    else if (bn.includes("rangeGrid")) {
        Ul();
        const s = bn.split("_"),
            e = parseInt(s[1], 10),
            t = document.getElementById(jr[e]);
        if (_n[e - 1]++, _n[e - 1] >= Il[e - 1]) t.textContent = "COLLECT";
        else {
            const n = t.childNodes[t.childNodes.length - 1];
            n.nodeType === Node.TEXT_NODE && (n.textContent = Xn("FREE") + " " + _n[e - 1] + "/" + Il[e - 1])
        }
        localStorage.setItem("watchedVideoAmountToUnlockRangeCharacters", JSON.stringify(_n))
    } else if (bn.includes("meleeGrid")) {
        Ul();
        const s = bn.split("_"),
            e = parseInt(s[1], 10),
            t = document.getElementById(qr[e]);
        if (gn[e - 1]++, gn[e - 1] >= Ll[e - 1]) t.textContent = "COLLECT";
        else {
            const n = t.childNodes[t.childNodes.length - 1];
            n.nodeType === Node.TEXT_NODE && (n.textContent = Xn("FREE") + " " + gn[e - 1] + "/" + Ll[e - 1])
        }
        localStorage.setItem("watchedVideoAmountToUnlockMeleeCharacters", JSON.stringify(gn))
    }
    bn = "none", Bl = 0, NS()
}

function PS() {
    Yd.style.display = "block"
}

function NS() {
    Yd.style.display = "none"
}

function BS() {
    const s = document.getElementById("splash-screen-logo"),
        e = document.getElementById("loading-icon"),
        t = document.getElementById("showing-ads-icon"),
        n = {
            rotation: 0
        },
        i = {
            rotation: 360
        };
    new Xe(n, He).to(i, 4e3).easing(Fe.Linear.None).onUpdate(function() {
        e.style.transform = `translateX(-50%) translateY(-50%) rotateZ(${n.rotation}deg)`, t.style.transform = `translateX(-50%) translateY(-50%) rotateZ(${n.rotation}deg)`
    }).repeat(1 / 0).start();
    const r = {
            scale: new M(1, 1, 1)
        },
        a = {
            scale: new M(1.05, 1.05, 1.05)
        },
        o = new Xe(r, He).to(a, 650).easing(Fe.Sinusoidal.Out).onUpdate(function() {
            const c = r.scale.x,
                h = r.scale.y;
            s.style.transform = `translateX(-50%) translateY(-50%) scale(${c}, ${h})`
        }),
        l = new Xe(r, He).to({
            scale: new M(1, 1, 1)
        }, 650).easing(Fe.Sinusoidal.Out).onUpdate(function() {
            const c = r.scale.x,
                h = r.scale.y;
            s.style.transform = `translateX(-50%) translateY(-50%) scale(${c}, ${h})`
        });
    o.chain(l), l.chain(o), o.start()
}

function $d() {
    bS.style.display = "none"
}

function FS() {
    Oa.style.display !== "block" && (Oa.style.display = "block", Gd.style.display = "none")
}

function kS() {
    Oa.style.display !== "none" && (Oa.style.display = "none", Gd.style.display = "block", Xd())
}

function Kd(s) {
    const e = {
            x: 1,
            y: 1,
            z: 1
        },
        t = {
            x: 0,
            y: 0,
            z: 0
        },
        n = 1e3 / fe;
    new Xe(e, He).to(t, n).easing(Fe.Quadratic.Out).onUpdate(function() {
        s.scale.set(e.x, e.y, e.z)
    }).start()
}

function Ut() {
    nt && (Ls.stop(), Ls.play())
}

function OS(s) {
    nt && (Nl[s].stop(), Nl[s].play())
}

function Zd() {
    nt && (Mr.stop(), Mr.play())
}

function US() {
    nt && (Sr.stop(), Sr.play())
}

function zS() {
    nt && (wr.stop(), wr.play())
}
const Nt = [new M(-4, 0, -.5), new M(-2, 0, -.5), new M(0, 0, -.5), new M(2, 0, -.5), new M(4, 0, -.5), new M(-4, 0, -2.5), new M(-2, 0, -2.5), new M(0, 0, -2.5), new M(2, 0, -2.5), new M(4, 0, -2.5), new M(-4, 0, -4.5), new M(-2, 0, -4.5), new M(0, 0, -4.5), new M(2, 0, -4.5), new M(4, 0, -4.5)],
    GS = [new M(-4, 0, -10.5), new M(-2, 0, -10.5), new M(0, 0, -10.5), new M(2, 0, -10.5), new M(4, 0, -10.5), new M(-4, 0, -12.5), new M(-2, 0, -12.5), new M(0, 0, -12.5), new M(2, 0, -12.5), new M(4, 0, -12.5), new M(-4, 0, -14.5), new M(-2, 0, -14.5), new M(0, 0, -14.5), new M(2, 0, -14.5), new M(4, 0, -14.5)];
let kt = [!0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0],
    Va = [!0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0, !0],
    VS = [6526446, 16772393, 13765166, 9044164, 16735232],
    Jd = [20, 47, 112, 264, 622, 1342, 3476, 8236, 19482, 45244, 112364, 274876, 618471, 1391559, 3131007, 7044765, 15850721, 35664122, 80244274, 180549616, 406236636, 914032431],
    Qd = [8, 19, 45, 108, 256, 609, 1423, 3576, 8264, 19762, 46478, 114892, 258507, 581640, 1308690, 2944552, 6625242, 14906794, 33540286, 75465643, 169797696, 382044816],
    ef = [3, 7, 17, 40, 93, 221, 521, 1242, 2652, 6248, 16234, 36472, 82062, 184639, 415437, 934733, 2103149, 4732085, 10647191, 23956180, 53901405, 121278161],
    tf = [4, 10, 23, 54, 128, 304, 724, 1786, 4346, 9483, 23675, 58263, 131091, 294954, 663646, 1493203, 3359706, 7559338, 17008510, 38269147, 86105580, 193737555],
    Ht = ["1_M_1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
    Je = null;
const Ha = new Jy;
Ha.layers.set(0);
Ha.layers.set(2);
const Jo = new ve,
    Hs = new ve;
new M;
let xc = 0,
    yc = 0,
    Fl = 0,
    kl = 0;
const Ra = new Ja;
let dr = [new M(-5, 25, -7.5), new M(-10, 25, -7.5), new M(-25, 30, -7.5), new M(-5, 25, -7.5), new M(-10, 25, -7.5)];
const _t = new _d(16777215, 1);
_t.castShadow = !0;
_t.shadow.bias = .5;
_t.shadow.radius = 2;
_t.shadow.camera.left = -100;
_t.shadow.camera.right = 100;
_t.shadow.camera.top = 100;
_t.shadow.camera.bottom = -100;
_t.shadow.mapSize.width = 4096;
_t.shadow.mapSize.height = 4096;
_t.shadow.camera.near = .1;
_t.shadow.camera.far = 100;
const vc = new Ye;
vc.position.set(8, 0, -7.5);
Ue.add(vc);
_t.target = vc;
Ue.add(_t);
const nf = new By(16777215);
nf.intensity = 2;
Ue.add(nf);
const sf = new ud(new Uint8Array([0, 128, 255]), 3, 1, Vu);
sf.needsUpdate = !0;
new sc({
    color: 16763904,
    gradientMap: sf
});
We.position.copy(pc);
We.rotation.x = -1;
We.layers.enable(0);
We.layers.enable(1);
We.layers.enable(2);
document.getElementById("heroes-button").addEventListener("click", Ul);
document.getElementById("heroes-button").addEventListener("click", Ls);
window.addEventListener("blur", rf);
window.addEventListener("focus", af);

function rf() {
    kr = !1, Ze.pause()
}

function af() {
    kr = !0, Tt && !fi , document.addEventListener("click", yn), document.addEventListener("touchstart", yn)//&& Ze.play()
}

function HS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}
HS() && (window.addEventListener("pagehide", rf), window.addEventListener("pageshow", af));

function WS() {
    console.log("onVisibilityChange"), document.visibilityState === "hidden" ? (kr = !1, Ze.pause()) : document.visibilityState === "visible" && (kr = !0, Tt && !fi && Ze.play(), document.addEventListener("click", yn), document.addEventListener("touchstart", yn))
}

function Xi() {
    localStorage.setItem("playerCharactersInfo", JSON.stringify(Ht))
}

function XS() {
    const s = localStorage.getItem("playerCharactersInfo");
    Ht = JSON.parse(s), Ht === null && (Ht = ["1_M_1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"], Xi()), of()
}

function qS() {
    const s = localStorage.getItem("watchedVideoAmountToUnlockRangeCharacters");
    _n = JSON.parse(s), _n === null && (_n = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], localStorage.setItem("watchedVideoAmountToUnlockRangeCharacters", JSON.stringify(_n)));
    const e = localStorage.getItem("watchedVideoAmountToUnlockMeleeCharacters");
    gn = JSON.parse(e), gn === null && (gn = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], localStorage.setItem("watchedVideoAmountToUnlockMeleeCharacters", JSON.stringify(gn)))
}

function of() {
    for (let s = 0; s < Ht.length; s++) {
        if (Ht[s] === "0") continue;
        const [e, t, n] = Ht[s].split("_");
        parseInt(e) === 1 && no(Nt[s], parseInt(n), s, t, !1)
    }
    Xi()
}
document.addEventListener("touchmove", function(s) {
    s.scale !== 1 && s.preventDefault()
}, {
    passive: !1
});
window.addEventListener("mousedown", lf, !1);
window.addEventListener("touchstart", lf, !1);
window.addEventListener("mousemove", cf, !1);
window.addEventListener("touchmove", cf, !1);
window.addEventListener("mouseup", hf, !1);
window.addEventListener("touchend", hf, !1);

function lf(s) {
    if (!pi || gi || Ki || Zi) return;
    if (Je != null) {
        Je = null;
        return
    }
    const e = s.clientX || s.touches[0].clientX,
        t = s.clientY || s.touches[0].clientY;
    Jo.x = e / window.innerWidth * 2 - 1, Jo.y = -(t / window.innerHeight) * 2 + 1, Hs.x = e / window.innerWidth * 2 - 1, Hs.y = -(t / window.innerHeight) * 2 + 1;
    const n = pf(Jo);
    if (n.length > 0 && n[0].object.userData.draggable) {
        Je = n[0].object, Je.userData.beingDragged = !0, Je.position - n[0].point;
        const i = _f();
        Je.userData.dragStartIndex = i, kt[i] = !0, Je.userData.characterInfo = Ht[i], Xi(), jS(Je.userData.characterIndex)
    }
}

function jS(s) {
    const e = le[s];
    if (e !== void 0)
        for (let t = 0; t < le.length; t++) {
            if (t === s) continue;
            const n = le[t];
            n.characterLevel === e.characterLevel && n.soldierType === e.soldierType ? n.toggleHighlightEffect(!0) : n.toggleGrayEffect(!0)
        }
}

function YS() {
    for (let s = 0; s < le.length; s++) le[s] !== null && (le[s].toggleHighlightEffect(!1), le[s].toggleGrayEffect(!1))
}

function cf(s) {
    if (!pi || gi || Ki || Zi) return;
    s.preventDefault();
    let e = s.clientX,
        t = s.clientY;
    s.touches && s.touches[0] && (e = s.touches[0].clientX, t = s.touches[0].clientY), Hs.x = e / window.innerWidth * 2 - 1, Hs.y = -(t / window.innerHeight) * 2 + 1
}

function hf() {
    if (!(!pi || gi || Ki || Zi) && Je) {
        Hs.set(0, 0);
        const s = _f(),
            e = kt[s],
            t = Nt[s];
        Je.position.set(t.x, t.y, t.z), kt[s] = !1;
        const n = QS(),
            i = Je.userData.dragStartIndex;
        if (!e && !n) {
            for (let r = 0; r < le.length; r++)
                if (le[r].cube.userData.spawnPosIndex === s) {
                    const a = le[r];
                    a.cube.position.set(Nt[i].x, Nt[i].y, Nt[i].z), kt[i] = !1, a.cube.userData.spawnPosIndex = i, Ht[i] = a.characterInfo, Ht[s] = Je.userData.characterInfo
                } Je.position.set(Nt[s].x, Nt[s].y, Nt[s].z), kt[s] = !1, Je.userData.spawnPosIndex = s, localStorage.getItem("tutorialCompleted"), (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && (vu(), Cl())
        }
        Xi(), e && (Ht[Je.userData.dragStartIndex] = "0", Ht[s] = Je.userData.characterInfo, Je.userData.spawnPosIndex = s, localStorage.getItem("tutorialCompleted"), (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && (vu(), Cl())), Je.userData.beingDragged = !1, Je = null, YS(), Xi()
    }
}

function no(s, e, t, n, i) {
    if (t === -1) return;
    xc++;
    const r = `1_${n}_${e}`;
    let a = new Yv(s, e, t, n, r, i);
    a.cube.userData.characterIndex = le.length, le.push(a), Ht[t] = r, kt[t] = !1
}

function $S(s, e, t, n) {
    if (t === -1) return;
    yc++;
    let i = new Qv(s, e, t, n);
    In.push(i)
}
let Qo, el, tl;

function KS() {
    const s = new di(6, 6),
        e = new qs({
            color: 65280
        });
    e.transparent = !0, e.opacity = 0, s.rotateX(-Math.PI / 2);
    const t = new ct(s, e);
    t.position.set(0, 0, -2.5), t.scale.set(1.66, 1, 1), t.userData.ground = !0, t.layers.set(2), Ue.add(t), ai = Math.floor((Xt - 1) / 10) % 5, uf();
    let n;
    Is(!0), Ra.load("./models/character_unlock_platform/scene.gltf", function(i) {
        Rs(), n = i, i.scene.traverse(r => {
            r.castShadow = !0, r.receiveShadow = !0
        }), n.scene.scale.set(1, 1, 1), n.userData.name = "Character_unlock_platform", n.scene.position.set(100, 0, 0), Ue.add(n.scene)
    })
}

function uf() {
    Qo != null && nl(Qo), el != null && nl(el), tl != null && nl(tl);
    let s, e, t;
    ai === 0 ? (s = "models/maps/map01_environment/scene.gltf", e = "models/maps/map01_ground/scene.gltf", t = "models/maps/map01_platform/scene.gltf", _t.position.copy(dr[0])) : ai === 1 ? (s = "models/maps/map02_environment/scene.gltf", e = "models/maps/map02_ground/scene.gltf", t = "models/maps/map02_platform/scene.gltf", _t.position.copy(dr[1])) : ai === 2 ? (s = "models/maps/map03_environment/scene.gltf", e = "models/maps/map03_ground/scene.gltf", t = "models/maps/map03_platform/scene.gltf", _t.position.copy(dr[2])) : ai === 3 ? (s = "models/maps/map04_environment/scene.gltf", e = "models/maps/map04_ground/scene.gltf", t = "models/maps/map04_platform/scene.gltf", _t.position.copy(dr[3])) : ai === 4 && (s = "models/maps/map05_environment/scene.gltf", e = "models/maps/map05_ground/scene.gltf", t = "models/maps/map05_platform/scene.gltf", _t.position.copy(dr[4]));
    let n;
    Is(!0), Ra.load(s, function(i) {
        Rs(), n = i, Qo = n.scene, i.scene.traverse(r => {
            r.castShadow = !0, r.receiveShadow = !1, r.material && (r.material.metalness = .2, r.material.roughness = .7), r.isMesh && r.material.map && (r.material.map.encoding = Be)
        }), n.scene.scale.set(1, 1, 1), n.userData.name = "Ground", n.scene.position.set(0, 0, -7.5), n.scene.rotation.y = Math.PI, Ue.add(n.scene)
    }), Is(!0), Ra.load(e, function(i) {
        Rs(), n = i, el = n.scene, i.scene.traverse(r => {
            r.castShadow = !1, r.receiveShadow = !0
        }), n.scene.scale.set(1, 1, 1), n.userData.name = "Environment", n.scene.position.set(0, 0, -7.5), n.scene.rotation.y = Math.PI, Ue.add(n.scene)
    }), Is(!0), Ra.load(t, function(i) {
        Rs(), n = i, tl = n.scene, i.scene.traverse(r => {
            r.receiveShadow = !0, r.isMesh && r.material.map && (r.material.map.encoding = Be)
        }), n.scene.scale.set(1, 1, 1), n.userData.name = "Environment", n.scene.position.set(0, 0, -7.5), n.scene.rotation.y = Math.PI, Ue.add(n.scene)
    })
}

function df(s) {
    s ? Fl++ : kl++, Fl === xc && kl === yc && ZS()
}

function ZS() {
    document.getElementById("bottom-menu").style.display = "flex", document.getElementById("main-menu-bottom-shadow").style.display = "block"
}

function ff() {
    new Ka().load("./enemy_spawn_positions/level_informations.json", function(e) {
        const t = JSON.parse(e),
            n = (Xt - 1) % t.length;
        for (let i = 0; i < t[n].length; i++) {
            const r = t[n][i];
            if (r !== "0") {
                const [a, o, l] = r.split("_");
                parseInt(a) === 1 && ($S(GS[i].clone(), parseInt(l), i, o), Va[i] = !1)
            }
        }
    })
}

function JS() {
    if (!(!pi || gi || Ki || Zi) && Je != null) {
        const s = pf(Hs);
        if (s.length > 0)
            for (let e = 0; e < s.length; e++) {
                if (!s[e].object.userData.ground) continue;
                let t = s[e].point;
                Je.position.x = t.x, Je.position.z = t.z
            }
    }
}

function pf(s) {
    if (!(!pi || gi || Ki || Zi)) return Ha.setFromCamera(s, We), Ha.intersectObjects(Ue.children)
}

function QS() {
    let s = !1;
    for (let e = 0; e < le.length - 1; e++)
        for (let t = e + 1; t < le.length; t++) {
            const n = le[e].boundingBox,
                i = le[t].boundingBox,
                r = le[e].characterLevel === le[t].characterLevel,
                a = le[e].soldierType === le[t].soldierType,
                o = le[e].soldierType === "M" ? le[e].characterLevel >= qr.length : le[e].characterLevel >= jr.length;
            if (n && i && n.intersectsBox(i) && r && a && !o) {
                const l = new M;
                let c = parseInt(le[e].characterLevel) + 1,
                    h;
                le[e].cube.userData.beingDragged ? (l.set(le[t].cube.position.x, 0, le[t].cube.position.z), h = le[t].cube.userData.spawnPosIndex) : le[t].cube.userData.beingDragged && (l.set(le[e].cube.position.x, 0, le[e].cube.position.z), h = le[e].cube.userData.spawnPosIndex), Ht[Je.userData.dragStartIndex] = "0", US(), fw(l), kt[le[e].cube.userData.spawnPosIndex] = !0, kt[le[t].cube.userData.spawnPosIndex] = !0;
                const u = le[e].soldierType,
                    d = pw(u, le[e].characterLevel);
                d && (mc.style.display = "none"), le[e].destroyCharacter(), le[t].destroyCharacter(), le.splice(t, 1), le.splice(e, 1), no(l, c, h, u, d);
                for (let f = 0; f < le.length; f++) le[f].cube.userData.characterIndex = f;
                localStorage.getItem("tutorialCompleted"), (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && SS(), s = !0
            }
        }
    return s
}

function Vr() {
    for (let s = 0; s < kt.length; s++)
        if (kt[s] === !0) return s;
    return -1
}
let mf = null;

function ew(s, e) {
    mf = s;
    const t = s.cube;
    e && (s.prepareForCharacterUnlockScreen(), zS());
    const n = {
            x: t.position.x,
            y: t.position.y + 8,
            z: t.position.z
        },
        i = {
            x: t.position.x,
            y: t.position.y,
            z: t.position.z
        };
    t.scale.set(.3, 2, .3), new Xe(n, He).to({
        x: i.x,
        y: i.y,
        z: i.z
    }, 100).easing(Fe.Linear.None).onUpdate(function(u) {
        t.position.set(u.x, u.y, u.z)
    }).onComplete(function() {
        o.start()
    }).start();
    const r = {
            x: .3,
            y: 2,
            z: .3
        },
        a = {
            x: 1.25,
            y: .1,
            z: 1.25
        },
        o = new Xe(r, He).to({
            x: a.x,
            y: a.y,
            z: a.z
        }, 100).easing(Fe.Linear.None).onUpdate(function(u) {
            t.scale.set(u.x, u.y, u.z)
        }).onComplete(function() {
            h.start()
        }),
        l = {
            x: 1.25,
            y: .2,
            z: 1.25
        },
        c = {
            x: 1,
            y: 1,
            z: 1
        },
        h = new Xe(l, He).to({
            x: c.x,
            y: c.y,
            z: c.z
        }, 200).easing(Fe.Linear.None).onUpdate(function(u) {
            t.scale.set(u.x, u.y, u.z)
        })
}

function tw() {
    pi || (kS(), pi = !0, Ga = gc = 0)
}

function gf(s) {
    le.forEach(e => {
        e.updateBoundingBox()
    }), mi = qd.getDelta(), vw(), JS(), requestAnimationFrame(gf), Ga !== 0 && Ga === gc && Ur && tw(), He.update(s), xt.render(Ue, We), LS()
}
gf();

function Lu(s, e) {
    let t = null,
        n = 1 / 0;
    for (let i of e) {
        const r = s.distanceTo(i);
        !i.isDying && r < n && (n = r, t = i)
    }
    return t
}

function nw(s, e) {
    const t = e.x - s.x,
        n = e.z - s.z;
    return Math.sqrt(t * t + n * n)
}

function _f() {
    let s = 1 / 0,
        e = 0;
    for (let t = 0; t < Nt.length; t++) {
        const n = nw(Je.position, Nt[t]);
        n < s && (s = n, Nt[t], e = t)
    }
    return e
}

function xf() {
    for (let t of le) {
        const n = Lu(t, In);
        n && (t.moveTowards(n), t.attack(n))
    }
    for (let t of In) {
        const n = Lu(t, le);
        n && (t.moveTowards(n), t.attack(n))
    }
    const s = le.some(t => t.health > 0),
        e = In.some(t => t.health > 0);
    s && e ? requestAnimationFrame(xf) : dw(s)
}

function iw() {
    (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0), rw(), ow(), XS(), qS(), ff();
    const s = localStorage.getItem("spawnedMeleeSoldierCount");
    s != null && (Or = parseInt(s, 10));
    const e = localStorage.getItem("spawnedRangeSoldierCount");
    e != null && (za = parseInt(e, 10));
    const t = Pn();
    Gs.textContent = Kn(Math.round(t)), Gs.style.fontFamily = vt();
    const n = Nn();
    Vs.textContent = Kn(Math.round(n)), Vs.style.fontFamily = vt(), Ot < Nn() && (Hi.style.display = "none", Gi.style.display = "flex"), Ot < Pn() && (Wi.style.display = "none", Vi.style.display = "flex")
}

function sw() {
    localStorage.setItem("MergeHeroes_level", Xt)
}

function rw() {
    const s = localStorage.getItem("MergeHeroes_level");
    s != null && (Xt = parseInt(s, 10)), yf(), Ef()
}

function yf() {
    const s = document.getElementById("level-text"),
        e = Xn("LEVEL");
    s.textContent = `${e} ${Xt}`, s.style.fontFamily = vt()
}

function aw() {
    localStorage.setItem("MergeHeroes_gold", Ot)
}

function ow() {
    const s = localStorage.getItem("MergeHeroes_gold");
    s != null ? Ot = parseInt(s, 10) : Ot = 50, vf()
}

function Pn() {
    return (wu + wu * Or) * (1 + (Xt - 1) * .12)
}

function Nn() {
    return (Mu + Mu * za) * (1 + (Xt - 1) * .12)
}

function qi(s) {
    Ot += s, aw(), vf(), Ot < Nn() ? (Hi.style.display = "none", Gi.style.display = "flex") : (Hi.style.display = "flex", Gi.style.display = "none"), Ot < Pn() ? (Wi.style.display = "none", Vi.style.display = "flex") : (Wi.style.display = "flex", Vi.style.display = "none")
}

function lw(s) {
    Ni += s
}

function vf() {
    const s = Kn(Math.round(Ot));
    Au.textContent = s, Au.style.fontFamily = vt()
}
document.getElementById("fightButton").addEventListener("click", cw);

function cw() {
    console.log("startCombat"), console.log(fe), Xd(), xr(), Ni = 0, Ut(), le.forEach(t => {
        t.startCombat()
    }), In.forEach(t => {
        t.startCombat()
    });
    const e = `battle_music_${Math.floor(Math.random()*3)+1}.mp3`;
    Sf(e), Id(), Nd(), xf(), document.getElementById("bottom-menu").style.display = "none", document.getElementById("main-menu-bottom-shadow").style.display = "none", gi = !0, Tw(), Mf(!0), fc && wS()
}
document.getElementById("meleeSoldierButton").addEventListener("click", hw);
async function hw() {
    Ut();
    let s = Vr();
    if (s === -1) return;
    const e = Pn();
    if (Ot < e) {
        Ks("melee_soldier", 0);
        return
    }
    qi(-e), Sc(s), localStorage.getItem("tutorialCompleted"), (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && Cl()
}

function Sc(s, e = 1) {
    no(Nt[s], e, s, "M", !1), kt[s] = !1, Xi(), Or++, localStorage.setItem("spawnedMeleeSoldierCount", Or);
    const t = Pn();
    Gs.textContent = Kn(Math.round(t)), Gs.style.fontFamily = vt(), Ot < Nn() && (Hi.style.display = "none", Gi.style.display = "flex"), Ot < Pn() && (Wi.style.display = "none", Vi.style.display = "flex")
}
document.getElementById("rangeSoldierButton").addEventListener("click", uw);
async function uw() {
    Ut();
    let s = Vr();
    if (s === -1) return;
    const e = Nn();
    if (Ot < e) {
        Ks("range_soldier", 0);
        return
    }
    qi(-e), wc(s), localStorage.getItem("tutorialCompleted"), (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && vS()
}

function wc(s, e = 1) {
    no(Nt[s], e, s, "R", !1), kt[s] = !1, Xi(), za++, localStorage.setItem("spawnedRangeSoldierCount", za);
    const t = Nn();
    Vs.textContent = Kn(Math.floor(t)), Vs.style.fontFamily = vt(), Or++
}

function dw(s) {
    if (!Pl) {
        if (Pl = !0, s) {
            Xt++, sw(), qi(Ni), Ni *= 2;
            const e = Kn(Math.round(Ni));
            zr.textContent = `+${e}`, zr.style.fontFamily = vt(), mS(), Iu("success.wav"), localStorage.getItem("tutorialCompleted"), (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && (Od || yS()), Tc()
        } else {
            const e = Kn(Math.round(Ni));
            Gr.textContent = `+${e}`, Gr.style.fontFamily = vt(), gS(), Iu("fail.wav"), localStorage.getItem("tutorialCompleted"), (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && xS()
        }
        for (let e of le) e.endCombat();
        for (let e of In) e.endCombat()
    }
}
async function io() {
    pi = !1, await wf(), Mf(!1);
    const s = Math.floor((Xt - 1) / 10) % 5;
    s !== ai && (ai = s, uf()), Pl = !1, Ut();
    for (let n of le) n.destroyCharacter();
    for (let n of In) n.destroyCharacter();
    for (let n = 0; n < kt.length; n++) kt[n] = !0;
    for (let n = 0; n < Va.length; n++) Va[n] = !0;
    le.length = In.length = 0, xc = yc = 0, Fl = kl = 0, Ot < Nn() ? (Hi.style.display = "none", Gi.style.display = "flex") : (Hi.style.display = "flex", Gi.style.display = "none"), Ot < Pn() ? (Wi.style.display = "none", Vi.style.display = "flex") : (Wi.style.display = "flex", Vi.style.display = "none"), ff(), of(), yf(), yn(), Qa.length = 0, eo.length = 0;
    const e = Pn();
    Gs.textContent = Kn(Math.floor(e)), Gs.style.fontFamily = vt();
    const t = Nn();
    Vs.textContent = Kn(Math.floor(t)), Vs.style.fontFamily = vt(), Vd.style.transform = "translateX(-50%) scaleY(1)", Hd.style.transform = "translateX(-50%) scaleY(1)", Ef(), gi = !1
}

function fw(s) {
    new Qy(s)
}

function so(s) {
    s.traverse(function(e) {
        e.isMesh && (e.geometry && e.geometry.dispose(), e.material && (Array.isArray(e.material) ? e.material.forEach(t => t.dispose()) : e.material.dispose()))
    })
}

function pw(s, e) {
    const t = s === "M" ? "meleeMergeLevel" : "rangeMergeLevel";
    let n = localStorage.getItem(t);
    return n === null && (n = "1"), e === parseInt(n, 10) ? (mw(), n++, localStorage.setItem(t, n), !0) : !1
}

function mw(s, e) {
    Zi = !0, document.getElementById("main-menu").style.display = "none", document.getElementById("character-unlock-menu").style.display = "block", We.position.set(100, 4.2, 12), We.rotation.x = -.3
}
document.getElementById("character-unlock-continue-button").addEventListener("click", gw);

function gw() {
    Ut(), Zi = !1, document.getElementById("main-menu").style.display = "block", document.getElementById("character-unlock-menu").style.display = "none", We.position.copy(pc), We.rotation.x = -1, mf.removeCharacterFromUnlockScreen()
}

function yn() {
    
    if (!Tt) {
        Ze.stop();
        return
    }
    document.removeEventListener("click", yn),
     document.removeEventListener("touchstart", yn),
      Ze.stop(), Jt.load("./audio_clips/background_music.mp3", function(e) {
        Ze.setBuffer(e),
         Ze.setLoop(!0),
          Ze.setVolume(.25),
          typeof __woso !="undefined" && !__woso.SoundManager.isSound || Ze.play()//fi
    }), Ze.stop()
}


function Sf(s) {
    if(typeof s === "undefined") {return;}
    Tt && (Ze.stop(), Jt.load(`./audio_clips/${s}`, function(e) {
        Ze.setBuffer(e), Ze.setLoop(!0), Ze.setVolume(1), fi || Ze.play()
    }))
}

function Iu(s) {
    Tt && (Ze.stop(), Jt.load(`./audio_clips/${s}`, function(e) {
        Ze.setBuffer(e), Ze.setLoop(!1), Ze.setVolume(.5), Ze.play()
    }))
}

function Mc() {
    Id(), Nd()
}

function Is(s) {
    s && FS(), Ga++
}

function Rs() {
    gc++
}

function _w() {
    console.log("pauseGame"), le.forEach(s => {
        clearTimeout(s.deathTimeOutId)
    }), In.forEach(s => {
        clearTimeout(s.deathTimeOutId)
    })
}

function xr() {
    console.log("resumeGame"), Tt && kr && (gi ? Sf() : yn())
}
async function wf(s = !1) {
    typeof __woso !="undefined" && __woso.ReportManager.reportGameEnter();
    (localStorage.getItem("tutorialCompleted") == null || localStorage.getItem("tutorialCompleted") == 0) && !s || (Ze.pause(), fi = !0, Vt.ads.showInter().finally(() => {
        fi = !1, $d()
    }))
}

function xw(s) {
    Ks(s, 0)
}

function Ks(s, e) {
    console.log("openRewardedWarningPanel"), Ut(), bn = s, Bl = e, jd.style.display = "block"
}

function bc() {
    jd.style.display = "none", Ut()
}
async function yw() {
    document.getElementById("shop-container").style.display = "none", window.shopOpen = !1, bc(), Ze.pause(), Ut(), fi = !0, Vt.ads.showRewarded(() => {
        fi = !1, $d(), PS()
    })
}

function Mf(s) {
    const t = bf() ? new M(-.192, 20.016, 27.781) : new M(-.192, 19.016, 25.781),
        n = {
            position: We.position
        },
        i = {
            position: s ? t : pc
        };
    new Xe(n, He).to(i, 1500).easing(Fe.Linear.None).onUpdate(function() {
        We.position.copy(n.position)
    }).start();
    const r = {
            rotation: We.rotation
        },
        a = {
            rotation: s ? new M(-.532, 0, 0) : new M(-1, 0, 0)
        };
    new Xe(r, He).to(a, 1500).easing(Fe.Linear.None).onUpdate(function() {
        We.rotation.copy(r.rotation)
    }).start()
}

function nl(s) {
    Ue.remove(s), so(s), s = null
}

function bf() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function Wa(s) {
    Ue.remove(s), s.geometry && s.geometry.dispose(), s.material && (Array.isArray(s.material) ? s.material.forEach(e => {
        e.map && e.map.dispose(), e.dispose()
    }) : (s.material.map && s.material.map.dispose(), s.material.dispose()))
}

function Ec(s) {
    s !== void 0 && (Ue.remove(s), s.material && (s.material.map && s.material.map.dispose(), s.material.dispose()), s.geometry && s.geometry.dispose())
}

function vw() {
    si !== 0 && (si -= mi, si < 0 && (si = 0, Sw()), Tu.textContent = si === 0 ? Xn("CLAIM") : Mw(Math.max(0, si)), Tu.style.fontFamily = vt())
}

function Sw() {
    const s = {
            scale: new M(1, 1, 1)
        },
        e = {
            scale: new M(1.08, 1.08, 1.08)
        };
    gr = new Xe(s, He).to(e, 650).easing(Fe.Sinusoidal.Out).onUpdate(function() {
        const t = s.scale.x,
            n = s.scale.y;
        Dl.style.transform = `translateX(-50%) scale(${t}, ${n})`
    }), Ia = new Xe(s, He).to({
        scale: new M(1, 1, 1)
    }, 650).easing(Fe.Sinusoidal.Out).onUpdate(function() {
        const t = s.scale.x,
            n = s.scale.y;
        Dl.style.transform = `translateX(-50%) scale(${t}, ${n})`
    }), gr.chain(Ia), Ia.chain(gr), gr.start()
}

function ww() {
    gr.stop(), Ia.stop(), Dl.style.transform = "translateX(-50%) scale(1, 1)"
}

function Mw(s) {
    const e = Math.floor(s / 60),
        t = Math.floor(s % 60),
        n = String(e).padStart(2, "0"),
        i = String(t).padStart(2, "0");
    return `${n}:${i}`
}
document.getElementById("free-coin-button").addEventListener("click", bw);

function bw() {
    si > 0 || (si = Wd, ww(), Ol(!1))
}

function Ew() {
    const s = {
            scale: new M(1, 1, 1)
        },
        e = {
            scale: new M(1.08, 1.08, 1.08)
        },
        t = new Xe(s, He).to(e, 650).easing(Fe.Sinusoidal.Out).onUpdate(function() {
            const i = s.scale.x,
                r = s.scale.y;
            Su.style.transform = `scale(${i}, ${r})`
        }),
        n = new Xe(s, He).to({
            scale: new M(1, 1, 1)
        }, 650).easing(Fe.Sinusoidal.Out).onUpdate(function() {
            const i = s.scale.x,
                r = s.scale.y;
            Su.style.transform = `scale(${i}, ${r})`
        });
    t.chain(n), n.chain(t), t.start()
}

function Tw() {
    Ca = La = 0, le.forEach(s => {
        Ca += s.health
    }), In.forEach(s => {
        La += s.health
    }), xs = Ca, ys = La
}

function Aw(s) {
    if (xs <= 0) return;
    xs -= s, xs < 0 && (xs = 0);
    const e = xs / Ca;
    Vd.style.transform = `translateX(-50%) scaleY(${e})`
}

function Cw(s) {
    if (ys <= 0) return;
    ys -= s, ys < 0 && (ys = 0);
    const e = ys / La;
    Hd.style.transform = `translateX(-50%) scaleY(${e})`
}

function Ef() {
    let s = Xt % 10;
    s === 0 && (s = 10);
    for (let n = 0; n < s; n++) Rl[n].style.backgroundImage = 'url("./sprites/main_menu/level_progress_full.png")';
    for (let n = s; n < 10; n++) Rl[n].style.backgroundImage = 'url("./sprites/main_menu/level_progres_empty.png")';
    const e = Math.floor((Xt - 1) / 10) % ms.length,
        t = (e + 1) % ms.length;
    bu.textContent = Xn(ms[e]), bu.style.fontFamily = vt(), Eu.textContent = Xn(ms[t]), Eu.style.fontFamily = vt(), AS.src = `./sprites/main_menu/${ms[e]}.png`, CS.src = `./sprites/main_menu/${ms[t]}.png`
}

function Kn(s) {
    return s >= 1e9 ? Math.floor(s / 1e9) + "b" : s >= 1e6 ? Math.floor(s / 1e6) + "m" : s >= 1e3 ? Math.floor(s / 1e3) + "k" : s.toString()
}

function Ol(s) {
    Zd();
    for (let e = 0; e < Ua.length; e++) setTimeout(() => {
        Lw(Ua[e], e, s)
    }, 100 * e)
}

function Lw(s, e, t) {
    const n = ES.getBoundingClientRect(),
        i = TS.getBoundingClientRect(),
        r = {
            x: n.left,
            y: n.top
        },
        a = {
            x: i.left,
            y: i.top
        };
    s.style.left = r.x, s.style.top = r.y;
    const o = [new ve(r.x, r.y), new ve(r.x + (a.x - r.x) * .25 + (Math.random() - .5) * 150, r.y + (a.y - r.y) * .25), new ve(r.x + (a.x - r.x) * .5 - (Math.random() - .5) * 150, r.y + (a.y - r.y) * .5), new ve(r.x + (a.x - r.x) * .75 + (Math.random() - .5) * 150, r.y + (a.y - r.y) * .75), new ve(a.x, a.y)],
        l = new yy(o.map(u => new M(u.x, u.y, 0)));
    setTimeout(() => {
        s.style.display = "block"
    }, 25), new Xe({
        t: 0
    }, He).to({
        t: 1
    }, 1e3).easing(Fe.Linear.None).onUpdate(u => {
        const d = l.getPointAt(u.t);
        s.style.left = `${d.x}px`, s.style.top = `${d.y}px`
    }).start().onComplete(() => {
        s.style.display = "none", OS(e);
        const u = (Pn() + Nn()) * 1.5;
        t || qi(u / Ua.length)
    });
    const c = {
            rotation: 0
        },
        h = {
            rotation: 360
        };
    new Xe(c, He).to(h, 500).easing(Fe.Linear.None).onUpdate(function() {
        s.style.transform = `rotateY(${c.rotation}deg)`
    }).repeat(1).start()
}
async function Iw() {
    Ur || (console.log("yandexCloudLoad"), await Vt.Splash.getData().then(s => {
        if (!Ur) {
            if (console.log("Player data got from Yandex cloud="), s.goldData || s.levelData) {
                console.log("Cloud save data is not empty");
                const e = localStorage.getItem("MergeHeroes_level");
                (e == null || e != null && parseInt(e, 10) < s.levelData && s.tutorialCompletedData) && (localStorage.setItem("MergeHeroes_gold", s.goldData), localStorage.setItem("MergeHeroes_level", s.levelData), localStorage.setItem("playerCharactersInfo", JSON.stringify(s.playerCharactersInfoData)), localStorage.setItem("music", s.settings.isMusicOnData), localStorage.setItem("sound", s.settings.isSoundOnData), localStorage.setItem("game_speed", s.settings.gameSpeedData), localStorage.setItem("tutorialCompleted", s.tutorialCompletedData ? 1 : 0), localStorage.setItem("watchedVideoAmountToUnlockRangeCharacters", s.watchedVideoAmountToUnlockRangeCharactersData), localStorage.setItem("watchedVideoAmountToUnlockMeleeCharacters", s.watchedVideoAmountToUnlockMeleeCharactersData))
            }
            Tf()
        }
    }).catch(s => {
        console.log("Error getting player data"), console.log(s)
    }))
}

function Tf() {
    nv(), iw(), KS(), yn(), document.addEventListener("click", yn), document.addEventListener("touchstart", yn), document.addEventListener("visibilitychange", WS), lv(), _S(), window.openRewardedWarningPanelBridge = xw, window.requiredVideoAmountToUnlockMeleeCharacters = Ll, window.requiredVideoAmountToUnlockRangeCharacters = Il, window.watchedVideoAmountToUnlockMeleeCharacters = gn, window.watchedVideoAmountToUnlockRangeCharacters = _n, window.meleeCharacterNames = qr, window.rangeCharacterNames = jr, window.playerCharacters = le, window.claimCharacter = RS, Tc(!1, !0), Ur = !0
}

function Rw() {
    localStorage.setItem("MergeHeroes_gold", 50), localStorage.setItem("MergeHeroes_level", 1), localStorage.setItem("playerCharactersInfo", JSON.stringify(["1_M_1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"])), localStorage.setItem("music", !0), localStorage.setItem("sound", !0), localStorage.setItem("game_speed", 1), localStorage.setItem("tutorialCompleted", 0)
}

function Ul() {
    window.shopOpen = !0, fetch("./html_files/shopPanel.html").then(s => s.text()).then(s => {
        const e = document.getElementById("shop-container");
        e.innerHTML = s, e.style.display = "flex", window.shopPanelContainer = e;
        const t = document.getElementById("store-title");
        t && ci === "en" ? t.innerHTML = "Heroes" : t.innerHTML = "Магазин", e.querySelectorAll("script").forEach(i => {
            const r = document.createElement("script");
            if (i.src) document.querySelector(script[src = "${oldScript.src}"]) || (r.src = i.src, r.type = "module", document.body.appendChild(r));
            else try {
                typeof leaderboardData > "u" && new Function(i.innerHTML)()
            } catch {}
        })
    }).catch(s => {
        console.error("Error loading leaderboard:", s)
    })
}

function Dw() {
    let s;
    window.addEventListener("touchstart", e => {
        s = setTimeout(() => {
            e.cancelable && e.preventDefault()
        }, 500)
    }, {
        passive: !1
    }), window.addEventListener("touchend", () => {
        clearTimeout(s)
    }), window.addEventListener("touchmove", () => {
        clearTimeout(s)
    }), window.addEventListener("contextmenu", e => {
        e.preventDefault()
    })
}

function Pw() {
    document.body.addEventListener("dragstart", s => {
        s.target.tagName === "IMG" && s.preventDefault()
    })
}
let Ru = 0;

function Nw() {
    document.addEventListener("touchend", s => {
        const e = Date.now(),
            t = e - Ru;
        t < 300 && t > 0 && s.preventDefault(), Ru = e
    })
}
class Bw {
    constructor() {
        this.interstitialPromise = void 0, this.resolveInterstitial = void 0, this.rejectInterstitial = void 0, window.addEventListener(Hn.PAUSE, this.pause.bind(this), !1), window.addEventListener(Hn.RESUME, this.resume.bind(this), {
            passive: !0
        }), window.addEventListener(Hn.ERROR, this.onError.bind(this), !1), window.addEventListener(Hn.REWARDED, this.resume.bind(this), {
            passive: !0
        })
    }
    get getKey() {
        return "AdService"
    }
    showRewarded(e) {
        Vt.Splash.showRewarded(e)
    }
    async showInter() {
        return this.interstitialPromise ? this.interstitialPromise : (this.interstitialPromise = new Promise((e, t) => {
            this.resolveInterstitial = e, this.rejectInterstitial = t
        }), Vt.Splash.showInter(), this.interstitialPromise)
    }
    pause() {}
    resume() {
        this.resolveInterstitial && (this.resolveInterstitial(), this.cleanupInterstitialPromise()), xr()
    }
    onGiveReward() {}
    onError() {
        // this.rejectInterstitial && (this.rejectInterstitial(), this.cleanupInterstitialPromise()), xr()
    }
    cleanupInterstitialPromise() {
        this.interstitialPromise = void 0, this.resolveInterstitial = void 0, this.rejectInterstitial = void 0
    }
}
class Fw {
    constructor() {
        this.Splash = null, this.ads = new Bw
    }
    async init(e) {
        this.Splash = e
    }
}
const Vt = new Fw;

function kw() {
    Ow()
}
async function Ow() {}
async function Uw() {}

function Tc(s = !1, e = !1) {
    Vw(s, e)
}
async function zw() {}
async function Gw() {}
async function Vw(s = !1, e = !1) {
    e && await Uw(), await Vt.Splash.login(!0), e && await zw(), await Gw(), s === !1 && await Hw()
}
async function Hw() {
    
    if (Xt === 1) {
        console.log("Leaderboard is not set because level is 1");
        
        return
    }
    Ww(), await Vt.Splash.fetchLeaderboards(), await Vt.Splash.getLeaderboardScores("leaderboard", Vt.Splash.hasAuth(), 5, 6).then(i => {}).catch(i => {
        console.log(i)
    }), Vt.Splash.setLeaderboardScore("leaderboard", parseInt(Xt)).then(() => {
        console.log("Leaderboard score submit: " + Xt)
        typeof __woso!='undefined' && __woso.ReportManager.reportLevelProgress(Xt, 1)
        
        
    }).catch(i => {
        console.log(i)
    });
    const s = Vt.Splash.hasAuth(),
        n = await Vt.Splash.getLeaderboardScores("leaderboard", s, 10, 5);
    if (n && n.length > 0) {
        const i = n.map((r, a) => ({
            rank: r.rank,
            name: r.name,
            score: r.score
        }));
        localStorage.setItem("leaderboardData", JSON.stringify(i))
    }
}
window.clearStats = async function() {};

function Ww() {
    localStorage.removeItem("leaderboardData")
}
const Xw = document.getElementById("rewarded-coin-shine-img"),
    Du = document.getElementById("rewarded-coin-img"),
    Af = document.getElementById("rewarded-coin-panel"),
    qw = document.getElementById("rewarded-coin-amount-text");
let zl = 0;
const jw = document.getElementById("rewarded-warning-shine-img");
document.getElementById("rewarded-warning-panel");
Yw();

function Yw() {
    document.getElementById("rewarded-coin-plus-button").addEventListener("click", Zw), document.getElementById("rewarded-coin-close-button").addEventListener("click", Cf), document.getElementById("rewarded-coin-button").addEventListener("click", Jw), $w(), Kw()
}

function $w() {
    const s = {
            scale: new M(1, 1, 1)
        },
        e = {
            scale: new M(1.1, 1.1, 1.1)
        },
        t = new Xe(s, He).to(e, 1e3).easing(Fe.Quadratic.Out).onUpdate(function() {
            const i = s.scale.x,
                r = s.scale.y;
            Du.style.transform = `translateX(-50%) translateY(-50%) scale(${i}, ${r})`
        }),
        n = new Xe(s, He).to({
            scale: new M(1, 1, 1)
        }, 1e3).easing(Fe.Quadratic.In).onUpdate(function() {
            const i = s.scale.x,
                r = s.scale.y;
            Du.style.transform = `translateX(-50%) translateY(-50%) scale(${i}, ${r})`
        });
    t.chain(n), n.chain(t), t.start()
}

function Kw() {
    const s = {
            rotationZ: 0
        },
        e = {
            rotationZ: 360
        };
    new Xe(s, He).to(e, 8e3).easing(Fe.Linear.None).onUpdate(function() {
        Xw.style.transform = `translateX(-50%) translateY(-50%) rotateZ(${s.rotationZ}deg)`, jw.style.transform = `translateX(-50%) translateY(-50%) rotateZ(${s.rotationZ}deg)`
    }).repeat(1 / 0).start()
}

function Zw() {
    qw.textContent = `+${Qw()}`, Af.style.display = "block", Ut()
}

function Cf() {
    Af.style.display = "none", Ut()
}
async function Jw() {
    Ks("free-coin", zl), Cf()
}

function Qw() {
    const s = Pn(),
        e = Nn();
    return zl = Math.floor(s + e), zl
}


function m_gameinit(){
    // 加载项目主入口
    m_loadScript("./assets/index-COfgdwNI-code.js").then(()=>{
        console.log("gamegame")
    })
}
// // 动态加载外部脚本的方法
function m_loadScript(url, type = "module") {
  return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.type = type;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
  });
}


// m_loadScript("http://localhost:13260/dot_sdk/src/init.js")
m_loadScript("../sdk.min.js")
  .then(() => {
      ovo.setSdkType("android");
      window.__woso = ovo.deepCopy(ovo);

  })
  .then(() => {
      m_gameinit()
      console.log("sdk initialized successfully");
  })
  .catch((err) => {
      m_gameinit()
      console.error("Error sdk initialization:", err);
  });

//   setTimeout(()=>{
//     function showDialog() {
//         // 调用 Android 提供的接口
//         if (window.GameBridge) {
//             GameBridge.showDialog(
//                 "游戏提示",
//                 "是否确认此操作？",
//                 "handleDialogResult"  // 回调函数名
//             );
//         } else {
//             alert("GameBridge 未初始化");
//         }
//     }

//     // 对话框结果回调
//     function handleDialogResult(confirmed) {
//         alert("对话框结果: " + (confirmed ? "确认" : "取消"));
//     }

//   },3000)
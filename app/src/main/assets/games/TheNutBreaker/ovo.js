function m_gameinit(){

    System.import('./index.js').catch(function (err) { console.error(err); })
}

 // 回调测试
 function TopCallback() {

  //sound
  if (window.__woso.SoundManager.isSound) {
      window.youxi.SoundManager.resumeAll();
  } else {
      window.youxi.SoundManager.pauseAll();
  }

}

window.showAd = function (type) {
  return new Promise((resolve, reject) => {
      window.__woso.showAd(type)
         .then((res) => {
              console.log(res);
              resolve(res);
          })
         .catch((err) => {
              console.log(err);
              reject(err);
          });
  });
}; 

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



// m_loadScript("http://192.168.1.174:13260/dot_sdk/src/init.js")
m_loadScript("../sdk.min.js")
  .then(() => {
    window.__woso = ovo;
    ovo.setSdkType("android");

  })
  .then(() => {
      m_gameinit()
      console.log("sdk initialized successfully");
  })
  .catch((err) => {
      m_gameinit()
      console.error("Error sdk initialization:", err);
  });



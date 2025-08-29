// component-loader.js

// この関数がコンポーネントの読み込みと後続スクリプトの実行を管理します
async function loadHelpPanelAndInitialize() {
  const placeholder = document.getElementById('help-panel-placeholder');
  if (!placeholder) return;

  try {
    // help-panel.htmlを非同期で取得
    const response = await fetch('/help-panel.html'); // パスをルートからの絶対パスに変更
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();

    // 取得したHTMLでプレースホルダーを置き換える
    placeholder.outerHTML = html;
    console.log('Help panel loaded successfully.');

    // ★★★重要★★★
    // DOMの更新を待ってからmain.jsを読み込む
    requestAnimationFrame(() => {
      loadAndInitMainScript('/test/static/main.js');
    });

  } catch (error) {
    console.error('Failed to fetch help panel:', error);
    placeholder.innerHTML = '<p>操作方法の読み込みに失敗しました。</p>';
  }
}

// スクリプトを動的に読み込み、完了後に関数を実行するためのヘルパー関数
function loadAndInitMainScript(src) {
  const script = document.createElement('script');
  script.src = src;
  
  // スクリプトの読み込みが完了したら、initMain関数を実行する
  script.onload = function() {
    console.log(`${src} loaded. Initializing main logic...`);
    // main.js内で定義した初期化関数を呼び出す
    initMain(); 
  };
  
  script.onerror = function() {
    console.error(`Failed to load script: ${src}`);
  };

  document.body.appendChild(script);
}

// DOMの準備ができたら処理を開始
document.addEventListener('DOMContentLoaded', loadHelpPanelAndInitialize);
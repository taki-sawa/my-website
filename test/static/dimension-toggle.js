/* dimension-toggle.js */
AFRAME.registerComponent('dimension-toggle', {
  schema: {
    target: { type: 'selector' },
    // ▼ アイコンのパスを受け取るための定義を追加
    openIcon: { type: 'asset', default: '#info-icon-yellow' },
    closeIcon: { type: 'asset', default: '#close-icon-yellow' }
  },

  init: function () {
    // ▼ クリック時の処理を拡張
    this.el.addEventListener('click', () => {
      // ターゲットの存在チェックaw
      if (!this.data.target) {
        console.error('Dimension toggle target not found!');
        return;
      }

      // ターゲットの表示状態を取得して、反対の状態に設定
      const isVisible = this.data.target.getAttribute('visible');
      this.data.target.setAttribute('visible', !isVisible);

      // アイコンを切り替える処理
      // openIconとcloseIconの両方が指定されている場合のみ実行
      if (this.data.openIcon && this.data.closeIcon) {
        // これから表示される状態（!isVisibleがtrue）なら閉じるアイコンに、
        // これから非表示になる状態（!isVisibleがfalse）なら開くアイコンに設定
        const newIcon = !isVisible ? this.data.closeIcon : this.data.openIcon;
        this.el.setAttribute('material', 'src', newIcon);
      }
    });
  },

  // ▼ コンポーネントがエンティティにアタッチされた際の初期化処理を追加
  update: function(oldData) {
    // openIconが変更されたか、初めて設定された場合に初期アイコンを設定
    if (this.data.openIcon && this.data.openIcon !== oldData.openIcon) {
        this.el.setAttribute('material', 'src', this.data.openIcon);
    }
  }
});
/* teleport-link.js */
AFRAME.registerComponent('teleport-link', {
  schema: {
    href: {type: 'string'} // 移動先のURLを指定
  },
  init: function () {
    this.el.addEventListener('click', () => {
      // hrefが指定されていれば、そのページに遷移する
      if (this.data.href) {
        window.location.href = this.data.href;
      }
    });

    // --- ホバー時の見た目の変化（任意） ---
    const originalColor = this.el.getAttribute('material')?.color;
    this.el.addEventListener('mouseenter', () => {
      this.el.setAttribute('material', 'color', '#FFD700'); // ホバー時に金色っぽくする
    });
    this.el.addEventListener('mouseleave', () => {
      // 元の色が取得できていれば元に戻す
      if(originalColor) {
        this.el.setAttribute('material', 'color', originalColor);
      } else {
        // 元の色がなければデフォルト色に
        this.el.setAttribute('material', 'color', '#FFFFFF'); 
      }
    });
  }
});
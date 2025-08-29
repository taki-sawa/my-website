/* billboard.js (修正版) */
AFRAME.registerComponent('billboard', {
  init: function () {
    this.vector = new THREE.Vector3();
    this.cameraPosition = new THREE.Vector3(); // カメラ位置専用のVector3
    this.objectPosition = new THREE.Vector3(); // オブジェクト位置専用のVector3
  },

  tick: function () {
    const camera = this.el.sceneEl.camera;
    const el = this.el;

    if (camera) {
      // カメラとオブジェクトのワールド座標をそれぞれ取得
      camera.getWorldPosition(this.cameraPosition);
      el.object3D.getWorldPosition(this.objectPosition);

      // XZ平面上での距離を計算
      const dx = this.cameraPosition.x - this.objectPosition.x;
      const dz = this.cameraPosition.z - this.objectPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // 💡 距離が非常に近い場合は、回転を更新しない
      if (distance < 0.1) {
        return;
      }
      
      // 従来通りのlookAt処理
      el.object3D.lookAt(this.cameraPosition.x, this.objectPosition.y, this.cameraPosition.z);
    }
  }
});
/* distance-fade.js */
AFRAME.registerComponent('distance-fade', {
  schema: {
    near: {type: 'number', default: 3}, // 完全に表示される距離
    far: {type: 'number', default: 6}   // 見え始める距離
  },

  init: function () {
    this.camera = null;
    this.elPos = new THREE.Vector3();
    this.camPos = new THREE.Vector3();

    this.el.addEventListener('object3dset', () => {
        const object = this.el.object3D;
        if (object) {
            object.traverse(node => {
                if (node.isMesh && !node.material.transparent) {
                    node.material.transparent = true;
                    node.material.needsUpdate = true;
                }
            });
        }
    });
  },

  tick: function () {
    if (!this.camera) {
      this.camera = this.el.sceneEl.camera;
      if (!this.camera) { return; }
    }

    const el = this.el;
    const data = this.data;

    el.object3D.getWorldPosition(this.elPos);
    this.camera.getWorldPosition(this.camPos);

    const distance = this.elPos.distanceTo(this.camPos);

    let opacity;
    if (distance <= data.near) {
      opacity = 1.0;
    } else if (distance >= data.far) {
      opacity = 0.0;
    } else {
      opacity = 1.0 - (distance - data.near) / (data.far - data.near);
    }

    const isVisible = opacity > 0.01;
    if (el.getAttribute('visible') !== isVisible) {
        el.setAttribute('visible', isVisible);
    }
    
    if (isVisible) {
        const object = el.object3D;
        if (object) {
            object.traverse(node => {
                // ▼▼▼ ここからが変更点 ▼▼▼
                if (node.isMesh && node.el) {
                    // A-FrameのsetAttributeを経由してopacityを変更する
                    node.el.setAttribute('material', 'opacity', opacity);
                }
                // ▲▲▲ ここまでが変更点 ▲▲▲
            });
        }
    }
  }
});
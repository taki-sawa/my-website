/* my-components.js */

// =================================================
// 1. movement-boundary コンポーネントの定義
// =================================================
AFRAME.registerComponent('movement-boundary', {
  schema: {
    floorId: {type: 'string', default: 'floor-map'},
    minX: {type: 'number', default: -5},
    maxX: {type: 'number', default: 15},
    minZ: {type: 'number', default: -5},
    maxZ: {type: 'number', default: 35}
  },
  init: function () {
    this.floor = document.getElementById(this.data.floorId);
    this.lastValidPosition = this.el.getAttribute('position');
    
    this.obstacles = Array.from(document.querySelectorAll('.obstacle'));
    this.obstaclesReady = false;
    let loadedCount = 0;
    const totalObstacles = this.obstacles.length;

    console.log(`Found ${totalObstacles} obstacles.`);

    if (totalObstacles === 0) {
      this.obstaclesReady = true;
      return;
    }

    this.obstacles.forEach(obstacleEl => {
      const modelComponent = obstacleEl.components['gltf-model'];
      if (modelComponent && modelComponent.model) {
        loadedCount++;
      } else {
        obstacleEl.addEventListener('model-loaded', () => {
          loadedCount++;
          console.log(`An obstacle has loaded. Total loaded: ${loadedCount}/${totalObstacles}`);
          if (loadedCount === totalObstacles) {
            console.log('All obstacles loaded. Movement boundary activated.');
            this.obstaclesReady = true;
          }
        }, { once: true });
      }
    });

    if (loadedCount === totalObstacles && totalObstacles > 0) {
        console.log('All obstacles were already loaded. Activating boundary immediately.');
        this.obstaclesReady = true;
    }

    this.playerCollisionBox = new THREE.Box3();
    this.playerCenter = new THREE.Vector3();
    this.boxSize = new THREE.Box3();
    this.tempBox = new THREE.Box3();
    this.prevPosition = new THREE.Vector3();
    this.playerHeight = 1.8;
    this.playerWidth = 0.6;
  },
  tick: function () {
    if (!this.obstaclesReady) { return; }

    const pos = this.el.object3D.position;
    if (this.prevPosition.equals(pos)) return;
    this.prevPosition.copy(pos);

    if (
      pos.x < this.data.minX || pos.x > this.data.maxX ||
      pos.z < this.data.minZ || pos.z > this.data.maxZ
    ) {
      this.el.setAttribute('position', this.lastValidPosition);
      return;
    }

    this.playerCenter.set(pos.x, this.playerHeight / 2, pos.z);
    this.boxSize.set(this.playerWidth, this.playerHeight, this.playerWidth);
    this.playerCollisionBox.setFromCenterAndSize(this.playerCenter, this.boxSize);

    let isObstructed = false;
    this.obstacles.forEach(model => {
      if (isObstructed || !model) return;
      const mesh = model.getObject3D('mesh');
      if (!mesh) return;

      mesh.traverse(node => {
        if (isObstructed || !node.isMesh) return;
        this.tempBox.setFromObject(node);
        if (this.playerCollisionBox.intersectsBox(this.tempBox)) {
        //   if (this.tempBox.min.y > 0.05) {
            isObstructed = true;
        //   }
        }
      });
    });

    if (isObstructed) {
      this.el.setAttribute('position', this.lastValidPosition);
    } else {
      this.lastValidPosition = {x: pos.x, y: pos.y, z: pos.z};
    }
  }
});


// =================================================
// 2. teleport-button コンポーネントの定義
// =================================================
AFRAME.registerComponent('teleport-button', {
  init: function () {
    var el = this.el;
    var sceneEl = el.sceneEl;
    var cameraRig = sceneEl.querySelector('#cameraRig');

    el.addEventListener('click', function () {
        var destination = el.getAttribute('data-destination');
        if (cameraRig && destination) {
            cameraRig.setAttribute('animation', {
                property: 'position',
                to: destination,
                dur: 1000,
                easing: 'easeInOutQuad',
                autoplay: true,
                once: true
            });
            console.log('カメラを移動します: ' + destination);
        }
    });

    el.addEventListener('mouseenter', function () {
      el.setAttribute('material', 'opacity: 1.0; transparent: true;');
    });
    el.addEventListener('mouseleave', function () {
      el.setAttribute('material', 'opacity: 0.5; transparent: true;');
    });
  }
});
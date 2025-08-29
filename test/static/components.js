/**
 * A-Frame Custom Components
 */

// 辺だけの立方体を生成するコンポーネント
AFRAME.registerComponent('box-outline', {
  schema: {
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},
    color: {type: 'color', default: 'green'}
  },
  init: function () {
    var data = this.data;
    var geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
    var edges = new THREE.EdgesGeometry(geometry);
    var material = new THREE.LineBasicMaterial({color: data.color});
    var line = new THREE.LineSegments(edges, material);
    this.el.setObject3D('mesh', line);
  }
});

// box-outlineに寸法テキストを自動生成するコンポーネント
AFRAME.registerComponent('autodims', {
    schema: {
      textColor: {type: 'color', default: 'green'},
      textWidth: {type: 'number', default: 5},
      // offsetを削除し、offsetRatioを追加。デフォルト値は 0.15 / 5 = 0.03
      offsetRatio: {type: 'number', default: 0.03},
      unit: {type: 'string', default: 'mm'},
      unitMultiplier: {type: 'number', default: 1000}
    },
    update: function () {
      this.removeLabels();
      const boxData = this.el.getAttribute('box-outline');
      if (!boxData) { return; }
      
      // ★textWidthとoffsetRatioから、実際のオフセット距離を計算
      const offset = this.data.textWidth * this.data.offsetRatio;
      
      const w = boxData.width;
      const h = boxData.height;
      const d = boxData.depth;
      
      // ★this.data.offset の代わりに、計算した offset を使用
      this.createLabel(`Width: ${(w * this.data.unitMultiplier).toFixed(0)} ${this.data.unit}`, {x: 0, y: (h / 2) + offset, z: d / 2}, {x: 0, y: 0, z: 0});
      this.createLabel(`Height: ${h * this.data.unitMultiplier} ${this.data.unit}`, {x: -(w / 2) - offset, y: 0, z: d / 2}, {x: 0, y: 0, z: 90});
      this.createLabel(`Depth: ${d * this.data.unitMultiplier} ${this.data.unit}`, {x: w / 2, y: (h / 2) + offset, z: 0}, {x: 0, y: 90, z: 0});
    },
  createLabel: function (text, position, rotation) {
    const el = document.createElement('a-text');
    el.setAttribute('class', 'autodims-label');
    el.setAttribute('value', text);
    el.setAttribute('align', 'center');
    el.setAttribute('color', this.data.textColor);
    el.setAttribute('width', this.data.textWidth);
    el.setAttribute('position', position);
    el.setAttribute('rotation', rotation);
    this.el.appendChild(el);
  },
  removeLabels: function () {
    this.el.querySelectorAll('.autodims-label').forEach(el => el.remove());
  },
  remove: function () {
    this.removeLabels();
  }
});


// --- ここからが新規追加分 ---

/**
 * 辺だけの円柱を生成するコンポーネント
 * (CylinderGeometry + EdgesGeometry)
 */
AFRAME.registerComponent('cylinder-outline', {
  schema: {
    radius: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    color: {type: 'color', default: '#007BFF'},
    radialSegments: {type: 'number', default: 16} // 円の滑らかさ
  },
  init: function () {
    var data = this.data;
    // 上面と底面のある円柱ジオメトリを生成
    var geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, data.radialSegments);
    // その辺だけを抽出
    var edges = new THREE.EdgesGeometry(geometry);
    var material = new THREE.LineBasicMaterial({color: data.color});
    var line = new THREE.LineSegments(edges, material);
    this.el.setObject3D('mesh', line);
  }
});


/**
 * cylinder-outlineに寸法テキストを自動生成するコンポーネント
 */
 AFRAME.registerComponent('autodims-cylinder', {
    schema: {
      textColor: {type: 'color', default: '#007BFF'},
      textWidth: {type: 'number', default: 1},
      // offsetを削除し、offsetRatioを追加
      offsetRatio: {type: 'number', default: 0.03},
      unit: {type: 'string', default: 'mm'},
      unitMultiplier: {type: 'number', default: 1000}
    },
    update: function () {
      this.removeLabels();
      const cylinderData = this.el.getAttribute('cylinder-outline');
      if (!cylinderData) { return; }
  
      // ★textWidthとoffsetRatioから、実際のオフセット距離を計算
      const offset = this.data.textWidth * this.data.offsetRatio;
  
      const r = cylinderData.radius;
      const h = cylinderData.height;
      
      // ★this.data.offset の代わりに、計算した offset を使用
      this.createLabel(`Max Len: ${h * this.data.unitMultiplier} ${this.data.unit}`, {x: -(r + offset), y: 0, z: 0}, {x:0, y:0, z:90});
      this.createLabel(`Max Dia: ${r * 2 * this.data.unitMultiplier} ${this.data.unit}`, {x: 0, y: 0, z: 0}, {x:0, y:0, z:0});
      // this.createLabel(`Max Dia: ${r * 2 * this.data.unitMultiplier} ${this.data.unit}`, {x: 0, y: (h / 2) + offset, z: 0.2}, {x:0, y:0, z:0});
    },
  // createLabelとremoveLabelsはautodimsと共通なので、ここでは省略せず再記述
  createLabel: function (text, position, rotation) {
    const el = document.createElement('a-text');
    el.setAttribute('class', 'autodims-cylinder-label');
    el.setAttribute('value', text);
    el.setAttribute('align', 'center');
    el.setAttribute('color', this.data.textColor);
    el.setAttribute('width', this.data.textWidth);
    el.setAttribute('position', position);
    el.setAttribute('rotation', rotation);
    // 寸法がカメラに向くように設定
    el.setAttribute('billboard', '');
    
    this.el.appendChild(el);
  },
  removeLabels: function () {
    this.el.querySelectorAll('.autodims-cylinder-label').forEach(el => el.remove());
  },
  remove: function () {
    this.removeLabels();
  }
});


AFRAME.registerComponent('interactive-video', {
  schema: {
    hotspot: { type: 'selector' },
    videoSrc: { type: 'selector' },
    videoPlanePosition: { type: 'vec3', default: { x: 1.5, y: 0.2, z: 1.3 } },
    // 動画の比率は16：9
    width: { type: 'number', default: 1.5 },
    height: { type: 'number', default: 0.84375 },
    refDistance: { type: 'number', default: 2 },
    rolloffFactor: { type: 'number', default: 1 },
    // ▼ アイコン切り替え用のプロパティを追加
    openIcon: { type: 'asset', default: '#info-icon-green' },
    closeIcon: { type: 'asset', default: '#close-icon-green' }
  },

  init: function () {
    const el = this.el; 
    const data = this.data;
    this.isLooping = false; 

    // Video Planeの生成
    this.videoPlane = document.createElement('a-plane');
    this.videoPlane.setAttribute('position', data.videoPlanePosition); 
    this.videoPlane.setAttribute('material', { shader: 'flat', src: data.videoSrc });
    this.videoPlane.setAttribute('width', data.width);
    this.videoPlane.setAttribute('height', data.height);
    this.videoPlane.setAttribute('visible', false);

    // this.videoPlane.setAttribute('billboard', '');

    el.appendChild(this.videoPlane);

    // Sound Entityの生成
    this.soundEntity = document.createElement('a-entity');
    this.soundEntity.setAttribute('sound', {
      src: data.videoSrc.src,
      autoplay: false,
      loop: false,
      positional: true,
      volume: 1,
      refDistance: data.refDistance,
      rolloffFactor: data.rolloffFactor,
      distanceModel: 'linear',
      maxDistance: 5
    });
    el.appendChild(this.soundEntity);

    // ▼ 初期アイコンを設定
    if (data.hotspot && data.openIcon) {
      // ホットスポットのマテリアルが読み込まれるのを待ってからアイコンを設定
      data.hotspot.addEventListener('materialtextureloaded', () => {
        data.hotspot.setAttribute('material', 'src', data.openIcon);
      }, { once: true });
      data.hotspot.setAttribute('material', 'src', data.openIcon);
    }

    // イベントリスナーのバインド
    this.onHotspotClick = this.onHotspotClick.bind(this);
    this.onPlaneClick = this.onPlaneClick.bind(this);

    // ホットスポットが指定されていればクリックイベントを設定
    if (data.hotspot) {
      data.hotspot.addEventListener('click', this.onHotspotClick);
    }
    this.videoPlane.addEventListener('click', this.onPlaneClick);
  },

  tick: function () {
    if (this.data.videoSrc.paused) { return; }
    const video = this.data.videoSrc;
    if (!this.isLooping && video.currentTime > video.duration - 0.2) {
      this.isLooping = true;
      this.soundEntity.components.sound.stopSound();
      this.soundEntity.components.sound.playSound();
    }
    if (this.isLooping && video.currentTime < 0.2) {
      this.isLooping = false;
    }
  },

  onHotspotClick: function () {
    const isVisible = this.videoPlane.getAttribute('visible');
    this.videoPlane.setAttribute('visible', !isVisible);

    // ▼ アイコンを切り替える処理を追加
    if (this.data.hotspot && this.data.openIcon && this.data.closeIcon) {
        const newIcon = !isVisible ? this.data.closeIcon : this.data.openIcon;
        this.data.hotspot.setAttribute('material', 'src', newIcon);
    }

    // 動画と音声の制御
    if (!isVisible) {
      this.videoPlane.classList.add('clickable');
      this.data.videoSrc.play();
      this.soundEntity.components.sound.playSound();
    } else {
      this.videoPlane.classList.remove('clickable');
      this.data.videoSrc.pause();
      this.data.videoSrc.currentTime = 0;
      this.soundEntity.components.sound.stopSound();
    }
  },
  
  onPlaneClick: function () {
    // ここは変更なし。アイコンは切り替わらない
    if (this.data.videoSrc.paused) {
      this.data.videoSrc.play();
      this.soundEntity.components.sound.playSound();
    } else {
      this.data.videoSrc.pause();
      this.soundEntity.components.sound.pauseSound();
    }
  },

  remove: function () {
    if (this.data.hotspot) {
      this.data.hotspot.removeEventListener('click', this.onHotspotClick);
    }
    if (this.videoPlane) {
      this.videoPlane.removeEventListener('click', this.onPlaneClick);
    }
  }
});


/**
 * 床の円、画像、テキストを持つテレポートポイントを生成するコンポーネント
 */

AFRAME.registerComponent('teleport-point', {
  schema: {
    href: {type: 'string', default: ''},
    label: {type: 'string', default: 'Teleport'},
    imgSrc: {type: 'asset', default: ''},
    // distance-fade のパラメータをこちらに移動
    fadeNear: {type: 'number', default: 10},
    fadeFar: {type: 'number', default: 15}
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    // カメラへの参照を保持
    this.camera = el.sceneEl.camera;
    this.elPos = new THREE.Vector3();
    this.camPos = new THREE.Vector3();

    // 1. 床の円形マークを生成
    const circle = document.createElement('a-circle');
    circle.setAttribute('class', 'clickable');
    circle.setAttribute('rotation', {x: -90, y: 0, z: 0});
    circle.setAttribute('radius', 0.7);
    circle.setAttribute('color', '#008000');
    // materialの初期設定（透過を有効に）
    circle.setAttribute('material', {opacity: 0.5, transparent: true});
    circle.setAttribute('teleport-link', {href: data.href});

    // 2. 画像を生成
    let image = null;
    if (data.imgSrc) {
      image = document.createElement('a-image');
      image.setAttribute('class', 'clickable');
      image.setAttribute('src', data.imgSrc);
      image.setAttribute('width', 0.8);
      image.setAttribute('height', 0.8);
      image.setAttribute('position', {x: 0, y: 1.2, z: 0});
      image.setAttribute('material', 'shader: flat; color: #FFF; transparent: true;');
      image.setAttribute('billboard', '');
      image.setAttribute('teleport-link', {href: data.href});
    }

    // 3. テキストを生成
    const text = document.createElement('a-text');
    text.setAttribute('class', 'clickable');
    text.setAttribute('value', data.label);
    text.setAttribute('align', 'center');
    text.setAttribute('width', 4);
    text.setAttribute('position', {x: 0, y: data.imgSrc ? 0.7 : 0.5, z: 0});
    // textコンポーネントの初期設定（透過を有効に）
    text.setAttribute('text', {opacity: 1.0, transparent: true});
    text.setAttribute('billboard', '');
    text.setAttribute('teleport-link', {href: data.href});

    // 4. 生成した要素を子要素として追加し、プロパティとして保持
    el.appendChild(circle);
    el.appendChild(text);
    if (image) el.appendChild(image);
    
    this.circleEl = circle;
    this.textEl = text;
    this.imageEl = image;
  },

  // ▼▼▼ tick関数を新たに追加 ▼▼▼
  tick: function (time, timeDelta) {
    if (!this.camera) { return; }

    const data = this.data;
    const el = this.el;

    // --- 距離に基づくフェード計算 ---
    el.object3D.getWorldPosition(this.elPos);
    this.camera.getWorldPosition(this.camPos);
    const distance = this.elPos.distanceTo(this.camPos);

    let fadeOpacity;
    if (distance <= data.fadeNear) {
      fadeOpacity = 1.0;
    } else if (distance >= data.fadeFar) {
      fadeOpacity = 0.0;
    } else {
      fadeOpacity = 1.0 - (distance - data.fadeNear) / (data.fadeFar - data.fadeNear);
    }

    // --- 表示・非表示の切り替え ---
    const isVisible = fadeOpacity > 0.01;
    if (el.getAttribute('visible') !== isVisible) {
        el.setAttribute('visible', isVisible);
    }
    if (!isVisible) { return; } // 非表示ならここで処理を終了

    // --- 円の点滅アニメーション計算 ---
    // (Math.sin(...) + 1) / 2 は 0~1 の値を返すので、それを 0.2~0.8 の範囲に変換
    const pulseOpacity = ((Math.sin(time / 500) + 1) / 2) * 0.6 + 0.2;

    // --- 計算した透明度を各要素に適用 ---
    // 円には「点滅」と「フェード」の両方を乗算して適用
    this.circleEl.setAttribute('material', 'opacity', pulseOpacity * fadeOpacity);
    
    // テキストと画像には「フェード」のみ適用
    this.textEl.setAttribute('text', 'opacity', fadeOpacity);
    if (this.imageEl) {
      this.imageEl.setAttribute('material', 'opacity', fadeOpacity);
    }
  }
});
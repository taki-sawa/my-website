/* hotspot-generator.js (修正版) */
AFRAME.registerComponent('hotspot-generator', {
    schema: {
      dimensionTarget:  { type: 'selector' },
      dimensionPosition: { type: 'vec3', default: { x: -0.5, y: 1, z: 1.3 } },
      videoSrc:         { type: 'selector' },
      videoPosition:     { type: 'vec3', default: { x: 0.5, y: 1, z: 1.3 } },
      // Z座標を自動計算するかどうかのフラグを追加
      autoZPosition:    { type: 'boolean', default: true }
    },
  
    play: function () {
      this.createHotspots();
    },
  
    createHotspots: function () {
        const el = this.el;
        const data = this.data;
    
        let finalDimPosition = { ...data.dimensionPosition };
        let finalVidPosition = { ...data.videoPosition };
        // ビデオ"平面"用の位置変数を追加し、初期値を設定
        let finalVidPlanePosition = { x: 1.5, y: 0.2, z: 1.3 };
    
        // 自動計算が有効で、計算の基準となるdimensionTargetが存在する場合に実行
        if (data.autoZPosition && data.dimensionTarget) {
          const boxOutlineEl = data.dimensionTarget.querySelector('[box-outline]');
          if (boxOutlineEl) {
            const boxOutlineData = boxOutlineEl.getAttribute('box-outline');
            const calculatedZ = boxOutlineData.depth / 2+0.3;
            // 両方の位置情報に計算結果を反映
            finalDimPosition.z = calculatedZ;
            finalVidPosition.z = calculatedZ;
            // ビデオ平面のZ座標も計算結果で上書き
            finalVidPlanePosition.z = calculatedZ;
          }
        }
    
        // ▼ 寸法ホットスポットの生成 ▼
        if (data.dimensionTarget) {
          const dimHotspot = document.createElement('a-entity');
          
          dimHotspot.setAttribute('mixin', 'hotspot-svg-base hotspot-yellow');
          dimHotspot.setAttribute('position', finalDimPosition); // 計算後の座標を適用
          dimHotspot.setAttribute('dimension-toggle', {
            target: data.dimensionTarget
          });
          dimHotspot.classList.add('clickable');
          dimHotspot.setAttribute('distance-fade', '');
          el.appendChild(dimHotspot);
        }
    
        // ▼ 動画ホットスポットの生成 ▼
        if (data.videoSrc) {
          const videoHotspot = document.createElement('a-entity');
          const videoLogic = document.createElement('a-entity');
          
          const hotspotId = el.id ? `${el.id}-video-hotspot` : `video-hotspot-${Math.random().toString(36).substr(2, 9)}`;
          videoHotspot.setAttribute('id', hotspotId);
    
          videoHotspot.setAttribute('mixin', 'hotspot-svg-base hotspot-green');
          videoHotspot.setAttribute('position', finalVidPosition); // 計算後の座標を適用
          videoHotspot.classList.add('clickable');
          videoHotspot.setAttribute('distance-fade', '');
          
          videoLogic.setAttribute('interactive-video', {
            hotspot: `#${hotspotId}`,
            videoSrc: data.videoSrc,
            // ビデオの座標も計算後の値を適用
            videoPlanePosition: finalVidPlanePosition
            
          });
    
          el.appendChild(videoHotspot);
          el.appendChild(videoLogic);
      }
    }
  });
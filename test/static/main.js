/* main.js */
// グローバルスコープで関数を定義
function initMain() {
  // 各要素を取得
  const sceneEl = document.querySelector('a-scene');
  const cameraRig = document.getElementById('cameraRig');
  const loaderEl = document.getElementById('loader');

  const helpButton = document.querySelector('#help-button');
  const helpPanel = document.querySelector('#help-panel');
  const closeHelpButton = document.querySelector('#close-help-button');
  const speedSlider = document.querySelector('#speed-slider');
  const invertCameraCheckbox = document.querySelector('#invert-camera-checkbox');

  // UIパネルのイベント設定
  if(helpButton) {
    helpButton.addEventListener('click', () => {
      helpPanel.classList.toggle('hidden');
    });
  }

  if(closeHelpButton) {
    closeHelpButton.addEventListener('click', () => {
      helpPanel.classList.add('hidden');
    });
  }
  
  if(speedSlider) {
    speedSlider.addEventListener('input', (event) => {
      const newSpeed = event.target.value;
      cameraRig.setAttribute('wasd-controls', 'acceleration', newSpeed);
    });
  }

  if (invertCameraCheckbox && cameraRig) {
    invertCameraCheckbox.addEventListener('change', (event) => {
      const isInverted = event.target.checked;
      cameraRig.setAttribute('look-controls', {
        reverseMouseDrag: isInverted,
        reverseTouchDrag: isInverted
      });
    });
  }

  // ロード画面を隠す処理
  function hideLoader() {
    if (loaderEl) {
      console.log('Hiding loader...');
      loaderEl.classList.add('loader-hidden');
      loaderEl.addEventListener('transitionend', () => {
          loaderEl.style.display = 'none';
      }, { once: true });
    }
  }

  if (sceneEl.hasLoaded) {
    hideLoader();
  } else {
    sceneEl.addEventListener('loaded', hideLoader);
  }

  // テレポート処理
  const floorModel = document.getElementById('floor-map');
  const indicatorContainer = document.getElementById('teleport-indicators');
  const allObstacles = document.querySelectorAll('.obstacle');
  let currentIndicator = null;
  let mouseDownPos = null;
  let isDragging = false;
  const dragThreshold = 5;

  function showTeleportIndicator(position, color) {
    if (currentIndicator) {
      currentIndicator.remove();
    }
    const indicator = document.createElement('a-circle');
    indicator.setAttribute('position', { x: position.x, y: position.y + 0.02, z: position.z });
    indicator.setAttribute('rotation', '-90 0 0');
    indicator.setAttribute('radius', '0.25');
    indicator.setAttribute('color', color);
    indicator.setAttribute('material', { shader: 'flat', transparent: true, opacity: 0.2 });
    indicatorContainer.appendChild(indicator);
    currentIndicator = indicator;
    setTimeout(() => {
        if (currentIndicator === indicator) {
            currentIndicator.remove();
            currentIndicator = null;
        }
    }, 1500);
  }

  sceneEl.addEventListener('click', function (event) {
      if (isDragging) { return; } 
      const intersection = event.detail.intersection;
      if (!intersection || intersection.object.el !== floorModel) { return; }

      const point = intersection.point;
      const normal = intersection.face.normal;

      if (normal.y > 0.9 && Math.abs(point.y) < 0.1) {
        let isObstructed = false;
        const playerHeight = 1.8;
        const playerWidth = 0.6;
        const playerCollisionBox = new THREE.Box3();
        const playerCenter = new THREE.Vector3(point.x, playerHeight / 2, point.z);
        playerCollisionBox.setFromCenterAndSize(playerCenter, new THREE.Vector3(playerWidth, playerHeight, playerWidth));

        allObstacles.forEach(model => {
            if (isObstructed || !model) return;
            const modelMesh = model.getObject3D('mesh');
            if (!modelMesh) return;
            modelMesh.traverse(function (node) {
                if (isObstructed) return;
                if (node.isMesh) {
                    const objectBox = new THREE.Box3().setFromObject(node);
                    if (playerCollisionBox.intersectsBox(objectBox)) {
                        if (objectBox.min.y > 0.05) { 
                            isObstructed = true;
                        }
                    }
                }
            });
        });
          
          if (isObstructed) {
              showTeleportIndicator(point, '#FF4136');
          } else {
              showTeleportIndicator(point, '#FFFFFF');
              const currentPosition = cameraRig.getAttribute('position');
              const destination = `${point.x} ${currentPosition.y} ${point.z}`;
              cameraRig.setAttribute('animation', {
                  property: 'position',
                  to: destination,
                  dur: 800,
                  easing: 'easeInOutQuad',
                  autoplay: true
              });
          }
      }
  });

  function handleInteractionStart(event) {
      const point = event.touches ? event.touches[0] : event;
      mouseDownPos = { x: point.clientX, y: point.clientY };
      isDragging = false;
  }
  function handleInteractionMove(event) {
      if (!mouseDownPos) return;
      const point = event.touches ? event.touches[0] : event;
      const dx = point.clientX - mouseDownPos.x;
      const dy = point.clientY - mouseDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
          isDragging = true;
      }
  }
  function handleInteractionEnd() {
      mouseDownPos = null;
  }
  window.addEventListener('mousedown', handleInteractionStart);
  window.addEventListener('touchstart', handleInteractionStart, { passive: true });
  window.addEventListener('mousemove', handleInteractionMove);
  window.addEventListener('touchmove', handleInteractionMove);
  window.addEventListener('mouseup', handleInteractionEnd);
  window.addEventListener('touchend', handleInteractionEnd);
}
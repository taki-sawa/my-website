document.addEventListener('DOMContentLoaded', () => {
  // 'interactive-machine'クラスを持つすべての要素を取得
  const interactiveMachines = document.querySelectorAll('.interactive-machine');

  interactiveMachines.forEach(machine => {
    // 各モデルの初期状態をdatasetに設定
    machine.dataset.isDoorOpen = 'false';
    machine.dataset.isAnimating = 'false';

    // モデルのロード完了を待って、アニメーションクリップ名を取得・保存
    machine.addEventListener('model-loaded', () => {
      const model = machine.components['gltf-model'].model;
      if (!model || !model.animations || model.animations.length === 0) {
        console.warn('Animations not found for model:', machine.id);
        return;
      }

      const animations = model.animations;
      // "dooropen"（大文字小文字問わず）を含むアニメーションクリップを検索
      const openClip = animations.find(clip => clip.name.toLowerCase().includes('dooropen'));
      // "doorclose"（大文字小文字問わず）を含むアニメーションクリップを検索
      const closeClip = animations.find(clip => clip.name.toLowerCase().includes('doorclose'));

      if (openClip) {
        machine.dataset.openClip = openClip.name;
      } else {
        console.warn('"DoorOpen" animation not found for model:', machine.id);
      }

      if (closeClip) {
        machine.dataset.closeClip = closeClip.name;
      } else {
        console.warn('"DoorClose" animation not found for model:', machine.id);
      }
    });

    // クリックイベントリスナーを設定
    machine.addEventListener('click', () => {
      // アニメーション再生中なら処理を中断
      if (machine.dataset.isAnimating === 'true') {
        return;
      }

      const isDoorOpen = machine.dataset.isDoorOpen === 'true';
      // 状態に応じて再生するクリップを選択
      const clipToPlay = isDoorOpen ? machine.dataset.closeClip : machine.dataset.openClip;

      if (!clipToPlay) {
        console.error('Appropriate animation clip not found for this action.');
        return;
      }

      // アニメーション再生中のフラグを立てる
      machine.dataset.isAnimating = 'true';

      // animation-mixerコンポーネントでアニメーションを再生
      machine.setAttribute('animation-mixer', {
        clip: clipToPlay,
        loop: 'once',
        clampWhenFinished: true
      });

      // ドアの状態を反転
      machine.dataset.isDoorOpen = String(!isDoorOpen);
    });

    // アニメーション終了イベントリスナーを設定
    machine.addEventListener('animation-finished', () => {
      // アニメーション再生中フラグを下ろす
      machine.dataset.isAnimating = 'false';
    });
  });
});
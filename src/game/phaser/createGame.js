import Phaser from 'phaser'
import { MatchScene } from './scenes/MatchScene.js'

export function createPhaserGame(parent) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 720,
    height: 720,
    backgroundColor: 'rgba(255,255,255,0)',
    transparent: true,
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      activePointers: 3,
    },
    scene: [MatchScene],
  })

  const getScene = () => game.scene.getScene('MatchScene')

  return {
    restart() {
      getScene()?.restartGame()
    },
    setPaused(paused) {
      getScene()?.setGamePaused(paused)
    },
    showHint() {
      getScene()?.showHint()
    },
    toggleSound() {
      return getScene()?.toggleSound()
    },
    destroy() {
      game.destroy(true)
    },
  }
}


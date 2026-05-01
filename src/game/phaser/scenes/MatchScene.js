import Phaser from 'phaser'
import { backgroundAssets, tileAssets } from '../../assets/manifest.js'
import { Sfx } from '../../audio/sfx.js'
import { GAME_MESSAGES } from '../../content/copy.js'
import { GRID_SIZE } from '../../simulation/constants.js'
import {
  applyPlayerMove,
  createGameState,
  findBestMove,
} from '../../simulation/state.js'
import { publishHud } from '../../stores/gameStore.js'

const BOARD_ORIGIN = { x: 78, y: 86 }
const BOARD_STEP = 70
const TILE_SIZE = 62
const BOARD_PADDING = 18
const BEST_SCORE_KEY = 'happy-eliminate-best-score'

export class MatchScene extends Phaser.Scene {
  constructor() {
    super('MatchScene')
    this.state = null
    this.sprites = new Map()
    this.selected = null
    this.busy = false
    this.pausedByUi = false
    this.soundEnabled = true
    this.sfx = null
    this.reducedMotion = false
  }

  preload() {
    for (const tile of tileAssets) {
      this.load.image(tile.key, tile.path)
    }

    this.load.image(backgroundAssets.candyGarden.key, backgroundAssets.candyGarden.path)
  }

  create() {
    this.sfx = new Sfx()
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    this.drawStage()
    this.input.on('dragend', this.handleDragEnd, this)
    this.restartGame()
  }

  drawStage() {
    this.add
      .image(360, 360, backgroundAssets.candyGarden.key)
      .setDisplaySize(720, 720)
      .setAlpha(0.88)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x4d2340, 0.18)
    shadow.fillRoundedRect(
      BOARD_ORIGIN.x - BOARD_PADDING + 8,
      BOARD_ORIGIN.y - BOARD_PADDING + 12,
      GRID_SIZE * BOARD_STEP + BOARD_PADDING * 2,
      GRID_SIZE * BOARD_STEP + BOARD_PADDING * 2,
      34,
    )

    const panel = this.add.graphics()
    panel.fillStyle(0xfff7df, 0.78)
    panel.fillRoundedRect(
      BOARD_ORIGIN.x - BOARD_PADDING,
      BOARD_ORIGIN.y - BOARD_PADDING,
      GRID_SIZE * BOARD_STEP + BOARD_PADDING * 2,
      GRID_SIZE * BOARD_STEP + BOARD_PADDING * 2,
      34,
    )
    panel.lineStyle(4, 0xffffff, 0.75)
    panel.strokeRoundedRect(
      BOARD_ORIGIN.x - BOARD_PADDING,
      BOARD_ORIGIN.y - BOARD_PADDING,
      GRID_SIZE * BOARD_STEP + BOARD_PADDING * 2,
      GRID_SIZE * BOARD_STEP + BOARD_PADDING * 2,
      34,
    )

    const cells = this.add.graphics()
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let column = 0; column < GRID_SIZE; column += 1) {
        const { x, y } = this.positionFor(row, column)
        cells.fillStyle((row + column) % 2 === 0 ? 0xffffff : 0xffe8bd, 0.38)
        cells.fillRoundedRect(x - 31, y - 31, 62, 62, 18)
      }
    }
  }

  restartGame() {
    for (const sprite of this.sprites.values()) {
      sprite.destroy()
    }

    this.sprites.clear()
    this.selected = null
    this.busy = false
    this.pausedByUi = false
    this.state = createGameState()
    this.renderBoardInstant()
    this.publish(GAME_MESSAGES.ready)
  }

  getBestScore() {
    const best = Number(window.localStorage?.getItem(BEST_SCORE_KEY) ?? 0)
    return Number.isFinite(best) ? best : 0
  }

  saveBestScore() {
    const bestScore = Math.max(this.getBestScore(), this.state.score)
    window.localStorage?.setItem(BEST_SCORE_KEY, String(bestScore))
    return bestScore
  }

  publish(message = '') {
    const bestScore =
      this.state.status === 'won' || this.state.status === 'lost'
        ? this.saveBestScore()
        : this.getBestScore()

    publishHud({
      score: this.state.score,
      targetScore: this.state.targetScore,
      movesLeft: this.state.movesLeft,
      combo: this.state.combo,
      status: this.state.status,
      paused: this.pausedByUi,
      bestScore,
      soundEnabled: this.soundEnabled,
      message,
    })
  }

  positionFor(row, column) {
    return {
      x: BOARD_ORIGIN.x + column * BOARD_STEP + BOARD_STEP / 2,
      y: BOARD_ORIGIN.y + row * BOARD_STEP + BOARD_STEP / 2,
    }
  }

  setTileSize(sprite, multiplier = 1) {
    return sprite.setDisplaySize(TILE_SIZE * multiplier, TILE_SIZE * multiplier)
  }

  createTileSprite(tile, row, column, startRow = row) {
    const start = this.positionFor(startRow, column)
    const sprite = this.add
      .image(start.x, start.y, tile.type)
      .setDisplaySize(TILE_SIZE, TILE_SIZE)
      .setInteractive({ useHandCursor: true })
      .setData('id', tile.id)
      .setData('row', row)
      .setData('column', column)
      .setDepth(10 + row)

    this.input.setDraggable(sprite)
    sprite.on('pointerdown', () =>
      this.handleTilePress(sprite.getData('row'), sprite.getData('column')),
    )
    this.sprites.set(tile.id, sprite)
    return sprite
  }

  renderBoardInstant() {
    const seen = new Set()

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let column = 0; column < GRID_SIZE; column += 1) {
        const tile = this.state.board[row][column]
        const position = this.positionFor(row, column)
        let sprite = this.sprites.get(tile.id)

        if (!sprite) {
          sprite = this.createTileSprite(tile, row, column)
        }

        sprite
          .setTexture(tile.type)
          .setPosition(position.x, position.y)
          .setAlpha(1)
          .clearTint()
          .setData('row', row)
          .setData('column', column)
          .setDepth(10 + row)
        this.setTileSize(sprite)

        seen.add(tile.id)
      }
    }

    for (const [id, sprite] of this.sprites) {
      if (!seen.has(id)) {
        sprite.destroy()
        this.sprites.delete(id)
      }
    }
  }

  async syncSpritesToState(animated = false) {
    const seen = new Set()
    const tweens = []

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let column = 0; column < GRID_SIZE; column += 1) {
        const tile = this.state.board[row][column]
        const position = this.positionFor(row, column)
        let sprite = this.sprites.get(tile.id)

        if (!sprite) {
          sprite = this.createTileSprite(tile, row, column, -1)
          sprite.setAlpha(0)
        }

        sprite.setData('row', row).setData('column', column).setDepth(10 + row)
        sprite.clearTint()
        this.setTileSize(sprite)
        seen.add(tile.id)

        if (animated && !this.reducedMotion) {
          tweens.push(
            new Promise((resolve) => {
              this.tweens.add({
                targets: sprite,
                x: position.x,
                y: position.y,
                alpha: 1,
                angle: Phaser.Math.Between(-12, 12),
                duration: 260,
                ease: 'Back.Out',
                onComplete: () => {
                  sprite.setAngle(0)
                  resolve()
                },
              })
            }),
          )
        } else {
          sprite.setPosition(position.x, position.y).setAlpha(1).setAngle(0)
        }
      }
    }

    for (const [id, sprite] of this.sprites) {
      if (!seen.has(id)) {
        sprite.destroy()
        this.sprites.delete(id)
      }
    }

    await Promise.all(tweens)
  }

  handleTilePress(row, column) {
    if (this.busy || this.pausedByUi || this.state.status !== 'playing') {
      return
    }

    if (!this.selected) {
      this.selectTile(row, column)
      return
    }

    if (this.selected.row === row && this.selected.column === column) {
      this.clearSelection()
      return
    }

    const next = { row, column }

    if (Math.abs(this.selected.row - row) + Math.abs(this.selected.column - column) === 1) {
      this.tryMove(this.selected, next)
    } else {
      this.selectTile(row, column)
    }
  }

  handleDragEnd(pointer, sprite) {
    if (this.busy || this.pausedByUi || this.state.status !== 'playing' || !sprite) {
      return
    }

    const distanceX = pointer.upX - pointer.downX
    const distanceY = pointer.upY - pointer.downY

    if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) < 26) {
      return
    }

    const row = sprite.getData('row')
    const column = sprite.getData('column')
    const horizontal = Math.abs(distanceX) > Math.abs(distanceY)
    const to = {
      row: row + (horizontal ? 0 : Math.sign(distanceY)),
      column: column + (horizontal ? Math.sign(distanceX) : 0),
    }

    this.tryMove({ row, column }, to)
  }

  selectTile(row, column) {
    this.clearSelection()
    this.selected = { row, column }
    const tile = this.state.board[row][column]
    const sprite = this.sprites.get(tile.id)

    if (sprite) {
      sprite.setTint(0xffffff)
      this.setTileSize(sprite, 1.08)
    }
    this.publish(GAME_MESSAGES.tileSelected)
  }

  clearSelection() {
    if (this.selected) {
      const tile = this.state.board[this.selected.row]?.[this.selected.column]
      const sprite = tile ? this.sprites.get(tile.id) : null
      if (sprite) {
        sprite.clearTint()
        this.setTileSize(sprite)
      }
    }

    this.selected = null
  }

  async tryMove(from, to) {
    if (this.busy || this.pausedByUi) {
      return
    }

    if (to.row < 0 || to.column < 0 || to.row >= GRID_SIZE || to.column >= GRID_SIZE) {
      this.sfx.reject()
      this.clearSelection()
      return
    }

    const firstTile = this.state.board[from.row][from.column]
    const secondTile = this.state.board[to.row][to.column]

    if (!firstTile || !secondTile) {
      return
    }

    this.busy = true
    this.clearSelection()
    const result = applyPlayerMove(this.state, from, to)

    if (!result.valid) {
      await this.animateSwap(firstTile.id, secondTile.id, from, to, true)
      this.sfx.reject()
      this.busy = false
      this.publish(GAME_MESSAGES.invalidMove)
      return
    }

    this.sfx.move()
    await this.animateSwap(firstTile.id, secondTile.id, from, to, false)
    await this.animateCascade(result.steps)

    if (result.shuffled) {
      this.publish(GAME_MESSAGES.shuffled)
      this.cameras.main.shake(this.reducedMotion ? 80 : 180, 0.004)
      await this.syncSpritesToState(true)
    } else {
      await this.syncSpritesToState(false)
    }

    if (this.state.status === 'won') {
      this.sfx.win()
      this.celebrate()
    } else if (this.state.status === 'lost') {
      this.sfx.lose()
    }

    this.busy = false
    this.publish(this.statusMessage())
  }

  statusMessage() {
    if (this.state.status === 'won') {
      return GAME_MESSAGES.won
    }

    if (this.state.status === 'lost') {
      return GAME_MESSAGES.lost
    }

    if (this.state.combo > 1) {
      return GAME_MESSAGES.combo(this.state.combo)
    }

    return GAME_MESSAGES.keepGoing
  }

  animateSwap(firstId, secondId, from, to, revert) {
    const first = this.sprites.get(firstId)
    const second = this.sprites.get(secondId)

    if (!first || !second) {
      return Promise.resolve()
    }

    const fromPosition = this.positionFor(from.row, from.column)
    const toPosition = this.positionFor(to.row, to.column)
    const duration = this.reducedMotion ? 60 : 150

    return new Promise((resolve) => {
      this.tweens.add({
        targets: first,
        x: toPosition.x,
        y: toPosition.y,
        duration,
        ease: 'Sine.easeInOut',
      })
      this.tweens.add({
        targets: second,
        x: fromPosition.x,
        y: fromPosition.y,
        duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (!revert) {
            resolve()
            return
          }

          this.tweens.add({
            targets: first,
            x: fromPosition.x,
            y: fromPosition.y,
            duration,
            ease: 'Back.easeOut',
          })
          this.tweens.add({
            targets: second,
            x: toPosition.x,
            y: toPosition.y,
            duration,
            ease: 'Back.easeOut',
            onComplete: resolve,
          })
        },
      })
    })
  }

  async animateCascade(steps) {
    for (const step of steps) {
      this.publish(GAME_MESSAGES.cascade(step.combo, step.scoreGain))
      this.sfx.match(step.combo)

      await this.fadeMatches(step.matches)
      await this.animateGravity(step)
    }
  }

  fadeMatches(matches) {
    const duration = this.reducedMotion ? 80 : 210
    const animations = matches.map((match) => {
      const sprite = this.sprites.get(match.id)

      if (!sprite) {
        return Promise.resolve()
      }

      this.burstAt(sprite.x, sprite.y, match.type)

      return new Promise((resolve) => {
        const scaleMultiplier = this.reducedMotion ? 0.9 : 1.22
        this.tweens.add({
          targets: sprite,
          alpha: 0,
          scaleX: sprite.scaleX * scaleMultiplier,
          scaleY: sprite.scaleY * scaleMultiplier,
          angle: this.reducedMotion ? 0 : Phaser.Math.Between(-10, 10),
          duration,
          ease: 'Quad.easeIn',
          onComplete: () => {
            sprite.destroy()
            this.sprites.delete(match.id)
            resolve()
          },
        })
      })
    })

    return Promise.all(animations)
  }

  animateGravity(step) {
    const duration = this.reducedMotion ? 90 : 280
    const animations = []

    for (const spawn of step.spawns) {
      const tile = { id: spawn.id, type: spawn.type }
      const sprite = this.createTileSprite(tile, spawn.to.row, spawn.to.column, spawn.from.row)
      sprite.setAlpha(0.65)
    }

    for (const movement of [...step.moves, ...step.spawns]) {
      const sprite = this.sprites.get(movement.id)
      const position = this.positionFor(movement.to.row, movement.to.column)

      if (!sprite) {
        continue
      }

      sprite.setData('row', movement.to.row).setData('column', movement.to.column)
      animations.push(
        new Promise((resolve) => {
          this.tweens.add({
            targets: sprite,
            x: position.x,
            y: position.y,
            alpha: 1,
            duration,
            ease: this.reducedMotion ? 'Linear' : 'Bounce.easeOut',
            onComplete: resolve,
          })
        }),
      )
    }

    return Promise.all(animations)
  }

  burstAt(x, y, type) {
    if (this.reducedMotion) {
      return
    }

    const asset = tileAssets.find((tile) => tile.key === type)
    const color = Phaser.Display.Color.HexStringToColor(asset?.color ?? '#ffffff').color

    for (let index = 0; index < 8; index += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(3, 6), color, 0.8).setDepth(30)
      const angle = (Math.PI * 2 * index) / 8
      const distance = Phaser.Math.Between(32, 54)

      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 360,
        ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      })
    }
  }

  celebrate() {
    if (this.reducedMotion) {
      return
    }

    for (let index = 0; index < 36; index += 1) {
      const x = Phaser.Math.Between(90, 630)
      const color = Phaser.Math.RND.pick([0xf24858, 0xffd447, 0x36a0ff, 0xa84fe8])
      const dot = this.add.circle(x, -20, Phaser.Math.Between(4, 8), color, 0.9).setDepth(40)

      this.tweens.add({
        targets: dot,
        y: Phaser.Math.Between(260, 680),
        x: x + Phaser.Math.Between(-80, 80),
        alpha: 0,
        angle: 180,
        duration: Phaser.Math.Between(900, 1400),
        ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      })
    }
  }

  showHint() {
    if (this.busy || this.pausedByUi || this.state.status !== 'playing') {
      return
    }

    const move = findBestMove(this.state.board)

    if (!move) {
      this.publish(GAME_MESSAGES.noHint)
      return
    }

    const positions = [move.from, move.to]

    for (const position of positions) {
      const tile = this.state.board[position.row][position.column]
      const sprite = this.sprites.get(tile.id)

      if (!sprite) {
        continue
      }

      this.tweens.add({
        targets: sprite,
        scaleX: sprite.scaleX * 1.16,
        scaleY: sprite.scaleY * 1.16,
        yoyo: true,
        repeat: 2,
        duration: this.reducedMotion ? 80 : 170,
        ease: 'Sine.easeInOut',
        onComplete: () => this.setTileSize(sprite),
      })
    }

    this.publish(GAME_MESSAGES.hint)
  }

  setGamePaused(paused) {
    this.pausedByUi = paused
    this.publish(paused ? GAME_MESSAGES.paused : GAME_MESSAGES.resumed)
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled
    this.sfx.setEnabled(this.soundEnabled)
    this.publish(this.soundEnabled ? GAME_MESSAGES.soundOn : GAME_MESSAGES.soundOff)
    return this.soundEnabled
  }
}

import { writable } from 'svelte/store'
import { MOVE_LIMIT, TARGET_SCORE } from '../simulation/constants.js'

export const initialHudState = {
  score: 0,
  targetScore: TARGET_SCORE,
  movesLeft: MOVE_LIMIT,
  combo: 0,
  bestScore: 0,
  status: 'loading',
  paused: false,
  soundEnabled: true,
  message: '准备中',
}

export const gameHud = writable(initialHudState)

export function publishHud(update) {
  gameHud.update((current) => ({
    ...current,
    ...update,
  }))
}

export function resetHud() {
  gameHud.set(initialHudState)
}


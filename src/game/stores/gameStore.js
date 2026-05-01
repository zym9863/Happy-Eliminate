import { writable } from 'svelte/store'
import { GAME_MESSAGES } from '../content/copy.js'
import { MOVE_LIMIT, TARGET_SCORE } from '../simulation/constants.js'

export const createInitialHudState = () => ({
  score: 0,
  targetScore: TARGET_SCORE,
  movesLeft: MOVE_LIMIT,
  combo: 0,
  bestScore: 0,
  status: 'loading',
  paused: false,
  soundEnabled: true,
  message: GAME_MESSAGES.loading,
})

export const initialHudState = createInitialHudState()

export const gameHud = writable(createInitialHudState())

export function publishHud(update) {
  gameHud.update((current) => ({
    ...current,
    ...update,
  }))
}

export function resetHud() {
  gameHud.set(createInitialHudState())
}

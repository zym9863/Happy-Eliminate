import assert from 'node:assert/strict'
import {
  applyPlayerMove,
  cloneBoard,
  createGameState,
  findMatches,
  hasValidMove,
  isAdjacent,
  makeBoardFromTypes,
} from '../src/game/simulation/state.js'

const S = 'strawberry'
const L = 'lemon'
const B = 'blueberry'
const O = 'orange'
const G = 'grape'
const W = 'watermelon'

function playableRows() {
  return [
    [S, L, S, O, G, W, S, L],
    [B, S, G, W, O, B, L, G],
    [L, B, O, S, B, G, W, O],
    [O, G, W, L, S, O, B, W],
    [G, W, L, B, O, S, G, L],
    [W, O, B, G, L, W, S, B],
    [S, B, G, O, W, L, O, S],
    [L, S, O, W, G, B, L, O],
  ]
}

function stateFromRows(rows, options = {}) {
  return {
    board: makeBoardFromTypes(rows),
    random: () => 0.2,
    score: options.score ?? 0,
    movesLeft: options.movesLeft ?? 26,
    targetScore: options.targetScore ?? 3200,
    combo: 0,
    status: 'playing',
    lastMove: null,
  }
}

for (let seed = 1; seed <= 20; seed += 1) {
  const state = createGameState({ seed })
  assert.equal(findMatches(state.board).positions.length, 0, `seed ${seed} starts with matches`)
  assert.equal(hasValidMove(state.board), true, `seed ${seed} has no legal move`)
}

assert.equal(isAdjacent({ row: 0, column: 0 }, { row: 0, column: 1 }), true)
assert.equal(isAdjacent({ row: 0, column: 0 }, { row: 1, column: 1 }), false)

{
  const board = makeBoardFromTypes([
    [S, S, S, L],
    [L, B, G, O],
    [B, G, O, W],
    [O, W, L, B],
  ])
  const matches = findMatches(board)
  assert.equal(matches.positions.length, 3)
  assert.equal(matches.groups.length, 1)
}

{
  const board = makeBoardFromTypes([
    [S, L, B, O],
    [S, B, G, W],
    [S, G, O, L],
    [L, W, B, G],
  ])
  const matches = findMatches(board)
  assert.equal(matches.positions.length, 3)
  assert.equal(matches.groups.length, 1)
}

{
  const board = makeBoardFromTypes([
    [L, B, S, O, G],
    [B, G, S, W, L],
    [S, S, S, S, S],
    [O, W, S, L, B],
    [G, L, S, B, O],
  ])
  const matches = findMatches(board)
  assert.equal(matches.positions.length, 9)
  assert.equal(matches.groups.length, 2)
}

{
  const state = stateFromRows(playableRows())
  const before = cloneBoard(state.board)
  const result = applyPlayerMove(state, { row: 0, column: 0 }, { row: 0, column: 1 })
  assert.equal(result.valid, false)
  assert.equal(state.movesLeft, 26)
  assert.deepEqual(
    state.board.map((row) => row.map((tile) => tile.type)),
    before.map((row) => row.map((tile) => tile.type)),
  )
}

{
  const state = stateFromRows(playableRows())
  const result = applyPlayerMove(state, { row: 0, column: 1 }, { row: 1, column: 1 })
  assert.equal(result.valid, true)
  assert.equal(state.movesLeft, 25)
  assert.equal(result.steps[0].scoreGain >= 150, true)
  assert.equal(state.score >= 150, true)
}

{
  const state = stateFromRows(playableRows(), { movesLeft: 1, targetScore: 150 })
  const result = applyPlayerMove(state, { row: 0, column: 1 }, { row: 1, column: 1 })
  assert.equal(result.valid, true)
  assert.equal(state.status, 'won')
}

{
  const state = stateFromRows(playableRows(), { movesLeft: 1, targetScore: 99999 })
  const result = applyPlayerMove(state, { row: 0, column: 1 }, { row: 1, column: 1 })
  assert.equal(result.valid, true)
  assert.equal(state.status, 'lost')
}

console.log('logic tests passed')


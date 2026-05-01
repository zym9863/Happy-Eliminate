import {
  GRID_SIZE,
  MOVE_LIMIT,
  SCORE_PER_TILE,
  TARGET_SCORE,
  TILE_TYPES,
} from './constants.js'
import { createSeededRandom, pickRandom, shuffle } from './random.js'

let nextTileId = 1

function createTile(type) {
  return {
    id: `tile-${nextTileId++}`,
    type,
  }
}

function randomTile(random) {
  return createTile(pickRandom(TILE_TYPES, random))
}

function tileWouldMatch(board, row, column, type) {
  const leftMatch =
    column >= 2 &&
    board[row][column - 1]?.type === type &&
    board[row][column - 2]?.type === type
  const topMatch =
    row >= 2 &&
    board[row - 1][column]?.type === type &&
    board[row - 2][column]?.type === type

  return leftMatch || topMatch
}

function createCleanBoard(random) {
  const board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const candidates = TILE_TYPES.filter((type) => !tileWouldMatch(board, row, column, type))
      board[row][column] = createTile(pickRandom(candidates.length ? candidates : TILE_TYPES, random))
    }
  }

  return board
}

export function createBoard(random) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const board = createCleanBoard(random)

    if (findMatches(board).positions.length === 0 && hasValidMove(board)) {
      return board
    }
  }

  throw new Error('Unable to create a playable board')
}

export function makeBoardFromTypes(rows) {
  return rows.map((row) => row.map((type) => (type ? createTile(type) : null)))
}

export function cloneBoard(board) {
  return board.map((row) => row.map((tile) => (tile ? { ...tile } : null)))
}

export function isAdjacent(first, second) {
  const rowDistance = Math.abs(first.row - second.row)
  const columnDistance = Math.abs(first.column - second.column)
  return rowDistance + columnDistance === 1
}

export function isInsideBoard(position, boardSize = GRID_SIZE) {
  return (
    position.row >= 0 &&
    position.column >= 0 &&
    position.row < boardSize &&
    position.column < boardSize
  )
}

export function swapTiles(board, first, second) {
  const firstTile = board[first.row][first.column]
  board[first.row][first.column] = board[second.row][second.column]
  board[second.row][second.column] = firstTile
}

function addMatchGroup(groups, positions) {
  if (positions.length >= 3) {
    groups.push(positions)
  }
}

export function findMatches(board) {
  const groups = []
  const matchedByKey = new Map()
  const rowCount = board.length
  const columnCount = board[0]?.length ?? 0

  for (let row = 0; row < rowCount; row += 1) {
    let runStart = 0
    let runType = board[row][0]?.type

    for (let column = 1; column <= columnCount; column += 1) {
      const type = board[row][column]?.type

      if (type && type === runType) {
        continue
      }

      if (runType) {
        addMatchGroup(
          groups,
          Array.from({ length: column - runStart }, (_, offset) => ({
            row,
            column: runStart + offset,
          })),
        )
      }

      runStart = column
      runType = type
    }
  }

  for (let column = 0; column < columnCount; column += 1) {
    let runStart = 0
    let runType = board[0][column]?.type

    for (let row = 1; row <= rowCount; row += 1) {
      const type = board[row]?.[column]?.type

      if (type && type === runType) {
        continue
      }

      if (runType) {
        addMatchGroup(
          groups,
          Array.from({ length: row - runStart }, (_, offset) => ({
            row: runStart + offset,
            column,
          })),
        )
      }

      runStart = row
      runType = type
    }
  }

  for (const group of groups) {
    for (const position of group) {
      matchedByKey.set(`${position.row}:${position.column}`, position)
    }
  }

  return {
    groups,
    positions: [...matchedByKey.values()],
  }
}

export function findBestMove(board) {
  const rowCount = board.length
  const columnCount = board[0]?.length ?? 0
  const directions = [
    { row: 0, column: 1 },
    { row: 1, column: 0 },
  ]

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      for (const direction of directions) {
        const from = { row, column }
        const to = { row: row + direction.row, column: column + direction.column }

        if (!isInsideBoard(to, rowCount)) {
          continue
        }

        const candidate = cloneBoard(board)
        swapTiles(candidate, from, to)
        const matches = findMatches(candidate)

        if (matches.positions.length > 0) {
          return {
            from,
            to,
            matchCount: matches.positions.length,
          }
        }
      }
    }
  }

  return null
}

export function hasValidMove(board) {
  return Boolean(findBestMove(board))
}

function collapseBoard(board, random) {
  const moves = []
  const spawns = []
  const rowCount = board.length
  const columnCount = board[0]?.length ?? 0

  for (let column = 0; column < columnCount; column += 1) {
    let writeRow = rowCount - 1

    for (let row = rowCount - 1; row >= 0; row -= 1) {
      const tile = board[row][column]

      if (!tile) {
        continue
      }

      if (row !== writeRow) {
        board[writeRow][column] = tile
        board[row][column] = null
        moves.push({
          id: tile.id,
          type: tile.type,
          from: { row, column },
          to: { row: writeRow, column },
        })
      }

      writeRow -= 1
    }

    for (let row = writeRow; row >= 0; row -= 1) {
      const tile = randomTile(random)
      board[row][column] = tile
      spawns.push({
        id: tile.id,
        type: tile.type,
        from: { row: row - writeRow - 1, column },
        to: { row, column },
      })
    }
  }

  return { moves, spawns }
}

function resolveBoard(state) {
  const steps = []
  let combo = 1

  while (combo <= 20) {
    const matches = findMatches(state.board)

    if (matches.positions.length === 0) {
      break
    }

    const matchedTiles = matches.positions.map((position) => {
      const tile = state.board[position.row][position.column]
      return {
        ...position,
        id: tile.id,
        type: tile.type,
      }
    })
    const scoreGain = matchedTiles.length * SCORE_PER_TILE * combo

    for (const position of matches.positions) {
      state.board[position.row][position.column] = null
    }

    const collapse = collapseBoard(state.board, state.random)
    state.score += scoreGain

    steps.push({
      combo,
      matches: matchedTiles,
      scoreGain,
      moves: collapse.moves,
      spawns: collapse.spawns,
    })

    combo += 1
  }

  state.combo = Math.max(0, combo - 1)
  return steps
}

export function shuffleBoard(board, random) {
  const tiles = board.flat().filter(Boolean)
  const rowCount = board.length
  const columnCount = board[0]?.length ?? 0

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const shuffled = shuffle(tiles, random)

    for (let row = 0; row < rowCount; row += 1) {
      for (let column = 0; column < columnCount; column += 1) {
        board[row][column] = shuffled[row * columnCount + column]
      }
    }

    if (findMatches(board).positions.length === 0 && hasValidMove(board)) {
      return true
    }
  }

  const replacement = createBoard(random)
  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      board[row][column] = replacement[row][column]
    }
  }

  return true
}

export function createGameState(options = {}) {
  nextTileId = 1
  const random = createSeededRandom(options.seed ?? `${Date.now()}-${Math.random()}`)

  return {
    board: createBoard(random),
    random,
    score: options.score ?? 0,
    movesLeft: options.movesLeft ?? MOVE_LIMIT,
    targetScore: options.targetScore ?? TARGET_SCORE,
    combo: 0,
    status: 'playing',
    lastMove: null,
  }
}

export function applyPlayerMove(state, from, to) {
  if (state.status !== 'playing') {
    return { valid: false, reason: 'not-playing' }
  }

  if (!isInsideBoard(from, state.board.length) || !isInsideBoard(to, state.board.length)) {
    return { valid: false, reason: 'outside-board' }
  }

  if (!isAdjacent(from, to)) {
    return { valid: false, reason: 'not-adjacent' }
  }

  swapTiles(state.board, from, to)
  const firstMatches = findMatches(state.board)

  if (firstMatches.positions.length === 0) {
    swapTiles(state.board, from, to)
    state.combo = 0
    return { valid: false, reason: 'no-match' }
  }

  state.movesLeft -= 1
  const steps = resolveBoard(state)
  const totalScore = steps.reduce((sum, step) => sum + step.scoreGain, 0)
  let shuffled = false

  if (state.score >= state.targetScore) {
    state.status = 'won'
  } else if (state.movesLeft <= 0) {
    state.status = 'lost'
  } else if (!hasValidMove(state.board)) {
    shuffled = shuffleBoard(state.board, state.random)
  }

  state.lastMove = { from, to, totalScore }

  return {
    valid: true,
    from,
    to,
    steps,
    totalScore,
    combo: state.combo,
    shuffled,
    status: state.status,
  }
}


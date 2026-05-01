export const GAME_COPY = {
  title: '果园连连消',
  brand: 'Happy Eliminate',
  bestScore: '最佳分',
  currentScore: '当前分',
  targetScore: '目标分',
  movesLeft: '步数',
  combo: '连击',
  progress: '进度',
  tileSet: '果味棋子',
  status: '状态',
  actions: {
    hint: '提示',
    pause: '暂停',
    resume: '继续',
    soundOn: '声音开',
    soundOff: '声音关',
    restart: '重开',
  },
  results: {
    won: '漂亮通关',
    lost: '差一点点',
    paused: '游戏暂停',
  },
  resultDetails: {
    won: '果篮已经装满，继续挑战更高分。',
    lost: '步数用完了，换一种交换节奏再来。',
    paused: '棋盘会在这里等你。',
  },
}

export const GAME_MESSAGES = {
  loading: '正在装载果园',
  ready: '交换相邻水果，凑成三连',
  tileSelected: '已选中，点相邻棋子交换',
  invalidMove: '这一步没有形成消除',
  shuffled: '没有可走步，棋盘已洗牌',
  won: '目标达成',
  lost: '步数用完',
  combo: (combo) => `${combo} 连击`,
  keepGoing: '继续寻找三连',
  noHint: '暂时没有提示',
  hint: '高亮了一组可交换水果',
  paused: '已暂停',
  resumed: '继续游戏',
  soundOn: '声音已开启',
  soundOff: '声音已关闭',
  cascade: (combo, scoreGain) => `${combo} 连击 +${scoreGain}`,
}

export const TILE_COPY = {
  strawberry: '草莓',
  lemon: '柠檬',
  blueberry: '蓝莓',
  orange: '橙子',
  grape: '葡萄',
  watermelon: '西瓜',
}

export function getResultCopy(status) {
  const title = GAME_COPY.results[status] ?? GAME_COPY.results.lost
  const detail = GAME_COPY.resultDetails[status] ?? GAME_COPY.resultDetails.lost

  return { title, detail }
}

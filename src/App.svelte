<script>
  import { onMount } from 'svelte'
  import { createPhaserGame } from './game/phaser/createGame.js'
  import { gameHud } from './game/stores/gameStore.js'
  import { GAME_COPY } from './game/content/copy.js'
  import GameBoard from './lib/GameBoard.svelte'
  import HudPanel from './lib/HudPanel.svelte'

  let gameRoot
  let gameApi

  onMount(() => {
    gameApi = createPhaserGame(gameRoot)

    return () => {
      gameApi?.destroy()
    }
  })

  $: progress = $gameHud.targetScore
    ? Math.min(100, Math.round(($gameHud.score / $gameHud.targetScore) * 100))
    : 0
</script>

<main class="game-shell">
  <header class="topline" aria-label="游戏概览">
    <div class="brand-lockup">
      <p class="eyebrow">{GAME_COPY.brand}</p>
      <h1>{GAME_COPY.title}</h1>
    </div>

    <div class="best-score">
      <span>{GAME_COPY.bestScore}</span>
      <strong>{$gameHud.bestScore}</strong>
    </div>
  </header>

  <section class="play-layout">
    <GameBoard
      bind:gameRoot
      hud={$gameHud}
      onResume={() => gameApi?.setPaused(false)}
      onRestart={() => gameApi?.restart()}
    />

    <HudPanel
      hud={$gameHud}
      {progress}
      onHint={() => gameApi?.showHint()}
      onPauseToggle={() => gameApi?.setPaused(!$gameHud.paused)}
      onSoundToggle={() => gameApi?.toggleSound()}
      onRestart={() => gameApi?.restart()}
    />
  </section>
</main>

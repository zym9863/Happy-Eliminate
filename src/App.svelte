<script>
  import { onMount } from 'svelte'
  import { createPhaserGame } from './game/phaser/createGame.js'
  import { gameHud } from './game/stores/gameStore.js'

  let gameRoot
  let gameApi

  onMount(() => {
    gameApi = createPhaserGame(gameRoot)

    return () => {
      gameApi?.destroy()
    }
  })

  $: progress = Math.min(100, Math.round(($gameHud.score / $gameHud.targetScore) * 100))
  $: resultTitle = $gameHud.status === 'won' ? '甜蜜通关' : '再来一局'
</script>

<main class="game-shell">
  <section class="hero-bar" aria-label="游戏状态">
    <div>
      <p class="eyebrow">Happy Eliminate</p>
      <h1>开心消消乐</h1>
    </div>
    <div class="score-stack">
      <span>最高分</span>
      <strong>{$gameHud.bestScore}</strong>
    </div>
  </section>

  <section class="play-layout">
    <div class="board-wrap">
      <div class="canvas-frame">
        <div class="game-canvas" bind:this={gameRoot}></div>
      </div>

      {#if $gameHud.paused || $gameHud.status === 'won' || $gameHud.status === 'lost'}
        <div class="game-modal" role="dialog" aria-modal="true">
          <div class="modal-panel">
            {#if $gameHud.paused}
              <p class="modal-kicker">暂停中</p>
              <h2>糖果先等一下</h2>
              <button class="primary-action" onclick={() => gameApi?.setPaused(false)}>继续游戏</button>
            {:else}
              <p class="modal-kicker">{$gameHud.score} / {$gameHud.targetScore}</p>
              <h2>{resultTitle}</h2>
              <button class="primary-action" onclick={() => gameApi?.restart()}>重新开始</button>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <aside class="hud-panel" aria-label="控制面板">
      <div class="target-card">
        <div class="target-top">
          <span>目标</span>
          <strong>{$gameHud.targetScore}</strong>
        </div>
        <div class="progress-track" aria-hidden="true">
          <span style={`width: ${progress}%`}></span>
        </div>
        <div class="target-meta">
          <span>分数 {$gameHud.score}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div class="metric-grid">
        <div>
          <span>步数</span>
          <strong>{$gameHud.movesLeft}</strong>
        </div>
        <div>
          <span>连击</span>
          <strong>{$gameHud.combo || 0}</strong>
        </div>
      </div>

      <div class="message-chip" aria-live="polite">{$gameHud.message}</div>

      <div class="control-grid">
        <button onclick={() => gameApi?.showHint()} disabled={$gameHud.paused || $gameHud.status !== 'playing'}>
          提示
        </button>
        <button onclick={() => gameApi?.setPaused(!$gameHud.paused)} disabled={$gameHud.status !== 'playing'}>
          {$gameHud.paused ? '继续' : '暂停'}
        </button>
        <button onclick={() => gameApi?.toggleSound()} aria-pressed={$gameHud.soundEnabled}>
          {$gameHud.soundEnabled ? '音效开' : '音效关'}
        </button>
        <button onclick={() => gameApi?.restart()}>重开</button>
      </div>
    </aside>
  </section>
</main>

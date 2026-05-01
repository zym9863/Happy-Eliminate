<script>
  import EndGameDialog from './EndGameDialog.svelte'

  export let gameRoot
  export let hud
  export let onResume = () => {}
  export let onRestart = () => {}

  $: showOverlay = hud.paused || hud.status === 'won' || hud.status === 'lost'
</script>

<section class="board-stage" aria-label="消除棋盘">
  <div class="canvas-frame">
    <div class="game-canvas" bind:this={gameRoot}></div>
  </div>

  {#if showOverlay}
    <EndGameDialog {hud} {onResume} {onRestart} />
  {/if}
</section>

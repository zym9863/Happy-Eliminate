<script>
  import { GAME_COPY, getResultCopy } from '../game/content/copy.js'

  export let hud
  export let onResume = () => {}
  export let onRestart = () => {}

  $: result = hud.paused ? getResultCopy('paused') : getResultCopy(hud.status)
  $: showScore = !hud.paused
</script>

<div class="game-modal" role="dialog" aria-modal="true" aria-labelledby="game-dialog-title">
  <div class="modal-panel">
    <p class="modal-kicker">
      {#if showScore}
        {hud.score} / {hud.targetScore}
      {:else}
        {GAME_COPY.status}
      {/if}
    </p>
    <h2 id="game-dialog-title">{result.title}</h2>
    <p class="modal-copy">{result.detail}</p>

    {#if hud.paused}
      <button class="primary-action" type="button" onclick={onResume}>{GAME_COPY.actions.resume}</button>
    {:else}
      <button class="primary-action" type="button" onclick={onRestart}>{GAME_COPY.actions.restart}</button>
    {/if}
  </div>
</div>

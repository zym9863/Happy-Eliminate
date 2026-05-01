<script>
  import { tileAssets } from '../game/assets/manifest.js'
  import { GAME_COPY } from '../game/content/copy.js'
  import IconButton from './IconButton.svelte'

  export let hud
  export let progress = 0
  export let onHint = () => {}
  export let onPauseToggle = () => {}
  export let onSoundToggle = () => {}
  export let onRestart = () => {}

  $: canPlay = hud.status === 'playing' && !hud.paused
  $: pauseLabel = hud.paused ? GAME_COPY.actions.resume : GAME_COPY.actions.pause
  $: pauseIcon = hud.paused ? 'play' : 'pause'
  $: soundLabel = hud.soundEnabled ? GAME_COPY.actions.soundOn : GAME_COPY.actions.soundOff
  $: soundIcon = hud.soundEnabled ? 'sound-on' : 'sound-off'
</script>

<aside class="hud-panel" aria-label="游戏状态">
  <section class="score-card" aria-label="分数进度">
    <div class="score-card__top">
      <span>{GAME_COPY.currentScore}</span>
      <strong>{hud.score}</strong>
    </div>

    <div class="progress-track" aria-hidden="true">
      <span style={`width: ${progress}%`}></span>
    </div>

    <div class="score-card__meta">
      <span>{GAME_COPY.targetScore} {hud.targetScore}</span>
      <span>{progress}%</span>
    </div>
  </section>

  <section class="metric-row" aria-label="关键数据">
    <div class="metric-tile">
      <span>{GAME_COPY.movesLeft}</span>
      <strong>{hud.movesLeft}</strong>
    </div>
    <div class="metric-tile">
      <span>{GAME_COPY.combo}</span>
      <strong>{hud.combo || 0}</strong>
    </div>
  </section>

  <div class="message-strip" aria-live="polite">{hud.message}</div>

  <section class="control-grid" aria-label="游戏操作">
    <IconButton icon="hint" label={GAME_COPY.actions.hint} variant="lemon" disabled={!canPlay} onclick={onHint} />
    <IconButton icon={pauseIcon} label={pauseLabel} variant="mint" disabled={hud.status !== 'playing'} onclick={onPauseToggle} />
    <IconButton icon={soundIcon} label={soundLabel} variant="sky" pressed={hud.soundEnabled} onclick={onSoundToggle} />
    <IconButton icon="restart" label={GAME_COPY.actions.restart} variant="berry" onclick={onRestart} />
  </section>

  <section class="tile-dock" aria-label={GAME_COPY.tileSet}>
    {#each tileAssets as tile}
      <span class="tile-token" title={tile.label} style={`--tile-color: ${tile.color}`}>
        <img src={tile.path} alt={tile.label} />
      </span>
    {/each}
  </section>
</aside>

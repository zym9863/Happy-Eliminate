<script>
  export let icon
  export let label
  export let pressed = undefined
  export let disabled = false
  export let variant = 'berry'
  export let onclick = () => {}
</script>

<button
  type="button"
  class={`icon-button icon-button--${variant}`}
  aria-label={label}
  aria-pressed={pressed}
  {disabled}
  {onclick}
>
  <span class="icon-button__glyph" aria-hidden="true">
    {#if icon === 'hint'}
      <svg viewBox="0 0 24 24">
        <path d="M12 3.25a6.35 6.35 0 0 0-3.52 11.64c.42.28.68.74.68 1.24v.37h5.68v-.37c0-.5.26-.96.68-1.24A6.35 6.35 0 0 0 12 3.25Z" />
        <path d="M9.4 19.1h5.2M10.2 21h3.6" />
      </svg>
    {:else if icon === 'pause'}
      <svg viewBox="0 0 24 24">
        <path d="M8.2 5.5h2.35v13H8.2zM13.45 5.5h2.35v13h-2.35z" />
      </svg>
    {:else if icon === 'play'}
      <svg viewBox="0 0 24 24">
        <path d="M8.2 5.7v12.6l10-6.3-10-6.3Z" />
      </svg>
    {:else if icon === 'sound-on'}
      <svg viewBox="0 0 24 24">
        <path d="M4.7 9.2h3.2l4.15-3.35v12.3L7.9 14.8H4.7z" />
        <path d="M15.2 8.2a5 5 0 0 1 0 7.6M17.55 5.8a8.2 8.2 0 0 1 0 12.4" />
      </svg>
    {:else if icon === 'sound-off'}
      <svg viewBox="0 0 24 24">
        <path d="M4.7 9.2h3.2l4.15-3.35v12.3L7.9 14.8H4.7z" />
        <path d="m16.1 9.2 4.1 4.1M20.2 9.2l-4.1 4.1" />
      </svg>
    {:else}
      <svg viewBox="0 0 24 24">
        <path d="M17.8 8.2a6.7 6.7 0 1 0 1.05 7.2" />
        <path d="M17.8 4.8v3.4h-3.4" />
      </svg>
    {/if}
  </span>
  <span class="icon-button__label">{label}</span>
</button>

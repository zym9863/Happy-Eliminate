export class Sfx {
  constructor() {
    this.enabled = true
    this.context = null
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  ensureContext() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.context = AudioContext ? new AudioContext() : null
    }

    if (this.context?.state === 'suspended') {
      this.context.resume()
    }

    return this.context
  }

  tone(frequency, duration = 0.08, type = 'sine', volume = 0.08) {
    if (!this.enabled) {
      return
    }

    const context = this.ensureContext()

    if (!context) {
      return
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const now = context.currentTime

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + duration + 0.03)
  }

  move() {
    this.tone(420, 0.06, 'triangle', 0.05)
  }

  reject() {
    this.tone(160, 0.11, 'sawtooth', 0.035)
  }

  match(combo = 1) {
    this.tone(620 + combo * 60, 0.1, 'sine', 0.08)
    window.setTimeout(() => this.tone(840 + combo * 70, 0.08, 'triangle', 0.045), 55)
  }

  win() {
    this.tone(660, 0.09, 'triangle', 0.07)
    window.setTimeout(() => this.tone(880, 0.1, 'triangle', 0.07), 90)
    window.setTimeout(() => this.tone(1180, 0.14, 'sine', 0.06), 190)
  }

  lose() {
    this.tone(280, 0.14, 'sine', 0.06)
    window.setTimeout(() => this.tone(190, 0.18, 'sine', 0.05), 120)
  }
}


/**
 * Web Audio API 声音引擎
 * 用于生成精确的听觉刺激声音
 */

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.connect(this.ctx.destination)
      this.masterGain.gain.value = 0.3
    }
    return this.ctx
  }

  /**
   * 播放提示音（高频短促，适合反应测试）
   */
  playBeep(frequency: number = 880, duration: number = 0.15): void {
    const ctx = this.getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    // ADSR 包络
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(this.masterGain!)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  }

  /**
   * 播放错误提示音（低频，表示点击过早）
   */
  playError(): void {
    const ctx = this.getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(this.masterGain!)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  }

  /**
   * 播放成功提示音（悦耳和弦）
   */
  playSuccess(): void {
    const ctx = this.getContext()
    const frequencies = [523.25, 659.25, 783.99] // C major chord

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05)

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.05 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.4)

      osc.connect(gain)
      gain.connect(this.masterGain!)

      osc.start(ctx.currentTime + i * 0.05)
      osc.stop(ctx.currentTime + i * 0.05 + 0.4)
    })
  }

  /**
   * 播放倒计时滴答声
   */
  playTick(): void {
    const ctx = this.getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1000, ctx.currentTime)

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(this.masterGain!)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }
}

export const audioEngine = new AudioEngine()

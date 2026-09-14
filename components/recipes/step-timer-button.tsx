'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatDuration } from '@/lib/step-timers'

type Props = {
  seconds: number
  /** Optional short label to show at rest ("3 דק'"). Defaults to formatDuration(seconds). */
  restLabel?: string
}

/**
 * Inline countdown button for a step. Click starts the timer; while running
 * the label ticks down as MM:SS. When the timer finishes it flashes and
 * plays a beep. Users can tap again to pause or reset.
 *
 * Multiple instances can be mounted per step (e.g. "לטגן 3 דק' ולאפות 15 דק'"
 * yields two independent buttons). The audio + notification are per-button.
 */
export function StepTimerButton({ seconds, restLabel }: Props) {
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'done'>('idle')
  const [remaining, setRemaining] = useState<number>(seconds)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const alertLoopRef = useRef<number | null>(null)

  // Preload the alert beep so the first fire doesn't stall on a fetch.
  useEffect(() => {
    if (typeof window === 'undefined') return
    audioRef.current = new Audio(BEEP_DATA_URL)
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 1
  }, [])

  // Fire a burst of beeps + vibrations so the user can't miss it — even if
  // they walked into the next room. Repeats every ~1.4 s until the user
  // interacts with the button (which sets status back to idle) or 20 s
  // elapses (safety cap so a forgotten timer doesn't beep forever).
  const startAlertLoop = useCallback(() => {
    if (typeof window === 'undefined') return
    let count = 0
    const maxRepeats = 14 // ~20 s of alerts
    const fire = () => {
      // Rapid triple-beep: play → 350ms → play → 350ms → play
      const bank = audioRef.current
      const doBeep = (delay: number) => {
        window.setTimeout(() => {
          try {
            if (!bank) return
            bank.currentTime = 0
            bank.play().catch(() => {})
          } catch {}
        }, delay)
      }
      doBeep(0)
      doBeep(350)
      doBeep(700)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          (navigator as Navigator & { vibrate?: (p: number[] | number) => boolean }).vibrate?.([500, 150, 500, 150, 500])
        } catch {}
      }
    }
    fire()
    alertLoopRef.current = window.setInterval(() => {
      count++
      if (count >= maxRepeats) {
        stopAlertLoop()
        return
      }
      fire()
    }, 1400)
  }, [])

  const stopAlertLoop = useCallback(() => {
    if (alertLoopRef.current != null) {
      clearInterval(alertLoopRef.current)
      alertLoopRef.current = null
    }
    try {
      if (audioRef.current) audioRef.current.pause()
    } catch {}
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        (navigator as Navigator & { vibrate?: (p: number[] | number) => boolean }).vibrate?.(0)
      } catch {}
    }
  }, [])

  // Cleanup on unmount so a beep-loop from an unmounted card can't keep firing.
  useEffect(() => stopAlertLoop, [stopAlertLoop])

  useEffect(() => {
    if (status !== 'running') return
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t)
          setStatus('done')
          startAlertLoop()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status, startAlertLoop])

  function toggle() {
    if (status === 'idle') {
      setRemaining(seconds)
      setStatus('running')
    } else if (status === 'running') {
      setStatus('paused')
    } else if (status === 'paused') {
      setStatus('running')
    } else if (status === 'done') {
      // Acknowledging the alert — silence the beep loop and reset for another run.
      stopAlertLoop()
      setRemaining(seconds)
      setStatus('idle')
    }
  }

  function reset(e: React.MouseEvent) {
    e.stopPropagation()
    stopAlertLoop()
    setStatus('idle')
    setRemaining(seconds)
  }

  const restText = restLabel ?? formatDuration(seconds)
  const runningText = useMemo(() => {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0')
    const s = (remaining % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [remaining])

  const bg =
    status === 'running' ? '#EAF1E3'
    : status === 'paused' ? '#FEF3D4'
    : status === 'done' ? '#E4F3D7'
    : '#fff'
  const border =
    status === 'running' ? '#4d7c0f'
    : status === 'paused' ? '#d4a01a'
    : status === 'done' ? '#3f6212'
    : '#e5e5e5'
  const color =
    status === 'running' || status === 'done' ? '#3f6212'
    : status === 'paused' ? '#8a5c00'
    : '#4d7c0f'

  const icon =
    status === 'running' ? '⏸'
    : status === 'paused' ? '▶'
    : status === 'done' ? '✓'
    : '⏱'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <button
        type="button"
        onClick={toggle}
        aria-label={status === 'idle' ? `הפעל טיימר ל־${restText}` : status === 'running' ? 'השהה טיימר' : status === 'paused' ? 'המשך טיימר' : 'איפוס טיימר'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          background: bg,
          color,
          border: `1.5px solid ${border}`,
          borderRadius: 999,
          fontSize: '.85rem',
          fontWeight: 800,
          cursor: 'pointer',
          fontVariantNumeric: 'tabular-nums',
          minHeight: 32,
          transition: 'background .15s ease, border-color .15s ease',
          animation: status === 'done' ? 'timer-pop .6s ease-out infinite' : undefined,
        }}
      >
        <span aria-hidden style={{ fontSize: '.95rem' }}>{icon}</span>
        <span>
          {status === 'idle' && restText}
          {status === 'running' && runningText}
          {status === 'paused' && `${runningText} · השהה`}
          {status === 'done' && 'סיים!'}
        </span>
      </button>
      {(status === 'running' || status === 'paused' || status === 'done') && (
        <button
          type="button"
          onClick={reset}
          aria-label="איפוס טיימר"
          title="איפוס"
          style={{
            width: 26,
            height: 26,
            padding: 0,
            borderRadius: '50%',
            background: 'transparent',
            border: '1px solid #cfbfae',
            color: '#6b6357',
            fontSize: 12,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ↺
        </button>
      )}
      <style>{`
        @keyframes timer-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </span>
  )
}

// ─── Tiny data-URL beep so we don't ship a WAV file ──────────────────────────
// Generated once at module load: 0.5s of 880Hz sine at 22.05kHz mono.
const BEEP_DATA_URL = buildBeepDataUrl()
function buildBeepDataUrl(): string {
  const sampleRate = 22_050
  const durationSec = 0.5
  const freq = 880
  const totalSamples = Math.floor(sampleRate * durationSec)
  const buffer = new Uint8Array(44 + totalSamples * 2)
  const view = new DataView(buffer.buffer)

  // RIFF header
  writeStr(view, 0, 'RIFF')
  view.setUint32(4, 36 + totalSamples * 2, true)
  writeStr(view, 8, 'WAVE')
  writeStr(view, 12, 'fmt ')
  view.setUint32(16, 16, true)      // fmt chunk size
  view.setUint16(20, 1, true)        // PCM
  view.setUint16(22, 1, true)        // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)        // block align
  view.setUint16(34, 16, true)       // bits per sample
  writeStr(view, 36, 'data')
  view.setUint32(40, totalSamples * 2, true)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    // Envelope: quick fade in/out so it doesn't click
    const env = Math.min(1, t / 0.03, (durationSec - t) / 0.05)
    const s = Math.sin(2 * Math.PI * freq * t) * env * 0.6
    view.setInt16(44 + i * 2, Math.floor(s * 32767), true)
  }
  // Manual base64 encode to avoid depending on Buffer/btoa contexts
  let binary = ''
  for (let i = 0; i < buffer.length; i++) binary += String.fromCharCode(buffer[i]!)
  const b64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  return `data:audio/wav;base64,${b64}`
}

function writeStr(view: DataView, offset: number, s: string): void {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
}

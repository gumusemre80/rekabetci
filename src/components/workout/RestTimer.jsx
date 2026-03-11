import React, { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [60, 90, 120, 180];
const PRESET_LABELS = { 60: '1:00', 90: '1:30', 120: '2:00', 180: '3:00' };

// Short beep as base64 (440Hz, 200ms)
const BEEP_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVoGAAD+/wIA/v8EAPz/BgD6/wgA+P8KAPb/DAD0/w4A8v8QAPD/EgDu/xQA7P8WAIL/GACo/xoAxv8cAOT/HgACACAA4P8iAMT/JACM/yYAuP8oAD7/KgDE/ywAbf8uAIr/MADo/zIABgA0ABMANgAfADgAKgA6ADQAPAAWAD4ABgBAAOz/QgDg/0QAzP9GALz/SACK/0oAdv9MAGH/TgBN/1AAOf9SACX/VAAR/1YA/f5YAJb/WgD5/1wAOwBcAH0AXAB/AFwAYQBcAEMAXAAlAFwABwBcAOH/XADX/1wArf9cAKP/XACJ/1wAb/9cAFX/XABB/1wALf9cABn/XAAV/1wAD/9cAA//XAAP/1wAD/9cAA//XAAV/1wAGf9cACf/XAA1/1wAQ/9cAFH/XABZ/1wAYf9cAGn/XABR/1wAVf9cAFn/XABZ/1wAUf9cAFX/XA==';

const getTimerColor = (ratio) => {
  if (ratio > 0.5) return 'var(--neon-green)';
  if (ratio > 0.2) return 'var(--gold)';
  return 'var(--color-danger)';
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const RestTimer = ({ isActive, onComplete, onSkip }) => {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Init audio
  useEffect(() => {
    audioRef.current = new Audio(BEEP_URL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Start timer when activated
  useEffect(() => {
    if (isActive && !isRunning) {
      setRemaining(duration);
      setFinished(false);
      setIsRunning(true);
    }
  }, [isActive]);

  // Countdown logic
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setFinished(true);
          // Play beep
          try { audioRef.current?.play(); } catch(e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handlePreset = (seconds) => {
    setDuration(seconds);
    setRemaining(seconds);
    setFinished(false);
    setIsRunning(true);
  };

  const handleAdd30 = () => {
    setRemaining(prev => prev + 30);
    if (!isRunning) setIsRunning(true);
    setFinished(false);
  };

  const handleSkip = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setFinished(false);
    onSkip?.();
  };

  if (!isActive && !isRunning && !finished) return null;

  const ratio = remaining / duration;
  const color = finished ? 'var(--neon-green)' : getTimerColor(ratio);

  // SVG circle math
  const size = 100;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - ratio);

  return (
    <div className="card radial-spotlight radial-spotlight-cyan" style={{ 
      padding: '1.25rem', 
      textAlign: 'center',
      marginBottom: '1rem',
      background: finished ? 'var(--neon-green-bg)' : 'transparent',
      animation: finished ? 'pulse 1s ease-in-out infinite' : 'none'
    }}>
      {/* Duration Presets */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            style={{
              padding: '4px 12px', border: 'none', borderRadius: '4px',
              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-gaming)', transition: 'all 0.15s ease',
              background: p === duration ? 'var(--accent-dim)' : 'var(--bg-panel-hover)',
              color: p === duration ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke="var(--border-color)" strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={dashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
          />
        </svg>
        {/* Time text */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <span
            className="font-mono"
            style={{
              fontSize: finished ? '1.1rem' : '1.4rem', fontWeight: 800, color,
              fontFamily: 'var(--font-gaming)', letterSpacing: '-0.02em'
            }}
          >
            {finished ? '✓' : formatTime(remaining)}
          </span>
          {finished && <span style={{ fontSize: '0.6rem', color: 'var(--neon-green)' }}>HAZIR</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {!finished && (
          <button onClick={handleAdd30} style={{
            padding: '6px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--text-muted)', fontSize: '0.75rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-gaming)'
          }}>
            +30s
          </button>
        )}
        <button onClick={handleSkip} style={{
          padding: '6px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
          background: 'transparent', color: finished ? 'var(--neon-green)' : 'var(--text-muted)',
          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-gaming)'
        }}>
          {finished ? 'Devam Et' : 'Atla →'}
        </button>
      </div>
    </div>
  );
};

export default React.memo(RestTimer);

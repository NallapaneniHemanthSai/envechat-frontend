import { useEffect, useState } from "react";

export default function ServerWakeup({ onReady }) {
  const [seconds, setSeconds] = useState(0);
  const [statusText, setStatusText] = useState("Establishing connection...");
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    const dotTimer = setInterval(() => setDotCount((d) => (d + 1) % 4), 400);

    const statusMessages = [
      "Establishing connection...",
      "Waking up servers...",
      "Loading resources...",
      "Almost there...",
    ];
    const statusTimer = setInterval(() => {
      setStatusText((prev) => {
        const idx = statusMessages.indexOf(prev);
        return statusMessages[(idx + 1) % statusMessages.length];
      });
    }, 4000);

    const checkServer = async () => {
      try {
        const res = await fetch("https://envechat.onrender.com/api/auth/ping");
        if (res.ok) {
          clearInterval(timer);
          clearInterval(dotTimer);
          clearInterval(statusTimer);
          onReady();
        }
      } catch (err) {
        // Server still sleeping
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
      clearInterval(dotTimer);
      clearInterval(statusTimer);
    };
  }, [onReady]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = Math.min((seconds / 120) * 100, 95);

  return (
    <>
      <div style={styles.page}>
        {/* Animated background orbs */}
        <div style={{ ...styles.orb, ...styles.orb1 }} />
        <div style={{ ...styles.orb, ...styles.orb2 }} />
        <div style={{ ...styles.orb, ...styles.orb3 }} />

        <div style={styles.container}>
          {/* Logo */}
          <div style={styles.logoWrap}>
            <div style={styles.logoRing}>
              <div style={styles.logoInner}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <h1 style={styles.title}>EnveChat</h1>
          <p style={styles.subtitle}>{statusText}{'.'.repeat(dotCount)}</p>

          {/* Progress bar */}
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            <div style={{ ...styles.progressGlow, left: `${progress}%` }} />
          </div>

          {/* Stats row */}
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{mins}:{String(secs).padStart(2, '0')}</span>
              <span style={styles.statLabel}>Elapsed</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statValue}>~2:00</span>
              <span style={styles.statLabel}>Estimated</span>
            </div>
          </div>

          {/* Info pill */}
          <div style={styles.infoPill}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5865f2" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Free-tier server cold start — this only happens after inactivity</span>
          </div>

          {/* Loading dots */}
          <div style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ ...styles.loadDot, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(88, 101, 242, 0); }
        }
        @keyframes progressShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes loadBounce {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    height: '100vh',
    background: '#1e1f22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    animation: 'orbFloat 8s ease-in-out infinite',
  },
  orb1: {
    width: 400, height: 400,
    background: 'rgba(88, 101, 242, 0.12)',
    top: '-10%', left: '-5%',
    animationDelay: '0s',
  },
  orb2: {
    width: 300, height: 300,
    background: 'rgba(35, 165, 89, 0.08)',
    bottom: '-10%', right: '-5%',
    animationDelay: '-3s',
  },
  orb3: {
    width: 250, height: 250,
    background: 'rgba(240, 178, 50, 0.06)',
    top: '50%', left: '60%',
    animationDelay: '-5s',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '48px 40px',
    maxWidth: 420,
    width: '100%',
    animation: 'fadeInUp 0.6s ease',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(88, 101, 242, 0.1)',
    border: '2px solid rgba(88, 101, 242, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'ringPulse 2s ease-in-out infinite',
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #5865f2, #7289da)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(88, 101, 242, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#f2f3f5',
    letterSpacing: '-0.03em',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#949ba4',
    marginBottom: 32,
    minHeight: 20,
  },
  progressTrack: {
    position: 'relative',
    height: 4,
    background: '#404249',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #5865f2, #7289da, #5865f2)',
    backgroundSize: '200% 100%',
    borderRadius: 99,
    transition: 'width 1s ease',
    animation: 'progressShimmer 2s linear infinite',
  },
  progressGlow: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#5865f2',
    filter: 'blur(6px)',
    transition: 'left 1s ease',
    transform: 'translateX(-50%)',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f2f3f5',
    fontVariantNumeric: 'tabular-nums',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#949ba4',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statDivider: {
    width: 1,
    height: 32,
    background: '#404249',
  },
  infoPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: 'rgba(88, 101, 242, 0.08)',
    border: '1px solid rgba(88, 101, 242, 0.15)',
    borderRadius: 99,
    fontSize: 12,
    color: '#949ba4',
    marginBottom: 28,
  },
  dotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
  },
  loadDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#5865f2',
    display: 'inline-block',
    animation: 'loadBounce 1.4s ease-in-out infinite',
  },
};
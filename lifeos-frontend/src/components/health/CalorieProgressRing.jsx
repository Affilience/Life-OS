export default function CalorieProgressRing({ current, goal, size = 200 }) {
  const progress = Math.min((current / goal) * 100, 100);
  const circumference = 2 * Math.PI * 85; // radius = 85
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color based on progress
  let color = '#10b981'; // Green
  if (progress > 100) color = '#ef4444'; // Red (over goal)
  else if (progress > 90) color = '#f59e0b'; // Orange (close to goal)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={85}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={85}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color,
        }}>
          {current}
        </div>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginTop: '4px',
        }}>
          / {goal} cal
        </div>
      </div>
    </div>
  );
}

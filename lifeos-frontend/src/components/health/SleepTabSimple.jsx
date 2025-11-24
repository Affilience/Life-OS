import React, { useState } from 'react';
import { Moon, Clock, TrendingUp } from 'lucide-react';

export default function SleepTabSimple() {
  const [sleepLog, setSleepLog] = useState([
    {
      id: 1,
      date: '2025-01-19',
      bedtime: '22:30',
      wakeTime: '06:30',
      duration: 8,
      quality: 85,
    },
    {
      id: 2,
      date: '2025-01-18',
      bedtime: '23:00',
      wakeTime: '07:00',
      duration: 8,
      quality: 80,
    },
  ]);

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#fff',
        }}>
          Sleep Tracking
        </h2>
        <button style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
        }}>
          Log Sleep
        </button>
      </div>

      {/* Today's Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Duration</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>8h</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Quality</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>85%</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Moon size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Bedtime</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>22:30</div>
        </div>
      </div>

      {/* Recent Sleep Log */}
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#fff',
          marginBottom: '16px',
        }}>
          Recent Sleep
        </h3>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {sleepLog.map((sleep) => (
            <div
              key={sleep.id}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 100px',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Date
                </div>
                <div style={{ fontSize: '15px', color: '#fff', fontWeight: '500' }}>
                  {new Date(sleep.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Sleep Time
                </div>
                <div style={{ fontSize: '15px', color: '#fff' }}>
                  {sleep.bedtime} - {sleep.wakeTime}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Duration
                </div>
                <div style={{ fontSize: '15px', color: '#fff', fontWeight: '500' }}>
                  {sleep.duration}h
                </div>
              </div>

              <div style={{
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '6px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '16px', color: '#10b981', fontWeight: '600' }}>
                  {sleep.quality}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

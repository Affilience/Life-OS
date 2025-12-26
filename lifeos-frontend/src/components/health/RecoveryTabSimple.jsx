import React from 'react';
import { Heart, Activity, Battery } from 'lucide-react';

export default function RecoveryTabSimple() {
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
          Recovery Tracking
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
          Log Recovery
        </button>
      </div>

      {/* Recovery Stats */}
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
            <Battery size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Recovery Score</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>78%</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>Good</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>HRV</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>42ms</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>Average</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Heart size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Resting HR</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>58bpm</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>Target: 55</div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#fff',
          marginBottom: '16px',
        }}>
          Recovery Recommendations
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '24px' }}>😴</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                  Prioritise Sleep Quality
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Your HRV is below optimal. Focus on getting 8+ hours of quality sleep tonight.
                </div>
              </div>
            </div>
            <div style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#ef4444',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              High Priority
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '24px' }}>🧘‍♂️</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                  Stress Management
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Stress levels are elevated. Consider meditation or breathing exercises.
                </div>
              </div>
            </div>
            <div style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#f59e0b',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Medium Priority
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '24px' }}>🚶‍♂️</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                  Active Recovery
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Light movement can boost recovery. Consider gentle yoga or walking.
                </div>
              </div>
            </div>
            <div style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#3b82f6',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Low Priority
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

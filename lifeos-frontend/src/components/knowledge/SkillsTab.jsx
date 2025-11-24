import React from 'react';
import { Target, ArrowRight, ExternalLink } from 'lucide-react';
import Button from '../shared/Button';
import Card from '../shared/Card';
import './SkillsTab.css';

const SkillsTab = () => {
  const handleGoToSkills = () => {
    // In a real app, this would use React Router to navigate
    window.location.href = '/skills';
  };

  return (
    <div className="skills-tab">
      <Card>
        <div className="skills-redirect">
          <div className="redirect-icon">
            <Target size={48} />
          </div>
          
          <div className="redirect-content">
            <h3>Skills Management</h3>
            <p>
              Your comprehensive skills tracking and development is managed in the dedicated Skills module. 
              Track your progress, set learning goals, and build your professional expertise.
            </p>
            
            <div className="redirect-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <Target size={16} />
                </div>
                <span>Skill assessment and progress tracking</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Target size={16} />
                </div>
                <span>Learning path recommendations</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Target size={16} />
                </div>
                <span>Professional development goals</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Target size={16} />
                </div>
                <span>Certification and achievement tracking</span>
              </div>
            </div>
          </div>
          
          <div className="redirect-actions">
            <Button 
              variant="primary" 
              size="large"
              icon={ArrowRight}
              onClick={handleGoToSkills}
            >
              Go to Skills Module
            </Button>
            <Button 
              variant="ghost" 
              size="small"
              icon={ExternalLink}
            >
              Open in New Tab
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="skills-quick-stats">
        <Card title="Quick Skills Overview">
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <div className="stat-value">12</div>
              <div className="stat-label">Skills Tracked</div>
            </div>
            <div className="quick-stat">
              <div className="stat-value">3</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="quick-stat">
              <div className="stat-value">7</div>
              <div className="stat-label">Proficient</div>
            </div>
            <div className="quick-stat">
              <div className="stat-value">2</div>
              <div className="stat-label">Expert Level</div>
            </div>
          </div>
          <div className="quick-stats-footer">
            <p>Visit the Skills module for detailed tracking and development plans</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SkillsTab;
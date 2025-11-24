import React from 'react';
import { Target, Plus } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import ProgressBar from '../shared/ProgressBar';
import './GoalsTab.css';

export default function GoalsTab() {
  const goals = [
    {
      id: 1,
      title: '£10,000 Emergency Fund',
      current: 3500,
      target: 10000,
      deadline: '2026-12-31',
      category: 'Savings'
    },
    {
      id: 2,
      title: '£2,000/month Business Income',
      current: 2850,
      target: 2000,
      deadline: '2025-12-31',
      category: 'Income',
      completed: true
    },
    {
      id: 3,
      title: '£5,000 Investment Fund',
      current: 2000,
      target: 5000,
      deadline: '2026-06-30',
      category: 'Investment'
    },
    {
      id: 4,
      title: 'Build £15,000 Net Worth',
      current: 8500,
      target: 15000,
      deadline: '2026-12-31',
      category: 'Net Worth'
    }
  ];

  return (
    <div className="goals-tab">
      <Card>
        <Card.Header>
          <h3 className="card-title">Financial Goals</h3>
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            Add Goal
          </Button>
        </Card.Header>

        <div className="goals-list">
          {goals.map(goal => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.completed || goal.current >= goal.target;

            return (
              <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                <div className="goal-header">
                  <div>
                    <h4 className="goal-title">{goal.title}</h4>
                    <span className="goal-category">{goal.category}</span>
                  </div>
                  {isCompleted && (
                    <span className="goal-completed">✓ Completed</span>
                  )}
                </div>

                <ProgressBar
                  value={goal.current}
                  max={goal.target}
                  color="financial"
                />

                <div className="goal-footer">
                  <span>£{goal.current.toLocaleString()} / £{goal.target.toLocaleString()}</span>
                  <span>Due: {new Date(goal.deadline).toLocaleDateString('en-GB')}</span>
                </div>

                {!isCompleted && (
                  <div className="goal-remaining">
                    £{(goal.target - goal.current).toLocaleString()} remaining
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
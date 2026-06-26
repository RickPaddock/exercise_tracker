import React, { useState } from 'react';
import AbsChallengeTracker from './AbsChallengeTracker';
import { NutritionPage, GymPage } from './PlanPages';

const TABS = [
  { id: 'igor', label: 'IGOR situps', icon: '🧍' },
  { id: 'gym', label: 'GYM', icon: '🏋️' },
  { id: 'nutrition', label: 'NUTRITION', icon: '🍽️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('igor');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      <nav
        style={{
          display: 'flex',
          gap: '6px',
          padding: '10px',
          background: '#111827',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 10px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isActive ? '#2d6a4f' : '#1f2937',
                color: isActive ? '#ffffff' : '#9ca3af',
              }}
            >
              <span style={{ marginRight: '6px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'igor' && <AbsChallengeTracker />}
      {activeTab === 'gym' && <GymPage />}
      {activeTab === 'nutrition' && <NutritionPage />}
    </div>
  );
}

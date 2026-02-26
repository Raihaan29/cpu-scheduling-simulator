import React, { useState, useEffect } from 'react';
import { Sun, Moon, Cpu } from 'lucide-react';
import ProcessInput from './components/ProcessInput';
import GanttChart from './components/GanttChart';
import MetricsDashboard from './components/MetricsDashboard';
import { runAllSimulations } from './utils/algorithms';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [processes, setProcesses] = useState([]);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [isSmallerBetter, setIsSmallerBetter] = useState(true);

  const [simulationResults, setSimulationResults] = useState(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleRunSimulation = () => {
    if (processes.length === 0) {
      alert("Please add at least one process.");
      return;
    }
    const results = runAllSimulations(processes, timeQuantum, isSmallerBetter);
    setSimulationResults(results);
  };

  return (
    <div className="app-container">
      {/* Sidebar - Settings */}
      <aside className="app-sidebar">
        <div style={{ padding: '1rem', background: 'var(--card-bg)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="header-title" style={{ fontSize: '1.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <Cpu size={28} /> Process Scheduler
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Advanced CPU Scheduling Simulator
          </p>
        </div>

        <ProcessInput
          processes={processes}
          setProcesses={setProcesses}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          timeQuantum={timeQuantum}
          setTimeQuantum={setTimeQuantum}
          isSmallerBetter={isSmallerBetter}
          setIsSmallerBetter={setIsSmallerBetter}
          onRunSimulation={handleRunSimulation}
        />
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Header */}
        <header className="glass-panel app-header">
          <div className="status-indicator">
            <div className="status-dot"></div>
            SYSTEM ONLINE
          </div>
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        {/* Results Area */}
        {simulationResults ? (
          <>
            <GanttChart timeline={simulationResults[algorithm].timeline} />
            <MetricsDashboard
              currentResults={simulationResults[algorithm]}
              allResults={simulationResults}
            />
          </>
        ) : (
          <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.2rem' }}>Configure processes and run the simulation to see results.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

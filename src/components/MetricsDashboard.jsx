import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Cpu, Zap, List } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MetricCard = ({ title, value, unit, icon: Icon, delay }) => (
    <motion.div
        className="metric-card glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        <div className="metric-header">
            <Icon size={18} className="text-primary" />
            {title}
        </div>
        <div className="metric-value">
            {value} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{unit}</span>
        </div>
    </motion.div>
);

const MetricsDashboard = ({ currentResults, allResults }) => {
    if (!currentResults || !currentResults.stats) return null;

    const { stats, avgWt, avgTat, cpuUtil, throughput } = currentResults;

    const chartData = {
        labels: stats.map(s => s.id),
        datasets: [
            {
                label: 'Waiting Time (WT)',
                data: stats.map(s => s.wt),
                backgroundColor: 'rgba(59, 130, 246, 0.85)', // Brilliant Blue 500
                borderColor: 'rgba(37, 99, 235, 1)', // Blue 600
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: 'Turnaround Time (TAT)',
                data: stats.map(s => s.tat),
                backgroundColor: 'rgba(16, 185, 129, 0.85)', // Emerald 500
                borderColor: 'rgba(5, 150, 105, 1)', // Emerald 600
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: 'var(--text-primary)', font: { family: 'Outfit' } }
            },
            title: {
                display: true,
                text: 'WT vs TAT Comparison',
                color: 'var(--text-primary)',
                font: { family: 'Outfit', size: 16 }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: 'var(--text-secondary)' },
                grid: { color: 'var(--card-border)' }
            },
            x: {
                ticks: { color: 'var(--text-secondary)' },
                grid: { display: false }
            }
        }
    };

    // Build ranking table array
    const ranking = Object.entries(allResults).map(([key, res]) => ({
        name: key,
        wt: parseFloat(res.avgWt),
        tat: parseFloat(res.avgTat),
        cpu: parseFloat(res.cpuUtil)
    })).sort((a, b) => a.wt - b.wt); // sort by lowest Wait Time by default

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Top Value Cards */}
            <div className="dashboard-grid">
                <MetricCard title="Avg Waiting Time" value={avgWt} unit="ms" icon={Clock} delay={0.1} />
                <MetricCard title="Avg Turnaround" value={avgTat} unit="ms" icon={Clock} delay={0.2} />
                <MetricCard title="CPU Utilization" value={cpuUtil} unit="%" icon={Cpu} delay={0.3} />
                <MetricCard title="Throughput" value={throughput} unit="p/ms" icon={Zap} delay={0.4} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Bar Chart Panel */}
                <motion.div
                    className="glass-panel"
                    style={{ padding: '1.5rem', height: '400px' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                        <BarChart3 size={20} className="text-primary" /> Performance Distribution
                    </div>
                    <div style={{ height: '320px', width: '100%' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Comparison Table Panel */}
                <motion.div
                    className="glass-panel"
                    style={{ padding: '1.5rem' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                        <List size={20} className="text-primary" /> Algorithm Ranking (Current Dataset)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--table-border)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Algorithm</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Avg WT</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Avg TAT</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>CPU %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((row, i) => (
                                    <tr key={row.name} style={{ borderBottom: '1px solid var(--table-border)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                                            {i === 0 ? '🏆 ' : ''}{row.name}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{row.wt.toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{row.tat.toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{row.cpu.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default MetricsDashboard;

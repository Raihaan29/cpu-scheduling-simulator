import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Settings, Play, RefreshCw, Layers, Zap, RotateCcw } from 'lucide-react';
// Changed from ../utils/algorithms because we moved down a directory
import { runAllSimulations, ALGORITHMS } from '../../utils/algorithms';

const ProcessInput = ({
    processes,
    setProcesses,
    algorithm,
    setAlgorithm,
    timeQuantum,
    setTimeQuantum,
    isSmallerBetter,
    setIsSmallerBetter,
    onRunSimulation
}) => {

    const handleAddProcess = () => {
        const newId = `P${processes.length + 1} `;
        setProcesses([
            ...processes,
            { id: newId, at: 0, bt: 1, priority: 1 }
        ]);
    };

    const handleRemoveProcess = (index) => {
        const newProcs = [...processes];
        newProcs.splice(index, 1);
        setProcesses(newProcs);
    };

    const handleUpdate = (index, field, value) => {
        let val = parseInt(value);
        if (isNaN(val) || val < 0) val = 0;
        if (field === 'bt' && val < 1) val = 1;

        const newProcs = [...processes];
        newProcs[index][field] = val;
        setProcesses(newProcs);
    };

    const handleReset = () => {
        setProcesses([]);
    };

    // Check if priority fields need displaying
    const showPriority = algorithm.includes('PRIORITY');
    const showQuantum = algorithm.includes('RR');

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} className="text-primary" /> Configuration
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Scheduling Algorithm</label>
                <select
                    className="input-field"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                >
                    {Object.entries(ALGORITHMS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <AnimatePresence>
                {showQuantum && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}
                    >
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Time Quantum</label>
                        <input
                            type="number"
                            className="input-field"
                            min="1"
                            value={timeQuantum}
                            onChange={e => setTimeQuantum(e.target.value)}
                        />
                    </motion.div>
                )}

                {showPriority && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}
                    >
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Priority Logic</label>
                        <select
                            className="input-field"
                            value={isSmallerBetter ? 'smaller' : 'bigger'}
                            onChange={e => setIsSmallerBetter(e.target.value === 'smaller')}
                        >
                            <option value="smaller">Smaller Number = Higher Priority</option>
                            <option value="bigger">Bigger Number = Higher Priority</option>
                        </select>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={handleAddProcess} style={{ flex: 1 }}>
                    <Plus size={16} /> Add Process
                </button>
                <button className="btn btn-icon" onClick={handleReset} title="Clear All">
                    <RotateCcw size={18} />
                </button>
            </div>

            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '350px', marginTop: '0.5rem', paddingRight: '0.2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--table-border)' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>AT</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>BT</th>
                            {showPriority && <th style={{ padding: '0.75rem', textAlign: 'center' }}>Pri</th>}
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {processes.map((p, i) => (
                                <motion.tr
                                    key={p.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    layout
                                    style={{ borderBottom: '1px solid var(--table-border)' }}
                                >
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: 'var(--primary)',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '12px',
                                            fontWeight: 600
                                        }}>{p.id}</span>
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <input type="number" min="0" value={p.at} onChange={(e) => handleUpdate(i, 'at', e.target.value)}
                                            style={{ width: '50px', padding: '0.25rem', border: '1px solid var(--input-border)', borderRadius: '4px', background: 'var(--input-bg)', textAlign: 'center', color: 'inherit' }} />
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <input type="number" min="1" value={p.bt} onChange={(e) => handleUpdate(i, 'bt', e.target.value)}
                                            style={{ width: '50px', padding: '0.25rem', border: '1px solid var(--input-border)', borderRadius: '4px', background: 'var(--input-bg)', textAlign: 'center', color: 'inherit' }} />
                                    </td>
                                    {showPriority && (
                                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                            <input type="number" min="1" value={p.priority} onChange={(e) => handleUpdate(i, 'priority', e.target.value)}
                                                style={{ width: '50px', padding: '0.25rem', border: '1px solid var(--input-border)', borderRadius: '4px', background: 'var(--input-bg)', textAlign: 'center', color: 'inherit' }} />
                                        </td>
                                    )}
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <button className="btn-icon" onClick={() => handleRemoveProcess(i)} style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {processes.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No processes added yet.
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <button className="btn btn-primary" onClick={onRunSimulation} style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}>
                <Zap size={18} /> Run Simulation
            </button>

        </div>
    );
};

export default ProcessInput;

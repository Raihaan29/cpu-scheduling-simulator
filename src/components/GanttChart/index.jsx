import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

// Generates distinct colors per process
const processColors = [
    '#A78BFA', // Soft Purple
    '#60A5FA', // Soft Blue
    '#34D399', // Emerald
    '#F472B6', // Pink
    '#FBBF24', // Amber
    '#38BDF8', // Sky
    '#FB923C', // Orange
    '#F87171'  // Red
];

const getColorForProcess = (id) => {
    if (id === 'IDLE') return 'repeating-linear-gradient(45deg, rgba(160,160,160,0.1), rgba(160,160,160,0.1) 10px, rgba(160,160,160,0.2) 10px, rgba(160,160,160,0.2) 20px)';

    let num = parseInt(id.replace('P', ''));
    if (isNaN(num)) num = 1;
    return processColors[(num - 1) % processColors.length];
};

const GanttChart = ({ timeline }) => {

    if (!timeline || timeline.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Run simulation to view Gantt Chart
            </div>
        );
    }

    const totalTime = timeline[timeline.length - 1].end;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} className="text-primary" /> Visual Execution Timeline
            </h3>

            <div style={{ position: 'relative', width: '100%', height: '80px', marginTop: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', overflow: 'hidden' }}>
                {timeline.map((block, idx) => {
                    const duration = block.end - block.start;
                    const widthPct = (duration / totalTime) * 100;
                    const leftPct = (block.start / totalTime) * 100;
                    const isIdle = block.id === 'IDLE';

                    return (
                        <motion.div
                            key={`${idx}-${block.id}`}
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                height: '100%',
                                background: getColorForProcess(block.id),
                                transformOrigin: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isIdle ? 'var(--text-secondary)' : '#fff',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                borderRight: '1px solid var(--card-border)',
                                borderLeft: '1px solid var(--card-border)',
                                textShadow: isIdle ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                                boxShadow: isIdle ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.2)'
                            }}
                            title={`${block.id}: ${block.start}ms - ${block.end}ms (Duration: ${duration}ms)`}
                        >
                            {widthPct > 3 ? block.id : ''}

                            {/* Start label */}
                            {idx === 0 && (
                                <span style={{ position: 'absolute', bottom: '-25px', left: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {block.start}
                                </span>
                            )}
                            {/* End label */}
                            <span style={{ position: 'absolute', bottom: '-25px', right: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', transform: 'translateX(50%)' }}>
                                {block.end}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
            <div style={{ height: '20px' }}></div> {/* Spacer for bottom labels */}
        </div>
    );
};

export default GanttChart;

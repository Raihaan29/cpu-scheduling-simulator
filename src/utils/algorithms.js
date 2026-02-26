export const ALGORITHMS = {
    FCFS: 'First Come First Serve (FCFS)',
    SJF: 'Shortest Job First (SJF)',
    SRTF: 'Shortest Remaining Time First (SRTF)',
    RR: 'Round Robin (RR)',
    PRIORITY: 'Priority (Non-preemptive)',
    PRIORITY_RR: 'Priority + Round Robin'
};

/**
 * Normalizes metrics and builds the execution timeline
 */
const finalizeMetrics = (jobs, timeline) => {
    let totalWt = 0;
    let totalTat = 0;
    let maxWaitTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0;

    const stats = jobs.map(j => {
        const ct = j.endTimes[j.endTimes.length - 1]; // Completion time
        const tat = ct - j.at;                       // Turnaround time
        const wt = tat - j.bt;                       // Wait time
        const rt = (j.startTimes.length > 0 ? j.startTimes[0] : 0) - j.at; // Response time

        totalWt += wt;
        totalTat += tat;
        return { ...j, ct, tat, wt, rt };
    });

    const n = stats.length;
    const avgWt = n > 0 ? (totalWt / n).toFixed(2) : 0;
    const avgTat = n > 0 ? (totalTat / n).toFixed(2) : 0;
    const totalBt = jobs.reduce((sum, j) => sum + j.bt, 0);
    const cpuUtil = maxWaitTime > 0 ? ((totalBt / maxWaitTime) * 100).toFixed(2) : 0;
    const throughput = maxWaitTime > 0 ? (n / maxWaitTime).toFixed(4) : 0;

    return { timeline, stats, avgWt, avgTat, cpuUtil, throughput, totalExec: maxWaitTime };
};

// --- FCFS ---
export const simulateFCFS = (processList) => {
    let jobs = processList.map(p => ({ ...p, startTimes: [], endTimes: [] })).sort((a, b) => a.at - b.at);
    let timeline = [];
    let currentTime = 0;

    jobs.forEach(job => {
        if (currentTime < job.at) {
            timeline.push({ id: 'IDLE', start: currentTime, end: job.at });
            currentTime = job.at;
        }
        timeline.push({ id: job.id, start: currentTime, end: currentTime + job.bt });
        job.startTimes.push(currentTime);
        job.endTimes.push(currentTime + job.bt);
        currentTime += job.bt;
    });

    return finalizeMetrics(jobs, timeline);
};

// --- SJF (Non-preemptive) ---
export const simulateSJF = (processList) => {
    let jobs = processList.map(p => ({ ...p, startTimes: [], endTimes: [] }));
    let timeline = [];
    let currentTime = 0;
    let completed = 0;
    let n = jobs.length;
    let isCompleted = new Array(n).fill(false);

    while (completed !== n) {
        let idx = -1;
        let minBt = Infinity;
        for (let i = 0; i < n; i++) {
            if (jobs[i].at <= currentTime && !isCompleted[i]) {
                if (jobs[i].bt < minBt) {
                    minBt = jobs[i].bt;
                    idx = i;
                } else if (jobs[i].bt === minBt) {
                    if (idx === -1 || jobs[i].at < jobs[idx].at) idx = i;
                }
            }
        }

        if (idx !== -1) {
            let job = jobs[idx];
            timeline.push({ id: job.id, start: currentTime, end: currentTime + job.bt });
            job.startTimes.push(currentTime);
            job.endTimes.push(currentTime + job.bt);
            currentTime += job.bt;
            isCompleted[idx] = true;
            completed++;
        } else {
            let nextAt = Infinity;
            for (let i = 0; i < n; i++) {
                if (!isCompleted[i] && jobs[i].at < nextAt) nextAt = jobs[i].at;
            }
            timeline.push({ id: 'IDLE', start: currentTime, end: nextAt });
            currentTime = nextAt;
        }
    }
    return finalizeMetrics(jobs, timeline);
};

// --- SRTF (Preemptive) ---
export const simulateSRTF = (processList) => {
    let jobs = processList.map(p => ({ ...p, startTimes: [], endTimes: [] }));
    let timeline = [];
    let currentTime = 0;
    let completed = 0;
    let n = jobs.length;
    let remainingBt = jobs.map(j => j.bt);
    let prevIdx = -1;

    while (completed !== n) {
        let idx = -1;
        let minRemaining = Infinity;

        for (let i = 0; i < n; i++) {
            if (jobs[i].at <= currentTime && remainingBt[i] > 0) {
                if (remainingBt[i] < minRemaining) {
                    minRemaining = remainingBt[i];
                    idx = i;
                } else if (remainingBt[i] === minRemaining) {
                    if (idx === -1 || jobs[i].at < jobs[idx].at) idx = i;
                }
            }
        }

        if (idx !== -1) {
            if (prevIdx !== idx) {
                if (prevIdx !== -1 && prevIdx !== 'IDLE' && remainingBt[prevIdx] > 0) {
                    jobs[prevIdx].endTimes.push(currentTime);
                }
                timeline.push({ id: jobs[idx].id, start: currentTime, end: currentTime + 1 });
                jobs[idx].startTimes.push(currentTime);
            } else {
                timeline[timeline.length - 1].end += 1;
            }

            currentTime += 1;
            remainingBt[idx] -= 1;

            if (remainingBt[idx] === 0) {
                jobs[idx].endTimes.push(currentTime);
                completed++;
                prevIdx = -1;
            } else {
                prevIdx = idx;
            }
        } else {
            if (prevIdx !== 'IDLE') {
                timeline.push({ id: 'IDLE', start: currentTime, end: currentTime + 1 });
            } else {
                timeline[timeline.length - 1].end += 1;
            }
            currentTime += 1;
            prevIdx = 'IDLE';
        }
    }
    return finalizeMetrics(jobs, timeline);
};

// --- Round Robin (RR) ---
export const simulateRR = (processList, timeQuantum = 2) => {
    let jobs = processList.map((p, i) => ({ ...p, startTimes: [], endTimes: [], originalIndex: i }));
    let tq = parseInt(timeQuantum) || 2;
    let timeline = [];
    let currentTime = 0;
    let n = jobs.length;
    let remainingBt = jobs.map(j => j.bt);

    let sortedJobs = [...jobs].sort((a, b) => a.at - b.at);
    let queue = [];
    let completed = 0;
    let currentJobIdx = 0;

    if (sortedJobs.length > 0 && sortedJobs[0].at === 0) {
        while (currentJobIdx < n && sortedJobs[currentJobIdx].at <= currentTime) {
            queue.push(sortedJobs[currentJobIdx].originalIndex);
            currentJobIdx++;
        }
    }

    while (completed !== n) {
        if (queue.length === 0) {
            if (currentJobIdx < n) {
                let nextAt = sortedJobs[currentJobIdx].at;
                timeline.push({ id: 'IDLE', start: currentTime, end: nextAt });
                currentTime = nextAt;
                while (currentJobIdx < n && sortedJobs[currentJobIdx].at <= currentTime) {
                    queue.push(sortedJobs[currentJobIdx].originalIndex);
                    currentJobIdx++;
                }
            }
            continue;
        }

        let idx = queue.shift();
        let job = jobs[idx];
        let runTime = Math.min(tq, remainingBt[idx]);

        if (timeline.length > 0 && timeline[timeline.length - 1].id === job.id) {
            timeline[timeline.length - 1].end += runTime;
        } else {
            timeline.push({ id: job.id, start: currentTime, end: currentTime + runTime });
            job.startTimes.push(currentTime);
        }

        currentTime += runTime;
        remainingBt[idx] -= runTime;

        if (remainingBt[idx] === 0) {
            job.endTimes.push(currentTime);
            completed++;
        }

        while (currentJobIdx < n && sortedJobs[currentJobIdx].at <= currentTime) {
            queue.push(sortedJobs[currentJobIdx].originalIndex);
            currentJobIdx++;
        }

        if (remainingBt[idx] > 0) {
            queue.push(idx);
        }
    }
    return finalizeMetrics(jobs, timeline);
};

// --- Preemptive Priority ---
export const simulatePriority = (processList, isSmallerBetter = true) => {
    let jobs = processList.map(p => ({ ...p, startTimes: [], endTimes: [] }));
    let timeline = [];
    let currentTime = 0;
    let completed = 0;
    let n = jobs.length;
    let remainingBt = jobs.map(j => j.bt);
    let prevIdx = -1;

    while (completed !== n) {
        let idx = -1;
        let bestPriority = isSmallerBetter ? Infinity : -Infinity;

        for (let i = 0; i < n; i++) {
            if (jobs[i].at <= currentTime && remainingBt[i] > 0) {
                let isBetter = isSmallerBetter
                    ? jobs[i].priority < bestPriority
                    : jobs[i].priority > bestPriority;

                if (isBetter) {
                    bestPriority = jobs[i].priority;
                    idx = i;
                } else if (jobs[i].priority === bestPriority) {
                    if (idx === -1 || jobs[i].at < jobs[idx].at) idx = i;
                }
            }
        }

        if (idx !== -1) {
            if (prevIdx !== idx) {
                if (prevIdx !== -1 && prevIdx !== 'IDLE' && remainingBt[prevIdx] > 0) {
                    jobs[prevIdx].endTimes.push(currentTime);
                }
                timeline.push({ id: jobs[idx].id, start: currentTime, end: currentTime + 1 });
                jobs[idx].startTimes.push(currentTime);
            } else {
                timeline[timeline.length - 1].end += 1;
            }

            currentTime += 1;
            remainingBt[idx] -= 1;

            if (remainingBt[idx] === 0) {
                jobs[idx].endTimes.push(currentTime);
                completed++;
                prevIdx = -1;
            } else {
                prevIdx = idx;
            }
        } else {
            if (prevIdx !== 'IDLE') {
                timeline.push({ id: 'IDLE', start: currentTime, end: currentTime + 1 });
            } else {
                timeline[timeline.length - 1].end += 1;
            }
            currentTime += 1;
            prevIdx = 'IDLE';
        }
    }
    return finalizeMetrics(jobs, timeline);
};

// --- Priority + Round Robin (Hybrid) ---
// Groups by priority, then does RR inside priority groups
export const simulatePriorityRR = (processList, timeQuantum = 2, isSmallerBetter = true) => {
    let jobs = processList.map((p, i) => ({ ...p, startTimes: [], endTimes: [], originalIndex: i }));
    let tq = parseInt(timeQuantum) || 2;
    let timeline = [];
    let currentTime = 0;
    let n = jobs.length;
    let remainingBt = jobs.map(j => j.bt);

    let sortedJobs = [...jobs].sort((a, b) => a.at - b.at);
    let completed = 0;
    let currentJobIdx = 0;

    // Array of queues per priority
    let queues = {};

    const addToQueue = (jobIdx) => {
        const p = jobs[jobIdx].priority;
        if (!queues[p]) queues[p] = [];
        queues[p].push(jobIdx);
    };

    if (sortedJobs.length > 0 && sortedJobs[0].at === 0) {
        while (currentJobIdx < n && sortedJobs[currentJobIdx].at <= currentTime) {
            addToQueue(sortedJobs[currentJobIdx].originalIndex);
            currentJobIdx++;
        }
    }

    while (completed !== n) {
        // find highest priority queue with items
        let activePriority = null;
        let bestPriority = isSmallerBetter ? Infinity : -Infinity;

        for (let p in queues) {
            let numP = parseInt(p);
            if (queues[p].length > 0) {
                let isBetter = isSmallerBetter ? numP < bestPriority : numP > bestPriority;
                if (isBetter) {
                    bestPriority = numP;
                    activePriority = p;
                }
            }
        }

        if (activePriority === null) {
            if (currentJobIdx < n) {
                let nextAt = sortedJobs[currentJobIdx].at;
                timeline.push({ id: 'IDLE', start: currentTime, end: nextAt });
                currentTime = nextAt;
                while (currentJobIdx < n && sortedJobs[currentJobIdx].at <= currentTime) {
                    addToQueue(sortedJobs[currentJobIdx].originalIndex);
                    currentJobIdx++;
                }
            }
            continue;
        }

        let idx = queues[activePriority].shift();
        let job = jobs[idx];
        let runTime = Math.min(tq, remainingBt[idx]);

        if (timeline.length > 0 && timeline[timeline.length - 1].id === job.id) {
            timeline[timeline.length - 1].end += runTime;
        } else {
            timeline.push({ id: job.id, start: currentTime, end: currentTime + runTime });
            job.startTimes.push(currentTime);
        }

        currentTime += runTime;
        remainingBt[idx] -= runTime;

        if (remainingBt[idx] === 0) {
            job.endTimes.push(currentTime);
            completed++;
        }

        while (currentJobIdx < n && sortedJobs[currentJobIdx].at <= currentTime) {
            addToQueue(sortedJobs[currentJobIdx].originalIndex);
            currentJobIdx++;
        }

        if (remainingBt[idx] > 0) {
            // re-check if a better priority arrived during this runTime?
            // No, in standard Preemptive Priority RR we just evaluate queue again.
            queues[activePriority].push(idx);
        }
    }

    return finalizeMetrics(jobs, timeline);
};

export const runAllSimulations = (processList, timeQuantum, isSmallerBetter) => {
    return {
        FCFS: simulateFCFS(processList),
        SJF: simulateSJF(processList),
        SRTF: simulateSRTF(processList),
        RR: simulateRR(processList, timeQuantum),
        PRIORITY: simulatePriority(processList, isSmallerBetter),
        PRIORITY_RR: simulatePriorityRR(processList, timeQuantum, isSmallerBetter)
    };
};

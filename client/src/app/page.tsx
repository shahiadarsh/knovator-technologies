"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    RefreshCcw,
    AlertCircle,
    Database,
    Clock,
    FileText,
    Plus,
    ArrowUpRight,
    Eye,
    Zap,
    History
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ImportLog {
    _id: string;
    feedUrl: string;
    timestamp: string;
    totalFetched: number;
    totalImported: number;
    newJobs: number;
    updatedJobs: number;
    failedJobs: number;
}

export default function Dashboard() {
    const [logs, setLogs] = useState<ImportLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchLogs = async () => {
        try {
            const response = await axios.get("https://knovator-technologies.vercel.app/api/import-history");
            setLogs(response.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await axios.post("https://knovator-technologies.vercel.app/api/sync-now");
            // Optimistic feedback
            setTimeout(fetchLogs, 2000);
        } catch (error) {
            console.error("Failed to start sync", error);
        } finally {
            setTimeout(() => setSyncing(false), 3000);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const totalJobs = logs.reduce((acc, l) => acc + l.totalImported, 0);
    const totalNew = logs.reduce((acc, l) => acc + l.newJobs, 0);
    const totalFailed = logs.reduce((acc, l) => acc + l.failedJobs, 0);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                            <Zap className="text-blue-500 fill-blue-500 w-8 h-8 md:w-10 md:h-10" />
                            Job<span className="text-blue-500">Sync</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg font-medium">Pipeline Monitor & Automation Control</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSync}
                        disabled={syncing}
                        className="relative group flex items-center gap-3 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] disabled:opacity-50 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <RefreshCcw className={`w-5 h-5 relative z-10 ${syncing ? 'animate-spin' : ''}`} />
                        <span className="relative z-10">{syncing ? 'Syncing Pipeline...' : 'Trigger Full Sync'}</span>
                    </motion.button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Feeds"
                        value="9"
                        color="blue"
                        icon={<FileText className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Database Index"
                        value={totalJobs.toLocaleString()}
                        color="emerald"
                        icon={<Database className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Recent Imports"
                        value={`+${totalNew.toLocaleString()}`}
                        color="indigo"
                        icon={<Plus className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Sync Failures"
                        value={totalFailed.toLocaleString()}
                        color="rose"
                        icon={<AlertCircle className="w-6 h-6" />}
                    />
                </div>

                {/* History Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600/10 p-3 rounded-2xl">
                                <History className="w-6 h-6 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Sync Stream</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Pipeline Monitoring
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-xs font-bold uppercase tracking-[0.15em] border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5">Source Endpoint</th>
                                    <th className="px-8 py-5 text-center">Timestamp</th>
                                    <th className="px-8 py-5 text-center">Fetched</th>
                                    <th className="px-8 py-5 text-center">Processed</th>
                                    <th className="px-8 py-5 text-center">Failures</th>
                                    <th className="px-8 py-5 text-right">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-8 py-20 text-center"><Loader /></td></tr>
                                    ) : logs.length === 0 ? (
                                        <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-500">No telemetry data recorded yet.</td></tr>
                                    ) : logs.map((log, i) => (
                                        <motion.tr
                                            key={log._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-white/[0.03] transition-colors group/row"
                                        >
                                            <td className="px-8 py-6 max-w-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500/50 group-hover/row:scale-150 transition-transform" />
                                                    <span className="font-bold text-slate-200 truncate group-hover/row:text-white transition-colors" title={log.feedUrl}>
                                                        {log.feedUrl}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center text-sm font-mono text-slate-400">
                                                {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-lg font-black text-white">{log.totalFetched}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-emerald-400 text-xs font-black">+{log.newJobs} New</span>
                                                    <span className="text-indigo-400 text-[10px] font-bold">~{log.updatedJobs} Updated</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${log.failedJobs > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800/50 text-slate-600'}`}>
                                                    {log.failedJobs}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link
                                                    href={`/jobs?feed=${encodeURIComponent(log.feedUrl)}`}
                                                    className="inline-flex items-center gap-2 bg-slate-800/50 hover:bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all transform hover:-translate-x-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Open Records
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: 'blue' | 'emerald' | 'indigo' | 'rose' }) {
    const colors = {
        blue: 'from-blue-600/10 to-blue-600/5 border-blue-500/20 text-blue-500',
        emerald: 'from-emerald-600/10 to-emerald-600/5 border-emerald-500/20 text-emerald-500',
        indigo: 'from-indigo-600/10 to-indigo-600/5 border-indigo-500/20 text-indigo-500',
        rose: 'from-rose-600/10 to-rose-600/5 border-rose-500/20 text-rose-500',
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative p-8 rounded-[2rem] border bg-gradient-to-br ${colors[color]} backdrop-blur-sm shadow-xl transition-all overflow-hidden group`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500`}>
                {icon}
            </div>
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900/50 rounded-xl">
                        {icon}
                    </div>
                    <p className="text-slate-400 text-sm font-bold tracking-wide uppercase">{title}</p>
                </div>
                <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-white">{value}</p>
                    <ArrowUpRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors mb-2" />
                </div>
            </div>
        </motion.div>
    );
}

function Loader() {
    return (
        <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-slate-500 font-bold text-sm tracking-widest uppercase">Initializing Telemetry...</span>
        </div>
    );
}

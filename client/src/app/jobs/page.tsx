"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import {
    ArrowLeft,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Search,
    MapPin,
    Building2,
    Calendar,
    Briefcase,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    link: string;
    pubDate: string;
    sourceFeed: string;
}

function JobsList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sourceFeed = searchParams.get("feed");

    const [jobs, setJobs] = useState<Job[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const limit = 10;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/jobs`, {
                params: {
                    sourceFeed,
                    page,
                    limit,
                    search: debouncedSearch
                }
            });
            setJobs(response.data.jobs);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [sourceFeed, page, debouncedSearch]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </motion.button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                                Imported <span className="text-blue-500">Jobs</span>
                            </h1>
                            <p className="text-slate-400 mt-2 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span className="truncate max-w-[250px] md:max-w-md" title={sourceFeed || 'All Sources'}>
                                    {sourceFeed ? sourceFeed : 'All integrated job feeds'}
                                </span>
                            </p>
                        </motion.div>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full md:w-80 group"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search roles, companies..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                            />
                            {loading && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading && jobs.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-32 bg-slate-900/30 border border-slate-800/50 rounded-2xl animate-pulse" />
                            ))
                        ) : jobs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-20 text-center space-y-4 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl"
                            >
                                <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="w-6 h-6 text-slate-700" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white">No jobs match your search</p>
                                    <p className="text-slate-500 text-sm">Try adjusting your filters or search terms.</p>
                                </div>
                            </motion.div>
                        ) : (
                            jobs.map((job, index) => (
                                <motion.div
                                    key={job._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-slate-900/40 border border-slate-800/80 p-5 md:p-6 rounded-3xl hover:bg-slate-900/60 hover:border-blue-500/30 transition-all hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.1)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/0 group-hover:bg-blue-500/50 transition-all" />

                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="space-y-4 flex-1">
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {job.title}
                                            </h3>

                                            <div className="flex flex-wrap gap-y-3 gap-x-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-800/50">
                                                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                                    {job.company}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-800/50">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-800/50">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                    {format(new Date(job.pubDate), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href={job.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
                                        >
                                            View Source
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Enhanced Pagination */}
                {!loading && totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-slate-800"
                    >
                        <p className="text-sm text-slate-500 font-medium order-2 md:order-1">
                            Showing <span className="text-white">{(page - 1) * limit + 1}</span> - <span className="text-white">{Math.min(page * limit, total)}</span> of <span className="text-white">{total.toLocaleString()}</span> jobs
                        </p>

                        <div className="flex items-center gap-1 order-1 md:order-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-20 disabled:hover:text-slate-400 transition-all active:scale-90"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-1 px-4 text-sm font-bold text-white">
                                <span className="bg-blue-600/10 text-blue-500 px-2 py-1 rounded-lg">Page {page}</span>
                                <span className="text-slate-600 text-xs mx-1">/</span>
                                <span className="text-slate-400">{totalPages}</span>
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-20 disabled:hover:text-slate-400 transition-all active:scale-90"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        }>
            <JobsList />
        </Suspense>
    );
}

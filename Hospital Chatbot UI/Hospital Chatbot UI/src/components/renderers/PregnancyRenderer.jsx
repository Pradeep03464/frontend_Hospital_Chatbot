import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Baby, CheckCircle2, ChevronRight, Edit2, Plus, Check, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PregnancyRenderer = ({ intent }) => {
    const { state, dispatch } = useHospital();
    const { pregnancy } = state;

    // Default form data
    const [formData, setFormData] = useState({
        lmpDate: pregnancy?.lmpDate || '',
        edDate: pregnancy?.edDate || '',
        currentWeek: pregnancy?.currentWeek || 0,
        gravidity: pregnancy?.gravidity || 1,
        parity: pregnancy?.parity || 0,
        motherAge: pregnancy?.motherAge || 25,
        blood_group: pregnancy?.blood_group || 'O+',
        status: 'Healthy',
        trimester: 1,
        milestones: pregnancy?.milestones || []
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Initial check if we need to show form based on intent
    const isCreate = intent === 'CREATE_PREGNANCY_RECORD';
    const isUpdate = intent === 'UPDATE_PREGNANCY_RECORD';
    const isDelete = intent === 'DELETE_PREGNANCY_RECORD';

    const calculateWeeks = (lmp) => {
        if (!lmp) return 0;
        const start = new Date(lmp);
        const now = new Date();
        const diff = now - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const weeks = formData.lmpDate ? calculateWeeks(formData.lmpDate) : formData.currentWeek;
        const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

        const payload = {
            ...formData,
            currentWeek: weeks,
            trimester
        };

        dispatch({
            type: isUpdate ? 'UPDATE_PREGNANCY_RECORD' : 'CREATE_PREGNANCY_RECORD',
            payload
        });
        setIsSubmitted(true);
    };

    const handleDelete = () => {
        dispatch({ type: 'DELETE_PREGNANCY_RECORD' });
        setIsSubmitted(true);
    };

    // --- RENDERERS ---

    // 1. DELETE CONFIRM
    if (isDelete) {
        if (isSubmitted) return (
            <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl text-center text-sm text-slate-500">
                Pregnancy record removed.
            </div>
        );

        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-[2rem] text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-red-500 dark:text-red-300">
                    <Trash2 size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-red-700 dark:text-red-300">Remove Record?</h4>
                    <p className="text-xs text-red-600/80 dark:text-red-400 mt-1">This will clear your pregnancy data.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50">Cancel</button>
                    <button onClick={handleDelete} className="py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">Delete</button>
                </div>
            </motion.div>
        );
    }

    // 2. CREATE / UPDATE FORM
    if (isCreate || isUpdate) {
        if (isSubmitted) {
            return (
                <div className="mt-4 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300"><Check size={20} /></div>
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-200">Success</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Pregnancy record {isUpdate ? 'updated' : 'started'} successfully.</p>
                    </div>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-6 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
            >
                <div className="p-6 bg-med-blue text-white flex justify-between items-center">
                    <h4 className="font-bold flex items-center gap-2">
                        {isUpdate ? <Edit2 size={20} /> : <Plus size={20} />}
                        {isUpdate ? 'Update Pregnancy Record' : 'New Pregnancy Record'}
                    </h4>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">LMP Date</label>
                            <input
                                required type="date"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20 text-sm"
                                value={formData.lmpDate} onChange={(e) => setFormData({ ...formData, lmpDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">EDD (Optional)</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20 text-sm"
                                value={formData.edDate} onChange={(e) => setFormData({ ...formData, edDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Age</label>
                            <input
                                required type="number"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20 text-sm"
                                value={formData.motherAge} onChange={(e) => setFormData({ ...formData, motherAge: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Gravidity</label>
                            <input
                                required type="number"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20 text-sm"
                                value={formData.gravidity} onChange={(e) => setFormData({ ...formData, gravidity: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Blood</label>
                            <input
                                required type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20 text-sm"
                                value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-med-blue text-white rounded-[1.5rem] font-bold hover:shadow-lg hover:shadow-med-blue/20 transition-all active:scale-95">
                        {isUpdate ? 'Update Record' : 'Start Journey'}
                    </button>
                </form>
            </motion.div>
        );
    }

    // 3. SHOW DETAILS
    if (!pregnancy) return <div className="mt-6 text-center text-slate-400 text-sm p-4 bg-slate-50 rounded-2xl">No pregnancy record active.</div>;

    const calculateProgress = () => {
        const current = pregnancy.currentWeek || 0;
        return Math.min(100, (current / 40) * 100);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-6 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
            <div className="p-8 bg-gradient-to-br from-purple-500 to-med-blue text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
                    <Baby size={100} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Journey Tracker</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold bg-med-teal px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-med-teal/20">
                            <CheckCircle2 size={14} /> Active
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <h4 className="text-5xl font-black tracking-tighter">Week {pregnancy.currentWeek}</h4>
                        <span className="text-white/60 font-bold uppercase text-[10px] tracking-widest">of 40</span>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }} animate={{ width: `${calculateProgress()}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                            <span>Trimester {pregnancy.trimester || 1}</span>
                            <span>{Math.round(calculateProgress())}% Complete</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-6">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Upcoming Milestones</h5>
                <div className="space-y-0 relative">
                    <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-700 z-0"></div>

                    <div className="space-y-6 relative z-10">
                        {pregnancy.timeline && pregnancy.timeline.map((milestone, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-start gap-6 group"
                            >
                                <div className={`mt-1.5 w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm ${milestone.status === 'Completed'
                                    ? 'bg-med-teal/10 text-med-teal border border-med-teal/20'
                                    : milestone.status === 'Upcoming' || milestone.status === 'In Progress'
                                        ? 'bg-med-blue/10 text-med-blue border border-med-blue/20 ring-4 ring-med-blue/5 animate-pulse'
                                        : 'bg-slate-50 dark:bg-slate-900 text-slate-300 border border-slate-100 dark:border-slate-800'
                                    }`}>
                                    {milestone.status === 'Completed' ? <CheckCircle2 size={24} /> : i + 1}
                                </div>
                                <div className="flex-1 pb-6 border-b border-slate-50 dark:border-slate-900 group-last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h6 className={`font-bold text-sm ${milestone.status === 'Completed' ? 'text-slate-400 line-through decoration-med-teal/30' : 'text-slate-800 dark:text-slate-200'
                                            }`}>{milestone.event}</h6>
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">W{milestone.week}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${milestone.status === 'Completed' ? 'bg-med-teal/5 text-med-teal' : milestone.status === 'Upcoming' ? 'bg-med-blue/5 text-med-blue' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                                            }`}>
                                            {milestone.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PregnancyRenderer;

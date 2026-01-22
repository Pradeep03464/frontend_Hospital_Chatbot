import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { FileText, Calendar, User, Download, Eye, ArrowRight, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const ReportRenderer = ({ intent, entities }) => {
    const { state, dispatch } = useHospital();
    const { reports } = state;
    const [formState, setFormState] = useState({
        type: entities?.type || '',
        description: entities?.description || '',
        date: entities?.date || new Date().toISOString().split('T')[0],
        patientName: 'John Doe', // Mock default
        status: 'Final',
        summary: entities?.description || '',
        results: []
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    const handleSubmit = (e, isUpdate = false) => {
        e.preventDefault();
        const payload = {
            id: isUpdate ? entities.reportId : `REP${Math.floor(Math.random() * 1000)}`,
            ...formState,
            summary: formState.description // Mapping description to summary for simple view
        };

        dispatch({
            type: isUpdate ? 'UPDATE_REPORT' : 'CREATE_REPORT',
            payload
        });
        setIsSubmitted(true);
    };

    const handleDelete = () => {
        dispatch({ type: 'DELETE_REPORT', payload: entities.reportId });
        setIsSubmitted(true);
    };

    // --- RENDERERS ---

    // 1. DETAIL VIEW
    if (intent === 'SHOW_REPORT_BY_ID' && entities.reportId) {
        const report = reports.find(r => r.id === entities.reportId);
        if (!report) return <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">Report details not found.</div>;

        return (
            <motion.div
                initial="hidden" animate="visible" variants={containerVariants}
                className="mt-6 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
                <div className="p-8 bg-gradient-to-br from-med-blue to-blue-700 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
                        <FileText size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {report.id}
                            </span>
                            <span className="px-3 py-1 bg-med-teal rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {report.status}
                            </span>
                        </div>
                        <h4 className="text-2xl font-bold mb-1 tracking-tight">{report.type}</h4>
                        <div className="flex items-center gap-4 text-white/80 text-xs font-medium">
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {report.date}</span>
                            <span className="flex items-center gap-1.5"><User size={14} /> {report.patientName}</span>
                            {report.doctor && <span className="flex items-center gap-1.5 text-white/60">| {report.doctor}</span>}
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl text-sm text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 font-medium italic leading-relaxed">
                        "{report.summary || report.description}"
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95">
                            <Eye size={16} /> View PDF
                        </button>
                        <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95">
                            <Download size={16} /> Download
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // 2. CREATE / UPDATE FORM
    if (intent === 'CREATE_REPORT' || intent === 'UPDATE_REPORT') {
        const isUpdate = intent === 'UPDATE_REPORT';
        if (isSubmitted) {
            return (
                <div className="mt-4 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300"><Check size={20} /></div>
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-200">Success</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Report {isUpdate ? 'updated' : 'created'} successfully.</p>
                    </div>
                </div>
            );
        }

        // Pre-fill if update
        if (isUpdate && entities.reportId && !formState.id) {
            const report = reports.find(r => r.id === entities.reportId);
            if (report && report.id !== formState.id) {
                setFormState({ ...report, description: report.summary });
            }
        }

        return (
            <motion.form
                initial="hidden" animate="visible" variants={containerVariants}
                onSubmit={(e) => handleSubmit(e, isUpdate)}
                className="mt-6 w-full bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-med-blue/10 flex items-center justify-center text-med-blue">
                        {isUpdate ? <Edit2 size={20} /> : <Plus size={20} />}
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{isUpdate ? 'Edit Report' : 'New Report'}</h4>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Report Type</label>
                    <input
                        type="text"
                        value={formState.type}
                        onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-medium focus:ring-2 ring-med-blue/20 transition-all"
                        placeholder="e.g. Blood Test, MRI"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
                        <input
                            type="date"
                            value={formState.date}
                            onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-medium"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Patient</label>
                        <input
                            type="text"
                            value={formState.patientName}
                            readOnly
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-medium text-slate-400 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Summary / Description</label>
                    <textarea
                        value={formState.description}
                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-medium h-32 resize-none focus:ring-2 ring-med-blue/20 transition-all"
                        placeholder="Enter report details..."
                        required
                    />
                </div>

                <button type="submit" className="w-full py-4 bg-med-blue text-white rounded-2xl font-bold text-sm shadow-lg shadow-med-blue/30 hover:bg-blue-600 active:scale-95 transition-all">
                    {isUpdate ? 'Update Report' : 'Create Report'}
                </button>
            </motion.form>
        );
    }

    // 3. DELETE CONFIRMATION
    if (intent === 'DELETE_REPORT') {
        if (isSubmitted) return (
            <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl text-center text-sm text-slate-500">
                Report deleted.
            </div>
        );

        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-[2rem] text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-red-500 dark:text-red-300">
                    <Trash2 size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-red-700 dark:text-red-300">Delete Report?</h4>
                    <p className="text-xs text-red-600/80 dark:text-red-400 mt-1">This action cannot be undone. ID: {entities.reportId}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setConfirmDelete(false)} className="py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50">Cancel</button>
                    <button onClick={handleDelete} className="py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">Delete</button>
                </div>
            </motion.div>
        );
    }

    // 4. LIST VIEW (Default)
    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mt-6 w-full space-y-4">
            {reports.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm">No reports found.</div>
            ) : reports.map((report) => (
                <motion.div
                    key={report.id} variants={itemVariants}
                    className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-5 flex items-center justify-between hover:border-med-blue dark:hover:border-med-blue hover:shadow-lg transition-all cursor-pointer group shadow-sm shadow-slate-200/50 dark:shadow-none"
                // In a real app, this might trigger a SHOW_REPORT_BY_ID intent via a callback
                >
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-med-blue/5 dark:bg-med-blue/10 flex items-center justify-center text-med-blue transition-transform group-hover:scale-110">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-med-blue transition-colors text-left">{report.type}</h5>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-1">
                                <span>{report.date}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span>{report.id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${report.status === 'Final' ? 'text-med-teal bg-med-teal/5' : 'text-amber-500 bg-amber-50'}`}>{report.status}</span>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ReportRenderer;

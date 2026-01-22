import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Activity, Heart, Thermometer, Droplets, Plus, X, CheckCircle2, Trash2, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VitalRenderer = ({ intent, entities }) => {
    const { state, dispatch } = useHospital();
    const { vitals } = state;
    const [formData, setFormData] = useState({
        type: entities?.type || '',
        value: entities?.value || '',
        unit: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const getRiskLevel = (type, value) => {
        if (!value) return 'NORMAL';
        const val = parseFloat(value);
        if (type.toLowerCase().includes('pressure')) {
            const sys = parseInt(value.split('/')[0]);
            if (sys > 140) return 'HIGH';
            if (sys < 90) return 'LOW';
            return 'NORMAL';
        }
        if (type.toLowerCase().includes('heart')) {
            if (val > 100) return 'HIGH';
            if (val < 60) return 'LOW';
            return 'NORMAL';
        }
        return 'NORMAL';
    };

    const getStatusColor = (level) => {
        switch (level) {
            case 'HIGH': return 'bg-rose-500 text-white shadow-rose-200';
            case 'LOW': return 'bg-amber-500 text-white shadow-amber-200';
            default: return 'bg-med-teal text-white shadow-med-teal-100';
        }
    };

    const getIcon = (type) => {
        const t = type.toLowerCase();
        if (t.includes('heart')) return <Heart size={24} />;
        if (t.includes('pressure')) return <Activity size={24} />;
        if (t.includes('temp')) return <Thermometer size={24} />;
        return <Droplets size={24} />;
    };

    const handleSubmit = (e, isUpdate = false) => {
        e.preventDefault();
        const level = getRiskLevel(formData.type, formData.value);
        const newVital = {
            id: isUpdate ? entities.id : `VIT${Date.now()}`,
            ...formData,
            level,
            date: new Date().toISOString().split('T')[0]
        };

        dispatch({ type: isUpdate ? 'UPDATE_VITAL' : 'ADD_VITAL', payload: newVital });
        setIsSubmitted(true);
    };

    const handleDelete = () => {
        dispatch({ type: 'DELETE_VITAL', payload: entities.id });
        setIsSubmitted(true);
    };

    // --- RENDERERS ---

    // 1. DELETE CONFIRMATION
    if (intent === 'DELETE_VITAL' && entities?.id) {
        if (isSubmitted) return (
            <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl text-center text-sm text-slate-500">
                Vital record deleted.
            </div>
        );

        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-[2rem] text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-red-500 dark:text-red-300">
                    <Trash2 size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-red-700 dark:text-red-300">Delete Record?</h4>
                    <p className="text-xs text-red-600/80 dark:text-red-400 mt-1">ID: {entities.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50">Cancel</button>
                    <button onClick={handleDelete} className="py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">Delete</button>
                </div>
            </motion.div>
        );
    }

    // 2. CREATE / UPDATE FORM
    if (intent === 'ADD_VITAL' || intent === 'UPDATE_VITAL') {
        const isUpdate = intent === 'UPDATE_VITAL';

        if (isSubmitted) {
            return (
                <div className="mt-4 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300"><Check size={20} /></div>
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-200">Success</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Vital {isUpdate ? 'updated' : 'recorded'} successfully.</p>
                    </div>
                </div>
            );
        }

        // Pre-fill logic
        if (isUpdate && entities.id && !formData.id) {
            const vital = vitals.find(v => v.id === entities.id);
            if (vital && vital.id !== formData.id) {
                setFormData({ ...vital });
            }
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-6 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
            >
                <div className="p-6 bg-med-blue text-white flex justify-between items-center">
                    <h4 className="font-bold flex items-center gap-2">
                        {isUpdate ? <Edit2 size={20} /> : <Plus size={20} />}
                        {isUpdate ? 'Update Vital' : 'New Vital'}
                    </h4>
                </div>
                <form onSubmit={(e) => handleSubmit(e, isUpdate)} className="p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Vitals Category</label>
                        <input
                            required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20"
                            placeholder="e.g. Blood Pressure, Heart Rate"
                            value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Value</label>
                            <input
                                required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20"
                                placeholder="0.0"
                                value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unit</label>
                            <input
                                required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20"
                                placeholder="mmHg, bpm, etc."
                                value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-med-blue text-white rounded-[1.5rem] font-bold hover:shadow-lg hover:shadow-med-blue/20 transition-all active:scale-95">
                        {isUpdate ? 'Update Record' : 'Log Vital Reading'}
                    </button>
                </form>
            </motion.div>
        );
    }

    // 3. LIST VIEW (Default)
    return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
                {vitals.map((vital, i) => (
                    <motion.div
                        key={vital.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-med-blue/5 dark:bg-med-blue/10 flex items-center justify-center text-med-blue transition-transform group-hover:scale-110`}>
                                {getIcon(vital.type)}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm ${getStatusColor(vital.level)}`}>
                                {vital.level}
                            </span>
                        </div>
                        <div className="mt-6">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{vital.type}</h5>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{vital.value}</span>
                                <span className="text-xs font-bold text-slate-400">{vital.unit}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>{vital.id}</span>
                            <span className="text-slate-500">{vital.date}</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default VitalRenderer;

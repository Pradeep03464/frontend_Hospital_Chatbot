import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Calendar, Clock, User, CheckCircle2, Plus, X, MapPin, Edit2, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingInput = ({ label, icon: Icon, ...props }) => (
    <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-med-blue transition-colors">
            <Icon size={18} />
        </div>
        <input
            {...props}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-med-blue/20 focus:border-med-blue transition-all text-sm font-medium dark:text-white"
            placeholder=" "
        />
        <label className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none transition-all group-focus-within:-top-2 group-focus-within:left-4 group-focus-within:text-[10px] group-focus-within:font-bold group-focus-within:uppercase group-focus-within:bg-white dark:group-focus-within:bg-slate-800 group-focus-within:px-2 group-focus-within:text-med-blue peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-med-blue">
            {label}
        </label>
    </div>
);

const AppointmentRenderer = ({ intent, entities }) => {
    const { state, dispatch } = useHospital();
    const { appointments } = state;
    const [formData, setFormData] = useState({
        doctor: entities?.doctor_name || entities?.doctor || '',
        specialty: 'General',
        date: entities?.date || '',
        time: entities?.time || '09:00',
        notes: entities?.reason || ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // --- LOGIC ---
    const handleSubmit = (e, isUpdate = false) => {
        e.preventDefault();
        const payload = {
            id: isUpdate ? entities.appointmentId : `APP${Math.floor(1000 + Math.random() * 9000)}`,
            ...formData,
            status: 'Confirmed'
        };

        dispatch({
            type: isUpdate ? 'UPDATE_APPOINTMENT' : 'CREATE_APPOINTMENT',
            payload
        });
        setIsSubmitted(true);
    };

    const handleDelete = () => {
        dispatch({ type: 'DELETE_APPOINTMENT', payload: entities.appointmentId });
        setIsSubmitted(true);
    };

    // --- RENDERERS ---

    // 1. DELETE CONFIRMATION
    if (intent === 'DELETE_APPOINTMENT' && entities?.appointmentId) {
        if (isSubmitted) return (
            <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl text-center text-sm text-slate-500">
                Appointment cancelled.
            </div>
        );

        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-[2rem] text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-red-500 dark:text-red-300">
                    <Trash2 size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-red-700 dark:text-red-300">Cancel Appointment?</h4>
                    <p className="text-xs text-red-600/80 dark:text-red-400 mt-1">Are you sure you want to cancel? ID: {entities.appointmentId}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50">Back</button>
                    <button onClick={handleDelete} className="py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">Cancel Appointment</button>
                </div>
            </motion.div>
        );
    }

    // 2. CREATE / UPDATE FORM
    if (intent === 'CREATE_APPOINTMENT' || intent === 'UPDATE_APPOINTMENT') {
        const isUpdate = intent === 'UPDATE_APPOINTMENT';

        if (isSubmitted) {
            return (
                <div className="mt-4 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300"><Check size={20} /></div>
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-200">Success</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Appointment {isUpdate ? 'updated' : 'booked'} successfully.</p>
                    </div>
                </div>
            );
        }

        // Pre-fill logic
        if (isUpdate && entities.appointmentId && !formData.id) {
            const app = appointments.find(a => a.id === entities.appointmentId);
            if (app && app.id !== formData.id) {
                setFormData({ ...app });
            }
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-6 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
            >
                <div className="p-6 bg-med-blue text-white flex justify-between items-center">
                    <h4 className="font-bold flex items-center gap-2 tracking-tight">
                        {isUpdate ? <Edit2 size={20} /> : <Plus size={20} />}
                        {isUpdate ? 'Update Appointment' : 'New Appointment'}
                    </h4>
                </div>
                <form onSubmit={(e) => handleSubmit(e, isUpdate)} className="p-8 space-y-4">
                    <FloatingInput
                        label="Doctor Name" icon={User} required
                        value={formData.doctor}
                        onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FloatingInput
                            label="Date" icon={Calendar} required type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <FloatingInput
                            label="Time" icon={Clock} required type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>
                    <FloatingInput
                        label="Reason / Notes" icon={Edit2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <button
                        type="submit"
                        className="w-full py-5 bg-med-blue text-white rounded-[1.5rem] font-bold text-sm hover:bg-med-blue/90 hover:shadow-lg hover:shadow-med-blue/30 transition-all active:scale-95 mt-4"
                    >
                        {isUpdate ? 'Update Booking' : 'Confirm Reservation'}
                    </button>
                </form>
            </motion.div>
        );
    }

    // 3. LIST VIEW (Default)
    return (
        <div className="mt-6 w-full space-y-4">
            {appointments.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm">No appointments scheduled.</div>
            ) : appointments.map((app) => (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] overflow-hidden shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md transition-shadow group cursor-pointer"
                >
                    <div className="p-6 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="relative">
                                <img
                                    src={`https://i.pravatar.cc/150?u=${app.doctor}`}
                                    alt={app.doctor}
                                    className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-slate-100"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-med-teal border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={10} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-base">{app.doctor}</h5>
                                <p className="text-xs text-med-blue font-bold tracking-tight uppercase mt-0.5">{app.specialty}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{app.id}</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'Confirmed' ? 'bg-med-teal/10 text-med-teal' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {app.status}
                        </div>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <Calendar size={16} className="text-med-blue" /> {app.date}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <Clock size={16} className="text-med-blue" /> {app.time}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default AppointmentRenderer;

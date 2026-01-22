import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useHospital } from '../context/HospitalContext';
import { Sparkles } from 'lucide-react';

// Lazy load renderers
const ReportRenderer = lazy(() => import('./renderers/ReportRenderer'));
const AppointmentRenderer = lazy(() => import('./renderers/AppointmentRenderer'));
const VitalRenderer = lazy(() => import('./renderers/VitalRenderer'));
const PregnancyRenderer = lazy(() => import('./renderers/PregnancyRenderer'));

const MessageBubble = ({ message }) => {
    const isBot = message.sender === 'bot';
    const { intent, entities, text, timestamp } = message;

    const renderContent = () => {
        if (!isBot || !intent) return null;

        return (
            <Suspense fallback={
                <div className="mt-4 w-full h-32 rounded-3xl shimmer border border-slate-100 dark:border-slate-800" />
            }>
                <div className="w-full mt-2">
                    {intent.includes('REPORT') && <ReportRenderer intent={intent} entities={entities} />}
                    {intent.includes('APPOINTMENT') && <AppointmentRenderer intent={intent} entities={entities} />}
                    {(intent.includes('VITAL') || intent === 'ADD_VITAL') && <VitalRenderer intent={intent} entities={entities} />}
                    {intent.includes('PREGNANCY') && <PregnancyRenderer intent={intent} />}
                    {intent === 'HELP' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-6 p-6 bg-med-blue/5 dark:bg-med-blue/10 rounded-[2rem] border border-med-blue/10 backdrop-blur-sm shadow-sm"
                        >
                            <h4 className="font-bold text-med-blue dark:text-blue-400 mb-3 flex items-center gap-2">
                                <Sparkles size={18} /> How I can assist:
                            </h4>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
                                <li className="flex items-center gap-2">• View and manage <span className="text-med-blue font-bold tracking-tight">Medical Reports</span></li>
                                <li className="flex items-center gap-2">• Book or cancel <span className="text-med-blue font-bold tracking-tight">Appointments</span></li>
                                <li className="flex items-center gap-2">• Track daily <span className="text-med-blue font-bold tracking-tight">Health Vitals</span></li>
                                <li className="flex items-center gap-2">• Monitor <span className="text-med-blue font-bold tracking-tight">Pregnancy Progress</span></li>
                            </ul>
                        </motion.div>
                    )}
                </div>
            </Suspense>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className={`flex ${isBot ? 'justify-start' : 'justify-end'} gap-4 w-full group`}
        >
            {isBot && (
                <div className="w-10 h-10 rounded-xl bg-ai-lavender dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-med-blue shadow-sm shadow-med-blue/10 transition-transform group-hover:scale-110">
                    <Sparkles size={20} />
                </div>
            )}
            <div className={`flex flex-col max-w-[80%] ${isBot ? 'items-start' : 'items-end'}`}>
                <div
                    className={`px-6 py-4 rounded-[1.8rem] shadow-sm transition-all hover:shadow-md ${isBot
                        ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        : 'bg-med-blue text-white rounded-tr-none shadow-lg shadow-med-blue/20'
                        }`}
                >
                    <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{text}</p>
                </div>
                {timestamp && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-bold uppercase tracking-widest px-1">
                        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
                {renderContent()}
            </div>
        </motion.div>
    );
};

export default MessageBubble;

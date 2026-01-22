import React, { useState, useRef, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { classifyIntent } from '../lib/gemini';
import MessageBubble from './MessageBubble';
import { Send, Menu, Plus, Sun, Moon, Sparkles, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = () => {
    const { state, dispatch } = useHospital();
    const [input, setInput] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            return saved === 'true';
        }
        return false;
    });
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.messages, state.isTyping]);

    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            sender: 'user',
            text: input,
        };

        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        setInput('');
        dispatch({ type: 'SET_TYPING', payload: true });

        try {
            const result = await classifyIntent(input);
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    sender: 'bot',
                    text: result.reply,
                    intent: result.intent,
                    entities: result.entities
                }
            });
        } catch (error) {
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    sender: 'bot',
                    text: "I'm sorry, I encountered an error processing your request.",
                    intent: 'ERROR'
                }
            });
        } finally {
            dispatch({ type: 'SET_TYPING', payload: false });
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-med-bg bg-medical-pattern transition-colors duration-500">
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-[95vh] my-[2.5vh] glass rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 relative">

                {/* Header */}
                <header className="px-8 py-6 flex items-center justify-between border-b border-white/20 z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-med-blue flex items-center justify-center text-white shadow-lg shadow-med-blue/30 relative z-10 transition-transform hover:scale-105">
                                <Sparkles size={28} />
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-med-blue animate-ping opacity-20 z-0"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">City Hospital AI</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-med-teal animate-pulse"></span>
                                <span className="text-xs font-medium text-med-teal uppercase tracking-wider">Assistant Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 transition-all active:scale-95"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 transition-all">
                            <Menu size={20} />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scroll-smooth no-scrollbar">
                    <AnimatePresence initial={false}>
                        {state.messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                    </AnimatePresence>

                    {state.isTyping && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-ai-lavender dark:bg-slate-800 flex items-center justify-center text-med-blue shadow-sm">
                                <Sparkles size={18} />
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-3xl rounded-tl-none px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-2 h-2 rounded-full bg-med-blue/40"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Floating Input Area */}
                <div className="px-8 pb-8 pt-4">
                    <form
                        onSubmit={handleSend}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pl-4 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-med-blue/20 transition-all"
                    >
                        <button type="button" className="p-3 text-slate-400 hover:text-med-blue transition-colors">
                            <Plus size={22} />
                        </button>
                        <button type="button" className="p-2 text-slate-400 hover:text-med-blue transition-colors">
                            <Mic size={22} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="How can I help you with your health today?"
                            className="flex-1 py-3 text-slate-700 dark:text-slate-200 outline-none text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="group p-4 bg-med-blue text-white rounded-[1.5rem] hover:bg-med-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-med-blue/20 active:scale-95 flex items-center justify-center"
                        >
                            <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-[0.2em] font-semibold dark:text-slate-500">
                        Powered by Med-Intelligence Assistant
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;

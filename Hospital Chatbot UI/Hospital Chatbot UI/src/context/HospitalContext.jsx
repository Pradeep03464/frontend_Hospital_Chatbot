/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import initialData from '../data/hospitalData.json';

export const HospitalContext = createContext();

const defaultState = {
  ...initialData,
  messages: [
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your hospital assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
      intent: 'GREETING'
    }
  ],
  isTyping: false
};

const getInitialState = () => {
  const saved = localStorage.getItem('hospitalState');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved state', e);
      return defaultState;
    }
  }
  return defaultState;
};

function hospitalReducer(state, action) {
  switch (action.type) {
    case 'RESET_CONVERSATION':
      return defaultState;

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { ...action.payload, id: Date.now(), timestamp: new Date().toISOString() }]
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    // Report CRUD
    case 'CREATE_REPORT':
      return { ...state, reports: [action.payload, ...state.reports] };
    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r)
      };
    case 'DELETE_REPORT':
      return { ...state, reports: state.reports.filter(r => r.id !== action.payload) };

    // Appointment CRUD
    case 'CREATE_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a)
      };
    case 'DELETE_APPOINTMENT':
      return { ...state, appointments: state.appointments.filter(a => a.id !== action.payload) };

    // Vitals CRUD
    case 'ADD_VITAL':
      return { ...state, vitals: [action.payload, ...state.vitals] };
    case 'UPDATE_VITAL':
      return {
        ...state,
        vitals: state.vitals.map(v => v.id === action.payload.id ? { ...v, ...action.payload } : v)
      };
    case 'DELETE_VITAL':
      return { ...state, vitals: state.vitals.filter(v => v.id !== action.payload) };

    // Pregnancy CRUD
    case 'CREATE_PREGNANCY_RECORD':
      return { ...state, pregnancy: action.payload };
    case 'UPDATE_PREGNANCY_RECORD':
      return { ...state, pregnancy: { ...state.pregnancy, ...action.payload } };
    case 'DELETE_PREGNANCY_RECORD':
      return { ...state, pregnancy: null };

    default:
      return state;
  }
}

export const HospitalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(hospitalReducer, null, getInitialState);

  useEffect(() => {
    localStorage.setItem('hospitalState', JSON.stringify(state));
  }, [state]);

  return (
    <HospitalContext.Provider value={{ state, dispatch }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};

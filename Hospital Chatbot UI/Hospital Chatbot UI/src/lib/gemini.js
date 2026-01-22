import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
You are a hospital assistant AI. Your job is to classify user messages into specific intents and extract entities.

SUPPORTED INTENTS:

1. REPORTS (CRUD):
- SHOW_REPORTS: List all medical reports.
- SHOW_REPORT_BY_ID: View details of a specific report. Entity: reportId (e.g., REP001).
- CREATE_REPORT: Start a form to create a new report. Entities: type, description.
- UPDATE_REPORT: Edit an existing report. Entity: reportId.
- DELETE_REPORT: Delete a report. Entity: reportId.

2. APPOINTMENTS (CRUD):
- SHOW_APPOINTMENTS: List all appointments.
- CREATE_APPOINTMENT: Book a new appointment. Entities: doctor_name, date, reason.
- UPDATE_APPOINTMENT: Change an appointment. Entity: appointmentId.
- DELETE_APPOINTMENT: Cancel an appointment. Entity: appointmentId.

3. PREGNANCY (CRUD):
- SHOW_PREGNANCY_DETAILS: View pregnancy progress and timeline.
- CREATE_PREGNANCY_RECORD: Start a new pregnancy record.
- UPDATE_PREGNANCY_RECORD: Update pregnancy details.
- DELETE_PREGNANCY_RECORD: Remove pregnancy record.

4. VITALS (CRUD):
- SHOW_VITALS: List all health vitals.
- ADD_VITAL: Add a new vital record. Entities: type, value (e.g. 120/80, 98.6).
- UPDATE_VITAL: Edit a vital. Entity: id.
- DELETE_VITAL: Remove a vital. Entity: id.

5. GENERAL:
- HELP: Show available commands.
- GREETING: Simple hello or greeting.

OUTPUT FORMAT (JSON ONLY):
{
  "intent": "INTENT_NAME",
  "entities": {
    "reportId": "string or null",
    "appointmentId": "string or null",
    "id": "string or null",
    "type": "string or null",
    "value": "string or null",
    "date": "string or null",
    "doctor_name": "string or null",
    "description": "string or null"
  },
  "reply": "A brief natural language confirmation or question."
}

Example:
User: "Show my blood test report REP001"
Output: {"intent": "SHOW_REPORT_BY_ID", "entities": {"reportId": "REP001"}, "reply": "Sure, here are the details for report REP001."}
`;

export async function classifyIntent(message) {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        const lowerMsg = message.toLowerCase();

        // Helper regex for IDs
        const extractId = (text, prefix) => {
            const regex = new RegExp(`${prefix}\\d+`, 'i');
            const match = text.match(regex);
            return match ? match[0].toUpperCase() : null;
        };

        // Reports
        if (lowerMsg.includes('report')) {
            const reportId = extractId(lowerMsg, 'rep') || 'REP001';

            if (lowerMsg.includes('create') || lowerMsg.includes('add') || lowerMsg.includes('new')) return { intent: 'CREATE_REPORT', entities: {}, reply: "Opening new report form." };
            if (lowerMsg.includes('update') || lowerMsg.includes('edit')) return { intent: 'UPDATE_REPORT', entities: { reportId }, reply: `Editing report ${reportId}.` };
            if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) return { intent: 'DELETE_REPORT', entities: { reportId }, reply: `Confirm deletion for ${reportId}.` };
            // Check for specific ID request or just "show report details"
            if (lowerMsg.includes('show') && (extractId(lowerMsg, 'rep') || lowerMsg.includes('detail'))) return { intent: 'SHOW_REPORT_BY_ID', entities: { reportId }, reply: `Here is report ${reportId}.` };
            return { intent: 'SHOW_REPORTS', entities: {}, reply: "Here are all your medical reports." };
        }

        // Appointments
        if (lowerMsg.includes('appointment') || lowerMsg.includes('visit') || lowerMsg.includes('book')) {
            const appointmentId = extractId(lowerMsg, 'app') || 'APP001';

            if (lowerMsg.includes('create') || lowerMsg.includes('book') || lowerMsg.includes('new')) return { intent: 'CREATE_APPOINTMENT', entities: {}, reply: "Let's book a new appointment." };
            if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('reschedule')) return { intent: 'UPDATE_APPOINTMENT', entities: { appointmentId }, reply: `Rescheduling appointment ${appointmentId}.` };
            if (lowerMsg.includes('delete') || lowerMsg.includes('cancel')) return { intent: 'DELETE_APPOINTMENT', entities: { appointmentId }, reply: `Confirm cancellation for ${appointmentId}.` };
            return { intent: 'SHOW_APPOINTMENTS', entities: {}, reply: "Here are your upcoming appointments." };
        }

        // Vitals
        if (lowerMsg.includes('vital') || lowerMsg.includes('bp') || lowerMsg.includes('pressure') || lowerMsg.includes('heart')) {
            const id = extractId(lowerMsg, 'vit') || 'VIT001';

            if (lowerMsg.includes('add') || lowerMsg.includes('log') || lowerMsg.includes('record')) {
                let type = 'Blood Pressure';
                if (lowerMsg.includes('heart')) type = 'Heart Rate';
                if (lowerMsg.includes('temp')) type = 'Temperature';
                return { intent: 'ADD_VITAL', entities: { type }, reply: `Logging new ${type} reading.` };
            }
            if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) return { intent: 'DELETE_VITAL', entities: { id }, reply: "Removing vital record." };
            return { intent: 'SHOW_VITALS', entities: {}, reply: "Here are your latest health vitals." };
        }

        // Pregnancy
        if (lowerMsg.includes('pregnancy') || lowerMsg.includes('pregnant') || lowerMsg.includes('baby')) {
            if (lowerMsg.includes('create') || lowerMsg.includes('start')) return { intent: 'CREATE_PREGNANCY_RECORD', entities: {}, reply: "Starting a new pregnancy journey tracker." };
            if (lowerMsg.includes('update')) return { intent: 'UPDATE_PREGNANCY_RECORD', entities: {}, reply: "Update your pregnancy details." };
            if (lowerMsg.includes('delete')) return { intent: 'DELETE_PREGNANCY_RECORD', entities: {}, reply: "Deleting pregnancy record." };
            return { intent: 'SHOW_PREGNANCY_DETAILS', entities: {}, reply: "Here is your pregnancy timeline." };
        }

        return { intent: 'GREETING', entities: {}, reply: "Hello! I am your hospital assistant. I can help with Reports, Appointments, Vitals, and Pregnancy tracking." };
    }

    // First, try to use a regex fallback for specific IDs BEFORE calling API
    // This makes the app faster for known patterns and robust if API fails
    const lowerMsg = message.toLowerCase();

    // Helper regex for IDs
    const extractId = (text, prefix) => {
        const regex = new RegExp(`${prefix}\\d+`, 'i');
        const match = text.match(regex);
        return match ? match[0].toUpperCase() : null;
    };

    // --- ROBUST LOCAL REGEX CLASSIFICATION (Primary Layer) ---
    // This allows instant UI response for standard commands without API latency.

    // 1. Reports
    if (lowerMsg.includes('report')) {
        const reportId = extractId(lowerMsg, 'rep');

        if (lowerMsg.includes('create') || lowerMsg.includes('add') || lowerMsg.includes('new')) {
            return { intent: 'CREATE_REPORT', entities: {}, reply: "Opening new report form." };
        }
        if (lowerMsg.includes('update') || lowerMsg.includes('edit')) {
            return { intent: 'UPDATE_REPORT', entities: { reportId }, reply: reportId ? `Editing report ${reportId}.` : "Which report would you like to edit?" };
        }
        if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) {
            return { intent: 'DELETE_REPORT', entities: { reportId }, reply: reportId ? `Confirm deletion for ${reportId}.` : "Please specify the report ID to delete." };
        }
        if (lowerMsg.includes('show') && (extractId(lowerMsg, 'rep') || lowerMsg.includes('detail'))) {
            return { intent: 'SHOW_REPORT_BY_ID', entities: { reportId }, reply: reportId ? `Here is report ${reportId}.` : "Please provide a report ID." };
        }
        // Default to listing reports if just 'show reports' or similar
        if (lowerMsg.includes('show') || lowerMsg.includes('list') || lowerMsg.includes('my')) {
            return { intent: 'SHOW_REPORTS', entities: {}, reply: "Here are all your medical reports." };
        }
    }

    // 2. Appointments
    if (lowerMsg.includes('appointment') || lowerMsg.includes('visit') || lowerMsg.includes('book')) {
        const appointmentId = extractId(lowerMsg, 'app');

        if (lowerMsg.includes('create') || lowerMsg.includes('book') || lowerMsg.includes('new')) {
            return { intent: 'CREATE_APPOINTMENT', entities: {}, reply: "Let's book a new appointment." };
        }
        if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('reschedule')) {
            return { intent: 'UPDATE_APPOINTMENT', entities: { appointmentId }, reply: appointmentId ? `Rescheduling appointment ${appointmentId}.` : "Which appointment do you want to reschedule?" };
        }
        if (lowerMsg.includes('delete') || lowerMsg.includes('cancel')) {
            return { intent: 'DELETE_APPOINTMENT', entities: { appointmentId }, reply: appointmentId ? `Confirm cancellation for ${appointmentId}.` : "Please specify the appointment ID to cancel." };
        }
        return { intent: 'SHOW_APPOINTMENTS', entities: {}, reply: "Here are your upcoming appointments." };
    }

    // 3. Vitals
    if (lowerMsg.includes('vital') || lowerMsg.includes('bp') || lowerMsg.includes('pressure') || lowerMsg.includes('heart')) {
        const id = extractId(lowerMsg, 'vit');

        if (lowerMsg.includes('add') || lowerMsg.includes('log') || lowerMsg.includes('record')) {
            let type = 'Blood Pressure';
            if (lowerMsg.includes('heart')) type = 'Heart Rate';
            if (lowerMsg.includes('temp')) type = 'Temperature';
            return { intent: 'ADD_VITAL', entities: { type }, reply: `Logging new ${type} reading.` };
        }
        if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) {
            return { intent: 'DELETE_VITAL', entities: { id }, reply: "Removing vital record." };
        }
        return { intent: 'SHOW_VITALS', entities: {}, reply: "Here are your latest health vitals." };
    }

    // 4. Pregnancy
    if (lowerMsg.includes('pregnancy') || lowerMsg.includes('pregnant') || lowerMsg.includes('baby')) {
        if (lowerMsg.includes('create') || lowerMsg.includes('start')) return { intent: 'CREATE_PREGNANCY_RECORD', entities: {}, reply: "Starting a new pregnancy journey tracker." };
        if (lowerMsg.includes('update')) return { intent: 'UPDATE_PREGNANCY_RECORD', entities: {}, reply: "Update your pregnancy details." };
        if (lowerMsg.includes('delete')) return { intent: 'DELETE_PREGNANCY_RECORD', entities: {}, reply: "Deleting pregnancy record." };
        return { intent: 'SHOW_PREGNANCY_DETAILS', entities: {}, reply: "Here is your pregnancy timeline." };
    }

    // Greeting Fallback (Local)
    if (lowerMsg.match(/^(hi|hello|hey|greetings)/)) {
        return { intent: 'GREETING', entities: {}, reply: "Hello! I am your hospital assistant. I can help with Reports, Appointments, Vitals, and Pregnancy tracking." };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([SYSTEM_PROMPT, message]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid AI response");
    } catch (error) {
        console.error("AI Classification Error:", error);
        // Fallback for when API fails/is offline
        return { intent: 'GREETING', entities: {}, reply: "I'm currently offline, but I can help you view reports if you provide the Report ID (e.g., REP001)." };
    }
}

# Hospital Chatbot UI

A modern, responsive frontend application for a hospital chatbot built with React and Vite. This application provides an intuitive chat interface for patients to interact with AI-powered hospital services, including appointment scheduling, medical report analysis, pregnancy tracking, and vital signs monitoring.

## Features

- **Interactive Chat Interface**: Real-time messaging with a clean, user-friendly design
- **AI-Powered Responses**: Integrated with Google's Gemini AI for intelligent healthcare conversations
- **Specialized Renderers**:
  - Appointment scheduling and management
  - Pregnancy milestone tracking
  - Medical report interpretation
  - Vital signs visualization
- **Responsive Design**: Optimized for desktop and mobile devices
- **Smooth Animations**: Enhanced user experience with Framer Motion
- **Modern UI**: Built with Tailwind CSS for consistent styling

## Technologies Used

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **AI Integration**: Google Generative AI (Gemini)
- **Utilities**: clsx, tailwind-merge

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.jsx      # Main chat component
│   ├── MessageBubble.jsx      # Individual message display
│   └── renderers/             # Specialized content renderers
│       ├── AppointmentRenderer.jsx
│       ├── PregnancyRenderer.jsx
│       ├── ReportRenderer.jsx
│       └── VitalRenderer.jsx
├── context/
│   └── HospitalContext.jsx    # Global state management
├── data/
│   └── hospitalData.json      # Static hospital data
├── hooks/
│   └── useHospital.js         # Custom hooks
├── lib/
│   └── gemini.js              # AI integration utilities
├── App.css                    # Global styles
├── App.jsx                    # Main application component
├── index.css                  # Base styles
└── main.jsx                   # Application entry point
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Pradeep03464/frontend_Hospital_Chatbot.git
   cd frontend_Hospital_Chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Start chatting with the hospital chatbot!

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

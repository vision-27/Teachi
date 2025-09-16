# Teachi - AI Learning Hub

An offline AI learning hub for rural schools, easing teacher workloads and giving students reliable, curriculum-aligned resources without internet. Built with TypeScript and React.

## Features

- **Interactive Lessons**: Well-structured lesson content with carousel navigation
- **AI Integration**: Voice commands and text-based AI assistance throughout lessons
- **Global Shortcuts**: Hold '~' key for instant voice commands from any page
- **Three-Column Layout**: Lesson content, question history, and AI responses
- **Offline-First**: Designed for environments with limited internet connectivity
- **Modern Design**: Clean, accessible UI with the Teachi brand
- **TypeScript**: Full type safety and better development experience
- **Responsive Layout**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Python 3.8+ (for backend)
- ollama (qwen 2.5 7b)
- Vosk speech recognition model (for offline voice commands)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000` (Vite default port)

**Note**: This frontend requires a Python backend running on `http://localhost:8000/`. See the Backend Setup section below for instructions.

## Backend Setup

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Download Vosk Model (Required for Voice Commands)
```bash
# Automatic download
python download_vosk_model.py

# Or manual download
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip
rm vosk-model-small-en-us-0.15.zip
```

### 3. Start the Backend Server
```bash
# Option 1: Direct Python
python main.py

# Option 2: With uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important**: The Vosk model files are large (~40MB) and are excluded from git. You must download them manually using the instructions above.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Top navigation header with Teachi logo
│   ├── Landing.tsx             # Landing page with hero section
│   ├── LessonsList.tsx         # List of available lessons
│   ├── LessonContent.tsx       # Main lesson content with three-column layout
│   ├── Carousel.tsx            # Lesson content carousel with keyboard navigation
│   ├── AIButton.tsx            # Text-based AI assistance button
│   ├── VoiceButton.tsx         # Voice command button
│   ├── AIResponsePanel.tsx     # Right sidebar for AI responses
│   └── KeyHoldIndicator.tsx    # Visual feedback for global shortcuts
├── hooks/
│   ├── useKeyHold.ts           # Custom hook for key hold detection
│   └── useGlobalShortcut.ts    # Global shortcut management
├── contexts/
│   └── ShortcutContext.tsx     # React context for global shortcuts
├── services/
│   └── api.ts                  # API service layer with TypeScript interfaces
├── App.tsx                     # Main application component
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

## Features Overview

### Landing Page
- Teachi logo and branding
- Hero section with call-to-action
- Responsive design with gradient background

### Header
- Teachi logo with custom PNG image
- Navigation menu (Home, Lessons)
- Clean, modern design

### Lesson Content
- Three-column layout: question history, lesson content, AI responses
- Carousel navigation with keyboard arrow keys
- Dynamic lesson titles from API data
- Structured content with sections and steps
- Large, readable typography

### AI Integration
- **Text-based AI**: "Ask AI" buttons for contextual assistance
- **Voice Commands**: Voice button for hands-free interaction
- **Global Shortcuts**: Hold '~' key for instant voice commands
- **Response Management**: Question history and AI response panels
- **API Integration**: Full backend integration with Python server

### Navigation
- Keyboard navigation (arrow keys for carousel)
- Global shortcuts (hold '~' for voice commands)
- Responsive mobile layout

## API Integration

The frontend integrates with a Python backend server running on `http://localhost:3001/`:

### Endpoints
- `GET /api/lessons` - Fetch list of available lessons
- `GET /api/lessons/{lessonId}` - Fetch detailed lesson content
- `POST /text` - Submit AI text prompts
- `POST /voice` - Submit voice commands
- `POST /shortcut` - Handle global keyboard shortcuts

### Request/Response Schemas
See `API_SETUP.md` for detailed API documentation and backend setup instructions.

## Sample Lesson: The Water Cycle

The platform includes a complete lesson about the water cycle with:
- Introduction to the hydrologic cycle
- Four detailed stages (Evaporation, Condensation, Precipitation, Collection)
- Importance and environmental impact
- AI assistance buttons and voice commands for each section

## Customization

The application is built with modular components that can be easily customized:

- Update lesson content in `LessonContent.tsx`
- Modify AI interactions in `AIButton.tsx` and `VoiceButton.tsx`
- Customize global shortcuts in `useGlobalShortcut.ts`
- Update styling in the respective CSS files
- Add new lessons by extending the API structure

## Technologies Used

- **React 18** - UI library with hooks and context
- **TypeScript** - Type safety and interfaces
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Modern styling with flexbox, grid, and transitions
- **Custom Hooks** - Reusable stateful logic
- **Context API** - Global state management

## Development

### Key Features Implemented
- ✅ Three-column responsive layout
- ✅ Carousel navigation with keyboard support
- ✅ AI text and voice integration
- ✅ Global keyboard shortcuts ('~' key hold)
- ✅ Question history and response management
- ✅ Dynamic lesson content from API
- ✅ Teachi branding and logo integration
- ✅ Mobile-responsive design
- ✅ TypeScript type safety throughout

### Next Steps
- Backend API implementation (see `API_SETUP.md`)
- Additional lesson content
- User authentication and progress tracking
- Offline functionality enhancements

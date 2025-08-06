# Blooms Journey 🌸

A comprehensive pregnancy and parenting companion app built with Next.js, Firebase, and AI-powered features.

## Features

- 🤱 **Pregnancy Tracking**: Week-by-week pregnancy timeline and due date countdown
- 💬 **AI Pregnancy Pal**: Personalized pregnancy advice and support
- 👶 **Baby Chat**: AI-powered baby development insights
- 📝 **Journal & Logging**: Track your pregnancy journey and baby milestones
- 🥗 **Meal Planner**: Pregnancy-safe meal suggestions and nutrition tracking
- 💧 **Water Intake Tracker**: Stay hydrated throughout your pregnancy
- 🧘 **Yoga & Wellness**: Pregnancy-safe yoga routines and exercises
- 📚 **Resources**: Educational articles and videos
- 🔔 **Appointment Reminders**: Never miss important prenatal appointments
- 👥 **Community Features**: Connect with other expecting parents

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI**: Google Genkit for intelligent features
- **Deployment**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blooms-journey.git
cd blooms-journey
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config to `src/lib/firebase/clientApp.ts`

4. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your Firebase configuration and API keys.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── bloom-journey/   # Pregnancy-specific components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
└── ai/                 # AI flows and configurations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.

---

Made with ❤️ for expecting parents everywhere

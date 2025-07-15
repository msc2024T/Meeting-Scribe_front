# Meeting Scribe - Frontend

A modern web application for transcribing and summarizing meeting audio files. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Live Demo

**[https://meeting-scribe-front.vercel.app/](https://meeting-scribe-front.vercel.app/)**

## ✨ Features

- 🎵 **Audio File Upload**: Upload and manage meeting audio files
- 📝 **AI Transcription**: Automatic speech-to-text transcription
- 📊 **Smart Summarization**: Generate key points and action items
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🔐 **User Authentication**: Secure login and registration
- 📱 **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT-based auth with Redux state management
- **HTTP Client**: Axios with custom interceptors
- **Deployment**: Vercel

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone https://github.com/msc2024T/Meeting-Scribe_front.git
cd Meeting-Scribe_front
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```bash
# Create .env.local file
NEXT_PUBLIC_API_BASE_URL=your_api_base_url_here
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── register/         # Registration pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── AudioFileList.tsx # Audio file management
│   ├── Drawer.tsx        # Slide-out drawer UI
│   └── DrawerManager.tsx # Drawer state management
├── store/               # Redux store configuration
├── utils/               # Utility functions
│   ├── apiService.ts    # API service layer
│   ├── httpService.ts   # HTTP client with interceptors
│   └── types.ts         # TypeScript type definitions
└── public/             # Static assets
```

## 🔧 Key Features

### Audio File Management

- Upload audio files with drag-and-drop support
- View file details and metadata
- Delete and organize files

### Transcription & Summarization

- Real-time transcription processing
- AI-powered summary generation
- Key points extraction
- Action items identification

### User Experience

- Smooth animations and transitions
- Loading states and progress indicators
- Error handling and user feedback
- Responsive design for all screen sizes

## 🚀 Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import the project and configure environment variables
4. Deploy with one click

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

**Developer**: Mohamad  
**Email**: mohamad.sc66@gmail.com  
**GitHub**: [https://github.com/msc2024T](https://github.com/msc2024T)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Next.js and modern web technologies.

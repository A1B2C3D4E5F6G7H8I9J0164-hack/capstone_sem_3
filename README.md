📚 LearnSphere – AI Study Companion

# LearnSphere

An AI-powered platform that helps students summarize notes, generate quizzes, and track learning progress — making revision way easier and way smarter.

## 🚨 1. Problem Statement

Students often struggle with revising large amounts of content. LearnSphere solves this by providing:

- AI-generated note summaries
- Auto-created quizzes
- Personalized learning analytics

Everything in one platform.

## 🏗️ 2. System Architecture

### Tech Flow

```
React.js (Frontend)
  ↓
Node.js + Express.js (Backend)
  ↓
MongoDB Atlas (Database)
```

### Services Used

- JWT → Authentication
- OpenAI API → AI summaries + quiz generation
- Hosting → Vercel (Frontend) & Render (Backend)

## ⭐ 3. Key Features

### Authentication

- Secure JWT login & registration

### AI Tools

- On-demand note summarization
- Quiz generation from any note

### CRUD Operations

- Create, Read, Update, Delete notes

### Tracking

- Visual charts for learning progress
- Quiz performance analytics

### Routing

- Dashboard
- Notes
- Analytics
- Profile & more

## 🛠️ 4. Tech Stack

| Layer      | Technologies                               |
|------------|--------------------------------------------|
| Frontend   | React.js, React Router, Axios, Tailwind CSS |
| Backend    | Node.js, Express.js                        |
| Database   | MongoDB Atlas                              |
| Services   | JWT, OpenAI API, Chart.js                  |

## 🔗 5. API Overview

| Endpoint            | Method        | Description                | Access       |
|---------------------|---------------|----------------------------|--------------|
| /api/auth/...       | POST          | Signup / Login user        | Public       |
| /api/notes          | GET / POST    | Manage user notes          | Authenticated |
| /api/ai/summarize   | POST          | Generate note summary      | Authenticated |
| /api/ai/quiz       | POST          | Generate quiz from text    | Authenticated |
| /api/progress      | GET           | Fetch user progress        | Authenticated |

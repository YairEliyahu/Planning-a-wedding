# 💍 Planning a Wedding - All-in-One Management System

![Wedding Planning App](https://img.shields.io/badge/Wedding-Planning-pink?style=for-the-badge&logo=heart)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-green?style=for-the-badge&logo=mongodb)

## 📌 Project Overview

**Planning a Wedding** is a modern, comprehensive system designed to simplify the wedding planning process for couples. From managing guests and seating charts to budgeting and checklists — everything is in one place.

> 💡 **Built for weddings of all sizes — from 50 guests to hundreds.**

## 🎯 Goals

The system was created to reduce stress and streamline the entire wedding planning experience:

- ✅ Centralized planning and collaboration for couples  
- 📊 Visual tools to track progress  
- 🤝 Real-time synchronization between partners  
- 💡 Smart automations to save time  
- 🧘‍♀️ Peace of mind with structured planning

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** – App Router enabled
- **TypeScript** – Static typing
- **Tailwind CSS** – Responsive UI styling
- **Framer Motion** – Smooth animations
- **TanStack Query (React Query)** – Server state management

### Backend
- **Next.js API Routes** – Built-in server layer
- **MongoDB + Mongoose** – Flexible NoSQL database
- **Socket.io** – Real-time updates
- **NextAuth.js + JWT** – Secure authentication

### Dev & Tooling
- **Vercel** – Hosting & CI/CD
- **Jest + Testing Library** – Unit testing
- **Cypress** – E2E tests
- **ESLint + Prettier** – Code quality
- **Sharp** – Image optimization

## 🚀 Local Installation

### Requirements
```bash
Node.js >= 18.0.0  
npm >= 8.0.0  
MongoDB Atlas account or local MongoDB
✨ Core Features
👥 Guest Management
Excel import with format detection

Guest categorization (family, friends, work, etc.)

Real-time RSVP statistics

Advanced search and filtering

RSVP response tracking

🪑 Seating Arrangement
Drag & drop visual editor

Smart automatic seat assignment

Grouping family & friends together

Optimized space usage

✅ Wedding Checklist
Time-based task planning (12, 6, 3 months prior)

Visual task progress tracking

Smart reminders

Notes for each task

🎉 Wedding Details Management
Schedules and timelines

Locations (venue, ceremony, photography)

Budget management per category

Inspiration gallery

🔐 Authentication & Access Roles
User Types
👰🤵 Couple – Full access

👥 Collaborators – Shared access (e.g., planners, parents)

🔧 Admin – Technical and user management

Auth Methods
Email & password

Google OAuth

Email verification during signup

JWT-based session security

📁 Project Structure
bash
Copy
Edit
Planning-a-wedding/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── admin/         # Admin interface
│   │   ├── api/           # API routes
│   │   ├── auth/          # Auth pages
│   │   ├── user/[id]/     # User dashboards
│   │   │   ├── guestlist/
│   │   │   ├── seating/
│   │   │   ├── checklist/
│   │   │   └── wedding/
│   │   └── page.tsx       # Home page
│   ├── components/        # Shared UI components
│   ├── contexts/          # React context
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Config & utilities
│   ├── models/            # Mongoose models
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static files
├── tests/                 # Unit tests
├── cypress/               # E2E tests
└── scripts/               # Automation scripts
🧪 Testing
bash
Copy
Edit
npm run test             # Run unit tests
npm run test:coverage    # Coverage report
npm run cypress:open     # E2E testing
npm run lint             # Lint the code

Quality Standards
✅ 80%+ code coverage

✅ Full TypeScript typing

✅ E2E coverage for critical flows

✅ ESLint + Prettier enforcement

🛠️ Scripts
bash
Copy
Edit
npm run dev         # Run frontend
npm run dev:all     # Run with sockets/backend
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Lint code
npm run format      # Format code

🚀 Deployment
Vercel

🤝 Contributing
We welcome contributions from the community!

How to Contribute
🍴 Fork the repo

🌿 Create a new branch

💝 Commit your changes

📤 Push the branch

🔄 Open a Pull Request

Contribution Guidelines
Add documentation for new features

Include tests where relevant

Follow existing design & code conventions

Ensure accessibility compliance
###
👤 Authors
<table> <tr> <td align="center"> <a href="#"> <img src="https://via.placeholder.com/100x100/FF69B4/FFFFFF?text=YE" width="100px" alt="Yair Eliyahu"/> <br /><sub><b>Yair Eliyahu</b></sub> </a> <br /> 💻 🏗️ 🎨 </td> <td align="center"> <a href="#"> <img src="https://via.placeholder.com/100x100/4169E1/FFFFFF?text=LM" width="100px" alt="Liav Maman"/> <br /><sub><b>Liav Maman</b></sub> </a> <br /> 💻 ⚡ 🗄️ </td> </tr> </table>
<div align="center"> <strong>💕 Built with love to simplify wedding planning 💕</strong><br /> <br /> <img src="https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge" /> <img src="https://img.shields.io/badge/For-Weddings-pink?style=for-the-badge" /> <img src="https://img.shields.io/badge/Open-Source-green?style=for-the-badge" /> </div> ```

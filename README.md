# Ask & Say – Team Chat + AI Assistance + Code Editor

**Ask & Say** is a real-time collaborative chatting and coding platform built on the MERN stack with WebContainers and integrated AI assistance. Developers can share projects, chat, edit code in the browser (with VS Code–style theming), run and preview their applications instantly, and leverage AI for code generation and guidance—all in one unified interface. They can share notes at one place.

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Live Demo](#live-demo)  
4. [Prerequisites](#prerequisites)   
5. [Usage](#usage) 

---

## Features

- 🔒 **Authentication & Authorization** via JWT + Redis token blacklist  
- 💬 **Real-time Chat** with project-scoped rooms using **Socket.IO**  
- 🖥️ **In-Browser Code Editor** powered by **WebContainers** & **CodeMirror**  
- 🎨 **VS Code–style Theming** (Dracula, VS Dark)  
- 🤖 **AI-Assisted Coding** via Google Gemini / OpenAI integration  
- 📁 **File Tree Management**: create, update, delete files  
- 🔄 **Live Server Preview** inside `<iframe>`  
- 🗒️ **Project Notes** CRUD interface  
- 🚀 **Full CI/CD** ready for Vercel / Render  

---

## Tech Stack

- **Frontend:** React 18, React Router, Tailwind CSS, CodeMirror, WebContainer API  
- **Backend:** Node.js, Express, Socket.IO, MongoDB (Mongoose), Redis (ioredis)  
- **AI Service:** Google Generative AI (Gemini)  
- **Deployment:** Vercel (frontend), Render (backend)  
- **CI/CD & DevOps:** GitHub Actions, Docker (optional)  

---

## Live Demo (1st Login/Register request may take some time to respond because backend can be in Sleep Mode)

> **Frontend:** https://ask-and-say.vercel.app  
>
> **Backend:** https://askandsay-team-chat-with-ai.onrender.com  

---


## Prerequisites

- **Node.js** ≥ 16.x  
- **npm / Yarn**  
- **MongoDB** URI  
- **Redis** URL (for session/token blacklist)  
- **Google AI Key** (or OpenAI key)  
- **Frontend URL** (for CORS configuration)  

---

## Usage

- Register & Login

- Create or Join a project

- Use the Explorer to manage files

- Edit code in the Code Editor pane

- Click START/RUN to launch the server in-browser

- View live preview in the Preview tab

- Chat with collaborators via the Chat panel

- Mention @ai to invoke AI code assistance

- Use Collaborative Notes Feature

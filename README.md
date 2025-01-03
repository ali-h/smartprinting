# RFID-Based Smart Printing System

This repository contains the source code for the **RFID-Based Smart Printing System**, a project designed to streamline the printing process using RFID technology. The system is divided into two main components:

1. **Client**: A web-based user interface built with Svelte.
2. **Server**: A backend system powered by Node.js and Express.

---

## 📂 Project Structure

```plaintext
.
├── client/    # Frontend built with Svelte
├── server/    # Backend built with Node.js (Express)
```

---

## 🖥️ Client

The **client** folder contains the Svelte-based frontend application.

### Features
- RFID scanning interface.
- Display of printing jobs and status.
- User-friendly design with real-time updates.

### Prerequisites
- Node.js installed on your system.

### Commands

1. **Install dependencies**  
   Run the following command in the `client` folder:
   ```bash
   npm install
   ```

2. **Run in development mode**  
   To start the Svelte app in development mode (with hot-reloading):
   ```bash
   npm run dev
   ```
   By default, the app will be accessible at `http://localhost:5173/`.

3. **Build for production**  
   To create a production build of the application:
   ```bash
   npm run build
   ```
   The output will be stored in the `build/` folder.

4. **Preview production build**  
   To preview the built app locally run this in the  `build/` folder:
   ```bash
   http-server -p 80
   ```

---

## 🛠️ Server

The **server** folder contains the backend system built with Node.js and Express.

### Features
- Handles RFID scan data.
- Communicates with the database to store and retrieve printing jobs.
- Manages communication with printers.

### Prerequisites
- Node.js installed on your system.

### Commands

1. **Install dependencies**  
   Run the following command in the `server` folder:
   ```bash
   npm install
   ```

2. **Start the server**  
   To start the Express server:
   ```bash
   npm run start
   ```
   By default, the server will run at `http://localhost:3000/`.

---

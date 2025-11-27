# AgentOps Controller (Backend)

This is the backend API for **AgentOps**, an internal dashboard designed for AI operations teams to create, manage, and orchestrate AI Agents into sequential workflows.

Built as part of a Technical Test, this system integrates with **Google Gemini API** to execute real-time AI tasks.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema (ERD)](#database-schema-erd)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)

## ✨ Features
- **Authentication**: Secure JWT-based authentication (Login/Register) with Refresh Tokens.
- **Agent Management**: CRUD operations for AI Personas (System Instructions, Model, Temperature).
- **Workflow Orchestration**: Create workflows and chain multiple agents sequentially where output of Agent A becomes input of Agent B.
- **Execution Engine**: 
  - Real-time integration with **Google Gemini 1.5 Flash**.
  - Sequential processing logic.
- **Logging**: Comprehensive logging of every execution step (Input/Output history) for audit and debugging.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: AJV & Zod
- **AI Provider**: Google Generative AI SDK

## 🗂 Database Schema (ERD)

The database is designed to handle relationships between Users, Workflows, Steps, Agents, and Execution Logs efficiently.

![Entity Relationship Diagram](./erd.png)



## ✅ Prerequisites
- Node.js (v18 or later)
- PostgreSQL (Running locally or via Cloud)
- Google AI Studio API Key

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentops_controller

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file from the example:**

    ```bash
    cp .env.example .env
    ```

4.  **Fill in the environment variables in your `.env` file**:

    ```
    PORT=...
    HOST=...
    
    # Database Connection (PostgreSQL)
    # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
    
    DATABASE_URL="postgresql://postgres:password@localhost:5432/agentops_db?schema=public"

    # JWT Secrets (Generate strong random strings for production)
    JWT_ACCESS_TOKEN_SECRET="super_secret_access_key"
    JWT_REFRESH_TOKEN_SECRET="super_secret_refresh_key"
    JWT_EXPIRED_KEY="1h"

    # AI Configuration
    GEMINI_API_KEY="your_google_gemini_api_key_here"

    # Logs
    DB_ENABLE=true
    DB_LOGGING=false

    ```

5.  **Run the database migrations:**

    ```bash
    npx prisma migrate deploy
    ```

---

## Usage

* **To run the server in development mode:**

    ```bash
    npm run dev
    ```

* **To run the server in production mode:**

    ```bash
    npm start
    ```

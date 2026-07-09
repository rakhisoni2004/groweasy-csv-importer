# GrowEasy AI CSV Importer

An AI-powered CSV Importer that intelligently extracts CRM lead information from **any valid CSV format** and converts it into the GrowEasy CRM schema.

Built as part of the **GrowEasy Software Developer Assignment**.

---

#  Live Demo

https://groweasy-csv-importer-lake.vercel.app

---

#  GitHub Repository

https://github.com/rakhisoni2004/groweasy-csv-importer

---

# Features

✔ Upload any CSV file

✔ Drag & Drop upload

✔ CSV Preview before AI processing

✔ Responsive tables

✔ Sticky table headers

✔ Horizontal & Vertical scrolling

✔ AI-powered CRM field mapping

✔ Batch Processing

✔ Retry mechanism for failed AI requests

✔ Skip invalid records

✔ Download CRM CSV

✔ Fully responsive UI

✔ Deployed on Vercel

---

# Workflow

### Step 1 — Upload CSV

Users can

- Drag & Drop a CSV
- Browse and select a CSV

No AI processing happens here.

---

### Step 2 — Preview

CSV is parsed in the browser using PapaParse.

Users can verify uploaded rows before importing.

Supports

- Horizontal scrolling
- Vertical scrolling
- Responsive layout
- Sticky table header

---

### Step 3 — Confirm Import

Only after clicking **Import** does the frontend call the backend.

```
POST /api/extract
```

---

### Step 4 — AI Extraction

The backend

- Splits CSV rows into batches
- Sends each batch to **Groq**
- Uses **Llama 3.3 70B Versatile**
- Maps every row into GrowEasy CRM format
- Retries failed batches automatically

---

### Step 5 — Results

Displays

- Imported Records
- Skipped Records
- Total Imported
- Total Skipped

Users can download the final CRM CSV.

---

# AI Prompt Engineering

The system prompt enforces:

- Allowed CRM Status values
- Allowed Data Source values
- Strict JSON output
- No hallucinated data
- Preserve input row order
- Never drop rows
- Skip invalid records only after backend validation
- Merge extra phones/emails into crm_note

---

# CRM Fields

The AI extracts the following fields:

- created_at
- name
- email
- country_code
- mobile_without_country_code
- company
- city
- state
- country
- lead_owner
- crm_status
- crm_note
- data_source
- possession_time
- description

---

# Skip Rules

A record is skipped if it contains

- No Email
- AND
- No Mobile Number

Skipped rows are returned with a reason.

---

# Tech Stack

Frontend

- Next.js 16
- TypeScript
- Tailwind CSS
- PapaParse
- Lucide React

Backend

- Next.js API Routes

AI

- Groq API
- Llama 3.3 70B Versatile
- OpenAI Compatible SDK

Deployment

- Vercel

---

# Project Structure

```
src/

 app/
    page.tsx
    globals.css

    api/
        extract/
            route.ts

 components/
    UploadStep.tsx
    PreviewTable.tsx
    ProcessingView.tsx
    ResultsTable.tsx
    Stepper.tsx

 lib/
    constants.ts
    extract.ts
    types.ts
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/rakhisoni2004/groweasy-csv-importer.git
```

Go into the project

```bash
cd groweasy-csv-importer
```

Install dependencies

```bash
npm install
```

Create

```
.env.local
```

Add

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

Run

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# Deployment

The application is deployed on **Vercel**.

Environment Variable

```
GROQ_API_KEY
```

No additional configuration is required.

---

# Assignment Requirements Covered

| Requirement | Status |
|-------------|--------|
| Upload CSV | ✅ |
| Drag & Drop | ✅ |
| File Picker | ✅ |
| Preview Before Import | ✅ |
| Responsive Table | ✅ |
| Sticky Header | ✅ |
| Horizontal Scroll | ✅ |
| Vertical Scroll | ✅ |
| Backend API | ✅ |
| Batch Processing | ✅ |
| AI Mapping | ✅ |
| Retry Mechanism | ✅ |
| Skip Invalid Records | ✅ |
| JSON Response | ✅ |
| Download CRM CSV | ✅ |
| Deployed on Vercel | ✅ |

---

# Design Decisions

The application follows a simple three-step workflow:

Upload → Preview → Import

The UI focuses on clarity and responsiveness while keeping AI processing separate from CSV parsing.

Dark theme was chosen to match modern dashboard applications.

---

# Future Improvements

- Streaming progress updates
- Virtualized table for very large CSV files
- Database integration
- User authentication
- Import history
- Background job processing

---

# Author

**Rakhi Soni**

Software Developer Candidate

GitHub

https://github.com/rakhisoni2004

---

# Gemini Proxy (local)

This small Express server acts as a safe proxy that holds your Gemini API key and calls the Google Generative AI SDK (`@google/genai`).

Why use it
- Keeps the API key on the server (not in the browser/extension).
- Uses the official SDK to avoid REST schema mismatches.
- Simple to run locally for development.

Setup
1. Open a terminal in `server/`.
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`.

PowerShell example:

```powershell
cd "C:\Users\safiy\Documents\2 Annee Briefs\Gemini\server"
copy .env.example .env
# edit .env file and paste GEMINI_API_KEY=...
npm install
$env:GEMINI_API_KEY = "your_key_here"
npm start
```

Usage
- The server exposes POST /generate
  - body: { prompt: string, model?: string }
  - response: { letter: string, modelUsed: string }

- Configure the extension: open the config page and set Proxy to `http://localhost:3000` and save.
- Then use the extension's "Tester le modèle" or generate from the popup. The extension will forward generation requests to the proxy which calls Gemini via the SDK.

Notes
- For production, deploy the proxy to a secure environment (Cloud Run, App Engine, or a VM). Keep the key in environment variables and secure access (authentication, CORS restrictions).
- The SDK and API may change; prefer to keep packages up-to-date and check Google docs for model IDs and usage.

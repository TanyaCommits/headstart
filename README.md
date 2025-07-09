# Headstart

**Headstart** is a real-time AI meeting assistant that listens to technical discussions, summarizes key ideas, and generates starter code based on what was discussed. It is designed for engineering teams who want to turn spoken brainstorming into actionable code without manual note-taking.

## How It Works

1. The user speaks during a meeting (live mic input or audio upload).
2. Audio is streamed to Deepgram's API using WebSocket for real-time transcription.
3. Transcripts are summarized and analyzed using Gemini to extract technical intent.
4. Relevant starter code is generated and shown in a CodeMirror editor.
5. The user can copy, edit, or export the code directly from the UI.

## Features

- Real-time audio transcription using Deepgram
- Intelligent summarization and code generation using Gemini
- Live transcript viewer and code editor with CodeMirror
- WebSocket-powered backend for real-time communication
- Clean, responsive UI built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React, Tailwind CSS, CodeMirror
- **Backend**: Node.js with WebSocket server
- **Speech-to-Text**: Deepgram API (200 free minutes/month)
- **LLM Integration**: Gemini Pro (via REST API)


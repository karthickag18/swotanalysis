# SWOT Analysis Full-Stack Website

A simple full-stack SWOT analysis website using an Express backend to save and load SWOT data.

## Setup

1. Install Node.js if you don't have it already.
2. Open a terminal in this folder.
3. Run:

```bash
npm install
npm start
```

4. Open `http://localhost:3000` in your browser.

## Features

- Save SWOT entries to the server
- Load saved data when the page opens
- Uses SQLite storage in `swot-data.db`

## Notes

- The website is now full-stack with a backend API at `/api/swot`.
- Data is stored in SQL using SQLite rather than a JSON file.

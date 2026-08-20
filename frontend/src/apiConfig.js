// Production backend (Render). Matches the URL already used in TablesPage.jsx.
// NOTE: window.location.hostname + ":8000" only worked for local dev where the
// frontend and backend ran on the same machine — it breaks once they're deployed
// as separate services on Render.
export const API_BASE = "https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant";
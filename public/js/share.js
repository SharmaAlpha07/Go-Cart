// shared.js
document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const username = welcomeMessage?.dataset.username || "Guest";
    welcomeMessage.textContent = `Welcome! ${username}`;
  });
  
// Calculate remaining session time (replace this with your actual logic)
function calculateRemainingSessionTime() {
const expirationTime = new Date(Date.now() + 30 * 60 * 1000);
    const currentTime = new Date();
    const remainingTimeInSeconds = Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
    return remainingTimeInSeconds;
}

// Update session time display
function updateSessionTimeDisplay() {
    const sessionTimeElement = document.getElementById("session-time");
    const remainingTimeInSeconds = calculateRemainingSessionTime();
    const minutes = Math.floor(remainingTimeInSeconds / 60);
    const seconds = remainingTimeInSeconds % 60;
    sessionTimeElement.textContent = `Session time: ${minutes}m ${seconds}s`;
}

// Call the updateSessionTimeDisplay function initially
updateSessionTimeDisplay();

// Update session time display every second (1000 ms)
setInterval(updateSessionTimeDisplay, 100);

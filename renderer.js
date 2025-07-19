// renderer.js
// This script now only listens for messages from the C++ engine and updates the UI.

document.addEventListener('DOMContentLoaded', () => {
    // Window control listeners remain the same
    const closeBtn = document.getElementById('close-btn');
    closeBtn.addEventListener('click', () => window.api.send('window-close'));

    const minimizeBtn = document.getElementById('minimize-btn');
    minimizeBtn.addEventListener('click', () => window.api.send('window-minimize'));

    const maximizeBtn = document.getElementById('maximize-btn');
    maximizeBtn.addEventListener('click', () => window.api.send('window-maximize'));
});

// This is the main listener for all messages from the C++ engine
window.api.on('engine-message', (data) => {
    console.log('Received data from engine:', data);

    // Use a switch statement to handle different message types
    switch (data.type) {
        case 'status':
            const statusEl = document.getElementById('status');
            if (statusEl) statusEl.textContent = data.payload;
            break;

        case 'ocr-result':
            const ocrTextEl = document.getElementById('ocr-text');
            if (ocrTextEl) ocrTextEl.textContent = data.payload || 'No text detected.';
            break;
        
        case 'api-result':
            const resultEl = document.getElementById('result');
            if (resultEl) resultEl.textContent = (data.payload && data.payload.answer) ? `Answer: ${data.payload.answer}` : 'No answer found.';
            break;

        case 'calibration-update':
            const pointEl = document.getElementById(`cal-point-${data.payload.key}`);
            if (pointEl) {
                pointEl.textContent = `X:${data.payload.pos.x}, Y:${data.payload.pos.y}`;
                pointEl.classList.replace('text-gray-400', 'text-gray-800');
            }
            break;
        
        case 'clear-calibration':
             ['A', 'B', 'C', 'D'].forEach(key => {
                const pointEl = document.getElementById(`cal-point-${key}`);
                if (pointEl) {
                    pointEl.textContent = 'Not Set';
                    pointEl.classList.replace('text-gray-800', 'text-gray-400');
                }
            });
            break;

        // Add more cases here for other messages from your C++ engine
    }
});

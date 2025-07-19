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
    
    // Copy button listener needs to be here as well
    const copyButton = document.getElementById('copy-mac-button');
    copyButton.addEventListener('click', () => {
        const macAddress = document.getElementById('mac-address-display').textContent;
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = macAddress;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            copyButton.textContent = 'Copied!';
            setTimeout(() => { copyButton.textContent = 'Copy MAC'; }, 2000);
        } catch (err) {
            console.error('Failed to copy MAC address: ', err);
            copyButton.textContent = 'Error!';
        }
        document.body.removeChild(tempTextArea);
    });
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

        case 'error':
            const errorPayload = data.payload;
            const errorEl = document.getElementById('status');
            if (errorEl) errorEl.textContent = `Error: ${errorPayload}`;

            // Check if this is the specific activation error.
            if (errorPayload && errorPayload.includes('Software not activated for MAC:')) {
                // Extract the MAC address from the error message
                const macAddress = errorPayload.split(': ').pop();

                // Show the activation overlay
                const overlay = document.getElementById('activation-overlay');
                if (overlay) overlay.classList.remove('hidden');

                const mainContent = document.getElementById('main-content');
                if (mainContent) mainContent.classList.add('blur-sm', 'pointer-events-none');

                const macDisplay = document.getElementById('mac-address-display');
                if (macDisplay) macDisplay.textContent = macAddress;
            }
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
            // This now handles both option points and region points
            const pointEl = document.getElementById(`cal-point-${data.payload.key}`);
            if (pointEl) {
                pointEl.textContent = `X:${data.payload.pos.x}, Y:${data.payload.pos.y}`;
                pointEl.classList.replace('text-gray-400', 'text-gray-800');
            }
            break;
        
        case 'clear-calibration':
             ['A', 'B', 'C', 'D', 'p1', 'p2'].forEach(key => {
                const pointEl = document.getElementById(`cal-point-${key}`);
                if (pointEl) {
                    pointEl.textContent = 'Not Set';
                    pointEl.classList.replace('text-gray-800', 'text-gray-400');
                }
            });
            break;
    }
});

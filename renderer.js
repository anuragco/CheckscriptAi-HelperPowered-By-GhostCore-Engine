document.addEventListener('DOMContentLoaded', () => {
   
    const stealthButton = document.getElementById('stealth-button');
    if (stealthButton) {
        stealthButton.addEventListener('click', () => window.api.send('enter-stealth-mode'));
    }
   

    
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => window.api.send('window-close'));

    const minimizeBtn = document.getElementById('minimize-btn');
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => window.api.send('window-minimize'));

    const maximizeBtn = document.getElementById('maximize-btn');
    if (maximizeBtn) maximizeBtn.addEventListener('click', () => window.api.send('window-maximize'));
    
  
    const copyButton = document.getElementById('copy-mac-button');
    if (copyButton) {
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
    }
});

window.api.on('engine-message', (data) => {
    console.log('Received data from engine:', data);

    switch (data.type) {
        case 'status':
            const statusEl = document.getElementById('status');
            if (statusEl) statusEl.textContent = data.payload;
            break;

        case 'error':
            const errorPayload = data.payload;
            const errorEl = document.getElementById('status');
            if (errorEl) errorEl.textContent = `Error: ${errorPayload}`;

            if (errorPayload && errorPayload.includes('Software not activated for MAC:')) {
                const macAddress = errorPayload.split(': ').pop();
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

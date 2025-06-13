document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.config === 'undefined') {
        console.error('Configuration object (window.config) not found. Make sure config.js is loaded before admin.js.');
        alert('Error: config.js not found. Cannot build admin page.');
        return;
    }

    const formContainer = document.getElementById('config-form');
    const generateBtn = document.getElementById('generate-config-btn');
    const outputContainer = document.getElementById('output-container');
    const configOutput = document.getElementById('config-output');
    const copyBtn = document.getElementById('copy-config-btn');

    console.log('Admin script loaded. Config object:', window.config);

    // Phase 2: Form generation logic will go here.

    // Phase 3: Event listener for the generate button will go here.
});
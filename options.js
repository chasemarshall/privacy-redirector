// Options page script for Privacy Redirector (Firefox compatible)

// Default URLs
const DEFAULT_PIPED_URL = 'https://piped.withmilo.xyz';
const DEFAULT_REDDIT_URL = 'https://reddit.withmilo.xyz';
const DEFAULT_BLOCK_ALL = false;

// Load saved settings (Firefox compatible)
function loadSettings() {
    browser.storage.sync.get({
        pipedUrl: DEFAULT_PIPED_URL,
        redditUrl: DEFAULT_REDDIT_URL,
        blockAllYoutube: DEFAULT_BLOCK_ALL
    }).then(function(items) {
        document.getElementById('pipedUrl').value = items.pipedUrl;
        document.getElementById('redditUrl').value = items.redditUrl;
        document.getElementById('blockAllYoutube').checked = items.blockAllYoutube;
    }).catch(function(error) {
        console.log('Error loading settings:', error);
        // Use defaults if loading fails
        document.getElementById('pipedUrl').value = DEFAULT_PIPED_URL;
        document.getElementById('redditUrl').value = DEFAULT_REDDIT_URL;
        document.getElementById('blockAllYoutube').checked = DEFAULT_BLOCK_ALL;
    });
}

// Save settings (Firefox compatible)
function saveSettings() {
    const pipedUrl = document.getElementById('pipedUrl').value.trim();
    const redditUrl = document.getElementById('redditUrl').value.trim();
    const blockAllYoutube = document.getElementById('blockAllYoutube').checked;
    
    // Validate URLs
    if (!isValidUrl(pipedUrl) || !isValidUrl(redditUrl)) {
        showStatus('Please enter valid URLs (including https://)', false);
        return;
    }
    
    browser.storage.sync.set({
        pipedUrl: pipedUrl,
        redditUrl: redditUrl,
        blockAllYoutube: blockAllYoutube
    }).then(function() {
        showStatus('Settings saved successfully!', true);
    }).catch(function(error) {
        showStatus('Error saving settings: ' + error.message, false);
    });
}

// Reset to defaults (Firefox compatible)
function resetSettings() {
    document.getElementById('pipedUrl').value = DEFAULT_PIPED_URL;
    document.getElementById('redditUrl').value = DEFAULT_REDDIT_URL;
    document.getElementById('blockAllYoutube').checked = DEFAULT_BLOCK_ALL;
    
    browser.storage.sync.set({
        pipedUrl: DEFAULT_PIPED_URL,
        redditUrl: DEFAULT_REDDIT_URL,
        blockAllYoutube: DEFAULT_BLOCK_ALL
    }).then(function() {
        showStatus('Settings reset to defaults!', true);
    }).catch(function(error) {
        showStatus('Error resetting settings: ' + error.message, false);
    });
}

// Validate URL format
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Show status message
function showStatus(message, isSuccess) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + (isSuccess ? 'success' : 'error');
    status.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveSettings();
});

document.getElementById('resetBtn').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to reset to default settings?')) {
        resetSettings();
    }
});

// Auto-save on input change (with debounce)
let saveTimeout;
document.querySelectorAll('input[type="url"], input[type="checkbox"]').forEach(input => {
    input.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveSettings, 1000); // Save 1 second after user stops typing
    });
    input.addEventListener('change', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveSettings, 100); // Save immediately for checkboxes
    });
});

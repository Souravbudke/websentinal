// Content script for WebSentinal extension
// This script runs in the context of web pages and can manipulate the DOM

// Create and inject the warning popup
function createWarningPopup(data) {
  // Check if popup already exists
  if (document.getElementById('websentinal-warning')) {
    return;
  }
  
  // Don't show warnings for localhost URLs
  const currentUrl = window.location.href;
  if (currentUrl.includes('localhost') || 
      currentUrl.includes('127.0.0.1') || 
      currentUrl === 'http://127.0.0.1:5001/' ||
      currentUrl.startsWith('http://127.0.0.1:5001')) {
    console.log('WebSentinal: Skipping warning for localhost URL:', currentUrl);
    
    // Remove any existing warnings
    const existingWarning = document.getElementById('websentinal-warning');
    if (existingWarning) {
      existingWarning.remove();
    }
    
    return;
  }
  
  // Create the popup container
  const popup = document.createElement('div');
  popup.id = 'websentinal-warning';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    background-color: #ff4d4d;
    color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 2147483647;
    font-family: Arial, sans-serif;
    animation: slideIn 0.5s ease-out;
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
    }
  `;
  document.head.appendChild(style);
  
  // Format the trust score for display
  const trustScore = typeof data.trustScore === 'number' ? data.trustScore : 'Unknown';
  const scoreDisplay = typeof trustScore === 'number' ? `${trustScore}/100` : trustScore;
  
  // Create the content
  popup.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <div style="background-color: #ff2424; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; margin-right: 15px; animation: pulse 2s infinite;">
        <span style="font-size: 24px;">⚠️</span>
      </div>
      <h2 style="margin: 0; font-size: 18px;">Warning: Potentially Unsafe Website</h2>
    </div>
    <p style="margin: 0 0 15px 0; line-height: 1.4;">
      WebSentinal has detected that this website may be unsafe. 
      <br>
      <strong>Trust Score:</strong> ${scoreDisplay}
    </p>
    <p style="margin: 0 0 15px 0; font-size: 14px;">
      This site may be attempting to steal your personal information or install malware.
    </p>
    <div style="display: flex; justify-content: space-between;">
      <button id="websentinal-proceed" style="background-color: #ffffff; color: #ff4d4d; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">Proceed Anyway</button>
      <button id="websentinal-leave" style="background-color: #333333; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">Leave Site</button>
    </div>
  `;
  
  // Add to the page
  document.body.appendChild(popup);
  
  // Add event listeners
  document.getElementById('websentinal-proceed').addEventListener('click', () => {
    popup.remove();
  });
  
  document.getElementById('websentinal-leave').addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
  });
}

// Function to remove any existing warnings
function removeWarnings() {
  const warning = document.getElementById('websentinal-warning');
  if (warning) {
    warning.remove();
  }
}

// Check if we're on a localhost URL and remove warnings if so
function checkAndRemoveForLocalhost() {
  const currentUrl = window.location.href;
  if (currentUrl.includes('localhost') || 
      currentUrl.includes('127.0.0.1') || 
      currentUrl === 'http://127.0.0.1:5001/' ||
      currentUrl.startsWith('http://127.0.0.1:5001')) {
    console.log('WebSentinal: Removing warnings for localhost URL:', currentUrl);
    removeWarnings();
    return true;
  }
  return false;
}

// Run immediately to remove any existing warnings for localhost
if (checkAndRemoveForLocalhost()) {
  // Set up an interval to keep checking and removing warnings
  setInterval(checkAndRemoveForLocalhost, 1000);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Skip warnings for localhost URLs
  if (message.action === 'showWarning') {
    const currentUrl = window.location.href;
    if (currentUrl.includes('localhost') || 
        currentUrl.includes('127.0.0.1') || 
        currentUrl === 'http://127.0.0.1:5001/' ||
        currentUrl.startsWith('http://127.0.0.1:5001')) {
      console.log('WebSentinal: Skipping warning for localhost URL:', currentUrl);
      removeWarnings();
      return;
    }
    createWarningPopup(message.data);
  }
}); 
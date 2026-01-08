// Popup script for WebSentinal extension
// This script runs when the popup is opened

// Function to update the popup UI with website safety information
function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    if (url.length > 50) {
      // Format: domain.com/...
      return `${urlObj.hostname}${urlObj.pathname.length > 0 ? '/...' : ''}`;
    }
    return url;
  } catch (e) {
    return url;
  }
}

function updatePopup(url, data) {
  console.log("Updating popup with data:", data);
  
  // Handle localhost URLs
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    document.getElementById('trust-score').textContent = '100/100';
    document.getElementById('domain-age').textContent = 'Local Development';
    document.getElementById('domain-rank').textContent = 'Local';
    
    // Update status container for localhost
    const statusContainer = document.getElementById('status-container');
    statusContainer.innerHTML = `
      <div class="status safe">
        <div class="status-icon">✓</div>
        <div class="status-text">
          <h2>Local Development</h2>
          <p>This is a local development server and is safe.</p>
        </div>
      </div>
    `;
    
    // Hide warning message
    document.getElementById('warning-message').style.display = 'none';
    
    return;
  }
  
  // Update URL display
  document.getElementById('current-url').textContent = formatUrl(url);
  
  // Update trust score
  const trustScore = data.trustScore;
  document.getElementById('trust-score').textContent = `${trustScore}/100`;
  
  // Update domain age and rank
  document.getElementById('domain-age').textContent = data.domainAge || 'Not available';
  document.getElementById('domain-rank').textContent = data.domainRank || 'Not available';
  
  // Update status container based on trust score
  const statusContainer = document.getElementById('status-container');
  const warningElement = document.getElementById('warning-message');
  
  // Hide warning message by default
  warningElement.style.display = 'none';
  
  if (typeof trustScore === 'number') {
    if (trustScore >= 70) {
      statusContainer.innerHTML = `
        <div class="status safe">
          <div class="status-icon">✓</div>
          <div class="status-text">
            <h2>Website is Safe</h2>
            <p>This website has a good trust score.</p>
          </div>
        </div>
      `;
    } else if (trustScore >= 50) {
      statusContainer.innerHTML = `
        <div class="status unknown">
          <div class="status-icon">!</div>
          <div class="status-text">
            <h2>Use Caution</h2>
            <p>This website has a moderate trust score.</p>
          </div>
        </div>
      `;
    } else {
      statusContainer.innerHTML = `
        <div class="status unsafe">
          <div class="status-icon">✗</div>
          <div class="status-text">
            <h2>Potentially Unsafe</h2>
            <p>This website has a low trust score.</p>
          </div>
        </div>
      `;
      // Show the warning message box for emphasis
      warningElement.style.display = 'block';
    }
  } else {
    statusContainer.innerHTML = `
      <div class="status unknown">
        <div class="status-icon">?</div>
        <div class="status-text">
          <h2>Unknown Safety</h2>
          <p>We couldn't determine this website's safety.</p>
        </div>
      </div>
    `;
  }
  
  // Update the full analysis button to include the current URL
  const fullAnalysisButton = document.getElementById('full-analysis-btn');
  const encodedUrl = encodeURIComponent(url);
  fullAnalysisButton.href = `http://localhost:5001/?url=${encodedUrl}`;
}

// When the popup is opened, get the current tab
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;
    
    console.log("Popup opened for URL:", currentUrl);
    
    // Update URL display immediately
    document.getElementById('current-url').textContent = currentUrl;
    
    // Check if we have stored data for this URL
    chrome.storage.local.get([currentUrl], (result) => {
      console.log("Storage data:", result);
      
      if (result[currentUrl]) {
        updatePopup(currentUrl, result[currentUrl].result);
      } else {
        // If no data, show unknown status
        const statusContainer = document.getElementById('status-container');
        statusContainer.innerHTML = `
          <div class="status unknown">
            <div class="status-icon">?</div>
            <div class="status-text">
              <h2>Analyzing Website...</h2>
              <p>Please wait while we check this website.</p>
            </div>
          </div>
        `;
        
        // Hide warning message
        document.getElementById('warning-message').style.display = 'none';
        
        // For internal pages, show a message
        if (currentUrl.startsWith('chrome://') || 
            currentUrl.startsWith('chrome-extension://')) {
          statusContainer.innerHTML = `
            <div class="status unknown">
              <div class="status-icon">i</div>
              <div class="status-text">
                <h2>Browser Page</h2>
                <p>This is a browser internal page and cannot be analyzed.</p>
              </div>
            </div>
          `;
        }
        
        // Special handling for popular domains
        if (currentUrl.includes('instagram.com')) {
          document.getElementById('trust-score').textContent = '85/100';
          document.getElementById('domain-age').textContent = '12+ years';
          document.getElementById('domain-rank').textContent = 'Top 20';
          
          statusContainer.innerHTML = `
            <div class="status safe">
              <div class="status-icon">✓</div>
              <div class="status-text">
                <h2>Website is Safe</h2>
                <p>Instagram is a well-known social media platform.</p>
              </div>
            </div>
          `;
        }
      }
    });
  });
}); 
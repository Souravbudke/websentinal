// Popup script for WebSentinal extension
// This script runs when the popup is opened

// Function to update the popup UI with website safety information
function updatePopup(url, data) {
  console.log("Updating popup with data:", data);
  
  // Update URL
  document.getElementById('current-url').textContent = url;
  
  // Get status container
  const statusContainer = document.getElementById('status-container');
  
  // Create status HTML based on safety
  let statusHTML = '';
  if (data && data.result) {
    const result = data.result;
    const trustScore = result.trustScore;
    
    console.log("Result data:", result);
    
    // Update trust score
    const trustScoreElement = document.getElementById('trust-score');
    if (typeof trustScore === 'number') {
      trustScoreElement.textContent = `${trustScore}/100`;
    } else {
      trustScoreElement.textContent = trustScore;
    }
    
    // Update domain age and rank directly from the result object
    if (result.domainAge && result.domainAge !== 'Unknown') {
      document.getElementById('domain-age').textContent = result.domainAge;
    } else {
      document.getElementById('domain-age').textContent = 'Not available';
    }
    
    if (result.domainRank && result.domainRank !== 'Unknown') {
      document.getElementById('domain-rank').textContent = result.domainRank;
    } else {
      document.getElementById('domain-rank').textContent = 'Not available';
    }
    
    // Special handling for popular domains
    if (url.includes('instagram.com') && 
        (trustScoreElement.textContent === '--' || trustScoreElement.textContent === 'Unknown')) {
      trustScoreElement.textContent = '85/100';
      document.getElementById('domain-age').textContent = '12+ years';
      document.getElementById('domain-rank').textContent = 'Top 20';
    } else if (url.includes('facebook.com') && 
              (trustScoreElement.textContent === '--' || trustScoreElement.textContent === 'Unknown')) {
      trustScoreElement.textContent = '90/100';
      document.getElementById('domain-age').textContent = '15+ years';
      document.getElementById('domain-rank').textContent = 'Top 5';
    } else if (url.includes('google.com') && 
              (trustScoreElement.textContent === '--' || trustScoreElement.textContent === 'Unknown')) {
      trustScoreElement.textContent = '95/100';
      document.getElementById('domain-age').textContent = '20+ years';
      document.getElementById('domain-rank').textContent = 'Top 1';
    }
    
    if (result.isSafe) {
      statusHTML = `
        <div class="status safe">
          <div class="status-icon">✓</div>
          <div class="status-text">
            <h2>Website is Safe</h2>
            <p>This website appears to be legitimate and secure.</p>
          </div>
        </div>
      `;
    } else {
      statusHTML = `
        <div class="status unsafe">
          <div class="status-icon">!</div>
          <div class="status-text">
            <h2>Warning: Potentially Unsafe</h2>
            <p>This website may be dangerous. Proceed with caution.</p>
          </div>
        </div>
      `;
    }
    
    // If we don't have domain age or rank from the result object, try to extract from HTML
    if (document.getElementById('domain-age').textContent === '--' || 
        document.getElementById('domain-rank').textContent === '--') {
      try {
        // Create a temporary DOM element to parse the HTML
        if (typeof result.details === 'string' && result.details.includes('<html')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(result.details, 'text/html');
          
          // Find domain age if not already set
          if (document.getElementById('domain-age').textContent === '--') {
            const ageElements = doc.querySelectorAll('strong');
            for (const el of ageElements) {
              if (el.textContent.includes('Age:')) {
                const ageText = el.parentElement.textContent;
                const ageMatch = ageText.match(/Age:\s*([^<]+)/i);
                if (ageMatch && ageMatch[1]) {
                  document.getElementById('domain-age').textContent = ageMatch[1].trim();
                }
              }
            }
          }
          
          // Find domain rank if not already set
          if (document.getElementById('domain-rank').textContent === '--') {
            const rankElements = doc.querySelectorAll('strong');
            for (const el of rankElements) {
              if (el.textContent.includes('Rank:')) {
                const rankText = el.parentElement.textContent;
                const rankMatch = rankText.match(/Rank:\s*([^<]+)/i);
                if (rankMatch && rankMatch[1]) {
                  document.getElementById('domain-rank').textContent = rankMatch[1].trim();
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error extracting details:', error);
      }
    }
    
    // Final check - if we still don't have values, set to "Not available"
    if (document.getElementById('domain-age').textContent === '--') {
      document.getElementById('domain-age').textContent = 'Not available';
    }
    if (document.getElementById('domain-rank').textContent === '--') {
      document.getElementById('domain-rank').textContent = 'Not available';
    }
  } else {
    statusHTML = `
      <div class="status unknown">
        <div class="status-icon">?</div>
        <div class="status-text">
          <h2>No Data Available</h2>
          <p>We couldn't analyze this website. Try refreshing the page.</p>
        </div>
      </div>
    `;
  }
  
  // Update status container
  statusContainer.innerHTML = statusHTML;
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
        updatePopup(currentUrl, result[currentUrl]);
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
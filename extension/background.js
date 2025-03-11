// Background script for WebSentinal extension
// This script runs in the background and checks URLs as they are visited

// API endpoint for WebSentinal
const API_URL = 'http://localhost:5001';

// Function to check if a URL is safe
async function checkUrlSafety(url) {
  try {
    console.log("Checking URL safety for:", url);
    
    // Create form data to match the expected format in the Flask app
    const formData = new FormData();
    formData.append('url', url);
    
    // First try the JSON API endpoint
    try {
      console.log("Trying JSON API endpoint...");
      const apiResponse = await fetch(`${API_URL}/api/check-url`, {
        method: 'POST',
        body: formData
      });
      
      if (apiResponse.ok) {
        const jsonData = await apiResponse.json();
        console.log("API response:", jsonData);
        
        // Ensure we have valid data
        const trustScore = typeof jsonData.trust_score === 'number' ? jsonData.trust_score : 
                          (jsonData.trust_score === 'Unknown' ? 'Unknown' : 0);
        
        return {
          isSafe: jsonData.is_safe === true,
          trustScore: trustScore,
          domainAge: jsonData.domain_age || 'Unknown',
          domainRank: jsonData.domain_rank || 'Unknown',
          details: JSON.stringify(jsonData)
        };
      } else {
        console.warn("API returned non-OK status:", apiResponse.status);
      }
    } catch (apiError) {
      console.warn('API endpoint failed, falling back to HTML parsing:', apiError);
      // If API fails, fall back to HTML parsing
    }
    
    // Fallback: Send the URL to the WebSentinal HTML endpoint
    console.log("Falling back to HTML endpoint...");
    const response = await fetch(`${API_URL}/`, {
      method: 'POST',
      body: formData
    });
    
    // Parse the response
    const text = await response.text();
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    // Extract data using DOM methods instead of regex
    let trustScore = 'Unknown';
    let domainAge = 'Unknown';
    let domainRank = 'Unknown';
    
    // Find trust score
    const trustScoreElement = doc.querySelector('.trust-score');
    if (trustScoreElement) {
      const scoreText = trustScoreElement.textContent.trim();
      const scoreMatch = scoreText.match(/(\d+)/);
      if (scoreMatch && scoreMatch[1]) {
        trustScore = parseInt(scoreMatch[1]);
      }
    } else {
      // Fallback to regex if DOM element not found
      const trustScoreMatch = text.match(/Trust Score:\s*(\d+)/i);
      if (trustScoreMatch && trustScoreMatch[1]) {
        trustScore = parseInt(trustScoreMatch[1]);
      }
    }
    
    // Find domain age
    const ageElements = doc.querySelectorAll('strong');
    for (const el of ageElements) {
      if (el.textContent.includes('Age:')) {
        const ageText = el.parentElement.textContent;
        const ageMatch = ageText.match(/Age:\s*([^<]+)/i);
        if (ageMatch && ageMatch[1]) {
          domainAge = ageMatch[1].trim();
        }
      }
    }
    
    // Find domain rank
    const rankElements = doc.querySelectorAll('strong');
    for (const el of rankElements) {
      if (el.textContent.includes('Rank:')) {
        const rankText = el.parentElement.textContent;
        const rankMatch = rankText.match(/Rank:\s*([^<]+)/i);
        if (rankMatch && rankMatch[1]) {
          domainRank = rankMatch[1].trim();
        }
      }
    }
    
    // Special handling for popular domains
    if (url.includes('instagram.com')) {
      // Instagram is generally safe and has a high rank
      if (trustScore === 'Unknown') {
        trustScore = 85;
        domainAge = '12+ years';
        domainRank = 'Top 20';
      }
    } else if (url.includes('facebook.com')) {
      if (trustScore === 'Unknown') {
        trustScore = 90;
        domainAge = '15+ years';
        domainRank = 'Top 5';
      }
    } else if (url.includes('google.com')) {
      if (trustScore === 'Unknown') {
        trustScore = 95;
        domainAge = '20+ years';
        domainRank = 'Top 1';
      }
    }
    
    // Determine if the site is safe based on trust score
    const isSafe = typeof trustScore === 'number' ? trustScore >= 50 : true;
    
    console.log("Parsed results:", { trustScore, domainAge, domainRank, isSafe });
    
    return {
      isSafe: isSafe,
      trustScore: trustScore,
      domainAge: domainAge,
      domainRank: domainRank,
      details: text
    };
  } catch (error) {
    console.error('Error checking URL safety:', error);
    return { 
      isSafe: true, 
      trustScore: 'Error', 
      domainAge: 'Unknown',
      domainRank: 'Unknown',
      details: 'Error checking URL safety' 
    };
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check when the page has finished loading
  if (changeInfo.status === 'complete' && tab.url) {
    // Ignore browser internal pages and the WebSentinal app itself
    if (!tab.url.startsWith('chrome://') && 
        !tab.url.startsWith('chrome-extension://') && 
        !tab.url.includes('localhost:5001')) {
      
      console.log("Tab updated, checking URL:", tab.url);
      
      // Check the URL safety
      checkUrlSafety(tab.url).then(result => {
        console.log("Safety check result:", result);
        
        if (!result.isSafe) {
          // Send a message to the content script to show a warning
          chrome.tabs.sendMessage(tabId, {
            action: 'showWarning',
            data: {
              url: tab.url,
              trustScore: result.trustScore,
              domainAge: result.domainAge,
              domainRank: result.domainRank
            }
          });
          
          // Update the extension icon to indicate danger
          chrome.action.setBadgeText({ text: '!' });
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
        } else {
          // Update the extension icon to indicate safety
          chrome.action.setBadgeText({ text: '✓' });
          chrome.action.setBadgeBackgroundColor({ color: '#00FF00' });
        }
        
        // Store the result for the popup
        chrome.storage.local.set({ 
          [tab.url]: {
            result: result,
            timestamp: Date.now()
          }
        });
      });
    }
  }
}); 
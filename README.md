# WebSentinal

WebSentinal is a comprehensive web security analysis tool designed to detect and warn users about potentially malicious websites. The system consists of a Flask-based backend application and a browser extension that work together to provide real-time website safety analysis.

## Features

- **Website Trust Score Calculation**: Analyzes multiple security factors to generate a trust score for any website
- **Domain Analysis**: Checks domain age, rank, and WHOIS information
- **Security Indicators**: Detects URL shorteners, IP presence in URLs, HSTS support, and more
- **SSL Certificate Analysis**: Examines certificate details for additional security verification
- **Browser Extension**: Real-time website safety monitoring with visual indicators
- **Warning System**: Alerts users when visiting potentially unsafe websites
- **Web Interface**: Detailed analysis reports accessible through a web dashboard

## System Architecture

WebSentinal consists of two main components:

1. **Backend Application**: A Flask-based web service that performs website security analysis
2. **Browser Extension**: A Chrome/Firefox extension that communicates with the backend to provide real-time safety information

## Backend Installation

### Prerequisites

- Python 3.6+
- pip (Python package manager)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/websentinal.git
   cd websentinal
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```
   flask run --port=5001
   ```
   Then visit `http://localhost:5001/update-db` to populate the database with domain rank data.

5. Start the application:
   ```
   flask run --host=0.0.0.0 --port=5001
   ```

The backend will be accessible at `http://localhost:5001`.

## Browser Extension Installation

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click "Load unpacked" and select the `extension` directory
4. The extension should now be installed and active

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the `extension` directory and select the `manifest.json` file
4. The extension should now be installed and active

## Docker Deployment

WebSentinal can also be deployed using Docker:

```
docker build -t websentinal .
docker run -p 5001:5001 websentinal
```

## Usage

### Web Interface

1. Access the web interface at `http://localhost:5001`
2. Enter a URL in the input field and click "Check"
3. View the detailed security analysis report

### Browser Extension

1. Make sure the WebSentinal backend is running at `http://localhost:5001`
2. Browse the web as normal
3. The extension will automatically analyze websites you visit
4. If a website is potentially unsafe (trust score < 50), a warning popup will appear
5. Click the extension icon to see detailed safety information about the current website

## Security Analysis Factors

WebSentinal evaluates websites based on multiple security factors, including:

- **Domain Age**: Older domains are generally more trustworthy
- **Domain Rank**: Higher-ranked domains are typically more legitimate
- **URL Structure**: Checks for overly long or deep URLs
- **URL Shortening**: Detects if URL shortening services are being used
- **IP Presence**: Checks if IP addresses are directly used in URLs
- **HSTS Support**: Verifies if the website enforces secure connections
- **SSL Certificate**: Analyzes certificate validity and issuer
- **Phishing Database**: Checks against known phishing URLs

Each factor contributes to the final trust score, which ranges from 0 to 100.

## API Usage

WebSentinal provides a simple API for programmatic access:

```
POST /api/check-url
Content-Type: application/x-www-form-urlencoded

url=https://example.com
```

Response:
```json
{
  "status": "SUCCESS",
  "url": "https://example.com",
  "trust_score": 85,
  "is_safe": true,
  "domain_age": "10.5 year(s)",
  "domain_rank": "25430",
  "ip_present": false,
  "is_url_shortened": false,
  "hsts_support": true,
  "too_long_url": false,
  "too_deep_url": false
}
```

## Project Structure

```
websentinal/
├── app.py                 # Main Flask application
├── controller.py          # Controller for handling requests
├── model.py               # Core security analysis logic
├── db.py                  # Database models
├── onetimescript.py       # Scripts for database initialization
├── requirements.txt       # Python dependencies
├── Dockerfile             # Docker configuration
├── static/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── data/              # Data files (URL shorteners, domain ranks)
├── templates/             # HTML templates
│   ├── base.html          # Base template
│   ├── index.html         # Main analysis page
│   ├── preview.html       # Website preview page
│   └── source_code.html   # Source code view page
└── extension/             # Browser extension
    ├── manifest.json      # Extension configuration
    ├── background.js      # Background script
    ├── content.js         # Content script
    ├── popup.html         # Extension popup
    ├── popup.js           # Popup script
    └── popup.css          # Popup styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

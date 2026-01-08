# WebSentinal Browser Extension

A browser extension that uses the WebSentinal backend to detect and warn about potentially malicious websites.

## Features

- Real-time website safety analysis
- Warning popups for unsafe websites
- Detailed safety information in the extension popup
- Visual indicators of website safety status

## Installation

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

## Usage

1. Make sure the WebSentinal backend is running at `http://localhost:5001`
2. Browse the web as normal
3. The extension will automatically analyze websites you visit
4. If a website is potentially unsafe (trust score < 50), a warning popup will appear
5. Click the extension icon to see detailed safety information about the current website

## Development

This extension communicates with the WebSentinal backend API to analyze websites. The backend must be running for the extension to work properly.

### Files

- `manifest.json`: Extension configuration
- `background.js`: Background script that analyzes URLs
- `content.js`: Content script that displays warnings
- `popup.html`: Extension popup UI
- `popup.js`: Script for the extension popup

## License

This project is licensed under the MIT License. 
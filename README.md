# 🎯 Distraction Eater (Focus Blocker)

> A sleek, password-protected Chrome extension built to keep you in the zone and eliminate digital distractions when it matters most. 

## 🚀 Pitch
Hackathons, deep-work sessions, and final exams require absolute focus. **Distraction Eater** is a lightweight Chrome extension that intercepts your attempts to visit time-wasting websites. Unlike other blockers that you can easily toggle off when your willpower fades, Distraction Eater locks your settings behind a custom password, ensuring you stay on task until the work is done.

## ✨ Key Features

* **Dual-Mode Filtering:** Choose between a Blacklist (block specific distracting sites) or a Whitelist (block the entire internet except for the specific tools you need).
* **Password-Protected Willpower:** Lock your blocklist with a custom password. Attempting to remove a site from the list requires you to enter the password via a sleek, built-in modal UI.
* **Draft State Architecture:** Toggle between modes without accidentally breaking your workflow. Changes are staged and only applied when you hit the "Apply Mode" button.
* **Custom Interception Page:** If you try to visit a blocked site, you are instantly redirected to a custom, beautifully styled "Access Denied" page to remind you to get back to coding.
* **Seamless UI/UX:** Features a modern, responsive design with segmented controls, password confirmation validation, "show password" toggles, and instant visual feedback for user actions.

## 🛠️ Tech Stack

* **Frontend:** Vanilla JavaScript, HTML5, CSS3 (Modern Flexbox layout, CSS Variables)
* **Extension API:** Chrome Extension Manifest V3
* **Storage:** `chrome.storage.local` for secure, persistent user preferences
* **Routing:** `chrome.declarativeNetRequest` and `chrome.tabs` for zero-latency URL interception

## 📥 Installation Guide (Developer Mode)

To test Distraction Eater locally on your machine, follow these steps:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/` in your URL bar.
3. In the top right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing this repository's files.
6. The extension will appear in your browser! Click the "Puzzle Piece" icon in your Chrome toolbar and pin **Distraction Eater** for easy access.

## 💻 How to Use

1. **Set a Password:** Click the extension icon and set your secure removal password.
2. **Add Sites:** Type in a domain (e.g., `twitter.com`, `reddit.com`) and click **Add**.
3. **Choose Your Mode:** Select either Blacklist or Whitelist.
4. **Apply Settings:** Click **Apply Mode** to activate the blocker. 
5. **Get to Work:** Try visiting a blocked site and watch the extension instantly intercept the request! To remove a site later, click the red "X" and enter your password.


# UW Bills Review

A branded customer-facing "Free Bills Review" page for collecting a light household bills snapshot.

The page is designed to:

- feel more professional than a standard Google Form
- let customers complete only the sections that matter
- collect indicative data rather than exact bill evidence
- avoid sensitive details such as bank details, account numbers and full policy data
- send submissions to a Google Sheet through Google Apps Script

## Files

- `index.html` - page structure and form fields
- `styles.css` - UW-inspired visual styling
- `script.js` - conditional sections, validation and submission
- `google-apps-script/Code.gs` - Google Sheets endpoint template
- `assets/` - logo, partner photo and service icons

## Setup

1. Create a Google Sheet for responses.
2. Open Extensions > Apps Script.
3. Paste `google-apps-script/Code.gs`.
4. Deploy as a web app.
5. Copy the web app URL into `CONFIG.appsScriptUrl` in `script.js`.
6. Publish the site through GitHub Pages.

## Insurance

The insurance section is intentionally signposting only. It does not collect policy details and does not provide insurance advice.

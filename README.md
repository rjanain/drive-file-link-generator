# Drive File Link Generator Library

## Overview
This library processes student answer scripts stored in a Google Drive folder, updates their permissions, and stores file links in a Google Sheets document. It is scalable, easy to set up, and tracks processed folders.

### Features:
- Processes PDF files and sets them to "Anyone with the link can view."
- Logs file links and metadata to Google Sheets.
- Supports batch processing to avoid timeout errors.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [CLASP](https://github.com/google/clasp)
- Google Apps Script API enabled.

### Project Structure

```md
/project-root
  ├── src
  │   ├── config.js
  │   ├── drive.js
  │   ├── sheets.js
  │   ├── process.js
  │   └── main.js
  ├── .clasp.json
  └── package.json
```


## Setup

1. Clone this repository and navigate to the project directory:
   ```bash
   git clone https://github.com/your-repo/student-answer-library.git
   cd student-answer-library
   ```

2. Install necessary packages for development
    ```bash
    npm install
    ```


3. Create a new Google Apps Script project and link it:
   ```bash
   clasp create --type standalone --title "Student Answer Script Library"
   ```


4. Move your `appsscript.json` file into the `src` directory (this will replace the existing `appsscript.json` file inside `src` folder). Make sure the `.clasp.json` file points to the `src` folder by updating it as follows:

   ```json
   {
     "scriptId": "YOUR_SCRIPT_ID",
     "rootDir": "src"
   }
   ```

5. Push the code to Google Apps Script:
   ```bash
   clasp push
   ```

6. Open the Google Apps Script project in the Apps Script editor:
   ```bash
   clasp open
   ```

## Configuration

Modify the `src/config.js` file to include:
- `parentFolderId`: The Google Drive folder containing student answer scripts.
- `storageSheetId`: The Google Sheet to store links and metadata.
- `sheetNames`: Specify sheet names for data tracking and links.

## Usage

Once the code is deployed in Google Apps Script, call the `initializeProcess` function to start processing the student answer scripts and log the results to Google Sheets.

## Development

To make changes to the code:
1. Edit the files inside the `src` directory.
2. Run:
   ```bash
   clasp push
   ```

   This will push the changes to Google Apps Script.

## License

MIT License.

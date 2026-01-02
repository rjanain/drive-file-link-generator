# Drive File Link Generator

A Google Apps Script library to batch process Drive folders, generate file links, and log metadata to Google Sheets.

## Features
- Recursively processes folders and files.
- Logs file links, owners, and timestamps to Google Sheets.
- **Configurable Permissions**: Optionally sets files to "Anyone with the link can view".
- Tracks processed folders to prevent duplicates.

## Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/rjanain/drive-file-link-generator.git
   cd drive-file-link-generator
   npm install
   ```

2. **Initialize Apps Script**:
   ```bash
   clasp create --type standalone --title "Drive Link Generator"
   ```
   *Ensure `.clasp.json` points to `"rootDir": "src"`.*

3. **Deploy**:
   ```bash
   clasp push
   clasp open
   ```

## Configuration

**Important**: You must update `src/config.js` with your specific IDs and settings before running the script.

```javascript
const config = {
    parentFolderId: "YOUR_DRIVE_FOLDER_ID", // ID of the folder to process
    storageSheetId: "YOUR_SHEET_ID",       // ID of the destination Google Sheet
    // ...
    updatePermissions: false // Set to true to change file permissions to "Anyone with link can view"
};
```

> **Note on Permissions**: 
> By default, this project uses the `https://www.googleapis.com/auth/drive.readonly` scope for security. 
> If you set `updatePermissions: true` to modify file access, you **must** also update `src/appsscript.json`:
> Change `"https://www.googleapis.com/auth/drive.readonly"` to `"https://www.googleapis.com/auth/drive"`.

## Usage

Run the `initializeProcess` function in the Apps Script editor to start processing.

## License
MIT License

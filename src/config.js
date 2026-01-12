const PARENT_FOLDER_ID = "PARENT_FOLDER_ID"; // Replace Your Google Drive ID
const RENAMING_FOLDER_ID = "RENAME_FOLDER_ID"; // Replace Your Google Drive ID (For Renaming)
const STORAGE_SHEET_ID = "STORAGE_SHEET_ID"; // Replace Your Google Sheet ID

/* Sheet Names */
const DATA_TRACK_SHEET_NAME = "DriveFile";
const LINKS_SHEET_NAME = "AnswerScriptLink";
const RENAMING_RULES_SHEET_NAME = "RenamingRules";
const RENAMING_LOG_SHEET_NAME = "RenamingLog";

/**
 * Configuration object for the script.
 */
const config = {
  parentFolderId: PARENT_FOLDER_ID,
  storageSheetId: STORAGE_SHEET_ID,
  renamingFolderId: RENAMING_FOLDER_ID,
  targetFileType: "", // "csv", "pdf", "xlsx", or "" for all
  sheetNames: {
    dataTrack: DATA_TRACK_SHEET_NAME,
    links: LINKS_SHEET_NAME,
    renamingRules: RENAMING_RULES_SHEET_NAME,
    renamingLog: RENAMING_LOG_SHEET_NAME
  },
  headers: {
    dataTrack: ["Folder Name", "Folder ID", "Processed", "Processed Date", "Processed Note"],
    links: ["Folder Name", "File Name", "File URL", "File Owner", "Link Generated On"],
    renamingRules: ["Search ID", "New File Name"],
    renamingLog: ["Original Name", "New Name", "File ID", "Status", "Date"]
  },
  updatePermissions: false // Set to true to enable "Anyone with the link can view" permission
};

function startDriveFileListingProcess() {
  initializeFileListingProcess()
}

function startDriveFileRenamingProcess() {
  initializeFileRenamingProcess()
}
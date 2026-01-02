/**
 * Initializes the listing and processing of folders and files.
 */
function initializeProcess() {
  Logger.log("Starting initialization process...");
  const spreadsheet = SpreadsheetApp.openById(config.storageSheetId);
  ensureSheet(spreadsheet, config.sheetNames.dataTrack, config.headers.dataTrack);
  ensureSheet(spreadsheet, config.sheetNames.links, config.headers.links);

  const existingFolders = getExistingFolders(spreadsheet);
  const newFolders = listSubFolders(config.parentFolderId, existingFolders);
  appendNewFolders(spreadsheet, newFolders);
  
  // Ensure data is written before re-reading
  SpreadsheetApp.flush();
  
  // Re-fetch folders to include the newly added ones for processing
  const allFolders = getExistingFolders(spreadsheet);
  const unprocessedFolders = filterUnprocessedFolders(allFolders);
  processFolders(unprocessedFolders, spreadsheet);
  Logger.log("Initialization process completed.");
}

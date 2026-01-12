/**
 * Initializes the listing and processing of folders and files.
 */
function initializeFileListingProcess() {
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

/**
 * Initializes the file renaming process.
 */
function initializeFileRenamingProcess() {
  Logger.log("Starting renaming process...");
  const spreadsheet = SpreadsheetApp.openById(config.storageSheetId);
  
  // Ensure necessary sheets exist
  ensureSheet(spreadsheet, config.sheetNames.renamingRules, config.headers.renamingRules);
  ensureSheet(spreadsheet, config.sheetNames.renamingLog, config.headers.renamingLog);
  
  // Get renaming rules
  const rules = getRenamingRules(spreadsheet);
  
  if (rules.length === 0) {
      Logger.log("No renaming rules found. Exiting.");
      return;
  }
  
  // Run renaming logic
  renameFilesBasedOnRules(config.renamingFolderId, rules, spreadsheet);
  
  Logger.log("Renaming process completed.");
}

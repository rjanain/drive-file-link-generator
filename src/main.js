/**
 * Initializes the listing and processing of folders and files.
 */
function initializeProcess() {
  const spreadsheet = SpreadsheetApp.openById(config.storageSheetId);
  ensureSheet(spreadsheet, config.sheetNames.dataTrack, config.headers.dataTrack);
  ensureSheet(spreadsheet, config.sheetNames.links, config.headers.links);

  const existingFolders = getExistingFolders(spreadsheet);
  const newFolders = listSubFolders(config.parentFolderId, existingFolders);
  appendNewFolders(spreadsheet, newFolders);
  const unprocessedFolders = filterUnprocessedFolders(existingFolders);
  processFolders(unprocessedFolders, spreadsheet);
}

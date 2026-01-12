/**
 * Initializes the listing and processing of folders and files.
 */
function initializeFileListingProcess() {
  Logger.log("Starting initialization process...");
  const spreadsheet = SpreadsheetApp.openById(config.storageSheetId);
  ensureSheet(
    spreadsheet,
    config.sheetNames.dataTrack,
    config.headers.dataTrack
  );
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
  ensureSheet(
    spreadsheet,
    config.sheetNames.renamingRules,
    config.headers.renamingRules
  );
  ensureSheet(
    spreadsheet,
    config.sheetNames.renamingLog,
    config.headers.renamingLog
  );

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

/**
 * Reverts renaming for the most recent log entries.
 * Reverts all "Success" entries in the log that haven't been reverted yet.
 */
function revertLastRenamingBatch() {
  Logger.log("Starting revert process...");
  const spreadsheet = SpreadsheetApp.openById(config.storageSheetId);
  const sheet = spreadsheet.getSheetByName(config.sheetNames.renamingLog);

  if (!sheet) {
    Logger.log("No renaming log found.");
    return;
  }

  // NOTE: Removed UI confirmation for standalone execution. 
  // Be careful when running this function!

  const data = sheet.getDataRange().getValues();
  // Headers: Original Name, New Name, File ID, Status, Date

  // Iterate backwards to undo the most recent changes first
  let revertCount = 0;

  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    const originalName = row[0];
    const newName = row[1];
    const fileId = row[2];
    const status = row[3];

    // Only revert if operation was a Success and hasn't been reverted yet
    if (status === "Success" && originalName && fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        // Only rename if the current name matches the "New Name" we set,
        // to avoid reverting files that might have been changed manually since then.
        if (file.getName() === newName) {
          file.setName(originalName);
          // Mark row as Reverted in the sheet by updating the Status column (Column 4, Index 3)
          // Or easier, just append a note or update the status column.
          // In Apps Script column indices are 1-based. Status is column D (4).
          sheet.getRange(i + 1, 4).setValue("Reverted");
          Logger.log(`Reverted: ${newName} -> ${originalName}`);
          revertCount++;
        } else {
          Logger.log(
            `Skipping revert for ${fileId}: Current filename (${file.getName()}) does not match expected new name (${newName})`
          );
        }
      } catch (e) {
        Logger.log(`Failed to revert row ${i + 1}: ${e.message}`);
        sheet.getRange(i + 1, 4).setValue("Revert Failed: " + e.message);
      }
    }
  }

  Logger.log(`Revert complete. ${revertCount} files restored.`);
}


/**
 * Ensures a sheet exists, or creates it with specified headers.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 * @param {string} sheetName - Name of the sheet to check or create.
 * @param {Array} headers - Array of header titles for the sheet.
 */
function ensureSheet(spreadsheet, sheetName, headers) {
    Logger.log(`Ensuring sheet exists: ${sheetName}`);
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        sheet.appendRow(headers);
    } else {
        const lastRow = sheet.getLastRow();
        if (lastRow === 0) {
            Logger.log(`Sheet ${sheetName} is empty. Appending headers.`);
            sheet.appendRow(headers);
        } else {
            // Check if first row matches headers or is empty
            const firstRowRange = sheet.getRange(1, 1, 1, headers.length);
            const firstRowValues = firstRowRange.getValues()[0];
            
            // Check if the header row is completely empty
            const isHeaderEmpty = firstRowValues.every(cell => cell === "");
            
            if (isHeaderEmpty) {
                Logger.log(`Sheet ${sheetName} has existing rows but missing headers. Setting headers.`);
                firstRowRange.setValues([headers]);
            }
        }
    }
}

/**
 * Retrieves existing folders from the dataTrack sheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 * @return {Object} An object with folder IDs as keys for quick lookup.
 */
function getExistingFolders(spreadsheet) {
    const sheet = spreadsheet.getSheetByName(config.sheetNames.dataTrack);
    const data = sheet.getDataRange().getValues();
    let folders = {};
    data.slice(1).forEach((row, index) => {
        folders[row[1]] = { name: row[0], processed: row[2], date: row[3], note: row[4], rowIndex: index + 2 };
    });
    Logger.log(`Retrieved ${Object.keys(folders).length} existing folders from sheet.`);
    return folders;
}


/**
 * Appends new folders to the dataTrack sheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 * @param {Array} newFolders - New folders to append.
 */
function appendNewFolders(spreadsheet, newFolders) {
    Logger.log(`Appending ${newFolders.length} new folders to sheet.`);
    const sheet = spreadsheet.getSheetByName(config.sheetNames.dataTrack);
    if (newFolders.length > 0) {
        const lastRow = sheet.getLastRow();
        const values = newFolders.map(folder => [folder.name, folder.id, false, "", ""]);
        sheet.getRange(lastRow + 1, 1, newFolders.length, 5).setValues(values);
    }
}


/**
 * Logs the file information to a Google Sheet.
 * @param {Array} files - Array of file data.
 * @param {string} folderName - Name of the folder being processed.
 * @return {number} Number of files processed.
 */
function logFilesToSheet(files, folderName) {
    Logger.log(`Logging ${files.length} files to sheet for folder: ${folderName}`);
    const sheet = SpreadsheetApp.openById(config.storageSheetId).getSheetByName(config.sheetNames.links);
    const lastRow = sheet.getLastRow();
    const values = files.map(file => {
        // Remove file extension from filename
        const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        return [folderName, fileNameWithoutExtension, file.url, file.owner, file.generatedOn];
    });
    if (values.length > 0) {
        sheet.getRange(lastRow + 1, 1, values.length, values[0].length).setValues(values);
    }
    return files.length;
}

/**
 * Retrieves renaming rules from the RenamingRules sheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 * @return {Array} An array of objects containing { searchId, newName }.
 */
function getRenamingRules(spreadsheet) {
    const sheet = spreadsheet.getSheetByName(config.sheetNames.renamingRules);
    if (!sheet) {
        Logger.log("Renaming rules sheet not found.");
        return [];
    }
    const data = sheet.getDataRange().getValues();
    const rules = [];
    // Assuming headers are in row 1, iterate from row 2
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[1]) {
            rules.push({ searchId: String(row[0]), newName: String(row[1]) });
        }
    }
    Logger.log(`Retrieved ${rules.length} renaming rules.`);
    return rules;
}

/**
 * Logs a renaming action to the RenamingLog sheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 * @param {string} originalName - Original file name.
 * @param {string} newName - New file name.
 * @param {string} fileId - ID of the file.
 * @param {string} status - Status of the operation.
 */
function logRenamingResult(spreadsheet, originalName, newName, fileId, status) {
    let sheet = spreadsheet.getSheetByName(config.sheetNames.renamingLog);
    
    if (!sheet) {
         ensureSheet(spreadsheet, config.sheetNames.renamingLog, config.headers.renamingLog);
         sheet = spreadsheet.getSheetByName(config.sheetNames.renamingLog);
    } 
    
    // Ensure that if the sheet exists but is empty, we add headers before logging data
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(config.headers.renamingLog);
    }
    
    sheet.appendRow([originalName, newName, fileId, status, new Date()]);
}


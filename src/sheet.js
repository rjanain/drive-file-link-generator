
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


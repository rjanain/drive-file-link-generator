
/**
 * Ensures a sheet exists, or creates it with specified headers.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 * @param {string} sheetName - Name of the sheet to check or create.
 * @param {Array} headers - Array of header titles for the sheet.
 */
function ensureSheet(spreadsheet, sheetName, headers) {
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
    data.slice(1).forEach(row => {
        folders[row[1]] = { name: row[0], processed: row[2], date: row[3], note: row[4] };
    });
    return folders;
}


/**
 * Appends new folders to the dataTrack sheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 * @param {Array} newFolders - New folders to append.
 */
function appendNewFolders(spreadsheet, newFolders) {
    const sheet = spreadsheet.getSheetByName(config.sheetNames.dataTrack);
    if (newFolders.length > 0) {
        const lastRow = sheet.getLastRow();
        const values = newFolders.map(folder => [folder.name, folder.id, false, "", ""]);
        sheet.getRange(lastRow + 1, 1, newFolders.length, 5).setValues(values);
    }
}

/**
 * Finds the row index of a folder by ID.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Sheet object.
 * @param {string} folderId - ID of the folder to find.
 * @return {number} The row index.
 */
function findRowById(sheet, folderId) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === folderId) {
            return i + 1; // Account for array indexing vs Sheets indexing
        }
    }
    return null;
}


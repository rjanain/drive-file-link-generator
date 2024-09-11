
/**
 * Filters folders to find those not yet processed.
 * @param {Object} existingFolders - Folders from the dataTrack sheet.
 * @return {Array} An array of folders not processed.
 */
function filterUnprocessedFolders(existingFolders) {
    return Object.keys(existingFolders)
        .filter(key => !existingFolders[key].processed)
        .map(key => ({ id: key, name: existingFolders[key].name }));
}

/**
 * Processes each folder, listing and updating permissions of all files.
 * @param {Array} folders - Array of folder data.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object.
 */
function processFolders(folders, spreadsheet) {
    const dataTrackSheet = spreadsheet.getSheetByName(config.sheetNames.dataTrack);

    folders.forEach(folder => {
        Logger.log(`Processing folder: ${folder.name}`);
        const filesList = listFilesInFolder(folder.id);
        const processedCount = updatePermissionsAndLog(filesList, folder.name);
        Logger.log(`Completed processing folder: ${folder.name} with ${processedCount} files processed.`);

        // Update the dataTrack sheet
        const rowIndex = findRowById(dataTrackSheet, folder.id);
        if (rowIndex) {
            dataTrackSheet.getRange(rowIndex, 3).setValue(true);
            dataTrackSheet.getRange(rowIndex, 4).setValue(new Date());
            dataTrackSheet.getRange(rowIndex, 5).setValue(`${processedCount} files processed`);
        }
    });
}

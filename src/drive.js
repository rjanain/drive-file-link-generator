/**
 * Lists all files in a folder and sets view permissions.
 * @param {string} folderId - ID of the folder.
 * @return {Array} An array of file data.
 */
function listFilesInFolder(folderId) {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileList = [];

    while (files.hasNext()) {
        const file = files.next();
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileList.push({
            name: file.getName(),
            url: file.getUrl(),
            owner: file.getOwner().getName(),
            generatedOn: new Date()
        });
    }
    return fileList;
}


/**
 * Lists all subfolders within a given folder and filters out already listed ones.
 * @param {string} folderId - The ID of the parent folder.
 * @param {Object} existingFolders - Folders already in the dataTrack sheet.
 * @return {Array} An array of folder objects with names and IDs.
 */
function listSubFolders(folderId, existingFolders) {
    const parentFolder = DriveApp.getFolderById(folderId);
    const childFolders = parentFolder.getFolders();
    const newFolders = [];

    while (childFolders.hasNext()) {
        const folder = childFolders.next();
        if (!existingFolders.hasOwnProperty(folder.getId())) {
            newFolders.push({ name: folder.getName(), id: folder.getId() });
        }
    }
    return newFolders;
}


/**
 * Logs the file information to a Google Sheet and updates the permissions.
 * @param {Array} files - Array of file data.
 * @param {string} folderName - Name of the folder being processed.
 * @return {number} Number of files processed.
 */
function updatePermissionsAndLog(files, folderName) {
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
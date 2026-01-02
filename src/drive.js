/**
 * Lists all files in a folder and sets view permissions.
 * @param {string} folderId - ID of the folder.
 * @return {Array} An array of file data.
 */
function listFilesInFolder(folderId) {
    Logger.log(`Listing files in folder: ${folderId}`);
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileList = [];

    while (files.hasNext()) {
        const file = files.next();
        if (config.updatePermissions) {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
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
    Logger.log(`Listing subfolders for parent folder: ${folderId}`);
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

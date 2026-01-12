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

/**
 * Renames files in a folder based on rules.
 * @param {string} folderId - ID of the folder to process.
 * @param {Array} rules - Array of renaming rules {searchId, newName}.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet for logging.
 */
function renameFilesBasedOnRules(folderId, rules, spreadsheet) {
    Logger.log(`Starting renaming process in folder: ${folderId}`);
    try {
        const folder = DriveApp.getFolderById(folderId);
        const files = folder.getFiles();
        
        while (files.hasNext()) {
            const file = files.next();
            const currentName = file.getName();
            
            for (const rule of rules) {
                // Check if the search ID is present in the filename
                if (currentName.includes(rule.searchId)) {
                    
                    // Construct new name, attempting to preserve extension
                    const extensionMatch = currentName.match(/\.[^/.]+$/);
                    const extension = extensionMatch ? extensionMatch[0] : "";
                    
                    const newNameBase = rule.newName;
                    // Only append extension if newName doesn't end with it (simple check)
                    const finalNewName = newNameBase.endsWith(extension) ? newNameBase : newNameBase + extension;
                    
                    if (currentName !== finalNewName) {
                        try {
                            file.setName(finalNewName);
                            // Call logRenamingResult from sheet.js
                            logRenamingResult(spreadsheet, currentName, finalNewName, file.getId(), "Success");
                            Logger.log(`Renamed: ${currentName} -> ${finalNewName}`);
                        } catch (e) {
                            logRenamingResult(spreadsheet, currentName, finalNewName, file.getId(), "Error: " + e.message);
                            Logger.log(`Error renaming ${currentName}: ${e.message}`);
                        }
                    } else {
                        Logger.log(`Skipping ${currentName} (Already matches new name)`);
                    }
                    
                    // Stop checking other rules for this file once a match is found
                    break; 
                }
            }
        }
    } catch (e) {
        Logger.log(`Error accessing folder ${folderId}: ${e.message}`);
    }
}

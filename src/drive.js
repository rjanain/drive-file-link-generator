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

    let stats = {
        filesCount: 0,
        renameCount: 0
    };

    try {
        const rootFolder = DriveApp.getFolderById(folderId);
        processFolderRecursively(rootFolder, rules, spreadsheet, stats);

        Logger.log(`Finished processing folder tree. Total files scanned: ${stats.filesCount}. Total files renamed: ${stats.renameCount}.`);

    } catch (e) {
        Logger.log(`Error accessing root folder ${folderId}: ${e.message}`);
    }
}

/**
 * Recursive helper function to process a folder and its subfolders.
 * @param {GoogleAppsScript.Drive.Folder} folder - The folder to process.
 * @param {Array} rules - Renaming rules.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet for logging.
 * @param {Object} stats - Statistics object {filesCount, renameCount}.
 */
function processFolderRecursively(folder, rules, spreadsheet, stats) {
    try {
        // Process files in the current folder
        const files = folder.getFiles();

        while (files.hasNext()) {
            const file = files.next();
            stats.filesCount++;
            const currentName = file.getName();

            // Filter by file type if configured
            if (config.targetFileType && !currentName.toLowerCase().endsWith(`.${config.targetFileType.toLowerCase()}`)) {
                continue;
            }

            for (const rule of rules) {
                if (currentName.includes(rule.searchId)) {

                    const extensionMatch = currentName.match(/\.[^/.]+$/);
                    const extension = extensionMatch ? extensionMatch[0] : "";

                    const newNameBase = rule.newName;
                    const finalNewName = newNameBase.endsWith(extension) ? newNameBase : newNameBase + extension;

                    if (currentName !== finalNewName) {
                        try {
                            file.setName(finalNewName);
                            logRenamingResult(spreadsheet, currentName, finalNewName, file.getId(), "Success");
                            Logger.log(`Renamed: ${currentName} -> ${finalNewName}`);
                            stats.renameCount++;
                        } catch (e) {
                            logRenamingResult(spreadsheet, currentName, finalNewName, file.getId(), "Error: " + e.message);
                            Logger.log(`Error renaming ${currentName}: ${e.message}`);
                        }
                    } else {
                        Logger.log(`Skipping ${currentName} (Already matches new name)`);
                    }
                    break;
                }
            }
        }

        // Recursively process subfolders
        const subfolders = folder.getFolders();
        while (subfolders.hasNext()) {
            const subfolder = subfolders.next();
            processFolderRecursively(subfolder, rules, spreadsheet, stats);
        }

    } catch (e) {
        Logger.log(`Error accessing folder ${folder.getName()}: ${e.message}`);
    }
}


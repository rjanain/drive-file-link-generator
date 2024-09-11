const config = {
    parentFolderId: "1qjhoFSfZ82YINe-TOEq8EXDLHRYwv3sY", // Replace Your Google Drive ID
    storageSheetId: "1R6qJdluzar_SwbQfGkKRoQDzv3uxWa9DqLAuxQwujgQ", // Replace Your Google Sheet ID
    sheetNames: {
      dataTrack: "DriveFile",
      links: "AnswerScriptLink"
    },
    headers: {
      dataTrack: ["Folder Name", "Folder ID", "Processed", "Processed Date", "Processed Note"],
      links: ["Folder Name", "File Name", "File URL", "File Owner", "Link Generated On"]
    }
  };
  
  
  /*
  * Some Test
  * Remove the extension of a filename that appears after a period (.).
  * Remove any string that appears before and including an underscore (_).
  * =REGEXREPLACE(A1, "(.*_)?(.+?)(\..*)?", "$2")
  */
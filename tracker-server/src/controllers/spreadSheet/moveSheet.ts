import { google } from "googleapis";
import { googleAuth } from "./googleApiTypes";

export const moveSpreadsheetFromRoot = (
  auth: googleAuth,
  spreadSheetId: string,
  parent: string,
) =>
  new Promise((resolve, reject) => {
    const drive = google.drive("v3");
    drive.files.update(
      {
        auth,
        fileId: spreadSheetId,
        addParents: parent,
        removeParents: "root",
      },
      (err) => {
        if (err) reject(err);
        resolve("Success");
      },
    );
  });

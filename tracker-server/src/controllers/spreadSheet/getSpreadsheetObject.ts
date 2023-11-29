import { google } from "googleapis";
import { GaxiosResponse } from "googleapis-common";
import { googleAuth, Schema$Spreadsheet } from "./googleApiTypes";
export const getSpreadsheetObject = (auth: googleAuth, spreadsheetId: string) =>
  new Promise<Schema$Spreadsheet>((resolve, reject) => {
    const sheets = google.sheets("v4");

    sheets.spreadsheets.get(
      {
        auth,
        spreadsheetId,
      },
      (
        err: Error | null,
        googleapires: GaxiosResponse<Schema$Spreadsheet> | null | undefined,
      ) => {
        if (err) reject(err);
        if (!googleapires || !googleapires.data)
          reject("Something went wrong.");
        else {
          resolve(googleapires.data);
        }
      },
    );
  });

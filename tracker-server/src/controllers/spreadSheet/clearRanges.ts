import { google } from "googleapis";
import { googleAuth } from "./googleApiTypes";

export const clearRanges = (
  auth: googleAuth,
  spreadsheetId: string,
  ranges: string[],
) =>
  new Promise((resolve, reject) => {
    const sheets = google.sheets("v4");
    sheets.spreadsheets.values.batchClear(
      {
        auth,
        spreadsheetId,
        requestBody: {
          ranges,
        },
      },
      (err: Error | null) => {
        if (err) reject(err);
        else resolve("Success");
      },
    );
  });

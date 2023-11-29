import { google } from "googleapis";
import { googleAuth, Schema$Request } from "./googleApiTypes";

export const performInitialUpdates = (
  auth: googleAuth,
  spreadsheetId: string,
  requests: Schema$Request[],
) =>
  new Promise((resolve, reject) => {
    const sheets = google.sheets("v4");
    sheets.spreadsheets.batchUpdate(
      {
        auth,
        spreadsheetId,
        requestBody: {
          requests,
        },
      },
      (err: Error | null) => {
        if (err) reject(err);
        else resolve("Success");
      },
    );
  });

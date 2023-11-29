import { google } from "googleapis";
import { GaxiosResponse } from "googleapis-common";
import { googleAuth, Schema$File } from "./googleApiTypes";
export const getLink = (auth: googleAuth, fileId: string) =>
  new Promise((resolve, reject) => {
    const drive = google.drive("v3");
    drive.files.get(
      {
        auth,
        fileId,
        fields: "webViewLink",
      },
      (
        err: Error | null,
        googleapires: GaxiosResponse<Schema$File> | null | undefined,
      ) => {
        if (err) reject(err);
        if (
          !googleapires ||
          !googleapires.data ||
          !googleapires.data.webViewLink
        )
          reject("Something went wrong.");
        else {
          resolve(googleapires.data.webViewLink);
        }
      },
    );
  });

import { google } from "googleapis";
import { GaxiosResponse } from "googleapis-common";
import { googleAuth, Schema$File } from "./googleApiTypes";
export const createFolder = (
  auth: googleAuth,
  name: string,
  parents: string[],
) =>
  new Promise<string>((resolve, reject) => {
    const drive = google.drive("v3");
    const fileMetadata = {
      name,
      parents,
      mimeType: "application/vnd.google-apps.folder",
    };
    drive.files.create(
      {
        auth,
        requestBody: fileMetadata,
        fields: "id",
      },
      (
        err: Error | null,
        googleapires: GaxiosResponse<Schema$File> | null | undefined,
      ) => {
        if (err) reject(err);
        if (!googleapires || !googleapires.data || !googleapires.data.id)
          reject("Something went wrong.");
        else {
          resolve(googleapires.data.id);
        }
      },
    );
  });

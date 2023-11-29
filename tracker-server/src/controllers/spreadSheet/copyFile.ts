import { google } from "googleapis";
import { GaxiosResponse } from "googleapis-common";
import { googleAuth, Schema$File } from "./googleApiTypes";
export const copyFile = (
  auth: googleAuth,
  fileId: string,
  parents: string[],
  name?: string,
) =>
  new Promise<string>((resolve, reject) => {
    const drive = google.drive("v3");
    const fileMetadata = {
      name,
      parents,
    };
    drive.files.copy(
      {
        auth,
        requestBody: fileMetadata,
        fileId,
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

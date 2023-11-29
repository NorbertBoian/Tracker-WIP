import { google } from "googleapis";
import { GaxiosResponse } from "googleapis-common";
import { googleAuth, Schema$Project } from "./googleApiTypes";
export const createAppScriptProject = (
  auth: googleAuth,
  spreadsheetId: string,
  title = "TimeTracker",
) =>
  new Promise<string>((resolve, reject) => {
    const script = google.script("v1");

    script.projects.create(
      {
        auth,
        requestBody: {
          title,
          parentId: spreadsheetId,
        },
      },
      (
        err: Error | null,
        googleapires: GaxiosResponse<Schema$Project> | null | undefined,
      ) => {
        if (err) reject(err);
        if (!googleapires || !googleapires.data || !googleapires.data.scriptId)
          reject("Something went wrong.");
        else {
          resolve(googleapires.data.scriptId);
        }
      },
    );
  });

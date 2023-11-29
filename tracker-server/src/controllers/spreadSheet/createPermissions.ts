import { google } from "googleapis";
import { googleAuth } from "./googleApiTypes";
export const createPermissions = (auth: googleAuth, fileId: string) =>
  new Promise((resolve, reject) => {
    const drive = google.drive("v3");
    drive.permissions.create(
      {
        auth,
        fileId,
        requestBody: {
          type: "user",
          role: "writer",
          emailAddress: process.env.GOOGLE_API_CLIENT_EMAIL,
        },
      },
      (err: Error | null) => {
        if (err) reject("The API returned an error.");
        drive.permissions.create(
          {
            auth,
            fileId,
            requestBody: {
              type: "anyone",
              role: "reader",
            },
          },
          (err: Error | null) => {
            if (err) reject("The API returned an error.");
            resolve("Succes");
          },
        );
      },
    );
  });

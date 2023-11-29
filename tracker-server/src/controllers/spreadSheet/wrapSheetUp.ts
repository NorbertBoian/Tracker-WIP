import { Response } from "express";
import { clearRanges } from "./clearRanges";
import { createAppScriptProject } from "./createAppScriptProject";
import { createPermissions } from "./createPermissions";
import { OAuth2ClientType, Schema$Request } from "./googleApiTypes";
import { performInitialUpdates } from "./performInitialUpdates";
import { updateAppScriptContent } from "./updateAppScriptContent";

export const wrapSheetUp = async (
  OAuth2Client: OAuth2ClientType,
  monthSpreadsheetId: string,
  rangesToBeCleared: string[],
  initialUpdatesRequests: Schema$Request[],
  streamClient?: Response<any, Record<string, any>>,
) => {
  if (streamClient) streamClient.write("data: permissions\n\n");
  await createPermissions(OAuth2Client, monthSpreadsheetId);
  if (streamClient) streamClient.write("data: clearSheet\n\n");
  await clearRanges(OAuth2Client, monthSpreadsheetId, rangesToBeCleared);
  if (streamClient) streamClient.write("data: initialUpdates\n\n");
  await performInitialUpdates(
    OAuth2Client,
    monthSpreadsheetId,
    initialUpdatesRequests,
  );
  if (streamClient) streamClient.write("data: createScript\n\n");
  const scriptId = await createAppScriptProject(
    OAuth2Client,
    monthSpreadsheetId,
    `${monthSpreadsheetId}_script`,
  );
  if (streamClient) streamClient.write("data: updateScript\n\n");
  await updateAppScriptContent(OAuth2Client, scriptId);
};

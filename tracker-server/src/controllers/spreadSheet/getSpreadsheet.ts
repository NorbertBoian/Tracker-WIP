import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { webcrypto as crypto } from "node:crypto";
import { google } from "googleapis";
import { languageCodeType, monthNumberType } from "../../constants";
import { disabledDaysType, requiredHoursType } from "../../types/knex";
import { IDate } from "../../utils/getEmptyDatesArray";
import { userDefaultDaysColorsType } from "../updateUserSettings";
import { searchFile } from "./searchFile";
import { createFolder } from "./createFolder";
import { createSheet } from "./createSheet";
import { getLink } from "./getLink";
import { moveSpreadsheetFromRoot } from "./moveSheet";
import { updateSpreadsheetData } from "./updateSpreadsheetData";
import { wrapSheetUp } from "./wrapSheetUp";
import { capitalize } from "../../utils/capitalize";

const rootFolder = "1zEarPcjB1Vn4_T-6Qv3SxPxAVWphECHg" as const;

interface IExpectedReqBody {
  hourlyRate: string;
  overtimeMultiplier: string;
  displayedCurrency: string;
  preferredLanguage: languageCodeType;
  month: monthNumberType;
  year: number;
  requiredHours: requiredHoursType;
  disabledDays: disabledDaysType;
  weekdaysColors: Required<userDefaultDaysColorsType>;
  filteredDates: IDate[];
  streamClientId?: string;
}

const abortIfCancelled = (
  streamClientIds: Map<
    string,
    { response: Response; lastGetSpreadsheetRequest?: Request }
  >,
  req: Request<{ [key: string]: string }, any, IExpectedReqBody>,
  abortController: AbortController,
  streamClientId?: string,
) => {
  if (
    streamClientId &&
    streamClientIds.get(streamClientId)?.lastGetSpreadsheetRequest !== req
  ) {
    abortController.abort();
  } else if (!abortController.signal.aborted)
    setTimeout(
      () =>
        abortIfCancelled(streamClientIds, req, abortController, streamClientId),
      50,
    );
};

export const getSpreadsheet = async (
  req: Request<{ [key: string]: string }, any, IExpectedReqBody>,
  res: Response<any>,
  streamClientIds: Map<
    string,
    { response: Response; lastGetSpreadsheetRequest?: Request }
  >,
) => {
  const abortController = new AbortController();
  const { signal } = abortController;
  try {
    const {
      hourlyRate,
      overtimeMultiplier,
      displayedCurrency,
      preferredLanguage,
      month,
      year,
      requiredHours,
      disabledDays,
      weekdaysColors,
      filteredDates,
      streamClientId,
    } = req.body;

    const streamClient = streamClientIds.get(streamClientId ?? "")?.response;
    if (streamClient && !signal.aborted)
      streamClientIds.set(streamClientId ?? "", {
        response: streamClient,
        ...streamClientIds.get(streamClientId ?? ""),
        lastGetSpreadsheetRequest: req,
      });

    abortIfCancelled(streamClientIds, req, abortController, streamClientId);

    const localizedMonthName = capitalize(
      Intl.DateTimeFormat(preferredLanguage, {
        month: "long",
      }).format(new Date(`${month + 1}`)),
    );
    const { userId, guestId } = req.session;
    const uniqueId = userId ? userId : guestId ? guestId : crypto.randomUUID();
    if (!req.session.guestId && !req.session.userId)
      req.session.guestId = uniqueId;

    const jwtClient = new google.auth.JWT(
      process.env.GOOGLE_API_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_API_PRIVATE_KEY,
      [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    );
    if (signal.aborted) throw new Error("cancelled");
    const OAuth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    });
    if (signal.aborted) throw new Error("cancelled");
    OAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_OAUTH2_REFRESH_TOKEN,
    });
    if (streamClient && !signal.aborted)
      streamClient.write("data: searchFolder\n\n");
    if (signal.aborted) throw new Error("cancelled");
    const usersFoldersMeta = await searchFile({
      auth: OAuth2Client,
      parentId: rootFolder,
      fields: ["id", "name"],
    });
    if (signal.aborted) throw new Error("cancelled");
    const userFolderMeta = usersFoldersMeta.find((userFolderMeta) => {
      if (!userFolderMeta.name) return false;
      return bcrypt.compareSync(uniqueId, userFolderMeta.name);
    });

    const userFolderId = userFolderMeta ? userFolderMeta.id : undefined;

    if (!userFolderId) {
      const salt = await bcrypt.genSalt(11);
      const hashedUniqueId = await bcrypt.hash(uniqueId, salt);
      if (streamClient && !signal.aborted)
        streamClient.write("data: createFolder\n\n");
      if (signal.aborted) throw new Error("cancelled");
      const userFolderId = await createFolder(OAuth2Client, hashedUniqueId, [
        rootFolder,
      ]);
      if (streamClient && !signal.aborted)
        streamClient.write("data: createSheet\n\n");
      if (signal.aborted) throw new Error("cancelled");
      const {
        sheetId: monthSpreadsheetId,
        initialUpdatesRequests,
        rangesToBeCleared,
      } = await createSheet(
        `${localizedMonthName} ${year}`,
        OAuth2Client,
        hourlyRate,
        overtimeMultiplier,
        displayedCurrency,
        preferredLanguage,
        month,
        year,
        requiredHours,
        disabledDays,
        weekdaysColors,
        filteredDates,
      );
      if (streamClient && !signal.aborted)
        streamClient.write("data: moveSheet\n\n");
      if (signal.aborted) throw new Error("cancelled");
      moveSpreadsheetFromRoot(OAuth2Client, monthSpreadsheetId, userFolderId);
      if (streamClient && !signal.aborted)
        streamClient.write("data: getLink\n\n");
      if (signal.aborted) throw new Error("cancelled");
      const link = await getLink(OAuth2Client, monthSpreadsheetId);
      if (signal.aborted) throw new Error("cancelled");
      await wrapSheetUp(
        OAuth2Client,
        monthSpreadsheetId,
        rangesToBeCleared,
        initialUpdatesRequests,
        streamClient,
      );
      if (signal.aborted) throw new Error("cancelled");
      res.json(link);
      if (streamClient && !signal.aborted)
        streamClient.write("data: finished\n\n");
      abortController.abort();
      return;
    } else {
      if (streamClient && !signal.aborted)
        streamClient.write("data: searchFile\n\n");
      if (signal.aborted) throw new Error("cancelled");
      const monthSheetId = await searchFile({
        auth: OAuth2Client,
        parentId: userFolderId,
        fields: "id",
        onlyFirstPage: true,
        pageSize: 1,
        mimeType: "application/vnd.google-apps.spreadsheet",
      });

      if (monthSheetId[0]) {
        if (streamClient && !signal.aborted)
          streamClient.write("data: updateSpreadsheet\n\n");
        if (signal.aborted) throw new Error("cancelled");
        await updateSpreadsheetData({
          auth: OAuth2Client,
          spreadsheetId: monthSheetId[0],
          title: `${localizedMonthName} ${year}`,
          hourlyRate,
          overtimeMultiplier,
          displayedCurrency,
          preferredLanguage,
          month,
          year,
          requiredHours,
          disabledDays,
          weekdaysColors,
          filteredDates,
        });

        if (streamClient && !signal.aborted)
          streamClient.write("data: getLink\n\n");
        if (signal.aborted) throw new Error("cancelled");
        const link = await getLink(OAuth2Client, monthSheetId[0]);
        if (signal.aborted) throw new Error("cancelled");
        res.json(link);
        if (streamClient && !signal.aborted)
          streamClient.write("data: finished\n\n");
        abortController.abort();
        return;
      } else {
        if (streamClient && !signal.aborted)
          streamClient.write("data: createSheet\n\n");
        if (signal.aborted) throw new Error("cancelled");
        const {
          sheetId: monthSpreadsheetId,
          initialUpdatesRequests,
          rangesToBeCleared,
        } = await createSheet(
          `${localizedMonthName} ${year}`,
          OAuth2Client,
          hourlyRate,
          overtimeMultiplier,
          displayedCurrency,
          preferredLanguage,
          month,
          year,
          requiredHours,
          disabledDays,
          weekdaysColors,
          filteredDates,
        );

        if (streamClient && !signal.aborted)
          streamClient.write("data: moveSheet\n\n");
        if (signal.aborted) throw new Error("cancelled");
        moveSpreadsheetFromRoot(OAuth2Client, monthSpreadsheetId, userFolderId);

        if (streamClient && !signal.aborted)
          streamClient.write("data: getLink\n\n");
        if (signal.aborted) throw new Error("cancelled");
        const link = await getLink(OAuth2Client, monthSpreadsheetId);
        await wrapSheetUp(
          OAuth2Client,
          monthSpreadsheetId,
          rangesToBeCleared,
          initialUpdatesRequests,
        );
        if (signal.aborted) throw new Error("cancelled");
        res.json(link);
        if (streamClient && !signal.aborted)
          streamClient.write("data: finished\n\n");
        abortController.abort();
        return;
      }
    }
  } catch (err) {
    abortController.abort();
    return res.status(400).json(err);
  }
};

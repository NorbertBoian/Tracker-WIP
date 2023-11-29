import { drive_v3, sheets_v4 } from "googleapis";
import { script_v1 } from "googleapis";
import {
  BaseExternalAccountClient,
  Compute,
  GoogleAuth,
  JWT,
  OAuth2Client,
  UserRefreshClient,
} from "googleapis-common";

export type Schema$FileList = drive_v3.Schema$FileList;

export type Schema$File = drive_v3.Schema$File;

export type Schema$Project = script_v1.Schema$Project;

export type Schema$Content = script_v1.Schema$Content;

export type Schema$Deployment = script_v1.Schema$Deployment;

export type Schema$Spreadsheet = sheets_v4.Schema$Spreadsheet;

export type Schema$Sheet = sheets_v4.Schema$Sheet;

export type Schema$CellData = sheets_v4.Schema$CellData;

export type Schema$GridRange = sheets_v4.Schema$GridRange;

export type Schema$Request = sheets_v4.Schema$Request;

export type Schema$NamedRange = sheets_v4.Schema$NamedRange;

export type Schema$ExtendedValue = sheets_v4.Schema$ExtendedValue;

export type OAuth2ClientType = OAuth2Client;

export type JWTClientType = JWT;

export type Schema$ConditionalFormatRule =
  sheets_v4.Schema$ConditionalFormatRule;

export type googleAuth =
  | string
  | OAuth2Client
  | JWT
  | Compute
  | UserRefreshClient
  | BaseExternalAccountClient
  | GoogleAuth;

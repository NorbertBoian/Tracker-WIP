import { google } from "googleapis";
import { GaxiosResponse } from "googleapis-common";
import { googleAuth, Schema$File, Schema$FileList } from "./googleApiTypes";

interface IParameters {
  auth: googleAuth;
  parentId?: string;
  name?: string;
  mimeType?: string;
  pageSize?: number;
  onlyFirstPage?: boolean;
}

type searchFileOverloads = {
  <T extends keyof Schema$File>(parameters: IParameters): Promise<
    Schema$File[]
  >;
  <T extends keyof Schema$File>(
    parameters: IParameters & { fields: T | [T] },
  ): Promise<Required<Schema$File>[T][]>;
  <T extends keyof Schema$File>(
    parameters: IParameters & { fields: T[] },
  ): Promise<Required<Pick<Schema$File, T>>[]>;
};

export const searchFile: searchFileOverloads = async <
  T extends keyof Schema$File,
>({
  auth,
  parentId,
  fields,
  name,
  mimeType,
  pageSize,
  onlyFirstPage,
}: IParameters & { fields?: T | T[] }) => {
  const fieldsArray = fields
    ? Array.isArray(fields)
      ? fields
      : [fields]
    : undefined;

  const search = (pageToken?: string) =>
    new Promise<Schema$FileList>((resolve, reject) => {
      const drive = google.drive("v3");

      const queryStrings = [
        ...(name ? [`name='${name}`] : []),
        ...(mimeType ? [`mimeType='${mimeType}'`] : []),
        ...(parentId ? [`'${parentId}' in parents`] : []),
        ["trashed=false"],
      ];

      const query = queryStrings.join(" and ");

      drive.files.list(
        {
          q: query,
          auth,
          fields: `files${
            fieldsArray ? `(${fieldsArray.join(",")})` : ""
          },nextPageToken`,
          ...{
            ...(pageSize ? { pageSize } : {}),
            ...(pageToken ? { pageToken } : {}),
          },
        },
        (
          err: Error | null,
          googleapires: GaxiosResponse<Schema$FileList> | null | undefined,
        ) => {
          if (err || !googleapires) reject(err);
          else {
            resolve(googleapires.data);
          }
        },
      );
    });

  const result:
    | Schema$File[]
    | Required<Schema$File>[T][]
    | Required<Pick<Schema$File, T>>[] = [];

  const data = await search();

  if (data.files === undefined) throw "Something went wrong.";

  for (const file of data.files) {
    if (fieldsArray && fieldsArray.length === 1) {
      const field = fieldsArray[0];
      result.push(file[field] as any);
    } else {
      result.push(file as any);
    }
  }

  let nextPageToken = data.nextPageToken;

  if (!onlyFirstPage) {
    while (nextPageToken !== undefined && nextPageToken !== null) {
      const response = await search(nextPageToken);
      nextPageToken = response.nextPageToken;
      if (response.files) {
        for (const file of data.files) {
          if (fieldsArray && fieldsArray.length === 1) {
            const field = fieldsArray[0];
            result.push(file[field] as any);
          } else {
            result.push(file as any);
          }
        }
      }
    }
  }

  return result;
};

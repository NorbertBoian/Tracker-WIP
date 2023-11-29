import { Request, Response } from "express";

export const updateStreamClientIds = (
  req: Request,
  res: Response,
  streamClientIds: Map<
    string,
    { response: Response; lastGetSpreadsheetRequest?: Request }
  >,
) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);
  const { s: streamClientId } = req.query;
  if (typeof streamClientId === "string") {
    streamClientIds.set(streamClientId, {
      lastGetSpreadsheetRequest: undefined,
      ...streamClientIds.get(streamClientId),
      response: res,
    });
  }

  req.on("close", () => {
    if (typeof streamClientId === "string") {
      streamClientIds.delete(streamClientId);
    }
  });
};

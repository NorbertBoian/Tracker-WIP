import { Schema$Sheet } from "./googleApiTypes";
import { en } from "./localization/en";
import { ro } from "./localization/ro";

export const getLocalizationSheet = () => {
  const languages = [en, ro];

  const rowData: {
    values: {
      userEnteredValue: {
        stringValue: (typeof en | typeof ro)[keyof typeof en];
      };
      userEnteredFormat: {
        textFormat: {
          foregroundColor: {
            red: 0;
            green: 0;
            blue: 0;
          };
        };
      };
    }[];
  }[] = [];

  for (const string in en) {
    const castedString = string as keyof typeof en;
    const row = languages.map((language) => ({
      userEnteredValue: { stringValue: language[castedString] },
      dataValidation: {
        condition: {
          type: "TEXT_EQ",
          values: [
            {
              userEnteredValue: language[castedString],
            },
          ],
        },
        strict: true,
      },
      userEnteredFormat: {
        textFormat: {
          foregroundColor: { red: 0, green: 0, blue: 0 } as const,
        },
        horizontalAlignment: "CENTER",
        verticalAlignment: "MIDDLE",
      },
    }));
    rowData.push({ values: row });
  }

  const columnCount = rowData[0].values.length;
  const rowCount = rowData.length;

  const localizationSheetRequests = [
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: 5,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: columnCount,
        },
      },
    },
  ];

  const localizationSheet: Schema$Sheet = {
    properties: {
      title: "Localization",
      sheetType: "GRID",
      sheetId: 5,
      gridProperties: {
        columnCount,
        hideGridlines: false,
        rowCount,
      },
      hidden: true,
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData,
      },
    ],
    protectedRanges: [{ range: { sheetId: 5 } }],
  };

  return {
    localizationSheet,
    localizationSheetRequests,
  };
};

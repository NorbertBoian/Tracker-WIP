import { readFile } from "node:fs/promises";
import { google } from "googleapis";
import { googleAuth, Schema$Content } from "./googleApiTypes";
import { GaxiosResponse } from "googleapis-common";
import { resolve } from "node:path";

export const updateAppScriptContent = async (
  auth: googleAuth,
  scriptId: string,
) => {
  // const scriptSource = await readFile(
  //   resolve("./src/controllers/spreadsheet/updateDaysNamesColors.js"),
  //   {
  //     encoding: "utf8",
  //   },
  // );
  const scriptSource = `const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const sheets = spreadsheet.getSheets();
const inputSheet = sheets[0];
const statsSheet = sheets[1];
const monthSettingsSheet = sheets[3];
const weekdaysColorsCells = monthSettingsSheet
  .getNamedRanges()
  .filter(
    (namedRange) => namedRange.getName().slice(0, -1) === "weekdayColor_0",
  )
  .sort((a, b) => (a.getName() < b.getName() ? -1 : 1))
  .map((namedRange) => namedRange.getRange());
const updateColorsCheckboxRange = monthSettingsSheet
  .getNamedRanges()
  .find((namedRange) => namedRange.getName() === "updateColorsCheckbox")
  .getRange();

const weekdaysColors = weekdaysColorsCells.map((weekdayColorCell) =>
  weekdayColorCell.getBackground(),
);
const updateDaysNamesColors = () => {
  const weekdaysColors = weekdaysColorsCells.map((weekdayColorCell) =>
    weekdayColorCell.getBackground(),
  );

  const inputRules = inputSheet.getConditionalFormatRules();
  const inputDayColorRules = inputRules.filter(
    (inputRule) => inputRule.getRanges().length === 31,
  );
  const updatedInputDayColorRules = inputDayColorRules.map(
    (inputDayColorRule, index) =>
      inputDayColorRule
        .copy()
        .setFontColor(weekdaysColors[index])
        .whenFormulaSatisfied(
          \`=MATCH(INDIRECT("RC",FALSE), INDIRECT("Computed!$B$40"):INDIRECT("Computed!$B$46"),0)=\${
            index + 1
          }\`,
        )
        .build(),
  );
  const updatedInputRules = [
    ...inputRules.filter((inputRule) => inputRule.getRanges().length !== 31),
    ...updatedInputDayColorRules,
  ];
  inputSheet.setConditionalFormatRules(updatedInputRules);

  const statsRules = statsSheet.getConditionalFormatRules();
  const statsDayColorRules = statsRules.filter(
    (statsRule) => statsRule.getRanges().length === 31,
  );
  const updatedStatsDayColorRules = statsDayColorRules.map(
    (statsDayColorRule, index) =>
      statsDayColorRule
        .copy()
        .setFontColor(weekdaysColors[index])
        .whenFormulaSatisfied(
          \`=MATCH(INDIRECT("RC",FALSE), INDIRECT("Computed!$B$40"):INDIRECT("Computed!$B$46"),0)=\${
            index + 1
          }\`,
        )
        .build(),
  );
  const updatedStatsRules = [
    ...statsRules.filter((statsRule) => statsRule.getRanges().length !== 31),
    ...updatedStatsDayColorRules,
  ];
  statsSheet.setConditionalFormatRules(updatedStatsRules);
};

function onOpen() {
  updateDaysNamesColors();
}

function onEdit(e) {
  const range = e.range;
  if (
    range.getCell(1, 1).getDataSourceUrl() ===
      updateColorsCheckboxRange.getCell(1, 1).getDataSourceUrl() &&
    range.isChecked()
  ) {
    updateDaysNamesColors();
    range.setValue(false);
  }
}
`;

  // const manifestSource = await readFile(
  //   resolve("./src/controllers/spreadsheet/appsscript.json"),
  //   {
  //     encoding: "utf8",
  //   },
  // );

  const manifestSource = `{
  "timeZone": "Europe/Bucharest",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}`;

  return new Promise<string>((resolve, reject) => {
    const script = google.script("v1");

    script.projects.updateContent(
      {
        auth,
        scriptId,
        requestBody: {
          files: [
            {
              name: "updateDaysNamesColors",
              type: "SERVER_JS",
              source: scriptSource,
            },
            {
              name: "appsscript",
              type: "JSON",
              source: manifestSource,
            },
          ],
        },
      },
      (
        err: Error | null,
        googleapires: GaxiosResponse<Schema$Content> | null | undefined,
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
};

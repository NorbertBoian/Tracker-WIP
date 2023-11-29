import defaultClasses from "./DaySettingsBar.module.css";
type combinedClasses = typeof defaultClasses;
type combinedClassesKey = keyof combinedClasses;
type combinedClassesWithoutFocused = Omit<typeof defaultClasses, "focused">;
type combinedClassesKeyWithoutFocused = keyof combinedClassesWithoutFocused;

export const getJoinedClasses = (
  combinedClasses: combinedClassesWithoutFocused,
) => {
  const combinedClassesKeys = Object.keys(
    combinedClasses,
  ) as combinedClassesKeyWithoutFocused[];

  const getClasses = (string: string) => {
    const filteredClassesKeys = combinedClassesKeys.filter((key) =>
      key.includes(string),
    );
    const classes = filteredClassesKeys.reduce((prevClasses, classKey) => {
      const cssClass = combinedClasses[classKey];
      return `${cssClass} ${prevClasses}`;
    }, "");
    return classes;
  };

  const hourRequirementsColumnClasses = getClasses("hourRequirementsColumn");
  const dayNameClasses = getClasses("dayName");
  const requiredHoursInputClasses = getClasses("requiredHoursInput");
  const toggleDayButtonClasses = getClasses("toggleDayButton");
  const daySettingsDividerClasses = getClasses("daySettingsDivider");

  const joinedClasses = {
    hourRequirementsColumnClasses,
    dayNameClasses,
    requiredHoursInputClasses,
    toggleDayButtonClasses,
    daySettingsDividerClasses,
  };

  return joinedClasses;
};

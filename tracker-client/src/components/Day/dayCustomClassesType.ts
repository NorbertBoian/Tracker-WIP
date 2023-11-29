import { dayParentCustomClassesType } from "./Day";
import { customClasssesType as dayTimeInputsCustomClassesType } from "./DayTimeInputs/DayTimeInputs";
import { customClasssesType as dayTimeInputCustomClassesType } from "./DayTimeInput/DayTimeInput";
import { customClasssesType as daySettingsCustomClassesType } from "./DaySettings/DaySettings";
import { customClasssesType as dayStatsCustomClassesType } from "./DayStats/DayStats";
import { customClasssesType as dayStatusIndicatorCustomClassesType } from "./DayStatusIndicator/DayStatusIndicator";
import { customClasssesType as dayFirstRowCustomClassesType } from "./DayFirstRow/DayFirstRow";
import { customClasssesType as daySecondRowCustomClassesType } from "./DaySecondRow/DaySecondRow";

export interface IDayCustomClasses {
  dayClasses?: dayParentCustomClassesType;
  dayTimeInputClasses?: dayTimeInputCustomClassesType;
  dayTimeInputsClasses?: dayTimeInputsCustomClassesType;
  daySettingsClasses?: daySettingsCustomClassesType;
  dayStatsClasses?: dayStatsCustomClassesType;
  dayStatusIndicatorClasses?: dayStatusIndicatorCustomClassesType;
  dayFirstRowClasses?: dayFirstRowCustomClassesType;
  daySecondRowClasses?: daySecondRowCustomClassesType;
}

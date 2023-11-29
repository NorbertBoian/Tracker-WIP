import { IDate } from "../../utils/getEmptyDatesArray";
import { Schema$ExtendedValue } from "./googleApiTypes";

export const getTimesValues = (date: IDate | undefined) => {
  let began: Schema$ExtendedValue = {
    numberValue: 0,
  };
  let ended: Schema$ExtendedValue = {
    numberValue: 0,
  };
  if (date?.beganString.length === 5) {
    const [hours, minutes] = date.beganString.split(":");
    const days = (+hours + +minutes / 60) / 24;
    began = { numberValue: days };
  } else if (date?.beganString.length) {
    began = { stringValue: date.beganString };
  }
  if (date?.endedString.length === 5) {
    const [hours, minutes] = date.endedString.split(":");
    const days = (+hours + +minutes / 60) / 24;
    ended = { numberValue: days };
  } else if (date?.beganString.length) {
    ended = { stringValue: date.endedString };
  }

  return [began, ended];
};

import { useAppSelector } from "../../../../store";
import { Explanations } from "../../../Shared/Explanations/Explanations";
import customClasses from "./MonthSettingsExplanations.module.css";

export const MonthSettingsExplanations = () => {
  const { hourRequirementsExplanation, enableDisableDaysExplanation } =
    useAppSelector((state) => state.main.languageObject.data);

  const columnsContents = [
    hourRequirementsExplanation,
    enableDisableDaysExplanation,
  ];

  return (
    <Explanations
      columnsContents={columnsContents}
      customClasses={customClasses}
    ></Explanations>
  );
};

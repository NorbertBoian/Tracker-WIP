import { useAppSelector } from "../../../../store";
import { Explanations } from "../../../Shared/Explanations/Explanations";
import customClasses from "./ExplanationsSection.module.css";

export const ExplanationsSection = () => {
  const { hourRequirementsExplanation, enableDisableDaysExplanation } =
    useAppSelector((state) => state.applicationSettings.languageObject.data);

  const columnsContents = [
    hourRequirementsExplanation,
    enableDisableDaysExplanation,
  ];
  return (
    <Explanations
      columnsContents={columnsContents}
      customClasses={customClasses}
    />
  );
};

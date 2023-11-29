import { Explanations } from "../../../Shared/Explanations/Explanations";
import generalCustomClasses from "./generalCustomClasses.module.css";
import colorsCustomClasses from "./colorsCustomClasses.module.css";
import daysCustomClasses from "./daysCustomClasses.module.css";
import { useAppSelector } from "../../../../store";
import sharedClasses from "./ExplanationsSection.module.css";

interface IProps {
  selectedMobileMenu: "colors" | "general" | "days";
  explanationsSectionRef: React.MutableRefObject<HTMLDivElement | null>;
}

const customClasses = {
  days: { ...sharedClasses, ...daysCustomClasses },
  colors: { ...sharedClasses, ...colorsCustomClasses },
  general: { ...sharedClasses, ...generalCustomClasses },
};

export const ExplanationsSection = ({
  selectedMobileMenu,
  explanationsSectionRef,
}: IProps) => {
  const {
    hourRequirementsExplanation,
    enableDisableDaysExplanation,
    defaultColorExplanation,
    dayDisplayColorExplanation,
  } = useAppSelector((state) => state.applicationSettings.languageObject.data);

  const columnsContents = [
    hourRequirementsExplanation,
    enableDisableDaysExplanation,
    defaultColorExplanation,
    dayDisplayColorExplanation,
  ];

  return (
    <Explanations
      explanationsRef={explanationsSectionRef}
      columnsContents={columnsContents}
      customClasses={customClasses[selectedMobileMenu]}
    />
  );
};

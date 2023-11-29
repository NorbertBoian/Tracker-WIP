import { Fragment } from "react";
import defaultClasses from "./Explanations.module.css";

interface IProps {
  columnsContents: string[];
  customClasses?: Partial<typeof defaultClasses>;
  explanationsRef?: React.MutableRefObject<HTMLDivElement | null>;
}
export const Explanations = ({
  columnsContents,
  customClasses = {},
  explanationsRef,
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    explanationsContainer,
    explanationsContainerOther,
    explanationsComponent,
    columnDivider,
    explanationText,
    columnDividerColor,
    columnDividerOther,
    explanationTextContainer,
    explanationTextContainerOther,
  } = combinedClasses;

  return (
    <div
      aria-hidden={true}
      className={explanationsComponent}
      {...(explanationsRef ? { ref: explanationsRef } : {})}
    >
      <div className={`${explanationsContainer} ${explanationsContainerOther}`}>
        {columnsContents.map((columnContent, index) => (
          <Fragment key={index}>
            <div
              className={`${explanationTextContainer} ${explanationTextContainerOther}`}
            >
              <div className={explanationText}>{columnContent}</div>
            </div>
            {index < columnsContents.length - 1 ? (
              <div
                className={`${columnDivider} ${columnDividerColor} ${columnDividerOther}`}
              ></div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

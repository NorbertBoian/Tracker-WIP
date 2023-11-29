import { useRef, useEffect } from "react";
import { scrollToChild } from "../../../../utils/scrollToChild";

interface IProps {
  active: boolean;
  scrollEnabled: boolean;
  sFocusedClass: string;
  children: JSX.Element;
  [key: string]: unknown;
}

export const MimicFocus = (props: IProps) => {
  const { active, scrollEnabled, sFocusedClass, ...elementProps } = props;
  const childRef = useRef<HTMLElement | null>(null);

  const handleScroll = () => {
    if (childRef.current) scrollToChild(childRef.current);
  };

  useEffect(() => {
    if (active && scrollEnabled) {
      handleScroll();
    }
  }, [active, scrollEnabled]);

  const element = props.children;
  const elementChildren = element.props.children;
  return (
    <element.type
      {...element.props}
      {...elementProps}
      className={`${
        props.className
          ? props.className
          : element.props.className
          ? element.props.className
          : ""
      }${active ? ` ${sFocusedClass}` : ""}`}
      ref={childRef}
    >
      {elementChildren}
    </element.type>
  );
};

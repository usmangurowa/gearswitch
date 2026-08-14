import type { HugeiconsProps, IconSvgElement } from "@hugeicons/react-native";
import type { ComponentType } from "react";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { withUniwind } from "uniwind";

// Map className color classes (like text-foreground) to the icon's color prop
const StyledIcon = withUniwind(HugeiconsIcon as ComponentType<HugeiconsProps>, {
  color: {
    fromClassName: "className",
    styleProperty: "color",
  },
});

// Extended props to support 'as' prop pattern (used by React Native Reusables)
type IconProps = Omit<HugeiconsProps, "icon"> & {
  icon?: IconSvgElement;
  as?: IconSvgElement;
};

export const Icon = ({ as, icon, ...props }: IconProps) => {
  // Support both 'as' and 'icon' props for compatibility
  const iconElement = icon ?? as;
  if (!iconElement) {
    return null;
  }
  return <StyledIcon icon={iconElement} {...props} />;
};

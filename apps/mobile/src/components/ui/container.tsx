import type { SafeAreaViewProps } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";
import { withUniwind } from "uniwind";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export const Container = ({ className, ...props }: SafeAreaViewProps) => {
  return (
    <StyledSafeAreaView
      {...props}
      className={cn("flex-1 px-4 sm:px-6 md:px-8 lg:px-12", className)}
    />
  );
};

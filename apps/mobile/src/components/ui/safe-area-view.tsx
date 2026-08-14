import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

/**
 * SafeAreaView wrapped with Uniwind for className support.
 * @example
 * ```tsx
 * <StyledSafeAreaView className="flex-1 bg-background">
 *   <Text>Content</Text>
 * </StyledSafeAreaView>
 * ```
 */
export const StyledSafeAreaView = withUniwind(SafeAreaView);

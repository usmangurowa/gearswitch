import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Controller } from "react-hook-form";

import { Input } from "./input";
import { Label } from "./label";
import { Text } from "./text";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  className?: string;
}

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  className,
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View className={cn("gap-2", className)}>
          {label && <Label nativeID={name}>{label}</Label>}
          <Input
            placeholder={placeholder}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            aria-labelledby={name}
            aria-invalid={!!error}
            className={cn(error && "border-destructive")}
          />
          {error?.message && (
            <Text className="text-destructive text-sm">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};

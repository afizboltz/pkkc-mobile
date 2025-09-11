import React from "react";
import { StyleSheet, TextInput, TextStyle } from "react-native";
import { ThemedText } from "../ThemedText";

interface MyTextInputProps {
  placeholder?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  value?: string;
  onChangeInput?: (text: string) => void;
  errorText?: string;
  inputStyles?: TextStyle;
  multiline?: boolean;
  label?: string;
  textLimit?: number;
  showTextCounter?: boolean;
}

export const BasicTextInput: React.FC<MyTextInputProps> = ({
  placeholder = "",
  onBlur = () => {},
  onFocus = () => {},
  value,
  onChangeInput,
  errorText = "",
  inputStyles,
  multiline = false,
  label,
  textLimit = 100,
  showTextCounter = false,
  ...props
}) => {
  return (
    <>
      {label && <ThemedText type="subtitle">{label}</ThemedText>}
      <TextInput
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        multiline={multiline}
        onChangeText={onChangeInput}
        placeholder={placeholder}
        placeholderTextColor={colors.ashGrey}
        style={[{ ...inputStyles }]}
        scrollEnabled={!props.scrollEnabled && !multiline ? true : false}
        maxLength={textLimit}
        {...props}
      />
      {showTextCounter && textLimit > 0 && (
        <ThemedText type="subtitle">{`${value?.length}/${textLimit}`}</ThemedText>
      )}
      {Boolean(errorText) && (
        <ThemedText type="subtitle" style={styles.errorText}>
          {errorText}
        </ThemedText>
      )}
    </>
  );
};

// export const SearchInput: React.FC<SearchInputProps> = ({
//   placeholder = "Search here",
//   onBlur = () => {},
//   value,
//   onChangeInput,
//   errorText = "",
//   inputStyles = {},
// }) => {
//   return (
//     <>
//       <InputWrapper>
//         <TextInputOnly
//           underlineColorAndroid="transparent"
//           style={inputStyles as GeneralType}
//           placeholder={placeholder}
//           placeholderTextColor={colors.ashGrey}
//           onChangeText={onChangeInput}
//           onBlur={onBlur}
//           textAlignVertical="center"
//           value={value}
//         />
//         {!value && <SearchSvg />}
//       </InputWrapper>
//       {Boolean(errorText) && (
//         <ThemedText type="subtitle">{errorText}</ThemedText>
//       )}
//     </>
//   );
// };

// export const NumberInput: React.FC<NumberInputProps> = ({
//   placeholder = "",
//   disabled = false,
//   value,
//   onChangeInput,
//   errorText = "",
//   inputStyles = {},
//   label,
// }) => {
//   const onPlus = () => {
//     onChangeInput((Number(value) + 1).toString());
//   };

//   const onMinus = () => {
//     onChangeInput((Number(value) - 1).toString());
//   };

//   return (
//     <>
//       {label && <ThemedText type="subtitle">{label}</ThemedText>}
//       <InputWrapper disabled={disabled}>
//         <TextInputOnly
//           underlineColorAndroid="transparent"
//           style={inputStyles as GeneralType}
//           placeholder={placeholder}
//           placeholderTextColor={colors.ashGrey}
//           onChangeText={onChangeInput}
//           keyboardType="numeric"
//           value={value}
//           editable={!disabled}
//         />
//         <RightMultipleIconContainer>
//           <IconBtn disabled={disabled} onPress={onMinus}>
//             <MinusSvg
//               stroke={disabled || !value ? colors.silverMetal : colors.mainDark}
//               strokeWidth={2}
//             />
//           </IconBtn>
//           <Spacer width={8} />
//           <VerticalLine />
//           <Spacer width={8} />
//           <IconBtn disabled={disabled} onPress={onPlus}>
//             <PlusSvg
//               stroke={disabled || !value ? colors.silverMetal : colors.mainDark}
//               strokeWidth={0.5}
//               fill={disabled || !value ? colors.silverMetal : colors.mainDark}
//             />
//           </IconBtn>
//         </RightMultipleIconContainer>
//       </InputWrapper>
//       {Boolean(errorText) && (
//         <ThemedText style={styles.errorText}>{errorText}</ThemedText>
//       )}
//     </>
//   );
// };

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    fontSize: 12,
  },
});

import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

// import { normalFont, boldFont, normalItalicFont } from 'themes/styling';
interface MyTextProps {
  children: any;
  customStyles?: TextStyle | any;
  numberOfLines?: number;
  isBold?: boolean;
  isItalic?: boolean;
}

export const MyText: React.FC<MyTextProps> = ({
  children,
  customStyles,
  numberOfLines = 2,
  isBold = false,
  isItalic = false,
}) => {
  let myTextStyle: TextStyle = {};
  if (customStyles && Array.isArray(customStyles)) {
    myTextStyle = Object.assign({}, ...customStyles);
  } else {
    myTextStyle = customStyles ?? {};
  }

  return (
    <Text
      numberOfLines={numberOfLines}
      style={StyleSheet.flatten([
        styles.textStyle,
        myTextStyle,
        isBold && styles.boldStyle,
        isItalic && styles.italicStyle,
      ])}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    color: '#3333',
    fontSize: 14,
    // ...normalFont,
  },
  boldStyle: {
    // ...boldFont,
    fontWeight: 'bold',
  },
  italicStyle: {
    // ...normalItalicFont,
    fontStyle: 'italic',
  },
});

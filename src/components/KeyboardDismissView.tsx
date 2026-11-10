import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

export interface KeyboardDismissViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
}

export function KeyboardDismissView({ children, style, keyboardVerticalOffset = 0 }: KeyboardDismissViewProps) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      // 'padding' on both platforms: it adds bottom padding within the
      // existing flex container rather than relying on the container's own
      // height shrinking, which works reliably for both ScrollView and plain
      // View layouts (Android's 'height' mode's reflow depends on how content
      // redistributes when the container shrinks, which isn't reliable for
      // non-scrolling screens).
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {/* TouchableWithoutFeedback requires exactly one child, so any number of
          children passed in here are wrapped in a single inner View first. */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

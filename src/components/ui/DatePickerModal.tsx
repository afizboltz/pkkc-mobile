import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  visible: boolean;
  initialDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function DatePickerModal({
  visible,
  initialDate,
  mode = 'date',
  onConfirm,
  onCancel,
  title,
  confirmText,
  cancelText,
}: Props) {
  const [tempDate, setTempDate] = useState<Date>(initialDate || new Date());

  useEffect(() => {
    if (visible) setTempDate(initialDate || new Date());
  }, [visible, initialDate]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
              maximumDate={new Date()}
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancel]}>
              <Text style={styles.cancelText}>{cancelText || 'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(tempDate)} style={[styles.button, styles.confirm]}>
              <Text style={styles.confirmText}>{confirmText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pickerContainer: {
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 0 : 8,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: '#F3F4F6',
  },
  confirm: {
    backgroundColor: '#2563EB',
  },
  cancelText: {
    color: '#111827',
    fontWeight: '600',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

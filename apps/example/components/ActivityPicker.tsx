import React from "react";
import { Modal, NativeSyntheticEvent, StyleSheet, View } from "react-native";
import {
  ActivitySelectionMetadata,
  ActivitySelectionWithMetadata,
  DeviceActivitySelectionView,
  DeviceActivitySelectionViewPersisted,
} from "react-native-device-activity";

const PickerSheet = ({
  visible,
  onDismiss,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
      onDismiss={onDismiss}
    >
      <View style={styles.container}>{children}</View>
    </Modal>
  );
};

export const ActivityPicker = ({
  visible,
  onDismiss,
  onSelectionChange,
  familyActivitySelection,
  onReload: _onReload,
}: {
  visible: boolean;
  onDismiss: () => void;
  onSelectionChange: (
    event: NativeSyntheticEvent<ActivitySelectionWithMetadata>,
  ) => void;
  familyActivitySelection: string | undefined;
  onReload: () => void;
}) => {
  return (
    <PickerSheet visible={visible} onDismiss={onDismiss}>
      {visible && (
        <DeviceActivitySelectionView
          style={styles.picker}
          onSelectionChange={onSelectionChange}
          familyActivitySelection={familyActivitySelection}
        />
      )}
    </PickerSheet>
  );
};

export const ActivityPickerPersisted = ({
  visible,
  onDismiss,
  onSelectionChange,
  familyActivitySelectionId,
  onReload: _onReload,
  includeEntireCategory,
}: {
  visible: boolean;
  onDismiss: () => void;

  onSelectionChange: (
    event: NativeSyntheticEvent<ActivitySelectionMetadata>,
  ) => void;
  familyActivitySelectionId: string;
  onReload: () => void;
  includeEntireCategory?: boolean;
}) => {
  return (
    <PickerSheet visible={visible} onDismiss={onDismiss}>
      {visible && (
        <DeviceActivitySelectionViewPersisted
          style={styles.picker}
          onSelectionChange={onSelectionChange}
          familyActivitySelectionId={familyActivitySelectionId}
          includeEntireCategory={includeEntireCategory}
        />
      )}
    </PickerSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flex: 1,
  },
  picker: {
    flex: 1,
    width: "100%",
  },
});

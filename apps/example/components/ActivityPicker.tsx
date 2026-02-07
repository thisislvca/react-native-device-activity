import { View, NativeSyntheticEvent } from "react-native";
import {
  ActivitySelectionMetadata,
  ActivitySelectionWithMetadata,
  DeviceActivitySelectionView,
  DeviceActivitySelectionViewPersisted,
} from "react-native-device-activity";
import { Modal, Portal } from "react-native-paper";

export const ActivityPicker = ({
  visible,
  onDismiss,
  onSelectionChange,
  familyActivitySelection,
  onReload,
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
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          height: 600,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 600,
          }}
        >
          {visible && (
            <DeviceActivitySelectionView
              style={{
                flex: 1,
                height: 600,
                width: "100%",
                backgroundColor: "transparent",
              }}
              headerText="a header text!"
              footerText="a footer text!"
              onSelectionChange={onSelectionChange}
              familyActivitySelection={familyActivitySelection}
            />
          )}
        </View>
      </Modal>
    </Portal>
  );
};

export const ActivityPickerPersisted = ({
  visible,
  onDismiss,
  onSelectionChange,
  familyActivitySelectionId,
  onReload,
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
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          height: 600,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 600,
          }}
        >
          {visible && (
            <DeviceActivitySelectionViewPersisted
              style={{
                flex: 1,
                height: 600,
                width: "100%",
                backgroundColor: "transparent",
              }}
              headerText="a header text!"
              footerText="a footer text!"
              onSelectionChange={onSelectionChange}
              familyActivitySelectionId={familyActivitySelectionId}
              includeEntireCategory={includeEntireCategory}
            />
          )}
        </View>
      </Modal>
    </Portal>
  );
};

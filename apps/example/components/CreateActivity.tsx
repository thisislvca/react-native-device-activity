import { requestPermissionsAsync } from "expo-notifications";
import { useCallback, useState } from "react";
import { NativeSyntheticEvent, Pressable, View } from "react-native";
import * as ReactNativeDeviceActivity from "react-native-device-activity";
import {
  DeviceActivityEvent,
  DeviceActivitySelectionEvent,
} from "react-native-device-activity/src/ReactNativeDeviceActivity.types";
import { Button, Text, TextInput, Title, useTheme } from "react-native-paper";

import { ActivityPicker } from "./ActivityPicker";

const trackEveryXMinutes = 10;

const potentialMaxEvents = Math.floor((60 * 24) / trackEveryXMinutes);

const startMonitoring = async (
  activitySelection: string,
  activityName: string,
) => {
  await requestPermissionsAsync();

  ReactNativeDeviceActivity.setFamilyActivitySelectionId({
    id: activityName,
    familyActivitySelection: activitySelection,
  });

  const events: DeviceActivityEvent[] = [
    /*  {
      eventName: `minutes_reached_${initialMinutes}`,
      familyActivitySelection: activitySelection,
      threshold: { minute: initialMinutes },
    },
    {
      eventName: `minutes_reached_${initialMinutes}_override`,
      familyActivitySelection: activitySelection,
      threshold: { minute: initialMinutes, nanosecond: 1 },
    },*/
  ];

  for (let i = 1; i < potentialMaxEvents; i++) {
    const minutesReached = i * trackEveryXMinutes;
    const eventName = `minutes_reached_${minutesReached}`;
    const event: DeviceActivityEvent = {
      eventName,
      familyActivitySelection: activitySelection,
      threshold: { minute: minutesReached },
      includesPastActivity: false,
    };

    const overrideEventName = `minutes_reached_${minutesReached}_override`;
    const overrideEvent: DeviceActivityEvent = {
      eventName: overrideEventName,
      familyActivitySelection: activitySelection,
      threshold: { minute: minutesReached, nanosecond: 1 },
    };

    ReactNativeDeviceActivity.configureActions({
      activityName,
      callbackName: "eventDidReachThreshold",
      eventName: overrideEventName,
      actions: [
        {
          type: "sendNotification",
          payload: {
            title: "override!! {activityName}!",
            body: "You have reached {eventName} minutes!",
          },
        },
      ],
    });

    /*
    ReactNativeDeviceActivity.setFamilyActivitySelectionId({
      id: activityName,
      familyActivitySelection: activitySelection,
    });
    */

    ReactNativeDeviceActivity.configureActions({
      activityName,
      callbackName: "eventDidReachThreshold",
      eventName,
      actions: [
        {
          type: "blockSelection",
          familyActivitySelectionId: activityName,
        },
        {
          type: "sendHttpRequest",
          url: "https://webhook.site/df7583bc-fba5-4080-8a04-7417bccb2030",
          options: {
            method: "POST",
            body: {
              activityName,
              eventName,
              minutesReached,
            },
          },
        },
        {
          type: "sendNotification",
          payload: {
            title: "{activityName}!",
            body: "You have reached {eventName} minutes!",
          },
        },
        {
          type: "openApp",
        },
      ],
    });

    events.push(overrideEvent);

    events.push(event);
  }

  ReactNativeDeviceActivity.startMonitoring(
    activityName,
    {
      // warningTime: { minute: 1 },
      intervalStart: { hour: 0, minute: 0, second: 0 },
      intervalEnd: { hour: 23, minute: 59, second: 59 },
      repeats: false,
    },
    events,
  );
};

export const CreateActivity = ({ onDismiss }: { onDismiss: () => void }) => {
  const theme = useTheme();

  const [familyActivitySelectionResult, setFamilyActivitySelectionResult] =
    useState<DeviceActivitySelectionEvent | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const onSelectionChange = useCallback(
    (event: NativeSyntheticEvent<DeviceActivitySelectionEvent>) => {
      if (
        event.nativeEvent.familyActivitySelection !==
        familyActivitySelectionResult?.familyActivitySelection
      ) {
        setFamilyActivitySelectionResult(event.nativeEvent);
      }
    },
    [familyActivitySelectionResult?.familyActivitySelection],
  );

  const [activityName, setActivityName] = useState("");

  return (
    <View style={{ margin: 20 }}>
      <Title>Create Activity</Title>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginVertical: 10,
        }}
      >
        <Pressable
          onPress={() => setPickerVisible(true)}
          style={{
            width: 100,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white" }}>Select apps</Text>
        </Pressable>
        <Text>
          {familyActivitySelectionResult &&
          familyActivitySelectionResult?.categoryCount < 13
            ? `${familyActivitySelectionResult?.applicationCount} apps, ${familyActivitySelectionResult?.categoryCount} categories, ${familyActivitySelectionResult?.webDomainCount} domains`
            : familyActivitySelectionResult?.categoryCount
              ? "All categories selected"
              : "Nothing selected"}
        </Text>
      </View>
      <TextInput
        placeholder="Enter activity name"
        onChangeText={(text) => setActivityName(text)}
        value={activityName}
        style={{ marginVertical: 10 }}
      />
      <Button
        mode="contained"
        disabled={!familyActivitySelectionResult || !activityName}
        onPress={async () => {
          await startMonitoring(
            familyActivitySelectionResult?.familyActivitySelection ?? "",
            activityName,
          );
          onDismiss();
        }}
      >
        Start Monitoring
      </Button>
      <ActivityPicker
        visible={pickerVisible}
        onDismiss={() => setPickerVisible(false)}
        onSelectionChange={onSelectionChange}
        familyActivitySelection={
          familyActivitySelectionResult?.familyActivitySelection ?? undefined
        }
        onReload={() => {
          setPickerVisible(false);
          setTimeout(() => {
            setPickerVisible(true);
          }, 100);
        }}
      />
    </View>
  );
};

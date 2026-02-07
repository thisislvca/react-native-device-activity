import React, { useCallback, useMemo, useState } from "react";
import {
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivitySelectionWithMetadata,
  AuthorizationStatus,
  DeviceActivityReportSegmentation,
  DeviceActivityReportSnapshot,
  DeviceActivityReportView,
  getLatestReportSnapshot,
  isReportAvailable,
  requestAuthorization,
  useAuthorizationStatus,
} from "react-native-device-activity";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  Title,
} from "react-native-paper";

import { ActivityPicker } from "../components/ActivityPicker";

const dayInSeconds = 24 * 60 * 60;

export function ReportsTab() {
  const authorizationStatus = useAuthorizationStatus();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerReloadKey, setPickerReloadKey] = useState(0);
  const [familyActivitySelection, setFamilyActivitySelection] = useState<
    string | undefined
  >();
  const [from, setFrom] = useState(() => Date.now() / 1000 - dayInSeconds);
  const [to, setTo] = useState(() => Date.now() / 1000);
  const [segmentation, setSegmentation] =
    useState<DeviceActivityReportSegmentation>("daily");
  const [snapshot, setSnapshot] = useState<DeviceActivityReportSnapshot | null>(
    null,
  );

  const onSelectionChange = useCallback(
    (event: NativeSyntheticEvent<ActivitySelectionWithMetadata>) => {
      setFamilyActivitySelection(
        event.nativeEvent.familyActivitySelection ?? undefined,
      );
    },
    [],
  );

  const fetchSnapshot = useCallback(async () => {
    const nextSnapshot = await getLatestReportSnapshot({
      context: "totalActivity",
    });
    setSnapshot(nextSnapshot);
  }, []);

  const reportUnavailable = !isReportAvailable();

  const reportRangeLabel = useMemo(() => {
    const fromDate = new Date(from * 1000).toISOString();
    const toDate = new Date(to * 1000).toISOString();
    return `${fromDate} -> ${toDate}`;
  }, [from, to]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Title>Device Activity Reports</Title>
        <Text>
          Report availability:
          {reportUnavailable ? " not available on this runtime" : " available"}
        </Text>
        <Text>
          Authorization:
          {authorizationStatus === AuthorizationStatus.approved
            ? " approved"
            : authorizationStatus === AuthorizationStatus.denied
              ? " denied"
              : " notDetermined"}
        </Text>

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => requestAuthorization()}
        >
          Request authorization
        </Button>

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => setPickerVisible(true)}
        >
          Pick apps/categories
        </Button>

        <View style={styles.row}>
          <Button
            mode="outlined"
            style={styles.rowButton}
            onPress={() => {
              const now = Date.now() / 1000;
              setFrom(now - dayInSeconds);
              setTo(now);
            }}
          >
            Last 24h
          </Button>
          <Button
            mode="outlined"
            style={styles.rowButton}
            onPress={() => {
              const now = Date.now() / 1000;
              setFrom(now - 7 * dayInSeconds);
              setTo(now);
            }}
          >
            Last 7d
          </Button>
        </View>

        <TextInput
          style={styles.input}
          mode="outlined"
          label="From (unix seconds)"
          value={`${Math.floor(from)}`}
          onChangeText={(value) => {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
              setFrom(parsed);
            }
          }}
        />
        <TextInput
          style={styles.input}
          mode="outlined"
          label="To (unix seconds)"
          value={`${Math.floor(to)}`}
          onChangeText={(value) => {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
              setTo(parsed);
            }
          }}
        />
        <Text>Range: {reportRangeLabel}</Text>

        <SegmentedButtons
          style={styles.segmented}
          value={segmentation}
          onValueChange={(value) =>
            setSegmentation(value as DeviceActivityReportSegmentation)
          }
          buttons={[
            {
              value: "hourly",
              label: "Hourly",
            },
            {
              value: "daily",
              label: "Daily",
            },
            {
              value: "weekly",
              label: "Weekly",
            },
          ]}
        />

        <View style={styles.reportContainer}>
          <DeviceActivityReportView
            style={styles.reportView}
            context="totalActivity"
            familyActivitySelection={familyActivitySelection}
            from={from}
            to={to}
            segmentation={segmentation}
            users="all"
          />
        </View>

        <Button mode="contained" style={styles.button} onPress={fetchSnapshot}>
          Fetch snapshot
        </Button>
        <Text selectable>{JSON.stringify(snapshot, null, 2)}</Text>
      </ScrollView>
      <ActivityPicker
        key={pickerReloadKey}
        visible={pickerVisible}
        onDismiss={() => setPickerVisible(false)}
        familyActivitySelection={familyActivitySelection}
        onSelectionChange={onSelectionChange}
        onReload={() => setPickerReloadKey((prev) => prev + 1)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
  container: {
    flex: 1,
    padding: 12,
  },
  input: {
    marginTop: 12,
  },
  reportContainer: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    height: 260,
  },
  reportView: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginTop: 12,
  },
  rowButton: {
    marginRight: 12,
  },
  segmented: {
    marginTop: 12,
  },
});

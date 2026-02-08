//
//  DeviceActivityReportTests.swift
//  reactnativedeviceactivityexample
//

import DeviceActivity
import XCTest

class DeviceActivityReportTests: XCTestCase {
  func testDeserializeSnapshotFromDictionary() {
    let input: [String: Any] = [
      "version": 1,
      "context": "totalActivity",
      "totalActivityDurationSeconds": 120
    ]

    let snapshot = deserializeDeviceActivityReportSnapshot(rawValue: input)

    XCTAssertNotNil(snapshot)
    XCTAssertEqual(snapshot?["version"] as? Int, 1)
    XCTAssertEqual(snapshot?["context"] as? String, "totalActivity")
    XCTAssertEqual(snapshot?["totalActivityDurationSeconds"] as? Int, 120)
  }

  func testDeserializeSnapshotFromJsonString() {
    let input = "{\"version\":1,\"context\":\"totalActivity\"}"

    let snapshot = deserializeDeviceActivityReportSnapshot(rawValue: input)

    XCTAssertNotNil(snapshot)
    XCTAssertEqual(snapshot?["version"] as? Int, 1)
    XCTAssertEqual(snapshot?["context"] as? String, "totalActivity")
  }

  func testDeserializeSnapshotInvalidReturnsNil() {
    XCTAssertNil(deserializeDeviceActivityReportSnapshot(rawValue: "not-json"))
    XCTAssertNil(deserializeDeviceActivityReportSnapshot(rawValue: 123))
    XCTAssertNil(deserializeDeviceActivityReportSnapshot(rawValue: nil))
  }

  func testNormalizeDateRangeSwapsWhenReversed() {
    let from = Date(timeIntervalSince1970: 2_000)
    let to = Date(timeIntervalSince1970: 1_000)

    let normalized = normalizedDeviceActivityReportDateRange(
      from: from.timeIntervalSince1970,
      to: to.timeIntervalSince1970
    )

    XCTAssertLessThanOrEqual(normalized.0, normalized.1)
    XCTAssertEqual(normalized.0.timeIntervalSince1970, to.timeIntervalSince1970, accuracy: 0.001)
    XCTAssertEqual(normalized.1.timeIntervalSince1970, from.timeIntervalSince1970, accuracy: 0.001)
  }

  func testNormalizeDateRangeWhenEqualAddsOneSecond() {
    let timestamp = Date(timeIntervalSince1970: 10_000).timeIntervalSince1970

    let normalized = normalizedDeviceActivityReportDateRange(
      from: timestamp,
      to: timestamp
    )

    XCTAssertEqual(normalized.0.timeIntervalSince1970, timestamp, accuracy: 0.001)
    XCTAssertEqual(normalized.1.timeIntervalSince1970, timestamp + 1, accuracy: 0.001)
  }

  func testNormalizeDateRangeDefaultsInvalidValues() {
    let normalized = normalizedDeviceActivityReportDateRange(from: Double.nan, to: Double.infinity)

    XCTAssertLessThan(normalized.0, normalized.1)
  }

  func testSanitizeContextUsesDefaultWhenBlank() {
    XCTAssertEqual(sanitizeDeviceActivityReportContext(nil), DEFAULT_DEVICE_ACTIVITY_REPORT_CONTEXT)
    XCTAssertEqual(
      sanitizeDeviceActivityReportContext("  \n "), DEFAULT_DEVICE_ACTIVITY_REPORT_CONTEXT)
    XCTAssertEqual(sanitizeDeviceActivityReportContext("focus"), "focus")
  }

  @available(iOS 16.0, *)
  func testDeviceRawValuesDefaultsToAllWhenNoValuesAreProvided() {
    let allDevices = deviceActivityReportDevicesFromRawValues([])

    XCTAssertEqual(
      String(describing: allDevices), String(describing: DeviceActivityFilter.Devices.all))
  }

  @available(iOS 16.0, *)
  func testDeviceRawValuesUsesResolvedModelsWhenProvided() {
    let devices = deviceActivityReportDevicesFromRawValues([1])

    XCTAssertNotEqual(
      String(describing: devices), String(describing: DeviceActivityFilter.Devices.all))
  }
}

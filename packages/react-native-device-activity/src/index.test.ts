jest.mock("expo-modules-core", () => {
  class MockEventEmitter {
    addListener() {
      return { remove: jest.fn() };
    }

    removeAllListeners() {}
  }

  return {
    EventEmitter: MockEventEmitter,
    EventSubscription: class {},
    requireNativeViewManager: jest.fn(() => () => null),
  };
});

describe("index runtime wrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test("exports sheet picker views", () => {
    jest.isolateModules(() => {
      const module = require("./index");
      expect(module.DeviceActivitySelectionSheetView).toBeDefined();
      expect(module.DeviceActivitySelectionSheetViewPersisted).toBeDefined();
    });
  });

  test("delegates stopMonitoring to native module", () => {
    jest.isolateModules(() => {
      const mockNativeModule = {
        stopMonitoring: jest.fn(),
        startMonitoring: jest.fn(),
      };

      jest.doMock("./ReactNativeDeviceActivityModule", () => ({
        __esModule: true,
        default: mockNativeModule,
      }));

      const { stopMonitoring } = require("./index");
      const activities = ["activity-a"];

      stopMonitoring(activities);

      expect(mockNativeModule.stopMonitoring).toHaveBeenCalledWith(activities);
    });
  });

  test("delegates startMonitoring to native module", async () => {
    await jest.isolateModulesAsync(async () => {
      const mockNativeModule = {
        stopMonitoring: jest.fn(),
        startMonitoring: jest.fn().mockResolvedValue(undefined),
      };

      jest.doMock("./ReactNativeDeviceActivityModule", () => ({
        __esModule: true,
        default: mockNativeModule,
      }));

      const { startMonitoring } = require("./index");

      await startMonitoring(
        "activity-a",
        {
          intervalStart: { hour: 0, minute: 0 },
          intervalEnd: { hour: 23, minute: 59 },
        },
        [],
      );

      expect(mockNativeModule.startMonitoring).toHaveBeenCalled();
    });
  });

  test("delegates setWebContentFilterPolicy to native module", () => {
    const mockSetWebContentFilterPolicy = jest.fn();
    const policy = {
      type: "auto",
      domains: ["adult.example.com"],
      exceptDomains: ["safe.example.com"],
    };

    jest.isolateModules(() => {
      jest.doMock("./ReactNativeDeviceActivityModule", () => ({
        __esModule: true,
        default: {
          setWebContentFilterPolicy: mockSetWebContentFilterPolicy,
        },
      }));
      const { setWebContentFilterPolicy } = require("./index");
      setWebContentFilterPolicy(policy, "test");
    });

    expect(mockSetWebContentFilterPolicy).toHaveBeenCalledWith(policy, "test");
  });

  test("delegates clearWebContentFilterPolicy to native module", () => {
    const mockClearWebContentFilterPolicy = jest.fn();

    jest.isolateModules(() => {
      jest.doMock("./ReactNativeDeviceActivityModule", () => ({
        __esModule: true,
        default: {
          clearWebContentFilterPolicy: mockClearWebContentFilterPolicy,
        },
      }));
      const { clearWebContentFilterPolicy } = require("./index");
      clearWebContentFilterPolicy("test");
    });

    expect(mockClearWebContentFilterPolicy).toHaveBeenCalledWith("test");
  });

  test("returns native value for isWebContentFilterPolicyActive", () => {
    jest.isolateModules(() => {
      jest.doMock("./ReactNativeDeviceActivityModule", () => ({
        __esModule: true,
        default: {
          isWebContentFilterPolicyActive: () => true,
        },
      }));
      const { isWebContentFilterPolicyActive } = require("./index");
      expect(isWebContentFilterPolicyActive()).toBe(true);
    });
  });

  test("returns false fallback for isWebContentFilterPolicyActive", () => {
    jest.isolateModules(() => {
      jest.doMock("./ReactNativeDeviceActivityModule", () => ({
        __esModule: true,
        default: {},
      }));
      const { isWebContentFilterPolicyActive } = require("./index");
      expect(isWebContentFilterPolicyActive()).toBe(false);
    });
  });
});

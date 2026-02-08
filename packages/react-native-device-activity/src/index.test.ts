const fs = require("fs");
const path = require("path");

const readSource = (relativePath) =>
  fs.readFileSync(path.resolve("src", relativePath), "utf8");

describe("report API source coverage", () => {
  test("index exports report availability and snapshot helpers", () => {
    const source = readSource("index.ts");

    expect(source).toContain("export function isReportAvailable()");
    expect(source).toContain("export async function getLatestReportSnapshot");
    expect(source).toContain("DeviceActivityReportView");
  });

  test("iOS report view has fallback warning path", () => {
    const source = readSource("DeviceActivityReport.ios.tsx");

    expect(source).toContain("DeviceActivityReportView requires iOS 16+");
    expect(source).toContain("return <View style={style}>{children}</View>;");
  });

  test("non-iOS native module mock exposes getLatestReportSnapshot", () => {
    const source = readSource("ReactNativeDeviceActivityModule.ts");

    expect(source).toContain("getLatestReportSnapshot: warnFnNull");
  });
});

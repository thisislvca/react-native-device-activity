import SwiftUI

struct TotalActivityView: View {
  let configuration: TotalActivityConfiguration

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(configuration.totalActivityLabel)
        .font(.headline)
      Text("Updated \(configuration.generatedAtLabel)")
        .font(.caption)
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(12)
  }
}

#Preview {
  TotalActivityView(
    configuration: TotalActivityConfiguration(
      totalActivityLabel: "1h 23m",
      generatedAtLabel: "Feb 6, 2026 at 2:30 PM"
    )
  )
}

import ActivityKit
import WidgetKit
import SwiftUI

struct WidgetLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: TimeFlowAttributes.self) { context in
      // --- Lock Screen View ---
      HStack {
        // Left: Icon
        ZStack {
          Circle().fill(Color(red: 0.06, green: 0.13, blue: 0.09)) // Dark Green #102216
            .frame(width: 40, height: 40)
          Image(systemName: context.state.isPaused ? "pause.fill" : "timer")
            .foregroundColor(.white)
        }
        
        VStack(alignment: .leading) {
          Text(context.attributes.clientName)
            .font(.caption)
            .foregroundColor(.secondary)
          
          if context.state.isPaused {
            Text("Paused")
              .font(.headline)
          } else {
            Text("Tracking")
              .font(.headline)
              .foregroundColor(.green)
          }
        }
        
        Spacer()
        
        // Right: Time
        if context.state.isPaused {
          Text(context.state.staticElapsedTime)
            .font(.system(size: 32, weight: .bold, design: .monospaced))
        } else {
          // Native SwiftUI Timer that counts up from referenceDate
          Text(context.state.referenceDate, style: .timer)
            .font(.system(size: 32, weight: .bold, design: .monospaced))
            .multilineTextAlignment(.trailing)
        }
      }
      .padding()
      .activityBackgroundTint(Color(UIColor.systemBackground))

    } dynamicIsland: { context in
      DynamicIsland {
        // --- Expanded Region (Long Press) ---
        DynamicIslandExpandedRegion(.leading) {
          VStack {
            Spacer()
            Image(systemName: "timer")
              .font(.title2)
              .foregroundColor(.green)
            Spacer()
          }
          .padding(.leading, 8)
        }
        
        DynamicIslandExpandedRegion(.trailing) {
          VStack(alignment: .trailing) {
            Spacer()
            if context.state.isPaused {
              Text(context.state.staticElapsedTime)
                .font(.system(size: 24, weight: .bold, design: .monospaced))
              Text("Paused")
                .font(.caption)
                .foregroundColor(.secondary)
            } else {
              Text(context.state.referenceDate, style: .timer)
                .font(.system(size: 24, weight: .bold, design: .monospaced))
              Text("Total Time")
                .font(.caption)
                .foregroundColor(.secondary)
            }
            Spacer()
          }
          .padding(.trailing, 8)
        }
        
        DynamicIslandExpandedRegion(.bottom) {
          HStack {
            Text(context.attributes.clientName)
              .font(.caption2)
              .bold()
              .padding(6)
              .background(Color.white.opacity(0.2))
              .clipShape(Capsule())
            Spacer()
          }
        }
        
      } compactLeading: {
        // --- Compact View (Island Idle) ---
        Image(systemName: context.state.isPaused ? "pause.circle.fill" : "record.circle.fill")
          .foregroundColor(context.state.isPaused ? .yellow : .green)
          
      } compactTrailing: {
        if context.state.isPaused {
          Text(context.state.staticElapsedTime)
            .monospacedDigit()
            .font(.caption2)
            .foregroundColor(.secondary)
        } else {
          Text(context.state.referenceDate, style: .timer)
            .monospacedDigit()
            .frame(width: 45) // Fixed width prevents jitter
            .font(.caption2)
            .foregroundColor(.green)
        }
        
      } minimal: {
        Image(systemName: "timer")
          .foregroundColor(.green)
      }
    }
  }
}
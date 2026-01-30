import ExpoModulesCore
import ActivityKit

final class ActivityUnavailableException: GenericException<Void> {
  override var reason: String { "Live activities are not available on this system." }
}
final class ActivityDataException: GenericException<String> {
  override var reason: String { "Failed to parse Live Activity data: \(param)" }
}

// Helper structs to decode JSON from JS
fileprivate struct TimerStateJSON: Decodable {
  let referenceDateMs: Double
  let staticElapsedTime: String?
  let isPaused: Bool
}

fileprivate struct StartParams: Decodable {
  let clientName: String?
  let state: TimerStateJSON
}

fileprivate struct UpdateParams: Decodable {
  let state: TimerStateJSON
}

public class ActivityControllerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ActivityController")

    Property("areLiveActivitiesEnabled") {
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    AsyncFunction("startLiveActivity") { (rawData: String) async throws -> Void in
      guard #available(iOS 16.2, *) else { throw ActivityUnavailableException(()) }
      
      let data = Data(rawData.utf8)
      let params: StartParams
      do {
        params = try JSONDecoder().decode(StartParams.self, from: data)
      } catch {
        throw ActivityDataException(rawData)
      }
      
      // Stop existing activity if any (we only want one timer at a time)
      for activity in Activity<TimeFlowAttributes>.activities {
         await activity.end(dismissalPolicy: .immediate)
      }

      let attrs = TimeFlowAttributes(
        clientName: params.clientName ?? "TimeFlow"
      )
      
      let referenceDate = Date(timeIntervalSince1970: params.state.referenceDateMs / 1000)
      
      let state = TimeFlowAttributes.ContentState(
        referenceDate: referenceDate,
        isPaused: params.state.isPaused,
        staticElapsedTime: params.state.staticElapsedTime ?? "00:00"
      )

      _ = try Activity<TimeFlowAttributes>.request(
        attributes: attrs,
        contentState: state,
        pushType: nil
      )
    }

    AsyncFunction("updateLiveActivity") { (rawData: String) async throws -> Void in
      guard #available(iOS 16.2, *) else { return }
      
      // Find the active timer
      guard let activity = Activity<TimeFlowAttributes>.activities.first else { return }
      
      let data = Data(rawData.utf8)
      let params: UpdateParams
      do {
        params = try JSONDecoder().decode(UpdateParams.self, from: data)
      } catch {
        print("Error decoding update: \(error)")
        return
      }
      
      let referenceDate = Date(timeIntervalSince1970: params.state.referenceDateMs / 1000)

      let newState = TimeFlowAttributes.ContentState(
        referenceDate: referenceDate,
        isPaused: params.state.isPaused,
        staticElapsedTime: params.state.staticElapsedTime ?? "00:00"
      )

      await activity.update(using: newState)
    }

    AsyncFunction("stopLiveActivity") { () async throws -> Void in
      guard #available(iOS 16.2, *) else { return }
      for activity in Activity<TimeFlowAttributes>.activities {
        await activity.end(dismissalPolicy: .immediate)
      }
    }

    Function("isLiveActivityRunning") { () -> Bool in
      if #available(iOS 16.2, *) {
        return !Activity<TimeFlowAttributes>.activities.isEmpty
      }
      return false
    }
  }
}
import ActivityKit
import Foundation

public struct TimeFlowAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    // The date we count up from (or the date we paused at)
    public var referenceDate: Date 
    public var isPaused: Bool
    public var staticElapsedTime: String
  }

  // Static data that doesn't change during the session
  public let clientName: String
}
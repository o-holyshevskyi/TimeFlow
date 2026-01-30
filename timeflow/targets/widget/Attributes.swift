import ActivityKit
import Foundation

public struct TimeFlowAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var referenceDate: Date
    public var isPaused: Bool
    public var staticElapsedTime: String
  }

  public let clientName: String
}
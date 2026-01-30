export type TimerState = {
  // When running: The calculated start date to count from
  // When paused: The timestamp of when it was paused (unused visually, but good for state)
  referenceDateMs: number 
  // If paused, we display this static string (e.g., "01:25:30")
  staticElapsedTime?: string 
  isPaused: boolean
}

export type LiveActivityParams = {
  clientName?: string // Optional: Display Client Name on the island
  state: TimerState
}

export type StartLiveActivityFn = (params: LiveActivityParams) => Promise<void>

export type UpdateLiveActivityFn = (params: { state: TimerState }) => Promise<void>

export type StopLiveActivityFn = () => Promise<void>
export type IsLiveActivityRunningFn = () => boolean
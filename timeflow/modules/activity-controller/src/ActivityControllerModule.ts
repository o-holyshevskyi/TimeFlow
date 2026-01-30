import { requireNativeModule } from "expo";
import type {
  IsLiveActivityRunningFn,
  StartLiveActivityFn,
  StopLiveActivityFn,
  UpdateLiveActivityFn,
} from "./ActivityController.types";

const nativeModule = requireNativeModule("ActivityController");

export const startLiveActivity: StartLiveActivityFn = async (params) => {
  const stringParams = JSON.stringify(params);
  return nativeModule.startLiveActivity(stringParams);
};

export const updateLiveActivity: UpdateLiveActivityFn = async (params) => {
  const stringParams = JSON.stringify(params);
  // Safely check if function exists (avoids crashes on Android/Simulator)
  if (nativeModule && typeof nativeModule.updateLiveActivity === "function") {
    return nativeModule.updateLiveActivity(stringParams);
  }
  return Promise.resolve();
};

export const stopLiveActivity: StopLiveActivityFn = async () => {
  if (nativeModule && typeof nativeModule.stopLiveActivity === "function") {
    return nativeModule.stopLiveActivity();
  }
  return Promise.resolve();
};

export const isLiveActivityRunning: IsLiveActivityRunningFn = () => {
  if (nativeModule && typeof nativeModule.isLiveActivityRunning === "function") {
    return nativeModule.isLiveActivityRunning();
  }
  return false;
};

export const areLiveActivitiesEnabled: boolean = nativeModule?.areLiveActivitiesEnabled ?? false;
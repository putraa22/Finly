import { create } from "zustand";

type DashboardUiStore = {
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  simulatorFoodCutPct: number;
  setSimulatorFoodCutPct: (value: number) => void;
  simulatorSavePlusPct: number;
  setSimulatorSavePlusPct: (value: number) => void;
};

export const useDashboardUiStore = create<DashboardUiStore>((set) => ({
  notifOpen: false,
  setNotifOpen: (notifOpen) => set({ notifOpen }),
  simulatorFoodCutPct: 20,
  setSimulatorFoodCutPct: (simulatorFoodCutPct) =>
    set({ simulatorFoodCutPct }),
  simulatorSavePlusPct: 10,
  setSimulatorSavePlusPct: (simulatorSavePlusPct) =>
    set({ simulatorSavePlusPct }),
}));

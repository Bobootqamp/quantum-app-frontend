import { localAdapter, qiskitAdapter, type SimulationAdapter } from "@qamposer/react";

export type SimulationMode = "browser" | "qiskit";

export interface SimulationAdapters {
  mode: SimulationMode;
  /** Used by the "Run" button in the editor */
  adapter: SimulationAdapter;
  /** Used for instant (ideal) simulation on every circuit edit */
  realtimeAdapter: SimulationAdapter;
}

/**
 * Pick simulation adapters from the environment.
 *
 * - No backend URL: everything runs in the browser (localAdapter).
 * - With VITE_QISKIT_BACKEND_URL: "Run" goes to the Qiskit backend (qamposer-backend),
 *   while edits are still simulated instantly in the browser.
 */
export function createSimulationAdapters(backendUrl: string | undefined): SimulationAdapters {
  const realtimeAdapter = localAdapter();
  // qiskitAdapter appends "/api/...", so drop trailing slashes to avoid "//api"
  const url = backendUrl?.trim().replace(/\/+$/, "");

  if (!url) {
    return { mode: "browser", adapter: realtimeAdapter, realtimeAdapter };
  }
  return { mode: "qiskit", adapter: qiskitAdapter(url), realtimeAdapter };
}

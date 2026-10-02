import { afterEach, describe, expect, it, vi } from "vitest";
import { createSimulationAdapters } from "../src/qamposer/adapters";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createSimulationAdapters", () => {
  it("uses the browser simulator when no backend URL is set", () => {
    const { mode, adapter, realtimeAdapter } = createSimulationAdapters(undefined);
    expect(mode).toBe("browser");
    expect(adapter).toBe(realtimeAdapter);
    expect(adapter.name).toBe("Browser Simulator");
  });

  it("treats a blank URL as unset", () => {
    expect(createSimulationAdapters("  ").mode).toBe("browser");
  });

  it("uses the Qiskit backend for Run and the browser for realtime when a URL is set", () => {
    const { mode, adapter, realtimeAdapter } = createSimulationAdapters("http://localhost:8080");
    expect(mode).toBe("qiskit");
    expect(adapter.name).toBe("Qiskit Simulator");
    expect(realtimeAdapter.name).toBe("Browser Simulator");
  });

  it("ignores trailing slashes in the backend URL", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ counts: {} })));
    vi.stubGlobal("fetch", fetchMock);

    const { adapter } = createSimulationAdapters("http://localhost:8080/ ");
    await adapter.simulate({ qubits: 1, gates: [], shots: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/circuit/simulate",
      expect.anything(),
    );
  });
});

// Guards the @qamposer/react behaviors this template and AGENTS.md rely on.
import {
  type CircuitEditEvent,
  QamposerMicro,
  QamposerProvider,
  useQamposer,
} from "@qamposer/react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

type Api = ReturnType<typeof useQamposer>;

function renderWithApi(onCircuitEdit: (event: CircuitEditEvent, api: Api) => void) {
  const ref: { api?: Api } = {};
  function Probe() {
    ref.api = useQamposer();
    return <output>{ref.api.circuit.gates.length} gates</output>;
  }
  render(
    <QamposerProvider onCircuitEdit={(event) => ref.api && onCircuitEdit(event, ref.api)}>
      <Probe />
      <QamposerMicro />
    </QamposerProvider>,
  );
  if (!ref.api) throw new Error("useQamposer() was not rendered");
  return () => ref.api as Api;
}

describe("QamposerMicro inside QamposerProvider", () => {
  it("shares state with sibling components and reports API edits", () => {
    const onCircuitEdit = vi.fn();
    const api = renderWithApi(onCircuitEdit);

    act(() => {
      api().insertGate({ type: "H", qubit: 0 }, 0);
    });

    expect(screen.getByText("1 gates")).toBeTruthy();
    expect(onCircuitEdit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "add", origin: "api" }),
      expect.anything(),
    );
  });

  it("lets onCircuitEdit revert a forbidden edit with setCircuit(event.before)", () => {
    const api = renderWithApi((event, qamposer) => {
      if (event.origin === "api") return; // ignore our own revert
      if (event.changes.added.some((gate) => gate.type === "X")) qamposer.setCircuit(event.before);
    });

    act(() => {
      api().insertGate({ type: "H", qubit: 0 }, 0, { origin: "pointer" });
    });
    act(() => {
      api().insertGate({ type: "X", qubit: 1 }, 0, { origin: "pointer" });
    });

    expect(api().circuit.gates.map((gate) => gate.type)).toEqual(["H"]);
  });
});

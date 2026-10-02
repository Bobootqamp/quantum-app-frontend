import {
  type CircuitEditEvent,
  QamposerMicro,
  QamposerProvider,
  type ResultChangeEvent,
  type SimulationCompleteEvent,
  type SimulationErrorEvent,
  type SimulationStartEvent,
} from "@qamposer/react";
import { Experience } from "./Experience";
import { createSimulationAdapters } from "./qamposer/adapters";

const { mode, adapter, realtimeAdapter } = createSimulationAdapters(
  import.meta.env.VITE_QISKIT_BACKEND_URL,
);

const MODE_LABEL = {
  browser: "Browser simulator",
  qiskit: "Qiskit backend",
} as const;

/** In dev mode, print every Qamposer event to the browser console. */
function logEvent(name: string, event: unknown) {
  if (import.meta.env.DEV) console.debug(`[qamposer] ${name}`, event);
}

// ---- Qamposer callbacks ----------------------------------------------------------
// Everything the editor does is reported here. Use them for side effects (sounds,
// scores, game rules, ...). To read the current state while rendering, call
// useQamposer() inside <Experience /> instead. These may also be defined inside a
// component (e.g. to call a useState setter) — Qamposer always uses the latest ones.

/** One event per edit, with what changed and why. */
function handleCircuitEdit(event: CircuitEditEvent) {
  logEvent("circuit edit", event);
  // event.action: "add" | "move" | "remove" | "update" | "undo" | "redo"
  //             | "add-qubit" | "remove-qubit" | "clear" | "set" | "import" | "code"
  // event.origin: "pointer" | "keyboard" | "code" | "api"
  // event.gateId: the gate acted on (add / move / remove / update)
  // event.from / event.to: { row, column } (move only)
  // event.displaced: [{ id, from, to }] gates pushed aside as a side effect
  // event.reverts: the edit being undone / redone (undo / redo only)
  // event.changes: { added, removed, updated: [{ before, after }], qubits?: { from, to } }
  // event.before / event.after: Circuit { qubits, gates }
}

function handleSimulationStart(event: SimulationStartEvent) {
  logEvent("simulation start", event);
  // event.source: "realtime" (automatic, on every edit) | "run" ("Set up and run" / simulate())
  // event.circuit, event.qasm (OpenQASM 2.0)
}

function handleSimulationComplete(event: SimulationCompleteEvent) {
  logEvent("simulation complete", event);
  // event.result.counts: { "01": 512, ... } (q0 is the rightmost bit)
  // event.result.qsphere?: [{ state, x, y, z, probability, phase }] (<= 5 qubits, browser simulator)
  // event.result.execution_time, event.source, event.circuit, event.qasm
}

function handleSimulationError(event: SimulationErrorEvent) {
  logEvent("simulation error", event);
  // event.error: Error (e.g. backend unreachable), event.source, event.circuit, event.qasm
}

/** Fires whenever the displayed result changes, including when it is cleared. */
function handleResultChange(event: ResultChangeEvent) {
  logEvent("result change", event);
  // event.result: SimulationResult | null
  // event.source: "realtime" | "run" | null
  // event.reason: "simulation" | "empty-circuit" | "clear" | "remove-qubit"
}

export function App() {
  return (
    <QamposerProvider
      adapter={adapter}
      realtimeAdapter={realtimeAdapter}
      onCircuitEdit={handleCircuitEdit}
      onSimulationStart={handleSimulationStart}
      onSimulationComplete={handleSimulationComplete}
      onSimulationError={handleSimulationError}
      onResultChange={handleResultChange}
    >
      <div className="app">
        <header className="app__header">
          <h1>Quantum Sample App</h1>
          <span className={`app__mode app__mode--${mode}`}>{MODE_LABEL[mode]}</span>
        </header>

        <Experience />

        <section className="app__editor">
          <QamposerMicro title="Circuit" />
        </section>
      </div>
    </QamposerProvider>
  );
}

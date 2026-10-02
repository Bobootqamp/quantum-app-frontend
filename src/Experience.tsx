/**
 * Your app goes here — replace this component with your own experience.
 *
 * It is rendered inside <QamposerProvider>, so useQamposer() gives you the live
 * editor state and every editing / simulation action, for example:
 *
 *   const { circuit, result, status, setCircuit, insertGate, simulate, undo } = useQamposer();
 *
 * See "Qamposer で使える情報と操作" in AGENTS.md for the full list.
 */
export function Experience() {
  return (
    <main className="app__placeholder">
      <p>
        量子操作やシミュレーション結果等の情報をWebアプリの体験・ロジックとして自由に実装してください。
      </p>
      <p>どのような情報を活用できるかや詳細な実装検討はIBM Bobに尋ねてみましょう。</p>
    </main>
  );
}

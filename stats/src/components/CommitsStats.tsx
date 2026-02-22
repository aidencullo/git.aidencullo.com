import { useMemo } from 'react';
import { useCommits } from '../hooks/useCommits';

function TerminalLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const style = useMemo(
    () => ({
      animationDelay: `${delay}ms, ${delay + 420}ms`,
    }),
    [delay],
  );

  return (
    <p className="terminal-line terminal-line--typed" style={style}>
      {text}
    </p>
  );
}

function CommitsStats() {
  const { commitsToday, commitsYesterday, repoCount, fetching } = useCommits();

  if (fetching) {
    return <TerminalLine text="fetching commit telemetry..." delay={250} />;
  }

  return (
    <>
      <TerminalLine text={`commits today: ${commitsToday}`} delay={220} />
      <TerminalLine text={`commits yesterday: ${commitsYesterday}`} delay={860} />
      <TerminalLine text={`repos touched: ${repoCount}`} delay={1480} />
      <p className="terminal-line terminal-line--prompt">aidencullo@stats:~$ <span className="terminal-cursor" aria-hidden="true" /></p>
    </>
  );
}

export default CommitsStats;

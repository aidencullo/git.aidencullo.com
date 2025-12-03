import { useCommits } from '../hooks/useCommits';

function CommitsStats() {
  const { commits, fetching } = useCommits();

  return (
    <>
      commits: {!fetching ? (
        <p>{commits}</p>
      ) : (
        <p>Loading commits...</p>
      )}
    </>
  );
}

export default CommitsStats;


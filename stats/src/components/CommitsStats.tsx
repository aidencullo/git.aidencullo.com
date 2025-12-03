import { useCommits } from '../hooks/useCommits';

function CommitsStats() {
  const { commits, fetching } = useCommits();

  return (
    <>
      {!fetching ? (
        <p>{commits.length}</p>
      ) : (
        <p>Loading commits...</p>
      )}
    </>
  );
}

export default CommitsStats;


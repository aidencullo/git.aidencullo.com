import { useCommits } from '../hooks/useCommits';

function CommitsStats() {
  const { commits, fetching, dates } = useCommits();

  return (
    <>
      commits: {!fetching ? (
        <p>{commits}</p>
      ) : (
        <p>Loading commits...</p>
      )}
      dates: {dates.map((date) => <p>{date}</p>)}
    </>
  );
}

export default CommitsStats;


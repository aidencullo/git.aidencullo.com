import { useCommits } from '../hooks/useCommits';

function CommitsStats() {
  const { commitsToday, commitsYesterday, repoCount, fetching } = useCommits();

  if (fetching) {
    return <p>Loading commits...</p>;
  }

  return (
    <>
      <p>commits today: {commitsToday}</p>
      <p>commits yesterday: {commitsYesterday}</p>
      <p>repos: {repoCount}</p>
    </>
  );
}

export default CommitsStats;


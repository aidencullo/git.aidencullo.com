import { useCommits } from '../hooks/useCommits';

function CommitsStats() {
  const { commitsToday, commitsYesterday, gitlabCommitsToday, fetching } = useCommits();

  if (fetching) {
    return <p>Loading commits...</p>;
  }

  return (
    <>
      <p>commits today: {commitsToday}</p>
      <p>commits yesterday: {commitsYesterday}</p>
      <p>gitlab commits today: {gitlabCommitsToday}</p>
    </>
  );
}

export default CommitsStats;


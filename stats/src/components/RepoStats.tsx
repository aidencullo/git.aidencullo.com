interface RepoStatsProps {
  reposCount: number;
  fetching: boolean;
}

function RepoStats({ reposCount, fetching }: RepoStatsProps) {
  return (
    <>
      repos: {!fetching ? (
        <p>{reposCount}</p>
      ) : (
        <p>Loading repositories...</p>
      )}
    </>
  );
}

export default RepoStats;


interface RepoStatsProps {
  reposCount: number;
}

function RepoStats({ reposCount }: RepoStatsProps) {
  return (
    <>
        <p>repos: {reposCount}</p>
    </>
  );
}

export default RepoStats;


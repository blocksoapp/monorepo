import { useEnsName } from 'wagmi'

function EnsName(props) {
  const { data, isError, isLoading } = useEnsName({
    address: props.address,
  })

  if (isLoading) return <h5>Fetching ENS name…</h5>
  if (isError) return <h5>Error fetching ENS name</h5>
  return <h5>{data}</h5>
}

export default EnsName;

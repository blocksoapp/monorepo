import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { Button } from 'react-bootstrap'

function DisplayConnection() {
  const { address, isConnected } = useAccount()
  const {data: ensName } = useEnsName({ address })
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  if (isConnected)
    return (
      <div>
        Connected to {ensName ? `${ensName} (${address})` : address}
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </div>
    )
  return <Button onClick={() => connect()}>Connect Wallet</Button>
}

export default DisplayConnection
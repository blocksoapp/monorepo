import React from 'react'
import { useConnect } from 'wagmi'
import { Row, Col, Button } from 'react-bootstrap'

function WalletOptions() {
    const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
 
    return (
        <Row className='red-border'>
            {connectors.map((connector) => (
                <div className='d-flex flex-column p-0'>
                    <button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    >
                    {connector.name}
                    {!connector.ready && ' (unsupported)'}
                    {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting)'}
                    </button>
                </div>
            ))}
    
            {error && <div>{error.message}</div>}
        </Row>
    )
}

export default WalletOptions


 

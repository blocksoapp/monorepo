import React from 'react'
import { useConnect } from 'wagmi'
import { Button, Alert } from 'react-bootstrap'

function Wallets() {
    const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
 
    return (
        <div className=''>
            {connectors.map((connector) => (
                <div className='d-flex flex-column py-1'>
                    <Button
                    className='p-2'
                    
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    >
                        <span className='fw-bold'>
                            {connector.name}
                            {!connector.ready && ' (unsupported)'}
                            {isLoading &&
                                connector.id === pendingConnector?.id &&
                                ' (connecting)'}
                        </span>
                    </Button>
                </div>
            ))}
            {error && <Alert variant='danger' className='mt-4'>{error.message}</Alert>}
        </div>
    )
}

export default Wallets


 

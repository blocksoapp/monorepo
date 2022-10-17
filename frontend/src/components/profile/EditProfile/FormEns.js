import React from 'react'
import { Form, Button } from 'react-bootstrap'
import EnsAndAddress from '../../EnsAndAddress'
import { useEnsName } from 'wagmi'

function FormEns(props) {
       // constants
       const { data } = useEnsName({
        address: props.address,
    })

     // functions
     const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + props.address.substr(37,5);
    }

  return (
    <div className='p-3'>
         <Form.Label className='fw-bold'>Use an ENS </Form.Label> 
         <br/>
         
        <div className='border p-3'>
            {data ? 
            <>
                <EnsAndAddress address={props.address}/>
                <Button className="btn-sm me-4 mt-1" variant="dark">Save</Button>
            </>
            :`No ENS associated with your account '${getAbbrAddress(props.address)}'.`}
        </div>        
    </div>
  )
}

export default FormEns
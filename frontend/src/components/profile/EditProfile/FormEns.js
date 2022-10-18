import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import EnsAndAddress from '../../EnsAndAddress'
import { useEnsAvatar } from 'wagmi'

function FormEns(props) {
    // constants
    const { setProfile } = props
    const { data } = useEnsAvatar({ addressOrName: 'vitalik.eth' })
    const [loadingMsg, setLoadingMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)

     // functions
     const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + props.address.substr(37,5);
    }

    const handleSubmit = () => {
        // Return if no ens avatar
        if (data === null || '') {
            console.log('data is null or empty')
            setLoadingMsg(`No ENS avatar associated with ${getAbbrAddress(props.address)}`)
            return
        } else {
            setLoadingMsg('Fetching your ENS avatar...')
            setIsLoading(true)
            console.log('ens avatar: ', data)
            // update profile to include image url 
            setProfile(prevValue => {
                return {
                    ...prevValue,
                    image: data
                }
            })
            setLoadingMsg('Completed! Please submit the form to update your profile picture.')
            setIsLoading(false)
            // else if no ens avar
                // return error or set default card img
        }
    }

  return (
    <div className='p-3'>
         <Form.Label className='fw-bold'>Use an ENS </Form.Label> 
         <br/>
         
        <div className='border p-3 d-flex flex-column'>
                <EnsAndAddress address={props.address}/>
                <Button onClick={handleSubmit} className="btn-sm me-4 mt-1" variant="dark">Save</Button>
                {loadingMsg}
        </div>        
    </div>
  )
}

export default FormEns
import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import EnsAndAddress from '../../EnsAndAddress'
import { useEnsAvatar } from 'wagmi'
import Pfp from '../../Pfp'

function FormEns(props) {
    // constants
    const { setProfile, setPfpPreview  } = props
    const { data } = useEnsAvatar({ addressOrName: 'vitalik.eth' })
    const [loadingMsg, setLoadingMsg] = useState('Set Avatar')
    const [isLoading, setIsLoading] = useState(false)

     // functions
     const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + props.address.substr(37,5);
    }

    const handleSubmit = () => {
        // Return if no ens avatar
        if (data === null || '') {
            console.log('data is null or empty')
            return
        } else {
            setPfpPreview(data)
            setIsLoading(true)
            // update profile to include image url 
            setProfile(prevValue => {
                return {
                    ...prevValue,
                    image: data
                }
            })
            setIsLoading(false)
            setLoadingMsg('Success')
            // else if no ens avar
                // return error or set default card img
        }
    }

    

    useEffect(() => {
    const handleLoad = () => {
        if(isLoading) {
            setLoadingMsg("Fetching...")
        } else return
    }

    handleLoad()
    
    }, [isLoading])
    

  return (
    <div className='p-3'>
         <Form.Label className='fw-bold'>Use an ENS Avatar</Form.Label> 
         <br/>
                       
        <div className=''>
                {!data ? `No ENS avatar associated with ${getAbbrAddress(props.address)}`:
                <div>
                    <Form.Text className="text-muted">
                    Alternatively, you can use your ENS avatar as your profile picture.  
                    </Form.Text> 
                    <br/>
                    <Button onClick={handleSubmit} className="btn-sm mt-2" variant="dark">{loadingMsg}</Button> 
                </div>
                }               
        </div>        
    </div>
  )
}

export default FormEns
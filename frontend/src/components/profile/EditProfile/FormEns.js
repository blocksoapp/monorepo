import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useEnsAvatar } from 'wagmi'
import { abbrAddress } from '../../../utils'

function FormEns(props) {
    // constants
    const { setProfile, setPfpPreview, profile  } = props
    const { data } = useEnsAvatar({ addressOrName: props.address })
    const [loadingMsg, setLoadingMsg] = useState('Set Avatar')
    const [isLoading, setIsLoading] = useState(false)
    
    const updateLoadingMessage = (message) => {
        setLoadingMsg(message)
        setTimeout(() => {
            setLoadingMsg('Set Avatar')
          }, 3000)
        }

    const updatePfpPreview = () => {
        // Return if no Ens avatar
        if (data === null || '') {
            console.log('data is null or empty')
            return
        } 
        // PFP is already set as ENS avatar
        else if(data === profile['image']) {
            console.log('its already your profile pic')
            updateLoadingMessage('Failed')
            return
        }
        // If not signed in + no profile data
        else if(profile !== undefined){
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
            updateLoadingMessage('Success')
        } else {
            console.log('unable to authenticate user')
            return
        }
    }

    useEffect(() => {
    const handleLoad = () => {
        if(isLoading) {
            updateLoadingMessage('Fetching')
        } else return
    }
    handleLoad()
    }, [isLoading])


  return (
    <div className='p-3'>
         <Form.Label className='fw-bold'>Use an ENS Avatar</Form.Label> 
         <br/>
                       
        <div className='pt-3'>
                {!data ? <p className='fs-5'>No ENS avatar associated with {abbrAddress(props.address)}</p>:
                <div>
                    <Form.Text className="text-muted">
                    Alternatively, you can use your ENS avatar as your profile picture.  
                    </Form.Text> 
                    <br/>
                    <Button onClick={updatePfpPreview} className="btn-sm mt-2" variant="outline-dark">{loadingMsg}</Button> 
                    {loadingMsg === 'Failed' ? <p className='mt-2'>You are already using your ENS avatar as your profile picture.</p>:
                    loadingMsg === 'Success' ? <p className='mt-2'>Submit form or upload your new profile picture above to save changes.</p>:  
                    ''}
                </div>
                }               
        </div>        
    </div>
  )
}

export default FormEns
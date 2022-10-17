import React, { useState, useEffect, useRef } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useAccount} from 'wagmi'
import { NFTStorage, Blob } from 'nft.storage'
import { nftAPI } from '../../../utils'

function FileUpload({ setProfile }) {
        // state for filepath
        const [imagePath, setImagePath] = useState('')
        const [bufferImage, setBufferImage] = useState([])
        const [isLoading, setIsLoading] = useState(Boolean)
        const [loadingText, setLoadingText] = useState('')

        const { isConnected } = useAccount()

        useEffect(() => {
          console.log("buffer state:",bufferImage)
        }, [bufferImage])
        

      // Updates File Path state
      const handleBufferChange = async (event) => {
        const buffer = event.target.files[0]
        setBufferImage(buffer)
    }


    // Handle Submission to DB
    const handleFileSubmit = async () => {
        if(!isConnected) return
        setIsLoading(true)
        setLoadingText("Retrieving an ipfs link...")
        const client = new NFTStorage({ token: nftAPI })
        const content = new Blob([bufferImage])
        var cid = await client.storeBlob(content)
        console.log('fetching nft storage api')
        const res = await fetch('https://api.nft.storage/upload', {
            method: 'POST',
            body: JSON.stringify({data: content}),
            headers: {
                'accept': 'application/json',
                'Content-Type': 'image/png',
                'Authorization': `Bearer ${nftAPI}`
              }
        })
        const data = await res.json()
        if(data.ok) {
            console.log('uploaded to ipfs successfully')
            const ipfs = `https://${cid}.ipfs.nftstorage.link`
            setProfile(prevValue => {
                return {
                    ...prevValue,
                    image: ipfs
                }
            })
            setIsLoading(false)
            setLoadingText('Successfully uploaded image to ipfs!')
        } else if (!data.ok) {
            console.log('There was an error uploading your image to ipfs')
        }
    } 

    // Reset loadingText state after 5 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoadingText('')
      }, 5000);
      return () => clearTimeout(timer);
    }, [loadingText]);

  return (
    <div>
        <Form.Group className="p-3">
    
            <Form.Group className="mb-1">
              <Form.Label className="fw-bold">Upload an Image</Form.Label>
              <Form.Control onChange={handleBufferChange} type="file"/>
            </Form.Group>

            <div className='d-flex align-items-center'>
              <Button className="mt-2 me-3 btn-sm" variant="dark" onClick={handleFileSubmit}>Save</Button>
              <Form.Text className={`${!isLoading ? 'text-success' : 'text-muted'}`}>
              {loadingText}
              </Form.Text>
            </div>
        </Form.Group>
    </div>
  )
}

export default FileUpload


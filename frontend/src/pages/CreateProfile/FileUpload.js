import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { NFTStorage, Blob } from 'nft.storage'
import { nftAPI } from '../../utils'
import { useAccount} from 'wagmi'

function FileUpload({ profile, setProfile }) {
        // state for filepath
        const [imagePath, setImagePath] = useState('')
        const [bufferImage, setBufferImage] = useState([])

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
        } else if (!data.ok) {
            console.log('There was an error uploading your image to ipfs')
        }
    } 

  return (
    <Form.Group className="mb-3 border p-3">
        <Form.Label>Profile Picture</Form.Label>
            <Form.Control onChange={handleBufferChange} type="file" id="file" size="sm" name="imagePath" value={imagePath}/>
            <Form.Text className="text-muted mb-3">
            Upload a file for your profile picture. <br/>
            </Form.Text> 
            <Button className="mt-2 btn-sm" onClick={handleFileSubmit}>Upload File</Button>
        </Form.Group>
  )
}

export default FileUpload
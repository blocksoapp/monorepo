import React, { useState } from 'react'
import { Form } from 'react-bootstrap'
import { NFTStorage, File } from 'nft.storage'
import { nftStorageAPI } from '../../utils'
import { useAccount} from 'wagmi'

function FileUpload() {
        // state for filepath
        const [imagePath, setImagePath] = useState('')

        const { address } = useAccount()

      // Updates File Path state
      const handleImagePathChange = async (event) => {
        const client = new NFTStorage({ token: nftStorageAPI })
        const imagePath = event.target.value
        console.log(imagePath)

        // Store image to metadata
        const metadata = await client.store({
            name: `User ${address}'s Avatar`,
            description: 'Test ERC-1155 compatible metadata.',
            image: new File([imagePath], 'lol.png', { type: 'image/png' })
          })

        // Uploads image to ipfs
        const uploadImageRes = await fetch('https://api.nft.storage/upload', {
            method: 'POST',
            body: JSON.stringify({data: metadata }),
            headers: {
                'accept': 'application/json',
                'Content-Type': 'image/png',
                'Authorization': `Bearer ${nftStorageAPI}`
              }
        })

        console.log('uploadimg res: ', uploadImageRes)
        const json = await uploadImageRes.json()
        console.log('json: ', json)
        
        //const cid = await client.storeBlob(content)
        //console.log(cid) //> 'zdj7Wn9FQAURCP6MbwcWuzi7u65kAsXCdjNTkhbJcoaXBusq9'
    }

  return (
    <Form.Group className="mb-3 border p-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control onChange={handleImagePathChange} type="file" size="sm" name="imagePath" value={imagePath}/>
            <Form.Text className="text-muted mb-3">
            Upload a file for your profile picture.
            </Form.Text>
        </Form.Group>
  )
}

export default FileUpload
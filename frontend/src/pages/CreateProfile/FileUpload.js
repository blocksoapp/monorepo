import React, { useState } from 'react'
import { Form, Button, Col, Row } from 'react-bootstrap'
import { NFTStorage, Blob } from 'nft.storage'
import { nftStorageAPI } from '../../utils'
import { useAccount} from 'wagmi'

function FileUpload({ profile, setProfile }) {
        // state for filepath
        const [imagePath, setImagePath] = useState('')
        const [buffer, setBuffer] = useState([])

        const { address } = useAccount()

      // Updates File Path state
      const handleImagePathChange = async (event) => {
        const client = new NFTStorage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDA1NTM1ZjNlNDVGNjc5NDgyRjljQTllOWM5QTdmMjM0NDViNzY5NjIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzYyMjMxOTk5OCwibmFtZSI6ImJsb2Nrc28ifQ.XiamSrDC0I7CpyOKZhJFYLJzYKCC2GdScg1gi4nn-qI' })
        //const imagePath = event.target.value
        //setFile(document.getElementById('file').files[0])

        const buffer = event.target.files[0]
        //const reader = new window.FileReader()
        //reader.readAsArrayBuffer(file)
        //reader.onloadend = () => {
           // setBuffer(Buffer.from(reader.result))
        //}

        console.log(buffer)
        

        // Store image to metadata
        /* const metadata = await client.store({
            name: `User ${address}'s Avatar`,
            description: 'Test ERC-1155 compatible metadata.',
            image: new File([file], imagePath, { type: 'image/png' })
          }) */

        // blob method 
        const content = new Blob([buffer])
        const cid = await client.storeBlob(content)
        console.log(cid) //> 'zdj7Wn9FQAURCP6MbwcWuzi7u65kAsXCdjNTkhbJcoaXBusq9'

        // Uploads image to ipfs
        const res = await fetch('https://api.nft.storage/upload', {
            method: 'POST',
            body: JSON.stringify({data: content}),
            headers: {
                'accept': 'application/json',
                'Content-Type': 'image/png',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDA1NTM1ZjNlNDVGNjc5NDgyRjljQTllOWM5QTdmMjM0NDViNzY5NjIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzYyMjMxOTk5OCwibmFtZSI6ImJsb2Nrc28ifQ.XiamSrDC0I7CpyOKZhJFYLJzYKCC2GdScg1gi4nn-qI`
              }
        })

        console.log('uploading res: ', res)
        const json = await res.json()
        console.log('json: ', json)
        const uri = 'https://www.ipfs.com/ipfs/'
        const ipfs = `${uri}${cid}`
        
        setProfile(prevValue => {
            return {
                ...prevValue,
                image: ipfs
            }
        })
        
        
    }


  return (
    <Form.Group className="mb-3 border p-3">
        <Form.Label>Profile Picture</Form.Label>
            <Form.Control onChange={handleImagePathChange} type="file" id="file" size="sm" name="imagePath" value={imagePath}/>
        <Row>
        <Col>
            <Form.Label>Name</Form.Label>  
            <Form.Control type="text" size="sm" name="imageName"/>
        </Col>
        <Col>
            <Form.Label>Description</Form.Label>  
            <Form.Control type="text" size="sm" name="imageDescription"/>
        </Col>
        </Row>
            
            <Form.Text className="text-muted mb-3">
            Upload a file for your profile picture.
            </Form.Text> 
            <Button>Upload File</Button>
          
        </Form.Group>
  )
}

export default FileUpload
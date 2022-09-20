import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useContractRead } from 'wagmi'
import { erc721ABI } from 'wagmi'

function NftForm({ profile, setProfile }) {
  const [nft, setNft] = useState({
    tokenId: null,
    contractAddress: ''
})

  const contract = useContractRead({
    addressOrName: nft.contractAddress,
    contractInterface: erc721ABI,
    functionName: 'tokenURI',
    args: nft.tokenId
  })


    // Updates NFT state
    const handleNftChange = (event) => {
      const { name, value } = event.target

      setNft(prevValue => {
          return {
              ...prevValue,
              [name]: value
          }
      })

      console.log(nft)
  } 

      // Gets NFT metadata
      const getNftMetadata = async () => {

        // Returns tokenUri string
        const tokenUriResult = contract.data
          // Some results start with ipfs:// and others a direct link
        if(tokenUriResult.startsWith('ipfs://')) {
          const tokenUriResultSliced = contract.data.slice(7)
          const ipfsLink = `https://ipfs.io/ipfs/${tokenUriResultSliced}`
           // Fetch ipfs metdata
          const ipfsRes = await fetch(ipfsLink)
          // Store image 
          const ipfs = await ipfsRes.json()
          console.log(ipfs.image)
          // set profile.image state to ipfs.image
          setProfile(prevValue => {
              return {
                  ...prevValue,
                  image: ipfs.image
              }
          })
          console.log(profile)
        } else {
          const ipfsRes = await fetch(tokenUriResult)
          const ipfs = await ipfsRes.json()
          console.log(ipfs.image)
          setProfile(prevValue => {
              return {
                  ...prevValue,
                  image: ipfs.image
              }
          })
          console.log(profile)
        }
  }

  return (
    <Form.Group className="mb-3 border p-3">
    <Form.Label>NFT TokenId</Form.Label>
        <Form.Control onChange={handleNftChange} type="text" size="sm" name="tokenId" value={nft.name}/>
        <Form.Label>NFT Contract Address</Form.Label>
        <Form.Control onChange={handleNftChange} type="text" size="sm" name="contractAddress" value={nft.name}/>
        <Form.Text className="text-muted">
        Alternatively, you can enter your NFT details for your profile picture.
        </Form.Text>
        <br/>
        <Button className="btn-sm" onClick={getNftMetadata}>Verify NFT</Button>
    </Form.Group>
  )
}

export default NftForm
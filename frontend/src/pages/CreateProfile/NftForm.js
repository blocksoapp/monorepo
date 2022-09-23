import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useContractRead } from 'wagmi'
import { erc721ABI } from 'wagmi'

function NftForm({ profile, setProfile }) {
  const [nft, setNft] = useState({
    tokenId: null,
    contractAddress: ''
})
  // Instantiate the contract
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
  } 

      // Gets NFT metadata
      const getNftMetadata = async () => {
        // Returns tokenUri method data
        const tokenUriResult = contract.data
        // Adjust URL
        if(tokenUriResult.startsWith('ipfs://')) {
          const tokenUriResultSliced = contract.data.slice(7)
          const ipfsDomain = 'https://ipfs.io/ipfs/'
          const ipfsLink = `${ipfsDomain}${tokenUriResultSliced}`
          const ipfsRes = await fetch(ipfsLink)
          // Store image 
          const ipfsResJson = await ipfsRes.json()
          const jsonResultSliced = ipfsResJson.image.slice(7)
          const ipfs = `${ipfsDomain}${jsonResultSliced}` 
          // Set profile.image state to ipfs
          setProfile(prevValue => {
              return {
                  ...prevValue,
                  image: ipfs
              }
          })
        } else {
          // If metadata includes normal link
          const ipfsRes = await fetch(tokenUriResult)
          const ipfs = await ipfsRes.json()
          setProfile(prevValue => {
              return {
                  ...prevValue,
                  image: ipfs.image
              }
          })
        }
  }

  return (
    <Form.Group className="mb-3 border p-3">
    <Form.Label>Profile Picture (NFT): </Form.Label> <br/>
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
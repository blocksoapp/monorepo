import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useContractRead, erc721ABI } from 'wagmi'

function NftForm({ setProfile }) {
  // State
  const [nft, setNft] = useState({
    tokenId: null,
    contractAddress: ''
})
  const [isLoading, setIsLoading] = useState(Boolean)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [isError, setIsError] = useState(Boolean)

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
        try {
            // Returns tokenUri method data
          const tokenUriResult = contract.data
          // Adjust URL
          if(tokenUriResult.startsWith('ipfs://')) {
            setIsLoading(true)
            setLoadingMsg('Verifying NFT Data...')
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
            setIsLoading(false)
            setLoadingMsg('Success!')
          } else {
            // If metadata includes normal link
            setIsLoading(true)
            setLoadingMsg('Verifying NFT Data...')
            const ipfsRes = await fetch(tokenUriResult)
            const ipfs = await ipfsRes.json()
            setProfile(prevValue => {
                return {
                    ...prevValue,
                    image: ipfs.image
                }
            })
            setIsLoading(false)
            setLoadingMsg('Success!')
          }
        } catch (error) {
          console.log("error uploading nft: ", error)
          setIsLoading(false)
          setIsError(true)
          setLoadingMsg('Error. Please make sure both fields are correct.')
        }
  }

      // Reset loadingText state after 5 seconds
      useEffect(() => {
        const timer = setTimeout(() => {
          setLoadingMsg('')
        }, 5000);
        return () => clearTimeout(timer);
      }, [loadingMsg]);

  

  return (
    <Form.Group className="mb-3 p-3">
      <Form.Label className='fw-bold'>Upload NFT </Form.Label> <br/>
      {/* <Form.Label>TokenId</Form.Label>   */}
      <Form.Control className="mb-2" onChange={handleNftChange} type="text" size="sm" name="tokenId" value={nft.name} placeholder="Token Id"/>
      {/* <Form.Label>Contract Address</Form.Label> */}
      <Form.Control onChange={handleNftChange} type="text" size="sm" name="contractAddress" value={nft.name} placeholder="Contract Address"/>
      <Form.Text className="text-muted">
          Alternatively, you can enter your NFT details for your profile picture.  <br/>
      </Form.Text>
      <div className='d-flex align-items-center'>
              <Button className="btn-sm me-4 mt-1" variant="dark" onClick={getNftMetadata}>Verify</Button>
              <Form.Text className={`${!isError ? 'text-muted' : 'text-danger'}`}>
              {loadingMsg}
              </Form.Text>
      </div>
    </Form.Group>
  )
}

export default NftForm

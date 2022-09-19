import React, {useState} from 'react'
import { Container, Form, Button, Row, Col } from 'react-bootstrap'
import { useAccount, useContractRead } from 'wagmi'
import { erc721ABI } from 'wagmi'

function getCookie(name) {
    if (!document.cookie) {
      return null;
    }
  
    const xsrfCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith(name + '='));
  
    if (xsrfCookies.length === 0) {
      return null;
    }
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
  }
 
function CreateProfile() {
    const [profile, setProfile] = useState({
        image: '',
        bio: '',
        socials: {
            website: '',
            telegram: '',
            discord: '',
            twitter: '',
            opensea: '',
            looksrare: '',
            snapshot: ''
        }
    })
    const [nft, setNft] = useState({
        tokenId: null,
        contractAddress: ''
    })

    const initialState = {
        image: '',
        bio: '',
        socials: {
            website: '',
            telegram: '',
            discord: '',
            twitter: '',
            opensea: '',
            looksrare: '',
            snapshot: ''
        }
    }

    const { isConnected, address } = useAccount();
    const contract = useContractRead({
        addressOrName: nft.contractAddress,
        contractInterface: erc721ABI,
        functionName: 'tokenURI',
        args: nft.tokenId
      })

    // Form State Update
    const handleChange = (event) => {
        const { name, value } = event.target

        setProfile(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })

        console.log(profile)
    } 
    
    // Form Submission Function
    const handleSubmit = async () => {

        if(!isConnected) return

        const res = await fetch(`http://localhost:8000/api/${address}/profile`, {
            method: 'POST',
            body: JSON.stringify(profile),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFTOKEN': getCookie('csrftoken')
              },
              credentials: 'include'
        }) 

        const json = await res.json();

        if (!res.ok) {
            throw new Error('Failed to post data') 
        } else if(res.ok) {
            console.log('sucess posting data')
            // Reset profile object
            setProfile({...initialState})
        }
    }

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
            <>
                <Container className='p-3'>
                    <Form>
                    <Form.Group className="mb-3 border p-3">
                        <Form.Label>Profile Picture</Form.Label>
                        <Form.Control onChange={handleChange} type="file" size="sm" name="image" value={profile.name}/>
                        <Form.Text className="text-muted mb-3">
                        Upload a file for your profile picture.
                        </Form.Text>
                    </Form.Group>

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
        
                    <Form.Group className="mb-3 border p-3">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control onChange={handleChange} name="bio" value={profile.name} type="text" placeholder="" />
                        <Form.Text className="text-muted">
                        Tell us a little about yourself.
                        </Form.Text>
                    </Form.Group>
        
                    <div className="border p-3">
                        <h3>Add Socials (optional):</h3>
                        <Form.Group className="mb-3" controlId="website">
                        <Form.Label>Website</Form.Label>
                        <Form.Control onChange={handleChange} name="website" value={profile.socials.name} type="text" size="sm" placeholder="" />
                        </Form.Group>
        
                        <Row>
        
                            <Col>
                                <Form.Group className="mb-3" controlId="">
                                <Form.Label>Twitter</Form.Label>
                                <Form.Control onChange={handleChange} name="twitter" value={profile.socials.name} type="text" size="sm" placeholder="" />
                                </Form.Group>
        
                                <Form.Group className="mb-3" controlId="">
                                <Form.Label>Telegram</Form.Label>
                                <Form.Control onChange={handleChange} name="telegram" value={profile.socials.name} type="text" size="sm" placeholder="" />
                                </Form.Group>
        
                                <Form.Group className="mb-3" controlId="">
                                <Form.Label>Discord</Form.Label>
                                <Form.Control onChange={handleChange} name="discord" value={profile.socials.name} type="text" size="sm" placeholder="" />
                                </Form.Group>
                            </Col>
        
                            <Col>
                                <Form.Group className="mb-3" controlId="">
                                <Form.Label>Opensea</Form.Label>
                                <Form.Control onChange={handleChange} name="opensea" value={profile.socials.name} type="text" size="sm" placeholder="" />
                                </Form.Group>
        
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>LooksRare</Form.Label>
                                    <Form.Control onChange={handleChange} name="looksrare" value={profile.socials.name} type="text" size="sm" placeholder="" />
                                </Form.Group>
        
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Snapshot</Form.Label>
                                    <Form.Control onChange={handleChange} name="snapshot" value={profile.socials.name} type="text" size="sm" placeholder="" />
                                </Form.Group>
                            </Col>
        
                         </Row>
                    </div>
                    <Button disabled={!isConnected} variant="primary"  type="submit" onClick={handleSubmit}>
                        Submit
                    </Button> 
                        {!isConnected ? <Form.Text className="text-muted p-3">
                        Please connect to Metamask before submitting.
                        </Form.Text> : '' }
                    </Form>
                </Container>
            </>
          )
}

export default CreateProfile
import React from 'react'
import { Image, Button, Placeholder, Card } from 'react-bootstrap'

function FollowPlaceholder() {
    return (
        <div className="d-flex flex-sm-row flex-column align-items-sm-center py-sm-3 py-1 px-md-5 light-hover text-center text-sm-start">
                <div>
                <Image
                    className="bg-secondary mt-2"
                    height="100px"
                    width="100px"
                    roundedCircle
                />
                </div>
                <div className='flex-grow-1 ps-sm-4'>
                    <div className='follow-body align-items-center'>
                        <Placeholder xs={2} size="md"/>
                        <div className='align-self-center follow-btn'>
                           <Placeholder.Button animation="wave">
                                <Button></Button>
                           </Placeholder.Button>
                        </div>
                    </div>
                    <div className='pb-2'>
                        <Placeholder as={Card.Text} variant='primary' animation="wave">
                            <Placeholder xs={10} />{' '}
                            <br/>
                            <Placeholder xs={10} />
                        </Placeholder>
                    </div>
                </div>
        </div>
   
  )
}

export default FollowPlaceholder
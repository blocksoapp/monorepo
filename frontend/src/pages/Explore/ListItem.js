import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { baseAPI } from '../../utils'

function ListItem({address, index}) {

    const navigate = useNavigate()

    const etherscanUrl = `https://etherscan.io/address/${address}`

    const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + address.substr(37,5);
    }

    const handleClick = () => {
        console.log('view profile requested')
        navigate(`/${address}/profile`)
        
    }

  return (
    <div className="d-flex flex-column justify-content-center p-3 mb-5 align-items-center border">
            {/*
            Image here
            Make display image function reusable from wallet feed
            */}
            <a 
             href={etherscanUrl} 
             rel="noreferrer" 
             target="_blank" >
                {getAbbrAddress(address)}
            </a>
            <Button 
             className="btn-sm" 
             onClick={handleClick} >
                View Profile
            </Button>
    </div>
  )
}

export default ListItem
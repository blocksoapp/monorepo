import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { useEnsName } from 'wagmi'

function ListItem({item, index}) {

    const navigate = useNavigate()
    const etherscanUrl = `https://etherscan.io/address/${item}`

    //Using ENS Name
    const { data, isLoading } = useEnsName({
        address: item,
      })

    // Abbreviate address
    const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + address.substr(37,5);
    }

    const displayName = () => {
        if (isLoading) return <p>Fetching name…</p>
        if (!data) return <a href={etherscanUrl} rel="noreferrer" target="_blank" > {getAbbrAddress(item)} </a>
        else if(data) return <a href={etherscanUrl} rel="noreferrer" target="_blank" > {data} </a>
    }

    const handleClick = () => {
        console.log('view profile requested')
        navigate(`/${item}/profile`)
    }

  return (
    <div className="d-flex flex-column justify-content-center p-3 mb-5 align-items-center border">
            {/*
            Image here
            Make display image function reusable from wallet feed
            */}
            <div>
                {displayName()}
            </div>
            <Button 
             className="btn-sm" 
             onClick={handleClick} >
                View Profile
            </Button>
    </div>
  )
}

export default ListItem
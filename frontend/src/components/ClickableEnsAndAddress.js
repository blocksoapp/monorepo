import React from 'react'
import EnsAndAddress from './EnsAndAddress'

function ClickableEnsAndAddress(props) {
  return (
    <span className={props.className} onClick={props.onClick}>
        <EnsAndAddress address={props.address}/>
    </span>
  )
}

export default ClickableEnsAndAddress
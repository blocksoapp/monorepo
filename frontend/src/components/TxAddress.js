import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import EnsAndAddress from "./EnsAndAddress";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import ProfilePreview from './profile/ViewProfile/ProfilePreview';
import { apiGetProfile } from '../api'


function TxAddress(props) {
    // constants

    // state
    const [previewData, setPreviewData] = useState(null)
    const [previewLoading, setPreviewLoading]  = useState(false)
  
    const fetchProfile = async () => {
      setPreviewLoading(true);
      const resp = await apiGetProfile(props.address)
      if (resp.ok) {
          var data = await resp.json();
          console.log("data: ", data)
          setPreviewData(data);
          setPreviewLoading(false);
      }
      else {
          console.error(resp);
          setPreviewData(null)
          setPreviewLoading(false)
      }
  }
  
    useEffect(() => {
      fetchProfile()
    
    }, [])
        
    // render
    return (
        <OverlayTrigger
        trigger={['hover', 'focus']}
        placement='auto-start'
        overlay={
          <Popover>
            <Popover.Body className='popover'>
              <ProfilePreview
              address={props.address}
              previewData={previewData}
              previewLoading={previewLoading}
              imgUrl={props.imgUrl}
              bio={props.bio}
              numFollowers={props.numFollowers}
              numFollowing={props.numFollowing}
              />
            </Popover.Body>
          </Popover>
        }
        >
            <span>
                <Link to={`/${props.address}/profile`}>
                    @<EnsAndAddress address={props.address} />
                </Link>
            </span>
        </OverlayTrigger>
        
    )
}


export default TxAddress;
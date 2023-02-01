import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import "./feed-option-styles.css";


function FeedOptions({feedId}) {
    // hooks
    const navigate = useNavigate();

    // render
    return (
        <NavDropdown
          id="feed-options-dropdown"
          drop="bottom"
          title={
              <Button variant="transparent">
                <FontAwesomeIcon icon={faEllipsisV} />
              </Button>
          }
        >
            <NavDropdown.Item
                onClick={() => navigate(`/feeds/${feedId}/edit`)}
            >
                Edit Feed
            </NavDropdown.Item>
            <NavDropdown.Item>Delete Feed</NavDropdown.Item>
        </NavDropdown>
    );
}

export default FeedOptions;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import DeleteFeedModal from './DeleteFeedModal';
import "./feed-option-styles.css";


function FeedOptions({feedId}) {
    // hooks
    const navigate = useNavigate();

    // state
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            <NavDropdown.Item onClick={() => setShowDeleteModal(true)}>
                Delete
            </NavDropdown.Item>
            <DeleteFeedModal
                feedId={feedId}
                show={showDeleteModal}
                setShow={setShowDeleteModal}
            />
        </NavDropdown>
    );
}

export default FeedOptions;

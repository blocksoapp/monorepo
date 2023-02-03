import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { Button, Container, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import DeleteFeedModal from './DeleteFeedModal';
import "./feed-option-styles.css";


function FeedOptions({feed}) {
    // hooks
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    // state
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // render
    return (
        <>
            {(user !== null && (feed.owner.address === user.address || feed.followingEditableByPublic)) && (
                <NavDropdown
                    id="feed-options-dropdown"
                    drop="bottom"
                    title={
                        <Button variant="transparent">
                            <FontAwesomeIcon icon={faEllipsisV} />
                        </Button>
                    }
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Edit Feed */}
                    {(feed.owner.address === user.address || feed.followingEditableByPublic) && (
                        <NavDropdown.Item
                            onClick={() => navigate(`/feeds/${feed.id}/edit`)}
                        >
                            Edit Feed
                        </NavDropdown.Item>
                    )}

                    {/* Delete Feed */}
                    {feed.owner.address === user.address && (
                        <div>
                            <NavDropdown.Item onClick={() => setShowDeleteModal(true)}>
                                Delete
                            </NavDropdown.Item>
                            <DeleteFeedModal
                                feedId={feed.id}
                                show={showDeleteModal}
                                setShow={setShowDeleteModal}
                            />
                        </div>
                    )}
                </NavDropdown>
            )}
        </>
    );
}

export default FeedOptions;

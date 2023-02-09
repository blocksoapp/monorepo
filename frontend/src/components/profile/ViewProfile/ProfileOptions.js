import { useContext, useState } from 'react';
import { Button, Container, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../../contexts/UserContext';
import AddToFeedModal from '../../feed/write/AddToFeedModal';
import "../../feed/read/feed-option-styles.css";


function ProfileOptions({profile}) {
    // hooks
    const { user } = useContext(UserContext);

    // state
    const [showAddToFeedModal, setShowAddToFeedModal] = useState(false);

    // render
    return (
        <>
            {user !== null && (
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
                    {/* Add to Feed */}
                    <div>
                        <NavDropdown.Item onClick={() => setShowAddToFeedModal(true)}>
                            Add to Feed
                        </NavDropdown.Item>
                        <AddToFeedModal
                            profile={profile}
                            show={showAddToFeedModal}
                            setShow={setShowAddToFeedModal}
                        />
                    </div>
                </NavDropdown>
            )}
        </>
    );
}

export default ProfileOptions;

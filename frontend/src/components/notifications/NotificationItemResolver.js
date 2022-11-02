import { useEffect, useState } from "react";
import { NavDropdown } from "react-bootstrap";
import CommentOnPost from "./CommentOnPost";
import Followed from "./Followed";
import MentionedInComment from "./MentionedInComment";


function NotificationItemResolver({data}) {

    return (
        <>
            {/* user commented on your post */}
            {data['events']['commentOnPostEvent'] &&
                <CommentOnPost data={data['events']['commentOnPostEvent']} />
            }

            {/* user mentioned you in a comment */}
            {data['events']['mentionedInCommentEvent'] &&
                <MentionedInComment data={data['events']['mentionedInCommentEvent']} />
            }

            {/* user followed you */}
            {data['events']['followedEvent'] &&
                <Followed data={data['events']['followedEvent']} />
            }
        </>
    )
}


export default NotificationItemResolver;

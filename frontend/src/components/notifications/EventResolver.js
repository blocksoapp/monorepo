import CommentOnPostEvent from "./CommentOnPostEvent";
import FollowedEvent from "./FollowedEvent";
import MentionedInCommentEvent from "./MentionedInCommentEvent";


function EventResolver({data, setHref}) {

    return (
        <>
            {/* user commented on your post */}
            {data['commentOnPostEvent'] &&
                <CommentOnPostEvent
                    data={data['commentOnPostEvent']}
                    setHref={setHref}
                />
            }

            {/* user mentioned you in a comment */}
            {data['mentionedInCommentEvent'] &&
                <MentionedInCommentEvent
                    data={data['mentionedInCommentEvent']}
                    setHref={setHref}
                />
            }

            {/* user followed you */}
            {data['followedEvent'] &&
                <FollowedEvent
                    data={data['followedEvent']}
                    setHref={setHref}
                />
            }
        </>
    )
}


export default EventResolver;

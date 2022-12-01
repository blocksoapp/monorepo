import CommentOnPostEvent from "./events/CommentOnPostEvent";
import FollowedEvent from "./events/FollowedEvent";
import MentionedInCommentEvent from "./events/MentionedInCommentEvent";
import MentionedInPostEvent from "./events/MentionedInPostEvent";


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

            {/* user mentioned you in a post */}
            {data['mentionedInPostEvent'] &&
                <MentionedInPostEvent
                    data={data['mentionedInPostEvent']}
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

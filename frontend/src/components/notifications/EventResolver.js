import CommentOnPostEvent from "./events/CommentOnPostEvent";
import FollowedEvent from "./events/FollowedEvent";
import LikedPostEvent from "./events/LikedPostEvent";
import MentionedInCommentEvent from "./events/MentionedInCommentEvent";
import MentionedInPostEvent from "./events/MentionedInPostEvent";
import RepostEvent from "./events/RepostEvent";


function EventResolver({data, setHref}) {

    return (
        <>
            {/* user liked your post */}
            {data['likedPostEvent'] &&
                <LikedPostEvent
                    data={data['likedPostEvent']}
                    setHref={setHref}
                />
            }

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

            {/* user reposted your item */}
            {data['repostEvent'] &&
                <RepostEvent
                    data={data['repostEvent']}
                    setHref={setHref}
                />
            }
        </>
    )
}


export default EventResolver;

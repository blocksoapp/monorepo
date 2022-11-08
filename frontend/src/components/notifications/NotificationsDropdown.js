import { useEffect, useState } from "react";
import { Button, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { 
    apiGetNotifications,
    apiMarkNotificationsRead
} from "../../api.js";
import NotificationItem from "./NotificationItem.js";
import "./styles.css";


function NotificationsDropdown() {

    // state
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifs, setNotifs] = useState(null); 
    const [notifsLoading, setNotifsLoading] = useState(true); 
    const [notifsError, setNotifsError] = useState(false); 

    // functions
    /*
     * Sets the unread count based on the 'viewed'
     * property of the items in the given data.
     */ 
    const setUnreadsFromData = (data) => {
        var count = 0;
        for (var item of data) {
            if (item["viewed"] === false) {
                count++;
            }
        }
        setUnreadCount(count);
    }

    /*
     * Marks the currently loaded notifications as read.
     */
    const markNotificationsAsRead = async () => {
        // do nothing if there are no unread notifications
        if (unreadCount === 0) return;

        // marks the currently loaded notifications as read
        var toMark = [];
        for (var notif of notifs) {
            toMark.push(notif.id);
        }
        const resp = await apiMarkNotificationsRead(toMark);

        // if successful, set updated viewed notifications
        if (resp.status === 200) {
            const data = await resp.json(); 
            setUnreadsFromData(data);
            setNotifs(data);
        }

        // otherwise log errors
        else {
            console.error(resp);
        }
    }

    /*
     * Fetches the notifications of the authenticated user.
     */
    const fetchNotifications = async () => {
        setNotifsLoading(true);
        const resp = await apiGetNotifications();

        if (resp.status === 200) {
            const data = await resp.json();
            setNotifs(data["results"]);
            setNotifsError(false);
            setNotifsLoading(false);

            // set the unread count
            // TODO return unread count from the backend
            setUnreadsFromData(data["results"]);
        }
        else {
            setNotifsError(true);
            setNotifsLoading(false);
            console.error(resp);
        }
    }

    // effects

    /*
     * Fetch notifications of authed user on
     * component mount and every 30 seconds thereafter.
     */
    useEffect(() => {
        fetchNotifications();

        // fetch interval every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        // clear interval when component unmounts
        return () => {
            interval.clearInterval();
        }
    }, []);


    return (
        /* navbar icon with dropdown */
        <NavDropdown
            id="nav-notifications-dropdown"
            className="me-3"
            drop="start"
            title={
                <Button variant={unreadCount > 0 ? "danger" : "outline-dark"}>
                    <FontAwesomeIcon icon={faBell} />
                    {unreadCount > 0 ? <>&nbsp;{unreadCount}</> : <></>}
                </Button>
            }
            onClick={() => {
                setTimeout(() => {markNotificationsAsRead()}, 5000);
            }}
        >

            {/* notifications popup header */}
            <NavDropdown.Header className="popup-width">
                <h5>Notifications</h5>
            </NavDropdown.Header>

            {/* list of notifications */}
            {/* TODO handle loading and error cases*/}
            {notifs && notifs.map(notif => (
                <NotificationItem data={notif} />
            ))}
        </NavDropdown>
    )
}


export default NotificationsDropdown;

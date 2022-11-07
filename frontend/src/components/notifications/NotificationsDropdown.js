import { useEffect, useState } from "react";
import { Button, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { apiGetNotifications } from "../../api.js";
import NotificationItem from "./NotificationItem.js";
import "./styles.css";


function NotificationsDropdown() {

    // state
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifs, setNotifs] = useState(null); 
    const [notifsLoading, setNotifsLoading] = useState(true); 
    const [notifsError, setNotifsError] = useState(false); 

    // functions
    const fetchNotifications = async () => {
        setNotifsLoading(true);
        const resp = await apiGetNotifications();

        if (resp.status === 200) {
            var data = await resp.json();
            setNotifs(data["results"]);
            setNotifsError(false);
            setNotifsLoading(false);

            // set the unread count
            // TODO return unread count from the backend
            var count = 0;
            for (var item of data["results"]) {
                if (item["viewed"] === false) {
                    count++;
                }
            }
            if (count > 0) {
                setUnreadCount(count);
            }
        }
        else {
            setNotifsError(true);
            setNotifsLoading(false);
            console.error(resp);
        }
    }

    // effects

    /*
     * Fetch notifications on component mount.
     */
    useEffect(() => {
        fetchNotifications();
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

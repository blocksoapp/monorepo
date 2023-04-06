import SocialLinks from '../SocialLinks';
import classes from './MobileMenu.module.scss';

function MobileMenu({setMenuOpened}) {
    return (
        <div className={classes.mobileMenu}>
            <div className={classes.nav}>
                <a href='#' className={classes.home} onClick={() => setMenuOpened(false)}>
                    Home
                </a>
                <a href='#features' onClick={() => setMenuOpened(false)}>
                    Features
                </a>
                <a href='#blog' onClick={() => setMenuOpened(false)}>
                    Blog
                </a>
                <a href='#testimonials' onClick={() => setMenuOpened(false)}>
                    Testimonials
                </a>
            </div>
            <div className={classes.bottom}>
                <div className={classes.launchBtn}>
                    Launch App
                </div>
                <SocialLinks />
            </div>
        </div>
    )
}

export default MobileMenu;

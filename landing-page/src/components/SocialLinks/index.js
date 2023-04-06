import classes from './SocialLinks.module.scss';
import discord from '../../assets/img/discord.svg';
import twitter from '../../assets/img/twitter.svg';
import telegram from '../../assets/img/telegram.svg';
import notion from '../../assets/img/notion.svg';

function SocialLinks() {
    return (
        <div className={classes.socialLinks}>
            <a href='/'>
                <img src={discord} alt='discord' />
            </a>
            <a href='/'>
                <img src={twitter} alt='twitter' />
            </a>
            <a href='/'>
                <img src={telegram} alt='telegram' />
            </a>
            <a href='/'>
                <img src={notion} alt='twitter1' />
            </a>
        </div>
    )
}

export default SocialLinks;
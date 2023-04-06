import React, { useState } from 'react';
import classes from './Home.module.scss';
import banner_2 from '../../assets/img/banner_2.png';
import banner_3 from '../../assets/img/banner_3.png';
import banner_3_mobile from '../../assets/img/banner_3_mobile.png';
import featureImg_1 from '../../assets/img/feature_image_1.png';
import featureImg_2 from '../../assets/img/feature_image_2.png';
import featureImg_3 from '../../assets/img/feature_image_3.png';
import featureImg_4 from '../../assets/img/feature_image_4.png';
import chat_1 from '../../assets/img/feature_chat_1.png';
import chat_2 from '../../assets/img/feature_chat_2.png';
import chat_3 from '../../assets/img/feature_chat_3.png';
import chat_4 from '../../assets/img/feature_chat_4.png';
import chat_5 from '../../assets/img/feature_chat_5.png';
import chat_6 from '../../assets/img/feature_chat_6.png';
import chat_7 from '../../assets/img/feature_chat_7.png';
import chat_8 from '../../assets/img/feature_chat_8.png';
import chat_9 from '../../assets/img/feature_chat_9.png';
import chains from '../../assets/img/feature_chains.png';
import metamask from '../../assets/img/feature_metamask.png';
import walletConnect from '../../assets/img/feature_wallet_connect.png';
import rainbow from '../../assets/img/feature_rainbow.png';
import coinbase from '../../assets/img/feature_coinbase.png';
import blog_1 from '../../assets/img/blog_1.png';
import blog_2 from '../../assets/img/blog_2.png';
import read_1 from '../../assets/img/read_1.png';
import read_2 from '../../assets/img/read_2.png';
import read_3 from '../../assets/img/read_3.png';
import testimonial_1 from '../../assets/img/testimonial_1.png';
import testimonial_2 from '../../assets/img/testimonial_2.png';
import testimonial_3 from '../../assets/img/testimonial_3.png';
import star from '../../assets/img/star.png';
import starActive from '../../assets/img/star_active.png';

function Home() {
  const [featureTab, setFeatureTab] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const featureData = [
    {
      title: 'Find Alpha',
      desc: <>Use wallet connect to join blockso.<br />Progress in a secure and anonymous ecosystem. Personalize your profile with your assets.</>,
      img: featureImg_1,
      contents: <>
        <img className={classes.chat_1} src={chat_1} alt='chat-1' />
        <img className={classes.chat_2} src={chat_2} alt='chat-2' />
        <img className={classes.chat_3} src={chat_3} alt='chat-3' />
      </>
    },
    {
      title: 'Feed Track',
      desc: <>Did you just see a suspicious transaction for a token you’re holding? Tag your friends to GTFO! Even better, tag all the token holders!</>,
      img: featureImg_2,
      contents: <>
        <img className={classes.chat_4} src={chat_4} alt='chat-4' />
        <img className={classes.chat_5} src={chat_5} alt='chat-5' />
        <img className={classes.chat_6} src={chat_6} alt='chat-6' />
      </>
    },
    {
      title: 'Wallet Messaging',
      desc: <>Track the activity of your friends and communities across all EVM-compatible blockchains, allowing you to stay ahead of the game!</>,
      img: featureImg_3,
      contents: <>
        <img className={classes.chat_7} src={chat_7} alt='chat-7' />
        <img className={classes.chat_8} src={chat_8} alt='chat-8' />
        <img className={classes.chat_9} src={chat_9} alt='chat-9' />
      </>
    },
    {
      title: 'One Click Connect',
      desc: <>Blockso puts you closer to the things that you normally share with your friends, faster!</>,
      img: featureImg_4,
      contents: <>
        <img className={classes.metamask} src={metamask} alt='metamask' />
        <img className={classes.walletConnect} src={walletConnect} alt='wallet-connect' />
        <img className={classes.rainbow} src={rainbow} alt='rainbow' />
        <img className={classes.coinbase} src={coinbase} alt='coinbase' />
      </>
    },
    {
      title: 'Activity From All Chains',
      desc: <>Blockso puts you closer to the things that you normally share with your friends, faster!</>,
      img: featureImg_4,
      contents: <>
        <img className={classes.chains} src={chains} alt='chains' />
      </>
    },
  ]

  const testimonialData = [
    {
      name: 'Angella Marvc. Junior',
      job: <>CEO at <strong>SocialApp</strong></>,
      avatar: testimonial_1,
      title: 'UX is easy to use',
      stars: 4,
      desc: <>My favorite thing to do is scroll through the feed and discover new projects.<br />
        It feels like Instagram for web3!</>
    },
    {
      name: 'Axel Bitblaze',
      job: <>Influencer <strong>500k</strong> Subscribers</>,
      avatar: testimonial_2,
      title: 'Finding alpha is Super Easy',
      stars: 4,
      desc: <>Blockso has helped me find alpha on multiple occasions!</>
    },
    {
      name: 'Julliete Bold',
      job: <>Crypto user</>,
      avatar: testimonial_3,
      title: 'Made copy-trade easy',
      stars: 4,
      desc: <>I copy-traded franklinisbored.eth on the Old Rocks NFT and made a nice profit!</>
    }
  ]

  return (
    <div className={classes.home}>
      <section className={classes.banner}>
        <div className={classes.title}>
          blockso keeps you on top of your WEB3!
        </div>
        <div className={classes.desc}>
          Discover alpha, learn strategies, avoid exploits, share insights, and more
          using Blockso's revolutionary social tool!
        </div>
        <div className={classes.launch}>
          <div className={classes.launchBtn}>
            Launch App
          </div>
          <img className={classes.img_1} src={banner_2} alt='banner_2' />
          <img className={classes.img_2} src={banner_3} alt='banner_3' />
          <img className={classes.img_2_mobile} src={banner_3_mobile} alt='banner_3_mobile' />
        </div>
      </section>
      <section className={classes.features} id='features'>
        <div className={classes.title}>
          The social<br />
          network of the web3.0
        </div>
        <div className={classes.desc}>
          Connect your wallet and follow your friends, total strangers, alpha groups, influencers, DAOs.<br />
          You can see all that they do in a vibrant and fun way, Build the next social network owned by its users.
        </div>
        <div className={classes.feature}>
          <div className={classes.tabs}>
            {
              featureData.map((item, index) => (
                <div className={featureTab === index ? classes.tabActive : classes.tab} onClick={() => setFeatureTab(index)}>
                  {item.title}
                </div>
              ))
            }
          </div>
          <div className={classes.content}>
            <div className={classes.left}>
              <img className={classes.avatar} src={featureData[featureTab].img} alt='feature-avatar' />
              <div className={classes.title}>
                {featureData[featureTab].title}
              </div>
              <div className={classes.desc}>
                {featureData[featureTab].desc}
              </div>
            </div>
            <div className={classes.right}>
              {featureData[featureTab].contents}
            </div>
          </div>
        </div>
      </section>
      <section className={classes.blog}>
        <div className={classes.left}>
          <div className={classes.title}>
            Stay Informed with
            Real-Time Alerts 🔔
          </div>
          <div className={classes.desc}>
            Receive real-time alerts and notifications on important blockchain activity,
            allowing you to stay informed and connected.
          </div>
          <img src={blog_1} alt='blog-1' />
        </div>
        <div className={classes.line} />
        <div className={classes.right}>
          <div className={classes.title}>
            User-Friendly Interface
          </div>
          <div className={classes.desc}>
            Enjoy an intuitive and user-friendly interface that makes it easy to navigate
            and explore your blockchain insights
          </div>
          <img src={blog_2} alt='blog-2' />
        </div>
      </section>
      <section className={classes.read} id="blog">
        <div className={classes.title}>
          Useful to Read
        </div>
        <div className={classes.desc}>
          Connect your wallet and follow your friends, total strangers, alpha groups, influencers, DAOs.<br />
          You can see all that they do in a vibrant and fun way, Build the next social network owned by its users.
        </div>
        <div className={classes.content}>
          <img src={read_1} alt='read-1' />
          <img src={read_2} alt='read-2' />
          <img src={read_3} alt='read-3' />
        </div>
      </section>
      <section className={classes.testimonials} id='testimonials'>
        <div className={classes.title}>
          Testimonials
        </div>
        <div className={classes.desc}>
          Connect your wallet and follow your friends, total strangers, alpha groups, influencers, DAOs.<br />
          You can see all that they do in a vibrant and fun way, Build the next social network owned by its users.
        </div>
        <div className={classes.content}>
          <div className={classes.left}>
            {
              testimonialData.map((item, index) => (
                <div className={classes.person}>
                  <div className={index === activeTestimonial ? classes.activeCircle : classes.circle}></div>
                  <div className={index === activeTestimonial ? classes.activeFeature : classes.feature} onClick={() => setActiveTestimonial(index)}>
                    <img src={item.avatar} alt="User avatar" />
                    <div className={classes.intro}>
                      <div className={classes.name}>
                        {item.name}
                      </div>
                      <div className={classes.job}>
                        {item.job}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <div className={classes.right}>
            <div className={classes.title}>
              {testimonialData[activeTestimonial].title}
            </div>
            <div className={classes.stars}>
              <img src={testimonialData[activeTestimonial].stars < 1 ? star : starActive} alt='star' />
              <img src={testimonialData[activeTestimonial].stars < 2 ? star : starActive} alt='star' />
              <img src={testimonialData[activeTestimonial].stars < 3 ? star : starActive} alt='star' />
              <img src={testimonialData[activeTestimonial].stars < 4 ? star : starActive} alt='star' />
              <img src={testimonialData[activeTestimonial].stars < 5 ? star : starActive} alt='star' />
            </div>
            <div className={classes.desc}>
              {testimonialData[activeTestimonial].desc}
            </div>
          </div>
        </div>
      </section>
      <section className={classes.join}>
        <div className={classes.content}>
          <div className={classes.subtitle}>
            Hope that’s enough!
          </div>
          <div className={classes.title}>
            Eager to join blockso ?
          </div>
          <div className={classes.desc}>
            It’s still early and there’s lots to do! Have an idea?<br />
            We’d love it if you use the app and provide feedback! We want to build features to make web3 more fun for you!
          </div>
        </div>
        <div className={classes.demoBtn}>
          Live Demo
        </div>
      </section>
    </div>
  )
}

export default Home;

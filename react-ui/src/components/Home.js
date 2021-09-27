import React, { Component, useState, useEffect, useRef } from "react";
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Header from './Header'
import '../assets/css/Home.scss';
import { Link } from '@material-ui/core';
import { useSelector } from 'react-redux';

function LandingPage() {
  const userInfo = useSelector(state => state.userInfo);

  return (
    <div className='landingPage'>
      <Container className="home_container">
        <div className="home_wrapper">
          <div className="introline_wrapper">
            <h2 className="heading_main">Tove - Create and manage your online vote transparently for free</h2>
            <p className="heading_sub">An online voting platform backed by blockchain technology that helps reduce fraud or cheating in votes. Voting results are kept secure, transparent and verifiable as a public election.</p>
          </div>
          <figure className="home_figure">
            <div className="btn_wrapper">
              <Link href={userInfo.googleId ? `/create-new-vote` : `/sign-in`} className='sign_in_link'>
                <Button className="get_started_btn">{userInfo.googleId ? "Create your own vote" : "Get Started"}</Button>
              </Link>
            </div>
            <img src="https://startup-agency.vercel.app/_next/static/images/banner-illustration-bdd71ba1bdab49b214f8174a81063078.png" alt="illustration" className="css-9taffg" />
          </figure>
        </div>
        {/*<div className='feature_wrapper'>
          <h2>Features</h2>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6} lg={4}>
                <VoteCardItems {...voteData} />
            </Grid>
          </Grid>
  </div>*/}
      </Container>
    </div>
  )
}
function Footer() {
  return (
    <div className='footer'>
      Developed by <Link href= 'https://github.com/zufius'>zufius</Link>@2021
    </div>
  )
}
class Home extends Component {
  render() {
    return (
      <>
        <Header />
        <LandingPage />
        <Footer />
      </>
    );
  }
}

export default Home;
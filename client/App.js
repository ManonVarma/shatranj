import React, { useEffect, Fragment } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import MediaQuery from 'react-responsive';

import { socket } from './connection/socket';

import Header from './components/header/header.component'

import HomePage from './pages/home-page/home-page.component'
import GamePage from './pages/game-page/game-page.component'
import FriendPage from './pages/friend-page/friend-page.component'

import './App.css';

const App = () => {
  return (
    <Fragment>
      <MediaQuery minDeviceWidth={1224}>
          <div>
            <Router>
              <Header />
              <Routes>
                  <Route exact path='/' element={<HomePage/>} />
                  <Route path='/game' element={<GamePage />} />
                  <Route path='/friend' element={<FriendPage/>} />
              </Routes>
              <p style={{color: 'white', marginTop: '250px', textAlign: 'center'}}>© Shartanj 2022 | Team 69 LDRP-ITR</p>
            </Router>
          </div>
      </MediaQuery>

      {/* for mobile devices */}
      <MediaQuery maxDeviceWidth={1224}>
        <h3 style={{color: 'darkgreen',textAlign: 'center', marginTop: '250px'}}>Please access using a laptop/desktop computer</h3>
      </MediaQuery>
    </Fragment>
  )
}

export default App;

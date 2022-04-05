import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { socket, initialUserCount, initialGameCount } from '../../connection/socket'

import './header.style.css'

 const Header = () => {
    const [userCount, setUserCount] = useState(initialUserCount)
    const [gameCount, setGameCount] = useState(initialGameCount)

    const navigate = useNavigate()

    useEffect(() => {
        socket.on('user-count', (userCount) => {
            setUserCount(userCount)
        })

        socket.on('game-count', (gameCount) => {
            setGameCount(gameCount)
        })
    })

    return (
        <div className='header'>
            <div className='page-header'>
                <img 
                    src={require("../../assets/images/logo.png")} 
                    style={{cursor: 'pointer'}}
                    alt="Logo" 
                    width="180px"
                    height="55px"
                    onClick={() => { 
                        navigate('/', {replace: true})
                        window.location.reload()
                    }}
                />
                <div style={{flexGrow: '1'}}></div>

                <div className='count'>
                    <span className='user-count'>{userCount} online now</span>
                    <span className='game-count'>{gameCount} games in play</span>
                </div>
                
            </div>
        </div>
    )
}

export default Header

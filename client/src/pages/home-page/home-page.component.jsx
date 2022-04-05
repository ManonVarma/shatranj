import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { socket } from '../../connection/socket'

import { playerColorAction } from '../../redux/action'

import './home-page.style.css'

function HomePage({ setPlayerColor }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const playWithRandom = () => {
        socket.emit('join', { gameId: null })

        navigate('/game')
    }

    useEffect(() => {
        socket.on('me', ({ id, color }) => {
            // console.log(id, color)

            // console.log('mera color', color);
            // setPlayerColor(color)
            dispatch(playerColorAction(color))
        })
    })

    return (
        <div>
            <div className='home-page'>
                <button onClick={playWithRandom} className="btn-play-random">Play with random opponent</button>
                <button onClick={() => navigate('/friend')} className="btn-play-friend">Play with a friend</button>
            </div>
        </div>
    )
}

export default HomePage

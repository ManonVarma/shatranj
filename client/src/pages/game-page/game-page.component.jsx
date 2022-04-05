import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { myId, socket } from '../../connection/socket'

import ChessBoard from '../../components/chess-board/chess-board'
import Videos from '../../connection/video-chat/videos.component'
//
import DialogueBox from '../../components/dialogue-box/dialogue-box.component'
//

import { callAcceptedAction, gameOverAction, opponentConnectedAction, resetGameAction, usersAction } from '../../redux/action'

import './game-page.style.css'
import { useEventCallback } from '@material-ui/core'

const GamePage = () => {
    const playerColor = useSelector(state => state.playerColor)
    const callAccepted = useSelector(state => state.callAccepted)
    const callEnded = useSelector(state => state.callEnded)
    const opponentConnected = useSelector(state => state.opponentConnected)
    const users = useSelector(state => state.users)
    const gameOver = useSelector(state => state.gameOver)

    const connectionRef = useRef()

    const dispatch = useDispatch()

    const navigate =  useNavigate()

    // const leave = () => {
    //     console.log('niklaa lauda');
    //     dispatch(callAcceptedAction(false))
    //     // setCallEnded(true) 
    //     // dispatch(callEndedAction(true))

    //     connectionRef.current.destroy() 

    //     // window.location.reload() 
    // } 

    const disconnect = (ev) => {
        socket.disconnect()
        if (connectionRef && connectionRef.current)
            connectionRef.current.destroy() 
        // console.log('nikla gaya!!!!');

        navigate('/', {replace: true})

        return ev.returnValue = 'Are you sure you want to leave?'
    }

    window.onbeforeunload = (ev) => {
        ev.preventDefault()
        if (opponentConnected)
            return disconnect(ev)
        else
            window.onbeforeunload = null
    }

    window.onload = function() {
        navigate('/', {replace: true})
        window.location.reload()
    }   

    window.onpopstate=function()
    {
        navigate('/', {replace: true})
        window.location.reload()
    }

    useEffect(() => {
        socket.on('opponent-connected', ({ user1, user2 }) => {
            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Connected!'
            
            dispatch(opponentConnectedAction(true))

            const disconnectBtn = document.getElementsByClassName('disconnect-btn')[0]
            if (disconnectBtn)
                disconnectBtn.style.display = 'block'

            // console.log('usr1', user1, ' usr2', user2)
            const users = {
                user1: user1,
                user2: user2
            }
            dispatch(usersAction({
                data: users
            }))
        })

        socket.on('opponent-disconnected', (disconnectedPlayer) => {
            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Opponent Disconnected!' 
                
            dispatch(opponentConnectedAction(false))

            setTimeout(() => {
                navigate('/', {replace: true})
                window.location.reload()
            }, 2500)
        })

        socket.on('incoming-rematch-request', () => {
            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Incoming Rematch Request'
            
            const acceptRematchBtn = document.getElementsByClassName('accept-rematch-btn')[0]
            if (acceptRematchBtn)
                acceptRematchBtn.style.display = 'block'

            const rejectRematchBtn = document.getElementsByClassName('reject-rematch-btn')[0]
            if (rejectRematchBtn)
                rejectRematchBtn.style.display = 'block'
        })
        socket.on('rematch-request-accepted', () => {
            // reset the chess game
            dispatch(resetGameAction(true))

            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Connected!'
            const rematchBtn = document.getElementsByClassName('rematch-btn')[0]
            if (rematchBtn)
                rematchBtn.style.display = 'none'
        })
        socket.on('rematch-request-rejected', () => {
            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Request Rejected'
        })
    })

    useEffect(() => {
        if (myId && users && myId === users?.data.user2.id && gameOver) {
            const rematchBtn = document.getElementsByClassName('rematch-btn')[0]
            if (rematchBtn) {
                rematchBtn.style.display = 'block'
            }                
        }
    }, [gameOver, users]) 

    // component will unmount
    // useEffect(() => {
    //     return () => {
    //         // socket disconnect logic here
    //         console.log('nikal gaya loda')
    //         // leave()
    //         socket.disconnect()
    //     }
    // }, [])

    return (
        <div className='game-page'>
            <div style={{margin:'0px 40px'}}>
                <div id='searching-opponent' >
                    <div style={{flex:1}}>
                        <p id='information-note'>Searching An Opponent...</p>
                    </div>
                    
                    <div>
                        <button 
                            className='accept-rematch-btn'
                            onClick={() => { 
                                socket.emit('rematch-request-accepted')

                                // reset the chess game
                                dispatch(resetGameAction(true))

                                if (document.getElementById('information-note'))
                                    document.getElementById('information-note').innerHTML = 'Response Sent'
                                const acceptRematchBtn = document.getElementsByClassName('accept-rematch-btn')[0]
                                if (acceptRematchBtn)
                                    acceptRematchBtn.style.display = 'none'
                    
                                const rejectRematchBtn = document.getElementsByClassName('reject-rematch-btn')[0]
                                if (rejectRematchBtn)
                                    rejectRematchBtn.style.display = 'none'
                                setTimeout(() => {
                                    if (document.getElementById('information-note'))
                                        document.getElementById('information-note').innerHTML = 'Connected!'
                                }, 2000)
                            }}
                        >Accept</button>
                    </div>
                    <div>
                        <button 
                            className='reject-rematch-btn'
                            onClick={() => { 
                                socket.emit('rematch-request-rejected')

                                const acceptRematchBtn = document.getElementsByClassName('accept-rematch-btn')[0]
                                if (acceptRematchBtn)
                                    acceptRematchBtn.style.display = 'none'
                    
                                const rejectRematchBtn = document.getElementsByClassName('reject-rematch-btn')[0]
                                if (rejectRematchBtn)
                                    rejectRematchBtn.style.display = 'none'

                                if (document.getElementById('information-note'))
                                    document.getElementById('information-note').innerHTML = 'Response Sent'
                            }}
                        >Reject</button>
                    </div>
                    <div>
                        <button 
                            className='rematch-btn'
                            onClick={() => { 
                                socket.emit('request-rematch')
                                if (document.getElementById('information-note'))
                                    document.getElementById('information-note').innerHTML = 'Awaiting Response'
                            }}
                        >Request Rematch</button>
                    </div>
                    <div>
                        <button 
                            className='disconnect-btn'
                            onClick={() => { 
                                socket.disconnect() 
                                navigate('/', {replace: true})
                                window.location.reload()
                            }}
                        >Disconnect</button>
                    </div>
                </div>
                <div className='chess-board'>
                    <ChessBoard 
                        playerColor={playerColor} 
                        callAccepted={callAccepted} 
                        callEnded={callEnded} 
                    />
                </div>
            </div>

            
            <div style={{display: 'flex',margin: '0px 40px 10px 40px'}}>
                <Videos connectionRef={connectionRef}/>
            </div>
            
        </div>
    )
}

export default GamePage

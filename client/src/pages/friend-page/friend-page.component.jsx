import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { socket } from '../../connection/socket'

import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Loading } from 'react-loading-dot'

import { opponentConnectedAction, playerColorAction, usersAction } from '../../redux/action'

import './friend-page.style.css'

const FriendPage = () => {
    const [gameId, setGameId] = useState(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const createGame = () => {
        socket.emit('join', { gameId: 'first' })

        document.getElementsByClassName('join-friend-game')[0].style.display = 'none'
        document.getElementsByClassName('new-game-info')[0].style.display = ''
        document.getElementById('new-game-button').style.display = 'none'
    }

    const joinFriendGame = (e) => {
        e.preventDefault()

        const id = document.getElementById('gameid-input').value

        socket.emit('join', { gameId: id }, (error) => {
            if (error)
                alert(error)
            else
                navigate('/game')
        })
        
    }

    useEffect(() => {
        socket.on('game-id-for-friend', ({ gameId }) => {
            setGameId(gameId)
        })

        socket.on('opponent-connected', ({ user1, user2 }) => {
            dispatch(opponentConnectedAction(true))
            // setUsers({
            //     user1: user1,
            //     user2: user2
            // })

            // store users in redux here
            const users = {
                user1: user1,
                user2: user2
            }
            dispatch(usersAction({
                data: users
            }))
            
            navigate('/game')

            // this change is done on the GamePage
            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Connected!'
            const disconnectBtn = document.getElementsByClassName('disconnect-btn')[0]
            if (disconnectBtn)
                disconnectBtn.style.display = 'block'
        })

        socket.on('me', ({ id, color }) => {
            // console.log(id, 'color', color)
            dispatch(playerColorAction(color))
            // setPlayerColor(color)
        })
    })

    const selectText = (id) => {
        var sel, range;
        var el = document.getElementById(id); //get element id
    
        if (window.getSelection && document.createRange) { //Browser compatibility
          sel = window.getSelection();
          if(sel.toString() === ''){ //no text selection
             window.setTimeout(function(){
                range = document.createRange(); //range object
                range.selectNodeContents(el); //sets Range
                sel.removeAllRanges(); //remove all ranges from selection
                sel.addRange(range);//add Range to a Selection.
            },1);
          }
        }else if (document.selection) { //older ie
            sel = document.selection.createRange();
            if(sel.text === ''){ //no text selection
                range = document.body.createTextRange();//Creates TextRange object
                range.moveToElementText(el);//sets Range
                range.select(); //make selection.
            }
        }
    }

    window.onpopstate=function()
    {
        navigate('/', {replace: true})
        window.location.reload()
    }

    return (
        <div className='friend-page'>
            <div className='start-new-game'>
                <button id='new-game-button' onClick={createGame} className="new-game-btn">Start a new game</button>
                <div className='new-game-info' style={{display: 'none', fontSize: "23px"}}>
                    <div>
                        <span style={{fontWeight: '600', color:'#00A36C'}}>Game ID: </span>&nbsp; <CopyToClipboard text={gameId} >
                                            <code 
                                                style={{backgroundColor: '#D3D3D3', padding: '5px 10px', borderRadius: '5px', fontWeight: '600', cursor: 'pointer'}}
                                                id='game-id' 
                                                onClick={() => {
                                                    selectText('game-id')
                                                    document.getElementsByClassName('copy')[0].style.display = 'block'
                                                    setTimeout(() => {
                                                        const copiedDiv = document.getElementsByClassName('copy')[0]
                                                        if (copiedDiv)
                                                            copiedDiv.style.display = 'none'
                                                    }, 2500)
                                                }}
                                            >{gameId}</code>
                                        </CopyToClipboard>
                                        
                                        <div className='copy'>
                                            Copied!
                                        </div> 
                    </div>
                    <p style={{textAlign:'center', color:'#ffffff', textShadow: '2px 2px 8px #000000'}}>Give this ID to your friend</p>
                    <p style={{textAlign:'center', fontSize: '27px', color:'#ffc107', textShadow: '2px 2px 8px #000000', fontWeight: '600'}}>
                        Waiting...
                        {/* <Loading /> */}
                    </p>
                </div>
            </div>

            <div className='join-friend-game'>
                <div style={{margin: '0px 10px 10px 10px', textAlign:'center'}}>
                    <div style={{fontWeight: '500',fontSize:'25px', color:'#ffc107', textShadow:'2px 2px 8px #000000'}}>OR</div><br/>
                    <span style={{fontWeight: '500',fontSize:'23px', color:'white', textShadow:'2px 2px 8px #000000'}}>Join a game</span>
                </div>

                <form className='join-form'>
                    <div style={{marginRight:'5px'}}>
                        <input id='gameid-input' type="text" placeholder='Enter Game ID' className='label' required/>
                    </div>
                    
                    <div style={{marginLeft:'5px'}}>
                        <button type='submit' onClick={(e) => joinFriendGame(e)} className="btn-join">Join</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FriendPage

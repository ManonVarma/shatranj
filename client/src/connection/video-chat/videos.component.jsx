import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux'

import { socket, myId } from '../socket';

import Peer from 'simple-peer' 

import { callAcceptedAction, callEndedAction } from '../../redux/action'

// import { SocketContext } from '../../connection/context'

import ClipLoader from "react-spinners/ClipLoader";
import DialogueBox from '../../components/dialogue-box/dialogue-box.component'

import './videos.style.css'

const Videos = ({ connectionRef }) => {
    // webRTC states
    const [readyToCall, setReadyToCall] = useState(false)

    const [stream, setStream] = useState(null) 
    const [call, setCall] = useState({}) 
    const [callAccepted, setCallAccepted] = useState(false) 
    const [callEnded, setCallEnded] = useState(true) 
    const [firstUserId, setFirstUserId] = useState(null)
    const [secondUserId, setSecondUserId] = useState(null)
    const [otherUserId, setOtherUserId] = useState(null)

    // dialogue box states
    const [openDialogueBox, setOpenDialogueBox] = useState(false) 
    const [dialogueBoxMessage, setDialogueBoxMessage] = useState('All The Best!')
    const [dialogueBoxOptions, setDialogueBoxOptions] = useState({
            option1: 'Thank You!', 
            option2: null
    })
    const [dialogueBoxHandleCloseArg, setDialogueBoxHandleCloseArg] = useState(null)

    const myVideo = useRef() 
    const otherUserVideo = useRef() 

    const dispatch = useDispatch()
    
    const navigate = useNavigate()

    // redux code
    const users = useSelector(state=>state.users)

    const handleClose = (reason) => {
        setOpenDialogueBox(false)

        if (reason === 'no cam') {
            navigate('/', { replace: true })
            window.location.reload()
        }

        else {
            // console.log('call', call, 'close kar')
            if (readyToCall && myId === firstUserId)
                callUser()
            else
                answerCall()
        }
    }

    useEffect(() => {
        // console.log('call ue', call, 'stream:', stream)
        if (firstUserId && myId === firstUserId) {
          setReadyToCall(true)
          setOpenDialogueBox(true)
        }
    
        if (call.isReceivedCall)
          setOpenDialogueBox(true)
    }, [firstUserId, call])

    // for friend game (redux)
    useEffect(() => {
         if (users) {
            setFirstUserId(users?.data.user1.id)
            setSecondUserId(users?.data.user2.id)
        }
    }, [users])

    // for random opponent game
    useEffect(() => {
        socket.on('opponent-connected', ({ user1, user2 }) => {
            // console.log('u1:', user1.id, 'u2:', user2.id);
            setFirstUserId(user1.id)
            setSecondUserId(user2.id)

            if (myId === firstUserId)
                setOtherUserId(secondUserId)
            else    
                setOtherUserId(firstUserId)
        })
    })

    // webRT code start
    useEffect(() => {
        // getting permission from the user to get their camera & microphone
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
            .then((currentStream) => {
                setStream(currentStream) 

                myVideo.current.srcObject = currentStream 
            }) 
            .catch((err) => {
                // console.log('you fuckin dog bro');
                setDialogueBoxMessage("You can't enter without camera and microphone")
                setDialogueBoxOptions({option1: 'Close', option2: null})
                setDialogueBoxHandleCloseArg('no cam')

                setOpenDialogueBox(true)
            })


        socket.on('calluser', ({ signal, from }) => {
            setCall({
                isReceivedCall: true,
                from,
                signal
            }) 
        }) 
    }, []) 

    const answerCall = () => {
        // console.log('call uthaya')
        setCallAccepted(true) 
        dispatch(callAcceptedAction(true))
        // setCallEnded(false)
        // dispatch(callEndedAction(false))

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream
        }) 

        peer.on('signal', (data) => {
            socket.emit('answercall', {
                signal: data,
                to: call.from
            }) 
        }) 

        // capturing the other user's stream
        peer.on('stream', (currentStream) => {
            otherUserVideo.current.srcObject = currentStream 
        }) 

        peer.signal(call.signal) 

        connectionRef.current = peer 
    } 

    const callUser = () => { 
        // console.log('call lagega');
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream
        }) 

        peer.on('signal', (data) => {
            socket.emit('calluser', {
                userToCall: secondUserId,
                signalData: data,
                from: myId,
            }) 
        }) 

        peer.on('stream', (currentStream) => {
            otherUserVideo.current.srcObject = currentStream 
        }) 

        socket.on('callaccepted', (signal) => {
            setCallAccepted(true)    
            dispatch(callAcceptedAction(true))
            // setCallEnded(false)
            // dispatch(callEndedAction(false))
            
            peer.signal(signal) 
        }) 

        connectionRef.current = peer 
    } 

    // const leaveCall = () => {
    //     setCallAccepted(false)
    //     dispatch(callAcceptedAction(false))
    //     // setCallEnded(true) 
    //     // dispatch(callEndedAction(true))

    //     connectionRef.current.destroy() 

    //     window.location.reload() 
    // } 
    // webRTC code end

    return (
        <div className='videos'>
            <DialogueBox 
                openDialogueBox={openDialogueBox} 
                handleClose1={() => handleClose(dialogueBoxHandleCloseArg)} 
                handleClose2={() => handleClose(dialogueBoxHandleCloseArg)} 
                message={dialogueBoxMessage} 
                options={dialogueBoxOptions}
            />
                {/* Other user's video */}
                {
                    <div className='opponent-video-container'>
                        {
                            !callAccepted 
                            // && !callEnded 
                            ?
                                <div className='spinner'><ClipLoader size={75} color={'white'} /></div>
                                : (
                                    <div>
                                        <video
                                            height={'267px'} 
                                            playsInline 
                                            ref={otherUserVideo} 
                                            autoPlay
                                            className='video'
                                        />
                                    </div>
                                )
                        }
                    </div>
                }

                {/* My video */}
                {
                    stream && (
                        <div className='my-video-container'>
                            <div>
                                <video 
                                    height={'267px'}
                                    playsInline 
                                    muted 
                                    ref={myVideo} 
                                    autoPlay
                                    className='video'
                                />
                            </div>
                        </div>
                    )
                }
        </div>
    )
} 

export default Videos

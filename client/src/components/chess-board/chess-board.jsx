import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Chess from 'chess.js'
import { Chessboard } from 'react-chessboard'

import { socket } from '../../connection/socket'

import { gameOverAction, resetGameAction } from '../../redux/action'

import useSound from 'use-sound'
import pieceMoveSound from '../../assets/sounds/Piece Move Sound.mp3'

import './chess-board.style.css'

const ChessBoard = ({ playerColor, callAccepted, callEnded }) => {
    // console.log('player ka color', playerColor);
    // console.log('callAcc', callAccepted, '');
    // console.log('====================================');
    // console.log('s', socket)
    // console.log('====================================');

    const chessboardRef = useRef()  
    const [game, setGame] = useState(new Chess())

    const [rightClickedSquares, setRightClickedSquares] = useState({})  
    const [moveSquares, setMoveSquares] = useState({})  
    const [optionSquares, setOptionSquares] = useState({})  

    const gameOver = useSelector(state => state.gameOver)
    const resetGame = useSelector(state => state.resetGame)

    const dispatch = useDispatch()

    const [playSound] = useSound(pieceMoveSound)


    function safeGameMutate(modify) {
        setGame((g) => {
        const update = { ...g }  
        modify(update)  
        return update  
        })  
    }


    function onMouseOverSquare(square) {
        // don't let the player see the opponent's move options
        if (playerColor && game.turn() !== playerColor[0])
            return

        getMoveOptions(square)  
    }


    // Only set squares to {} if not already set to {}
    function onMouseOutSquare() {
        if (Object.keys(optionSquares).length !== 0) setOptionSquares({})  
    }


    function getMoveOptions(square) {
        const moves = game.moves({
            square,
            verbose: true
        })  

        if (moves.length === 0) {
            return  
        }

        const newSquares = {}  
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                game.get(move.to) && game.get(move.to).color !== game.get(square).color 
                    ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                    : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%'
            }  

            return move  
        })  
        
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        }

        setOptionSquares(newSquares)  
    }


    function onSquareClick() {
        setRightClickedSquares({})  
    }


    function onSquareRightClick(square) {
        const colour = 'rgba(0, 0, 255, 0.4)'  

        setRightClickedSquares({
            ...rightClickedSquares,
            [square]:
                rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
                ? undefined
                : { backgroundColor: colour }
        })  
    }


    // onDrop function for the player's moves
    function onDrop(sourceSquare, targetSquare) {
        if (!callAccepted)
            return false

        if (game.turn() !== playerColor[0] || game.game_over())
            return false

        const gameCopy = { ...game }  
        const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // always promote the pawn to a queen, for simplicity
        })  

        setGame(gameCopy)

        // illegal move
        if (move === null) return false  

        setMoveSquares({
            [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        })  


        // socket code start
        socket.emit('move', move)
        // socket code end

        // play the sound
        playSound()

        // check for game over (checkmate or stalemate) or a check
        if (game.in_stalemate() || game.in_checkmate())
            dispatch(gameOverAction(true))
        else if (game.in_check()) {
            // console.log('check waala', game.turn())
            if (document.getElementById('information-note'))
                    document.getElementById('information-note').innerHTML = `${game.turn() === 'b'? 'Black': 'White'} In Check!` 
        }
        else {
            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Connected!'
        }
 
        return true  
    }

    // onDrop function for the opponent's moves
    function onDropOtherPlayer(sourceSquare, targetSquare) {
        const gameCopy = { ...game }  
        const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // always promote the pawn to a queen, for simplicity
        })  

        setGame(gameCopy)  

        // illegal move
        if (move === null) return false  

        setMoveSquares({
            [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        })
 
        // check for game over (checkmate or stalemate) or a check
        if (game.in_stalemate() || game.in_checkmate())
            dispatch(gameOverAction(true))
        else if (game.in_check()) {
            // console.log('check waala', game.turn())
            if (document.getElementById('information-note'))
                    document.getElementById('information-note').innerHTML = `${game.turn() === 'b'? 'Black': 'White'} In Check!`
        }
        else {
            if (document.getElementById('information-note'))
                document.getElementById('information-note').innerHTML = 'Connected!'
        }
        
        // play the sound
        playSound()

        return true  
    }


    useEffect(() => {
        // to prevent multiple firing (also causes delay) of the event, use `socket.off(eventName).on()`
        socket.off('move').on('move', (move) => {
            // console.log('server se move aaya', move)
            onDropOtherPlayer(move.from, move.to)
        })

        if (resetGame) {
            setGame(new Chess())
            dispatch(resetGameAction(false))
            dispatch(gameOverAction(false))
            setMoveSquares({})
        }
    })

    useEffect(() => {
        if (gameOver) {
            if (game.in_stalemate()) {
                if (document.getElementById('information-note'))
                    document.getElementById('information-note').innerHTML = 'Stalemate!'

                // console.log('Draw!')
                alert("Game Over, It's a Stalemate! Draw!")
            }
            else {
                if (document.getElementById('information-note'))
                    document.getElementById('information-note').innerHTML = 'Checkmate!'

                let loser = game.turn(), winner

                if (loser === 'b')
                    winner = 'White'
                else
                    winner = 'Black'

                // console.log('Game Over', winner, ' Wins!')
                alert(`Game Over, ${winner} Wins!`)
            }
        }
    }, [game, gameOver])

    useEffect(() => {
        // console.log('turn: ', game.turn());
    }, [game])


    return (
        <div>
            <Chessboard
                animationDuration={200}
                position={game.fen()}
                arePiecesDraggable={!game.game_over()}  // don't let players to be able to pick pieces if game's over
                onMouseOverSquare={onMouseOverSquare}
                onMouseOutSquare={onMouseOutSquare}
                onSquareClick={onSquareClick}
                onSquareRightClick={onSquareRightClick}
                onPieceDrop={onDrop}
                customBoardStyle={{
                    borderRadius: '5px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                }}
                boardWidth={542}
                customSquareStyles={{
                    ...moveSquares,
                    ...optionSquares,
                    ...rightClickedSquares
                }}
                boardOrientation={playerColor}
                ref={chessboardRef}
            />
        </div>
    )  
}

export default ChessBoard

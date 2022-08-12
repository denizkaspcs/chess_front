import './App.css';
import Chessboard from 'chessboardjsx';
import React, {useState,useEffect,useRef} from 'react';
import { Chess } from 'chess.js';
import io from 'socket.io-client';



function App() {
  const [started, setStarted] = useState(false);
  const [socket, setSocket] = useState(null);
  const [fen, setFen] = useState("start");
  const [orientation, setOrientation] = useState("white");
  let game = useRef(null);
  
  useEffect(() => {
    game.current = new Chess();
  }, [])

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:8080`);
    setSocket(newSocket);
    return () => newSocket.close();
  },[setSocket])
  
  useEffect(() => {
    if (!socket) return;
    socket.on('color', (msg) => {
      setOrientation(msg);
    });
    socket.on('game_state', (fen) => {
      console.log(fen);
      game.current.load(fen);
      setFen(fen);
    })
  },[socket])

  const start_button_listener = () => {
    setStarted(true);
    socket.emit('start');
  }
  


  const onDrop = ({ sourceSquare, targetSquare }) => {
    console.log(fen);
    let piece = game.current.get(sourceSquare);
    if (piece.color === orientation[0]) {
      let move = game.current.move({
        from: sourceSquare,
        to: targetSquare
      })

      console.log(move);
      console.log(sourceSquare);
      console.log(targetSquare);
      if (move === null) {
        return;
      }
      socket.emit('fen', game.current.fen());

    } else {

    }
  }
  
  const reset = () => {
    game.current.clear();
    game.current.reset();
    setFen("start");
  }

  return (
    <>
      {
        game.current && game.current.game_over() ?
          <div style={{ textAlign: "center" }}>
            <h1>{game.current.in_checkmate() && game.current.turn() === 'w' ? "Black Wins!" : "White Wins!"}</h1><button onClick={reset}>Reset Board</button></div>
          :
          <span></span>
      }
      <div className="board_container">
        {started ?  <span></span>: <button className='start-button' onClick={start_button_listener}>Start</button>}
        <Chessboard position={fen} onDrop={onDrop} orientation={orientation} />
      </div>
    </>
    
  );
}

export default App;

import { useState } from "react";
import "./App.css";
import AudioPlayer from "./components/AudioPlayer";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [playbackEvent, setPlaybackEvent] = useState(null);

  function joinRoom() {
    if (!username || !room) {
      alert("Enter both fields");
      return;
    }

    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("Connected to server");

      ws.send(
        JSON.stringify({
          type: "join",
          username,
          room,
        })
      );

      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server:", data);

      if (data.type === "system" || data.type === "message") {
        setMessages((prev) => [...prev, data]);
      }

      if (
        data.type === "play" ||
        data.type === "pause" ||
        data.type === "seek" ||
        data.type === "track_change"
      ) {
        setPlaybackEvent(data);
      }
    };

    setSocket(ws);
  }

  function sendMessage() {
    if (!input.trim() || !socket) return;

    socket.send(
      JSON.stringify({
        type: "message",
        username,
        room,
        message: input,
      })
    );

    setInput("");
  }

  if (!connected) {
    return (
      <div className="app">
        <div className="join-card">
          <h1 className="title">🎧 EchoRoom</h1>
          <p className="subtitle">
            Listen to albums live with friends anywhere.
          </p>

          <input
            className="input"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="input"
            placeholder="Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />

          <button className="button" onClick={joinRoom}>
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="room-container">
        <h1 className="title">🎧 EchoRoom</h1>
        <p className="connected">Connected to room: {room}</p>

        <AudioPlayer socket={socket} playbackEvent={playbackEvent} />

        <div className="chat-card">
          <h2>Live Chat</h2>

          <div className="messages-box">
            {messages.map((msg, i) => (
              <div key={i} className="message">
                {msg.type === "system" ? (
                  <em className="system-message">{msg.message}</em>
                ) : (
                  <span>
                    <strong>{msg.username}:</strong> {msg.message}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="chat-row">
            <input
              className="input chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
            />

            <button className="button" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

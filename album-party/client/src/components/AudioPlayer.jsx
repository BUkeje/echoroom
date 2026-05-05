import { useRef, useState, useEffect } from "react";

export default function AudioPlayer({ socket, playbackEvent }) {
  const audioRef = useRef(null);

  const tracks = [
    {
      name: "Mock Song 1",
      src: "/audio/song1.wav",
    },
    {
      name: "Mock Song 2",
      src: "/audio/song2.wav",
    },
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  function sendPlaybackEvent(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(data));
  }

  async function togglePlay() {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);

        sendPlaybackEvent({
          type: "pause",
        });
      } else {
        await audioRef.current.play();
        setIsPlaying(true);

        sendPlaybackEvent({
          type: "play",
          time: audioRef.current.currentTime,
          trackIndex: currentTrackIndex,
        });
      }
    } catch (error) {
      console.error("Audio failed to play:", error);
      alert(
        "Audio file could not be played. Click once in the tab, then try again."
      );
    }
  }

  function nextTrack() {
    const isLastTrack = currentTrackIndex === tracks.length - 1;

    if (isLastTrack) {
      setCurrentTrackIndex(0);
      setIsPlaying(false);

      sendPlaybackEvent({
        type: "track_change",
        trackIndex: 0,
        shouldPlay: false,
      });

      return;
    }

    const newTrackIndex = currentTrackIndex + 1;

    setCurrentTrackIndex(newTrackIndex);
    setIsPlaying(true);

    sendPlaybackEvent({
      type: "track_change",
      trackIndex: newTrackIndex,
      shouldPlay: true,
    });
  }

  function previousTrack() {
    if (currentTrackIndex === 0) return;

    const newTrackIndex = currentTrackIndex - 1;

    setCurrentTrackIndex(newTrackIndex);
    setIsPlaying(true);

    sendPlaybackEvent({
      type: "track_change",
      trackIndex: newTrackIndex,
      shouldPlay: true,
    });
  }

  function handleSeek() {
    if (!audioRef.current) return;

    sendPlaybackEvent({
      type: "seek",
      time: audioRef.current.currentTime,
    });
  }

  useEffect(() => {
    if (!playbackEvent || !audioRef.current) return;

    async function handlePlaybackEvent() {
      try {
        if (playbackEvent.type === "play") {
          setCurrentTrackIndex(playbackEvent.trackIndex);
          audioRef.current.currentTime = playbackEvent.time;
          await audioRef.current.play();
          setIsPlaying(true);
        }

        if (playbackEvent.type === "pause") {
          audioRef.current.pause();
          setIsPlaying(false);
        }

        if (playbackEvent.type === "track_change") {
          setCurrentTrackIndex(playbackEvent.trackIndex);
          setIsPlaying(playbackEvent.shouldPlay);
        }

        if (playbackEvent.type === "seek") {
          audioRef.current.currentTime = playbackEvent.time;
        }
      } catch (error) {
        console.error("Sync error:", error);
      }
    }

    handlePlaybackEvent();
  }, [playbackEvent]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div
      style={{
        marginTop: "30px",
        borderTop: "1px solid #ddd",
        paddingTop: "20px",
      }}
    >
      <h2>🎵 Audio Player</h2>

      <p>
        Now Playing: <strong>{currentTrack.name}</strong>
      </p>

      <audio ref={audioRef} src={currentTrack.src} onEnded={nextTrack} />

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={previousTrack}>Previous</button>

        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>

        <button onClick={nextTrack}>Next</button>
      </div>
    </div>
  );
}

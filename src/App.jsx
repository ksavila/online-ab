import React, { useState, useRef, useEffect } from 'react';
import FrequencyVisualizer from './FrequencyVisualizer';
import './App.css';

// Loading indicator component
const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-2xl font-bold mb-6">Loading Your Audio</div>
      
      {/* Spinning record animation */}
      <div className="relative w-48 h-48 mb-8">
        {/* Vinyl record */}
        <div className="absolute inset-0 bg-gray-900 rounded-full animate-spin" 
             style={{ animationDuration: '3s' }}>
          {/* Vinyl grooves */}
          <div className="absolute inset-4 border border-gray-700 rounded-full opacity-30"></div>
          <div className="absolute inset-12 border border-gray-700 rounded-full opacity-30"></div>
          <div className="absolute inset-20 border border-gray-700 rounded-full opacity-30"></div>
          
          {/* Center hole */}
          <div className="absolute inset-0 m-auto w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Pulsing overlay */}
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-10"></div>
      </div>
      
      {/* Audio wave visualization */}
      <div className="flex items-end space-x-1 mb-8 h-12">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="w-2 bg-gradient-to-t from-purple-500 to-blue-400 rounded-full animate-pulse"
            style={{ 
              height: `${15 + Math.random() * 25}px`,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Loading text with bouncing dots */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Loading audio files</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" 
               style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" 
               style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" 
               style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Transport Bar component
const TransportBar = ({ 
  currentTime, 
  duration, 
  isPlaying, 
  isSeeking,
  onSeek, 
  onPlayPause 
}) => {
  const progressBarRef = useRef(null);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle click on progress bar for seeking
  const handleProgressClick = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    onSeek(newTime);
  };
  
  // Calculate progress width safely
  const calculateWidth = () => {
    if (duration <= 0) return '0%';
    const percentage = (currentTime / duration) * 100;
    return `${percentage}%`;
  };
  
  // Calculate handle position safely
  const calculateHandlePosition = () => {
    if (duration <= 0) return '-10px';
    const percentage = (currentTime / duration) * 100;
    return `calc(${percentage}% - 10px)`;
  };
  
  return (
    <div className="w-full mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Play/Pause button */}
        <button
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
        
        {/* Current time */}
        <div className="text-sm font-medium text-gray-700" style={{width: 20}}>{formatTime(currentTime)}</div>
        
        {/* Progress bar */}
        <div 
          ref={progressBarRef}
          className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div 
            className={`h-full bg-gradient-to-r from-blue-400 to-purple-500`}
            style={{ width: calculateWidth() }}
          ></div>
          
          {/* Seek handle */}
          <div 
            className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 bg-white border-2 border-purple-500 rounded-full shadow-md hover:scale-110'}`}
            style={{ 
              left: calculateHandlePosition(),
              display: duration > 0 ? 'block' : 'none'
            }}
          ></div>
        </div>
        
        {/* Duration */}
        <div className="text-sm font-medium text-gray-700">{formatTime(duration)}</div>
      </div>
    </div>
  );
};

function App() {
  const [isPlayingA, setIsPlayingA] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const audioContextRef = useRef(null);
  const audioBufferRefA = useRef(null);
  const audioBufferRefB = useRef(null);
  const sourceNodeRefA = useRef(null);
  const sourceNodeRefB = useRef(null);
  const gainNodeRefA = useRef(null);
  const gainNodeRefB = useRef(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  
  // Transport bar states
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playbackStartTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    fetchAudioData();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && audioContextRef.current) {
      gainNodeRefA.current = audioContextRef.current.createGain();
      gainNodeRefA.current.connect(audioContextRef.current.destination);

      gainNodeRefB.current = audioContextRef.current.createGain();
      gainNodeRefB.current.connect(audioContextRef.current.destination);

      gainNodeRefA.current.gain.value = 1;
      gainNodeRefB.current.gain.value = 0;
      
      if (audioBufferRefA.current) {
        setDuration(audioBufferRefA.current.duration);
      }
    }
  }, [isLoading]);

  // Start or restart the animation loop for updating playback time
  const startTimeUpdateLoop = () => {
    // Cancel any existing animation frame first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Only start if we're actually playing and not seeking
    if (!isPlaying || isSeeking) return;
    
    const updatePlaybackTime = () => {
      if (!audioContextRef.current) return;
      
      const newCurrentTime = audioContextRef.current.currentTime - playbackStartTimeRef.current;
      
      if (newCurrentTime <= duration) {
        setCurrentTime(newCurrentTime);
        animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
      } else {
        // We've reached the end
        stopAudio();
        setIsPlaying(false);
        setCurrentTime(0);
        setAudioCurrentTime(0);
      }
    };
    
    // Start the update loop
    animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
  };

  // Handle changes to playing state
  useEffect(() => {
    if (isPlaying && !isSeeking) {
      startTimeUpdateLoop();
    } else if (!isPlaying) {
      // Cancel animation frame if we're not playing
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isSeeking]);

  const fetchAudioData = async () => {
    setIsLoading(true);
    audioContextRef.current = new AudioContext();

    try {
      const [responseA, responseB] = await Promise.all([
        fetch('./assets/audioA.mp3'),
        fetch('./assets/audioB.mp3')
      ]);

      const [arrayBufferA, arrayBufferB] = await Promise.all([
        responseA.arrayBuffer(),
        responseB.arrayBuffer()
      ]);

      const decodePromiseA = new Promise((resolve, reject) => {
        audioContextRef.current.decodeAudioData(
          arrayBufferA,
          buffer => resolve(buffer),
          error => reject(error)
        );
      });

      const decodePromiseB = new Promise((resolve, reject) => {
        audioContextRef.current.decodeAudioData(
          arrayBufferB,
          buffer => resolve(buffer),
          error => reject(error)
        );
      });

      const [bufferA, bufferB] = await Promise.all([decodePromiseA, decodePromiseB]);

      audioBufferRefA.current = bufferA;
      audioBufferRefB.current = bufferB;
      
      setDuration(bufferA.duration);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio files:', error);
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsPlayingA(!isPlayingA);
    if (!isPlayingA) {
      gainNodeRefA.current.gain.value = 1;
      gainNodeRefB.current.gain.value = 0;
    } else {
      gainNodeRefA.current.gain.value = 0;
      gainNodeRefB.current.gain.value = 1;
    }
  };

  // Helper function to stop audio and clean up
  const stopAudio = () => {
    if (sourceNodeRefA.current) {
      try {
        sourceNodeRefA.current.onended = null;
        sourceNodeRefA.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }
    
    if (sourceNodeRefB.current) {
      try {
        sourceNodeRefB.current.onended = null;
        sourceNodeRefB.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }
  };

  // Helper function to start audio from a given position
  const startAudioFromPosition = (position) => {
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    stopAudio();
    
    sourceNodeRefA.current = audioContextRef.current.createBufferSource();
    sourceNodeRefA.current.buffer = audioBufferRefA.current;
    sourceNodeRefA.current.connect(gainNodeRefA.current);
    
    sourceNodeRefB.current = audioContextRef.current.createBufferSource();
    sourceNodeRefB.current.buffer = audioBufferRefB.current;
    sourceNodeRefB.current.connect(gainNodeRefB.current);
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioCurrentTime(0);
    };
    
    sourceNodeRefA.current.onended = handleEnded;
    sourceNodeRefB.current.onended = handleEnded;
    
    sourceNodeRefA.current.start(0, position);
    sourceNodeRefB.current.start(0, position);
    
    // Update timing reference
    playbackStartTimeRef.current = audioContextRef.current.currentTime - position;
  };

  // Handle seeking to a specific position in the audio
  const handleSeek = (newTime) => {
    // Set seeking state to true and stop the animation frame
    setIsSeeking(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clamp the seek time to valid range
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    
    // Update UI immediately without transitions
    setCurrentTime(newTime);
    setAudioCurrentTime(newTime);
    
    // If playing, restart audio from new position
    if (isPlaying) {
      startAudioFromPosition(newTime);
    }
    
    // After a short delay to allow audio nodes to initialize,
    // reset seeking state and restart the animation loop
    setTimeout(() => {
      setIsSeeking(false);
      if (isPlaying) {
        startTimeUpdateLoop();
      }
    }, 50);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      startAudioFromPosition(currentTime);
      setIsPlaying(true);
      // Animation loop will be started by the useEffect
    }
  };

  return (
    <div className="mx-auto max-w-screen-sm">
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <div className="flex items-left justify-left mt-4 mb-12">
            <img
              className="w-12 h-12 rounded-full mr-4"
              src="https://placehold.co/200"
              alt="Avatar"
            />
            <div>
              <h1 className="text-3xl font-bold">Remix</h1>
              <p className="text-sm text-gray-500 text-left">Now with less harshness!</p>
            </div>
          </div>
          
          {/* Transport Bar */}
          <TransportBar 
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isSeeking={isSeeking}
            onSeek={handleSeek}
            onPlayPause={handlePlayPause}
          />
          
          <div className="z-10 grid grid-cols-3 grid-rows-2 items-center justify-items-center gap-4">
            <div
              className={`z-10 w-48 rounded p-8 border border-gray-400 text-7xl font-bold ${isPlayingA ? 'opacity-100' : 'opacity-25'
                } flex flex-col items-center justify-between transition-opacity duration-300`}
            >
              <div className='p-4'>A</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="grey"
                className="w-16 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                />
              </svg>
            </div>
            <div className="w-48 z-10">
              <button
                className="w-24 h-24 rounded-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all shadow-md hover:shadow-lg"
                onClick={handleToggle}
              ></button>
            </div>
            <div
              className={`z-10 w-48 rounded p-8 border border-gray-400 text-7xl font-bold ${!isPlayingA ? 'opacity-100' : 'opacity-25'
                } flex flex-col items-center justify-between transition-opacity duration-300`}
            >
              <div className='p-4'>B</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="grey"
                className="w-16 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                />
              </svg>
            </div>
          </div>
          <div>
            <FrequencyVisualizer
              audioContext={audioContextRef.current}
              gainNodeA={gainNodeRefA.current}
              gainNodeB={gainNodeRefB.current}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
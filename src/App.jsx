import React, { useState, useRef, useEffect } from 'react';
import FrequencyVisualizer from './FrequencyVisualizer';
import './App.css';

function App() {
  const [isPlayingA, setIsPlayingA] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const audioBufferRefA = useRef(null);
  const audioBufferRefB = useRef(null);
  const sourceNodeRefA = useRef(null);
  const sourceNodeRefB = useRef(null);
  const gainNodeRefA = useRef(null);
  const gainNodeRefB = useRef(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  useEffect(() => {
    fetchAudioData();
  }, []);

  useEffect(() => {
    gainNodeRefA.current = audioContextRef.current.createGain();
    gainNodeRefA.current.connect(audioContextRef.current.destination);

    gainNodeRefB.current = audioContextRef.current.createGain();
    gainNodeRefB.current.connect(audioContextRef.current.destination);

    gainNodeRefA.current.gain.value = 1;
    gainNodeRefB.current.gain.value = 0;
  }, []);

  const fetchAudioData = async () => {
    audioContextRef.current = new AudioContext();

    const responseA = await fetch('./assets/audioA.mp3');
    const arrayBufferA = await responseA.arrayBuffer();
    audioContextRef.current.decodeAudioData(
      arrayBufferA,
      (buffer) => {
        audioBufferRefA.current = buffer;
      },
      (error) => {
        console.error('Error decoding audio data:', error);
      }
    );

    const responseB = await fetch('./assets/audioB.mp3');
    const arrayBufferB = await responseB.arrayBuffer();
    audioContextRef.current.decodeAudioData(
      arrayBufferB,
      (buffer) => {
        audioBufferRefB.current = buffer;
      },
      (error) => {
        console.error('Error decoding audio data:', error);
      }
    );
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

  const handlePlayPause = () => {
    if (isPlaying) {
      sourceNodeRefA.current.onended = null;
      sourceNodeRefB.current.onended = null;
      sourceNodeRefA.current.stop();
      sourceNodeRefB.current.stop();
      setAudioCurrentTime(0); // Set the seek time back to 0
      setIsPlaying(false); // Update the isPlaying state to false
    } else {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      sourceNodeRefA.current = audioContextRef.current.createBufferSource();
      sourceNodeRefA.current.buffer = audioBufferRefA.current;
      sourceNodeRefA.current.connect(gainNodeRefA.current);
      sourceNodeRefA.current.start(0, audioCurrentTime);
      sourceNodeRefA.current.onended = () => {
        setIsPlaying(false);
        setAudioCurrentTime(0); // Set the seek time back to 0
      };

      sourceNodeRefB.current = audioContextRef.current.createBufferSource();
      sourceNodeRefB.current.buffer = audioBufferRefB.current;
      sourceNodeRefB.current.connect(gainNodeRefB.current);
      sourceNodeRefB.current.start(0, audioCurrentTime);
      sourceNodeRefB.current.onended = () => {
        setIsPlaying(false);
        setAudioCurrentTime(0); // Set the seek time back to 0
      };

      setIsPlaying(true); // Update the isPlaying state to true
    }
  };


  return (
    <div className="mx-auto max-w-screen-sm">
      <div className="flex items-left justify-left mt-4 mb-24">
        <img
          className="w-12 h-12 rounded-full mr-4"
          src="https://placehold.co/200"
          alt="Avatar"
        />
        <div>
          <h1 className="text-3xl font-bold">Remix</h1>
          <p className="text-sm text-gray-500 text-left">by Kevin Avila</p>
        </div>
      </div>
      <div className="z-10 grid grid-cols-3 grid-rows-2 items-center justify-items-center gap-4">
        <div
          className={`z-10 w-48 rounded p-8 border border-gray-400 text-7xl font-bold ${isPlayingA ? 'opacity-100' : 'opacity-25'
            } flex flex-col items-center justify-between`}
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
            className="w-24 h-24 rounded-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 focus:outline-none"
            onClick={handleToggle}
          ></button>
        </div>
        <div
          className={`z-10 w-48 rounded p-8 border border-gray-400 text-7xl font-bold ${!isPlayingA ? 'opacity-100' : 'opacity-25'
            } flex flex-col items-center justify-between`}
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
        <div className="z-10 col-span-3 mt-12">
          <button
            className={`px-6 py-3 rounded-full text-white text-xl font-semibold focus:outline-none ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            onClick={handlePlayPause}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>

      </div>
      <div>
        <FrequencyVisualizer
          audioContext={audioContextRef.current}
          gainNodeA={gainNodeRefA.current}
          gainNodeB={gainNodeRefB.current}
        />
      </div>
    </div>
  );
}

export default App;
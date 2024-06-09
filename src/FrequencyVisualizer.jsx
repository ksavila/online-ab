import React, { useRef, useEffect } from 'react';

const WIDTH = 640;
const HEIGHT = 360;
const SMOOTHING = 0.8;
const FFT_SIZE = 2048;

function FrequencyVisualizer({ audioContext, gainNodeA, gainNodeB }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!audioContext || !gainNodeA || !gainNodeB) return;

    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;

    gainNodeA.connect(analyser);
    gainNodeB.connect(analyser);

    analyser.minDecibels = -140;
    analyser.maxDecibels = 0;

    const freqs = new Uint8Array(analyser.frequencyBinCount);
    const times = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      if (!audioContext) return;

      analyser.smoothingTimeConstant = SMOOTHING;
      analyser.fftSize = FFT_SIZE;

      analyser.getByteFrequencyData(freqs);
      analyser.getByteTimeDomainData(times);

      const canvas = canvasRef.current;
      const drawContext = canvas.getContext('2d');
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      // Draw the frequency domain chart.
      for (let i = 0; i < analyser.frequencyBinCount; i++) {
        const value = freqs[i];
        const percent = value / 256;
        const height = HEIGHT * percent;
        const offset = HEIGHT - height - 1;
        const barWidth = WIDTH / analyser.frequencyBinCount;
        const hue = (i / analyser.frequencyBinCount) * 360;
        drawContext.fillStyle = `hsl(${hue}, 100%, 50%)`;
        drawContext.fillRect(i * barWidth, offset, barWidth, height);
      }

      requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [audioContext, gainNodeA, gainNodeB]);

  return <canvas ref={canvasRef} className={'opacity-1 fixed z-0 bottom-0'}/>;
}

export default FrequencyVisualizer;
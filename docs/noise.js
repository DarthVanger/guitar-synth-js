function createNoise() {
  const noiseLength = 5;

  const bufferSize = audioCtx.sampleRate * noiseLength;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);

  let data = buffer.getChannelData(0);

  // fill the buffer with noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  let noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  noise.connect(audioCtx.destination);

  return noise;
}

const noise = createNoise();

function playNoise() {
  noise.start();
}

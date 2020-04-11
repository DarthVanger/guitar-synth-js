console.log('harmonics');

class Synth {
  superpose(a, b, awt, bwt) {  // Weighted superposition of a and b.
      const c = new Float32Array(a.length);
      for (let i = 0; i < a.length; i++)
         c[i] = a[i]*awt + b[i]*bwt;
      return c;
   }

   // Play sine wave of a given pitch
   tone(hz, duration) {
      const sampleRate = 44100;
      const bufferSize = sampleRate * duration;
      const buffer = new Float32Array(bufferSize);
      
      for (let i = 0; i <= bufferSize; i++) {
        buffer[i] = Math.sin(2 * Math.PI * i * hz / sampleRate);
      }

     return buffer;
   }

   // Play note of given pitch, with harmonics.
   note(pitch, t) {
      const hz = 440.0 * Math.pow(2, pitch / 12.0);
      const a = this.tone(hz, t);
      const hi = this.tone(2*hz, t);
      const lo = this.tone(hz/2, t);
      const h = this.superpose(hi, lo, 0.5, 0.5);
      return this.superpose(a, h, 0.5, 0.5);
   }
}

export default Synth;

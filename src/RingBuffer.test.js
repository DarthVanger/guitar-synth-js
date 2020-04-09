const RingBuffer = require('./RingBuffer');

test('capacity prop returns capacity passed in the contructor', () => {
  const ringBuffer = new RingBuffer(5);
  expect(ringBuffer.capacity).toBe(5);
});

test('size prop is zero after creating an instance', () => {
  const ringBuffer = new RingBuffer(5);
  expect(ringBuffer.size).toBe(0);
});

test('enqueue increases ring size by 1', () => {
  const ringBuffer = new RingBuffer(5);
  ringBuffer.enqueue(1);
  expect(ringBuffer.size).toBe(1);
  ringBuffer.enqueue(2);
  expect(ringBuffer.size).toBe(2);
  ringBuffer.enqueue(3);
  expect(ringBuffer.size).toBe(3);
});

test('dequeue returns the first item and removes it from the ring', () => {
  const ringBuffer = new RingBuffer(5);
  ringBuffer.enqueue(1);
  ringBuffer.enqueue(2);
  ringBuffer.enqueue(3);
  expect(ringBuffer.size).toBe(3);
  expect(ringBuffer.dequeue()).toBe(1);
  expect(ringBuffer.size).toBe(2);
  expect(ringBuffer.dequeue()).toBe(2);
  expect(ringBuffer.size).toBe(1);
});

test('peek returns the first item and keeps it in the ring', () => {
  const ringBuffer = new RingBuffer(5);
  ringBuffer.enqueue(1);
  ringBuffer.enqueue(2);
  ringBuffer.enqueue(3);
  expect(ringBuffer.size).toBe(3);
  expect(ringBuffer.peek()).toBe(1);
  expect(ringBuffer.size).toBe(3);
  expect(ringBuffer.peek()).toBe(1);
});

test('isEmpty() returns true after instantiating the ring', () => {
  const ringBuffer = new RingBuffer(5);
  expect(ringBuffer.isEmpty()).toBe(true);
});

test('isEmpty() returns false after adding 1 element', () => {
  const ringBuffer = new RingBuffer(5);
  ringBuffer.enqueue(1);
  expect(ringBuffer.isEmpty()).toBe(false);
});

test('isEmpty() returns true after enqueuing 1 element and dequieuing 1 element', () => {
  const ringBuffer = new RingBuffer(5);
  ringBuffer.enqueue(1);
  ringBuffer.dequeue();
  expect(ringBuffer.isEmpty()).toBe(true);
});

test('isFull() returns false when enqueuing 3 elements for ring with capacity 4', () => {
  const ringBuffer = new RingBuffer(4);
  ringBuffer.enqueue(1);
  ringBuffer.enqueue(2);
  ringBuffer.enqueue(3);
  expect(ringBuffer.isFull()).toBe(false);
});

test('isFull() returns true when enqueuing 3 elements for ring with capacity 3', () => {
  const ringBuffer = new RingBuffer(3);
  ringBuffer.enqueue(1);
  ringBuffer.enqueue(2);
  ringBuffer.enqueue(3);
  expect(ringBuffer.isFull()).toBe(true);
});

test('peek() and dequeue() return the first element after enqueueing and dequeing elements N times, N > capacity', () => {
  const ringBuffer = new RingBuffer(3);
  ringBuffer.enqueue(1);
  ringBuffer.enqueue(2);
  ringBuffer.enqueue(3);
  ringBuffer.dequeue();
  ringBuffer.dequeue();
  ringBuffer.enqueue(4);
  ringBuffer.enqueue(5);
  expect(ringBuffer.peek()).toBe(3);
  expect(ringBuffer.dequeue()).toBe(3);
  expect(ringBuffer.dequeue()).toBe(4);
});

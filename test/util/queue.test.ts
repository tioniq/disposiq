import {Queue} from "../../src/utils/queue";

describe('queue', () => {
  it('should enqueue and dequeue', () => {
    const queue = new Queue<number>()
    queue.enqueue(1)
    queue.enqueue(2)

    expect(queue.getLength()).toBe(2)
    expect(queue.getHead()).toBe(1)

    let head = queue.dequeue()

    expect(head).toBe(1)
    expect(queue.getLength()).toBe(1)
    expect(queue.getHead()).toBe(2)

    head = queue.dequeue()
    expect(head).toBe(2)

    expect(queue.getLength()).toBe(0)

    head = queue.dequeue()

    expect(head).toBe(null)
  })

  it('should return null when queue is empty', () => {
    const queue = new Queue<number>()
    const head = queue.dequeue()

    expect(head).toBe(null)
  })

  it('should return empty when queue is empty', () => {
    const queue = new Queue<number>()

    expect(queue.isEmpty()).toBe(true)

    queue.enqueue(1)

    expect(queue.isEmpty()).toBe(false)

    queue.dequeue()

    expect(queue.isEmpty()).toBe(true)
  })

  it('should iterate over queue', () => {
    const queue = new Queue<number>()
    queue.enqueue(1)
    queue.enqueue(2)

    const values: number[] = []
    queue.forEach(value => values.push(value))

    expect(values).toEqual([1, 2])
  })
})
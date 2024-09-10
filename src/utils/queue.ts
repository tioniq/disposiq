export class Node<T> {
  value: T
  next: Node<T> | null

  constructor(value: T) {
    this.value = value
    this.next = null
  }
}

export class Queue<T> {
  head: Node<T> | null
  tail: Node<T> | null
  length: number

  constructor() {
    this.head = null
    this.tail = null
    this.length = 0
  }

  enqueue(value: T) {
    const node = new Node(value)
    if (this.head) {
      this.tail!.next = node
      this.tail = node
    } else {
      this.head = node
      this.tail = node
    }
    this.length++
  }

  dequeue(): T | null {
    const current = this.head
    if (current === null) {
      return null
    }
    this.head = current.next
    this.length--
    return current.value
  }

  isEmpty(): boolean {
    return this.length === 0
  }

  getHead(): T | null {
    return this.head?.value ?? null
  }

  getLength(): number {
    return this.length
  }

  forEach(consumer: (value: T) => void) {
    let current = this.head
    while (current !== null) {
      consumer(current.value)
      current = current.next
    }
  }

  toArray() {
    const result: T[] = []
    let current = this.head
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  clear() {
    this.head = null
    this.tail = null
    this.length = 0
  }
}

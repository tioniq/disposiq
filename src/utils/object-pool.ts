import {Queue} from "./queue"

export class ObjectPool<T> {
  private readonly _scrap: Queue<T>
  private _size: number

  public constructor(poolSize: number) {
    this._scrap = new Queue<T>()
    this._size = poolSize
  }

  get size(): number {
    return this._size
  }

  set size(value: number) {
    this._size = value
  }

  get all(): T[] {
    return this._scrap.toArray()
  }

  public lift(): T | null {
    return this._scrap.length > 0 ? this._scrap.dequeue() : null
  }

  public throw(item: T): T | null {
    if (this._scrap.length < this._size) {
      this._scrap.enqueue(item)
      return null
    }
    const recycled = this._scrap.dequeue()
    this._scrap.enqueue(item)
    return recycled
  }

  public clear() {
    this._scrap.clear()
  }
}
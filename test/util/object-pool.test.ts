import { ObjectPool } from "../../src/utils/object-pool"

describe("object pool", () => {
  it("should throw and lift object", () => {
    const pool = new ObjectPool<number>(2)
    expect(pool.size).toBe(2)
    expect(pool.all).toEqual([])

    let item = pool.lift()

    expect(item).toBe(null)

    let extra = pool.throw(1)

    expect(extra).toBe(null)

    expect(pool.all).toEqual([1])

    item = pool.lift()

    expect(item).toBe(1)
    expect(pool.all).toEqual([])

    item = pool.lift()

    expect(item).toBe(null)

    extra = pool.throw(1)

    expect(extra).toBe(null)

    extra = pool.throw(2)

    expect(extra).toBe(null)
    expect(pool.all).toEqual([1, 2])

    extra = pool.throw(3)

    expect(extra).toBe(1)
    expect(pool.all).toEqual([2, 3])
  })

  it("should clear object pool", () => {
    const pool = new ObjectPool<number>(2)
    pool.throw(1)
    pool.throw(2)
    pool.clear()
    expect(pool.all).toEqual([])
  })

  it("should set object pool size", () => {
    const pool = new ObjectPool<number>(2)
    pool.size = 3
    expect(pool.size).toBe(3)

    pool.throw(1)
    pool.throw(2)
    pool.throw(3)

    expect(pool.all).toEqual([1, 2, 3])

    pool.throw(4)

    expect(pool.all).toEqual([2, 3, 4])
  })

  it("should not throw an exception when pool size is zero", () => {
    const pool = new ObjectPool<number>(0)
    pool.throw(1)
    pool.throw(2)
    pool.throw(3)
    expect(pool.all).toEqual([])
  })
})

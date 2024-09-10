import peer from "./peer"

async function main() {
  await run(peer)
}

async function run<T>(action: () => Promise<T> | T) {
  try {
    await action()
  } catch (error) {
    console.error(error)
  }
}

main().then(() => {
  console.info("Done")
  process.exit(0)
})
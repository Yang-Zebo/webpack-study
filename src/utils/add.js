export default function add(...args) {
  const result = args.reduce((pre, next) => {
    return pre + next
  }, 0)
  return result
}
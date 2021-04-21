export default function findKey(string: string): string | undefined {
  const re = /[a-zA-Z0-9]+-[0-9]+/
  const match = re.exec(string)
  return match ? match[0].toUpperCase() : undefined
}

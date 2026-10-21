import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

// Pinned distribution; preserve its original attribution alongside the samples.
const commit = '869b6f8d9cddb47d966238c012041480b1ce517a'
const base = `https://raw.githubusercontent.com/Tonejs/audio/${commit}/salamander/`
const directory = new URL('../public/audio/piano/', import.meta.url)
const names = ['A0', ...Array.from({ length: 7 }, (_, i) => ['C', 'Ds', 'Fs', 'A'].map(n => `${n}${i + 1}`)).flat(), 'C8']
await mkdir(directory, { recursive: true })
const manifest = []
const queue = [...names.map(n => `${n}.mp3`), 'README']
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const name = queue.shift()
    const response = await fetch(base + name, { signal: AbortSignal.timeout(30_000) })
    if (!response.ok) throw new Error(`Download failed: ${name} (${response.status})`)
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length > 250_000) throw new Error(`Unexpected sample size: ${name}`)
    await writeFile(new URL(name === 'README' ? 'UPSTREAM-README.txt' : name, directory), bytes)
    manifest.push({ file: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
  }
}))
manifest.sort((a, b) => a.file.localeCompare(b.file))
await writeFile(new URL('manifest.json', directory), JSON.stringify({ source: base, commit, files: manifest }, null, 2) + '\n')
console.log(`Saved ${names.length} piano samples (${(manifest.reduce((sum, f) => sum + f.bytes, 0) / 1024 / 1024).toFixed(2)} MiB) in ${fileURLToPath(directory)}`)

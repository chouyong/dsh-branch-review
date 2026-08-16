import { readFile } from 'node:fs/promises'

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
if (packageJson.dsh?.client?.platform !== 'web') throw new Error('package must declare web client platform')
if (!packageJson.dsh.client.inject.includes('@deepseek-ai/dsh-client-runtime')) throw new Error('runtime injection missing')
if (packageJson.dsh.bundle?.patch !== './cordis.patch.yml') throw new Error('Cordis patch missing')
console.log('package contract: PASS')

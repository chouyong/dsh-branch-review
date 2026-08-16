import { readFile } from 'node:fs/promises'

const bundle = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
if (!bundle.includes('window.__ModuleLoader__.load')) throw new Error('bundle contract missing ModuleLoader wrapper')
if (!bundle.includes('dsh-branch-review')) throw new Error('bundle contract missing plugin id')
if (!/require\((['"])react\1\)/.test(bundle)) throw new Error('bundle contract missing external React')
if (bundle.includes('react.production.min.js') || bundle.includes('react-dom.production.min.js')) {
  throw new Error('bundle contract includes a second React runtime')
}
console.log('bundle contract: PASS')

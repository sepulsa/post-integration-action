import {exec} from '@actions/exec'
import {SemVer, sort, valid} from 'semver'

export default async function gitTag(): Promise<string> {
  let output = ''

  await exec('git', ['config', 'versionsort.suffix', '-'])
  await exec(
    'git',
    ['tag', '--list', '--sort', 'v:refname', '[v0-9]*.[0-9]*.[0-9]*'],
    {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString()
        }
      }
    }
  )

  // Filter invalid semver tag
  const tags = output
    .trim()
    .split('\n')
    .filter(tag => valid(tag))

  const semver = new SemVer(sort(tags).pop() || '1.0.0')
  return semver.inc('preminor', 'rc').version
}

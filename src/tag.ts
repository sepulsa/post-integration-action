import {exec} from '@actions/exec'
import {prerelease, SemVer, sort, valid} from 'semver'

export async function prereleaseTag(): Promise<string> {
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

export async function prereleaseTagFromKey(
  key: string
): Promise<string | undefined> {
  let output = ''

  await exec(
    'git',
    [
      'tag',
      '--list',
      '--ignore-case',
      '--points-at',
      key,
      '[0-9]*.[0-9]*.[0-9]*'
    ],
    {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString().trim()
        }
      }
    }
  )

  const tags = output
    .trim()
    .split('\n')
    .filter(tag => prerelease(tag))

  return sort(tags).pop()
}

export function releaseTag(prerelease_tag: string): string {
  const semver = new SemVer(prerelease_tag)
  return semver.inc('minor').version
}

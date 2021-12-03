import * as semver from 'semver'
import {exec} from '@actions/exec'

const SEMVER_PATTERN = '[v0-9]*.[0-9]*.[0-9]*'

let output: Buffer

function stdout(data: Buffer): void {
  output = data
}

async function listTags(args: string[]): Promise<number> {
  return exec('git', ['tag', '--list'].concat(args), {
    listeners: {
      stdout
    }
  })
}

function tagsFromBuffer(buffer: Buffer): string[] {
  return buffer.toString().trim().split('\n')
}

export async function prereleaseTag(): Promise<string> {
  await exec('git', ['config', 'versionsort.suffix', '-'])
  await listTags(['--sort', 'v:refname', SEMVER_PATTERN])

  let ver: semver.SemVer
  if (output) {
    // Filter invalid semver tag
    const tags = tagsFromBuffer(output).filter(tag => semver.valid(tag))
    ver = new semver.SemVer(semver.sort(tags).pop() || '1.0.0')
  } else {
    ver = new semver.SemVer('1.0.0')
  }

  return ver.inc('preminor', 'rc').version
}

export async function prereleaseTagFromKey(key: string): Promise<string | undefined> {
  await listTags(['--ignore-case', '--points-at', key, SEMVER_PATTERN])

  const tags = tagsFromBuffer(output).filter(tag => semver.prerelease(tag))

  return semver.sort(tags).pop()
}

export function releaseTagFromPrerelease(tag: string): string {
  const ver = new semver.SemVer(tag)
  return ver.inc('minor').version
}

import { exec } from '@actions/exec'
import { prerelease, SemVer, sort, valid } from 'semver'

const SEMVER_PATTERN = '[v0-9]*.[0-9]*.[0-9]*'

let output: Buffer

function stdout(data: Buffer): void {
  output = data
}

async function listTags(args: string[]): Promise<number> {
  return exec('git', ['tag', '--list'].concat(args), {
    listeners: {
      stdout,
    },
  })
}

function tagsFromBuffer(buffer: Buffer): string[] {
  return buffer.toString().trim().split('\n')
}

export async function prereleaseTag(): Promise<string> {
  await exec('git', ['config', 'versionsort.suffix', '-'])
  await listTags(['--sort', 'v:refname', SEMVER_PATTERN])

  let semver: SemVer
  if (output) {
    // Filter invalid semver tag
    const tags = tagsFromBuffer(output).filter((tag) => valid(tag))
    semver = new SemVer(sort(tags).pop() || '1.0.0')
  } else {
    semver = new SemVer('1.0.0')
  }

  return semver.inc('preminor', 'rc').version
}

export async function prereleaseTagFromKey(key: string): Promise<string | undefined> {
  await listTags(['--ignore-case', '--points-at', key, SEMVER_PATTERN])

  const tags = tagsFromBuffer(output).filter((tag) => prerelease(tag))

  return sort(tags).pop()
}

export function releaseTagFromPrerelease(prerelease_tag: string): string {
  const semver = new SemVer(prerelease_tag)
  return semver.inc('minor').version
}

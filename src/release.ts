import * as core from '@actions/core'
import { exec } from '@actions/exec'
import yn from 'yn'
import deleteEnvironment from './environment'
import { prereleaseTagFromKey, releaseTagFromPrerelease } from './tag'

async function run(): Promise<void> {
  try {
    const key = core.getInput('key', { required: true }).toUpperCase()
    const token = core.getInput('token', { required: true })

    const prereleaseTag = await prereleaseTagFromKey(key)
    if (prereleaseTag === undefined) {
      core.setFailed("Can't find prerelease tag")
      return
    }

    const releaseTag = releaseTagFromPrerelease(prereleaseTag)

    const push = yn(core.getInput('push', { required: true }))
    if (push) {
      await core.group('Create release tag', async () => {
        await exec('git', ['tag', releaseTag, key])
        await exec('git', ['push', 'origin', releaseTag])
      })

      await core.group('Clean up prerelease tag', async () => {
        await exec('git', ['tag', '--delete', prereleaseTag, key])
        await exec('git', ['push', '--delete', 'origin', key])
        await exec('git', ['push', '--delete', 'origin', prereleaseTag])
      })
    }

    await deleteEnvironment(token, key)
    core.setOutput('tag', releaseTag)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

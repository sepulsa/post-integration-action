import * as core from '@actions/core'
import State from '../utils/state'
import deleteEnvironment from '../utils/environment'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    const key = core.getState(State.KEY)

    const push = core.getBooleanInput('push', {required: true})
    if (push) {
      const prereleaseTag = core.getState(State.PRERELEASE_TAG)
      const releaseTag = core.getState(State.RELEASE_TAG)

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

    const token = core.getInput('token', {required: true})
    await deleteEnvironment(token, key)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

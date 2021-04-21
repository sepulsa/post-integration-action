import * as core from '@actions/core'
import {exec} from '@actions/exec'
import yn from 'yn'
import {deleteEnvironment} from './environment'
import {prereleaseTagFromKey, releaseTag} from './tag'

async function run(): Promise<void> {
  try {
    const key = core.getInput('key', {required: true}).toUpperCase()
    const token = core.getInput('token', {required: true})

    const prerelease_tag = await prereleaseTagFromKey(key)
    if (prerelease_tag === undefined) {
      core.setFailed("Can't find prerelease tag")
      return
    }

    const release_tag = releaseTag(prerelease_tag)

    const push = yn(core.getInput('push', {required: true}))
    if (push) {
      await core.group('Create release tag', async () => {
        await exec('git', ['tag', release_tag, key])
        await exec('git', ['push', 'origin', release_tag])
      })

      await core.group('Clean up prerelease tag', async () => {
        await exec('git', ['tag', '--delete', prerelease_tag, key])
        await exec('git', ['push', '--delete', 'origin', key])
        await exec('git', ['push', '--delete', 'origin', prerelease_tag])
      })
    }

    await deleteEnvironment(token, key)
    core.setOutput('tag', release_tag)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

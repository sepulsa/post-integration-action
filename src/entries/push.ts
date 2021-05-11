import * as core from '@actions/core'
import { exec } from '@actions/exec'
import yn from 'yn'
import State from '../state'

async function run(): Promise<void> {
  try {
    const push = yn(core.getInput('push', { required: true }))
    if (push) {
      const key = core.getState(State.KEY)
      if (key) {
        await exec('git', ['tag', key])
      }

      const tag = core.getState(State.TAG)
      if (tag) {
        await exec('git', ['tag', tag])
      }

      await exec('git', ['push', '--tags'])
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

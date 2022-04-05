import * as core from '@actions/core'
import State from '../utils/state'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    const push = core.getBooleanInput('push', {required: true})
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
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

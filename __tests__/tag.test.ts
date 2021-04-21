import {exec, ExecOptions} from '@actions/exec'
import {prereleaseTag, prereleaseTagFromKey, releaseTag} from '../src/tag'

jest.mock('@actions/exec')
const mockedExec = exec as jest.Mock<Promise<number>>

function mockExecImplementation(
  cb: (listener: (data: Buffer) => void) => void
): void {
  mockedExec.mockImplementation(
    async (
      commandLine: string,
      args?: string[],
      options?: ExecOptions
    ): Promise<number> => {
      if (options?.listeners?.stdout) {
        cb(options.listeners.stdout)
      }
      return 1
    }
  )
}

describe('prereleaseTag', () => {
  const TEST_CASES = [
    // No previous tag.
    ['', '1.1.0-rc.0'],
    ['1.1.0', '1.2.0-rc.0'],
    ['1.1.0\nv1.2.0', '1.3.0-rc.0'],
    ['1.2.0\nv1.1.0', '1.3.0-rc.0'],
    ['v1.1.0\n1.2.0', '1.3.0-rc.0'],
    ['v1.2.0\n1.1.0', '1.3.0-rc.0']
  ]
  test.concurrent.each(TEST_CASES)(
    'Increment semver: test case #%#',
    async (tags, expected) => {
      mockExecImplementation(listener => {
        listener(Buffer.from(tags))
      })

      await expect(prereleaseTag()).resolves.toBe(expected)
    }
  )
})

test('No prerelease tag', async () => {
  mockExecImplementation(listener => {
    listener(Buffer.from('JIRA-999'))
  })

  await expect(prereleaseTagFromKey('JIRA-999')).resolves.toBeUndefined()
})

test('Prerelease tag', async () => {
  mockExecImplementation(listener => {
    const tags = [
      '1.0.0-rc.0',
      'v1.0.0-rc.0',
      '1.1.0-rc.0',
      '1.2.0',
      'v1.1.0',
      'JIRA-999'
    ]
    listener(Buffer.from(tags.join('\n')))
  })

  await expect(prereleaseTagFromKey('JIRA-999')).resolves.toEqual('1.1.0-rc.0')
})

test('Release tag', () => {
  expect(releaseTag('v1.1.0-rc.0')).toEqual('1.1.0')
})

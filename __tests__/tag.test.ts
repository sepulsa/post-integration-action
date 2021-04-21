import {exec, ExecOptions} from '@actions/exec'
import {prereleaseTag, prereleaseTagFromKey, releaseTag} from '../src/tag'

jest.mock('@actions/exec')
const mockedExec = exec as jest.Mock<Promise<number>>

function mockExecImplementation(data?: Buffer): void {
  mockedExec.mockImplementation(
    async (
      commandLine: string,
      args?: string[],
      options?: ExecOptions
    ): Promise<number> => {
      if (data && options?.listeners?.stdout) {
        options.listeners.stdout(data)
        return 0
      }

      return 1
    }
  )
}

describe('prereleaseTag', () => {
  const TEST_CASES: [Buffer | undefined, string][] = [
    // No previous tag.
    [undefined, '1.1.0-rc.0'],
    [Buffer.from(''), '1.1.0-rc.0'],

    [Buffer.from('1.1.0'), '1.2.0-rc.0'],
    [Buffer.from('1.1.0\nv1.2.0'), '1.3.0-rc.0'],
    [Buffer.from('1.2.0\nv1.1.0'), '1.3.0-rc.0'],
    [Buffer.from('v1.1.0\n1.2.0'), '1.3.0-rc.0'],
    [Buffer.from('v1.2.0\n1.1.0'), '1.3.0-rc.0']
  ]
  test.concurrent.each(TEST_CASES)('Test case #%#', async (tags, expected) => {
    mockExecImplementation(tags)

    await expect(prereleaseTag()).resolves.toBe(expected)
  })
})

test('No prerelease tag', async () => {
  mockExecImplementation(Buffer.from('JIRA-999'))

  await expect(prereleaseTagFromKey('JIRA-999')).resolves.toBeUndefined()
})

test('Prerelease tag', async () => {
  const tags = [
    '1.0.0-rc.0',
    'v1.0.0-rc.0',
    '1.1.0-rc.0',
    '1.2.0',
    'v1.1.0',
    'JIRA-999'
  ]
  mockExecImplementation(Buffer.from(tags.join('\n')))

  await expect(prereleaseTagFromKey('JIRA-999')).resolves.toEqual('1.1.0-rc.0')
})

test('Release tag', () => {
  expect(releaseTag('v1.1.0-rc.0')).toEqual('1.1.0')
})

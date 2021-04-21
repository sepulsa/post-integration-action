import {exec, ExecOptions} from '@actions/exec'
import gitTag from '../src/git-tag'

jest.mock('@actions/exec')

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
    const mockedExec = exec as jest.Mock<Promise<number>>
    mockedExec.mockImplementation(
      async (
        commandLine: string,
        args?: string[],
        options?: ExecOptions
      ): Promise<number> => {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from(tags))
        }
        return 1
      }
    )

    await expect(gitTag()).resolves.toBe(expected)
  }
)

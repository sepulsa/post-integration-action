import findKey from '../src/find-key'

const TEST_CASES: [string, string | undefined][] = [
  ['feature/jira-123-branch', 'JIRA-123'],
  ['feature/jira-123', 'JIRA-123'],
  ['jira-123-branch', 'JIRA-123'],
  ['jira-123', 'JIRA-123'],
  ['feature/branch', undefined],
  ['feature', undefined],
  ['branch', undefined]
]
test.concurrent.each(TEST_CASES)(
  'Find key from %p should return %p',
  async (branch, expected) => {
    expect(findKey(branch)).toBe(expected)
  }
)

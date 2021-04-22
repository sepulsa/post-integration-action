import deleteEnvironment from '../src/environment'

test('Delete invalid environment', async () => {
  const key = 'JIRA-404'
  await expect(deleteEnvironment('', key)).resolves.toEqual(404)
})

test('Delete environment', async () => {
  const key = 'JIRA-204'
  await expect(deleteEnvironment('', key)).resolves.toEqual(204)
})

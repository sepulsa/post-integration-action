import changeRecord from '../src/change-record'

jest.mock('@aws-sdk/client-route-53', () => ({
  ChangeResourceRecordSetsCommand: jest.fn(),
  Route53Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockReturnValue(true),
  })),
}))

const TEST_CASES: [string | undefined, string | undefined][] = [
  ['accessKeyId', 'secretAccessKey'],
  [undefined, undefined],
]
test.concurrent.each(TEST_CASES)('Test case #%#', async (accessKeyId, secretAccessKey) => {
  await expect(
    changeRecord({
      action: 'CREATE',
      name: 'admin.example.com',
      type: 'CNAME',
      dnsRecord: 'ns.example.com',
      zoneId: 'ZONEID',
      accessKeyId,
      secretAccessKey,
    }),
  ).resolves.toBeTruthy()
})

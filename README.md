# Post-Integration Action

## Prerelease

This action output JIRA issue key and prerelease tag based on Pull Request branch.

### Inputs
|Input|Required|Default|Description|
|---|:---:|---|---|
|`branch`|✅| |Branch name, must contain JIRA issue key|
|`push`|✅|`true`|Push tags if `true`|

### Outputs
|Output|Description|
|------|---|
|`key`|JIRA issue key|
|`tag`|Prerelease tag|

### Example usage

```yaml
uses: sepulsa/post-integration-action/prerelease@main
with:
  branch: ${{ github.head_ref }}
```

## Release

This action output release tag based on JIRA Issue key.

### Inputs
|Input|Required|Description|
|---|:---:|---|
|`key`|✅|JIRA issue key|
|`token`|✅|Github Personal Access Token with permission to delete environment|

### Outputs
|Output|Description|
|------|---|
|`tag`|Release tag|

### Example usage

```yaml
- uses: actions/checkout@v2
  with:
    ref: ${{ github.event.inputs.key }}
    fetch-depth: 0
- uses: sepulsa/post-integration-action/release@main
  with:
    key: ${{ github.event.inputs.key }}
    token: ${{ secrets.RELEASE_TOKEN }}
```

## Route Domain

This action `CREATE` or `DELETE` dns record.

### Inputs
|Input|Required|Description|
|---|:---:|---|
|`action`|✅|The action to perform. One of `CREATE`, `DELETE`, or `UPSERT`|
|`name`|✅|Fully  qualified  domain  name|
|`type`|✅|The DNS record type|
|`dns-record`|✅|The current or new DNS  record  value|
|`zone-id`|✅|The ID of the hosted zone that contains the resource record sets that you want to change|

Valid  values for DNS record `type`: **A** | **AAAA** | **CAA** | **CNAME** | **DS** | **MX** | **NAPTR** | **NS** | **PTR** | **SOA** | **SPF** | **SRV** | **TX**

### Outputs
|Output|Description|
|------|---|
|`output`|A complex type that contains information about changes made to your hosted zone|

### Example usage

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-southeast-1
- id: create-domain
  uses: sepulsa/post-integration-action/route-domain@route-domain
  with:
    action: CREATE
    name: admin.example.com
    type: CNAME
    dns-record: ns.example.com
    zone-id: ZONEID
- id: delete-domain
  uses: sepulsa/post-integration-action/route-domain@main
  with:
    action: DELETE
    name: admin.example.com
    type: CNAME
    dns-record: ns.example.com
    zone-id: ZONEID
```

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

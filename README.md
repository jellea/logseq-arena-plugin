# logseq-arena-plugin
Unofficial Are.na plugin for Logseq

# Build
`npm install && npm run build`

# Install

Tested with Logseq 0.5.4 

1. Enable Developer mode in Settings > Advanced 
2. Open plugin settings with `t` `p`
3. "Load unpacked plugin"
4. Choose the plugin repo folder 
5. Click the gear icon under the plugin name to open settings
6. Authenticate into Are.na by providing an access token (found at [dev.are.na](https://dev.are.na/oauth/applications)) like this:

```JSON
{
  "disabled": false,
  "arenaToken": "your token"
}
```

import '@logseq/libs'

export function registerSlashCommands(){
  logseq.Editor.registerSlashCommand('Embed Are.na Channel', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :arena-channel, channel-url}}`,
    )
    logseq.App.showMsg('/arena-channel installed')
  })
  
  logseq.Editor.registerSlashCommand('Embed Are.na Block', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :arena-block, block-url}}`,
    )
    logseq.App.showMsg('/arena-block installed')
  })
}
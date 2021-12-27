import '@logseq/libs'

export async function registerSlashCommands(){
  await logseq.Editor.registerSlashCommand('Embed Are.na Channel', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :arena-channel, channel-url}}`,
    )
  })
  
  await logseq.Editor.registerSlashCommand('Embed Are.na Block', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :arena-block, block-url}}`,
    )
  })
}
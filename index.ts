import '@logseq/libs'

const Arena = require("are.na");

async function main () {
  // You might need to set the Arena personal token manually
  // logseq.updateSettings({arenaToken:""})

  let apiToken = logseq.settings.arenaToken

  // TODO ask for token
  // if (!apiToken) {
  //   apiToken = window.prompt("Please fill in your arena personal token")
  //   logseq.updateSettings({arenaToken:apiToken})
  // }

  const arena = new Arena({accessToken: apiToken});

  // TODO fetch all channel names for auto complete
  // arena.me().get().then(user => {
  //   console.log(user)
  //   arena.user(user.id).channels().then(channels=>{
  //     console.log(channels)
  //   })
  // });
  
  // TODO registering of slash commands doesn't seem to work currently?
  logseq.Editor.registerSlashCommand('Embed Are.na Channel', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :arena-channel, channel}}`,
    )
    logseq.App.showMsg('/arena-channel installed')
  })


  logseq.App.onMacroRendererSlotted(async({ slot, payload}) => {
    let [type, channelUrl] = payload.arguments
    if (type !== ':arena-channel') return

    const regex = /https:\/\/w*\.?are\.na\/.+\/(.+)\/?/gm;
    let slug = regex.exec(channelUrl.trim())[1]

    arena.channel(slug).get().then(channel=>{
      let blocks = channel.contents.map(b=>`<li>${b.title}</li>`).join("")
      console.log(blocks)
      logseq.provideUI({
        key: 'arena-channel',
        slot, template: `
        <div style="background-color:var(--ls-quaternary-background-color);border-radius:5px;padding:10px;white-space:normal;">
          <h3>Are.na Channel: ${channel.title}</h3>
          <p>Number of blocks: ${channel.length}</p>
          <p>Channel status: ${channel.status}</p>
          <p>Description: ${channel.metadata.description}</p>
          <p><a href="https://are.na/${channel.owner.slug}/${channel.slug}">link</a></p>
          <ul>${blocks}</ul>
        </div>
        `,
      })
    })
  })
}

logseq.ready(main).catch(console.error)
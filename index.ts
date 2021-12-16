import '@logseq/libs'
import styles from "./index.css";

const Arena = require("are.na");

async function main () {
  // You might need to set the Arena personal token manually
  // logseq.updateSettings({arenaToken:""})

  let apiToken = logseq.settings.arenaToken

  // XXX remove once I manage to apply index.css properly
  logseq.provideStyle(`
  h3.arena-chan-title.private {
    color: red;
  }

  h3.arena-chan-title.public {
      color: #00FF00;
  }

  .arena-block {
    display: inline-block;
    width: 8rem;
    height: 8rem;
    margin: 0 5px 5px 0;
    border: 1px solid #FFFFFF55;
    font-size: 0.7em;
    line-height: 100%;
  }
  .arena-block-grid {
    display: flex;
    max-width: 50em;
    flex-wrap: wrap;
  }
  `)

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
      console.log(channel.contents)
      let blocks = channel.contents.map(b=>`<div class="arena-block">${b.title}</div>`).join("")
      console.log(blocks)
      logseq.provideUI({
        key: 'arena-channel',
        slot, template: `
        <div style="background-color:var(--ls-quaternary-background-color);border-radius:5px;padding:10px;white-space:normal;">
          <h3 class="arena-chan-title ${channel.status}">${channel.title}</h3>
          <p>${!channel.metadata ? '' : channel.metadata.description}</p>
          <p><a href="https://are.na/${channel.owner.slug}/${channel.slug}">Are.na channel</a> - ${channel.length} Blocks</p>
          <p></p>
          <div class="arena-block-grid">
            ${blocks}
          </div>
        </div>
        `,
      })
    })
  })
}

logseq.ready(main).catch(console.error)
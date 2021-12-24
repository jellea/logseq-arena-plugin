import '@logseq/libs'
// import styles from "./index.css";

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

  .arena-plugin-wrapper {
    background-color: var(--ls-quaternary-background-color);
    border-radius: 5px;
    padding: 10px;
    white-space: normal;
  }

  .arena-block {
    display: inline-block;
    width: 8rem;
    font-size: 0.7em;
    line-height: 100%;
    margin: 0 10px 10px 0;
    overflow: hidden;
  }
  .arena-block-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 8rem;
    vertical-align: middle;
    border: 1px solid #FFFFFF55;
    overflow: hidden;
  }
  .arena-block-title {
    margin-top: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

  logseq.provideModel({
    openLink(e) {
      console.log(e)
      const { url } = e.dataset
      logseq.App.openExternalLink(url)
    }
   })
  
  function renderBlock(b) {
    let { id, image, title } = b
    return image ? `
          <div class="arena-block" data-url="https://are.na/block/${id}" data-on-click="openLink" data-rect>
            <div class="arena-block-content"><img src="${image.square.url}"></div>
            <div class="arena-block-title">${title}</div>
          </div>
        `
      : `
      <div class="arena-block" data-url="https://are.na/block/${id}" data-on-click="openLink" data-rect>
        <div class="arena-block-content">'${b.content}'</div>
        <div class="arena-block-title">${title}</div>
      </div>
      `
  }

  function renderErrorMessage(slot){
    logseq.provideUI({
      key: 'arena-error',
      slot, template: `
      <div class="arena-plugin-wrapper">
        <h4>Error rendering are.na channel or block</h3>
      </div>
      `,
    })
  }

  function renderChannel(slot, payload) {
    let [type, channelUrl] = payload.arguments

    const regex = /https:\/\/w*\.?are\.na\/.+\/(.+)\/?/gm;
    let slug = regex.exec(channelUrl.trim())[1]

    arena.channel(slug).get().then(channel=>{
      console.log("ch",channel)

      let blocks = channel.contents.map(renderBlock).join("")
      logseq.provideUI({
        key: `arena-channel`,
        slot, template: `
        <div class="arena-plugin-wrapper">
          <h3 class="arena-chan-title ${channel.status}">Are.na channel: ${channel.title}</h3>
          <p>${!channel.metadata ? '' : channel.metadata.description}</p>
          <p>${channel.length} blocks - <a data-on-click="openLink" data-url="https://are.na/${channel.owner.slug}/${channel.slug}">open in are.na</a></p>
          <p></p>
          <div class="arena-block-grid">
            ${blocks}
          </div>
        </div>
        `,
      })
    }).catch((error) => {
      renderErrorMessage(slot)
    })
  
  }

  function renderSingleBlock(slot, payload){
    let [type, blockUrl] = payload.arguments

    const regex = /https:\/\/w*\.?are\.na\/block\/(.+)\/?/gm;
    let slug = regex.exec(blockUrl.trim())[1]

    arena.block(slug).get().then(block=>{
      logseq.provideUI({
        key: `arena-block`,
        slot, template: `
        <div class="arena-plugin-wrapper">
          <h3 class="arena-chan-title">Are.na block: ${block.title}</h3>
          <div class="arena-block-grid">
            ${renderBlock(block)}
          </div>
        </div>
        `
        ,
      })
    }).catch((error) => {
      renderErrorMessage(slot)
    })
  }

  logseq.App.onMacroRendererSlotted(async({slot, payload}) => {
    let [type] = payload.arguments
      
    switch(type){
      case ':arena-channel':
        return renderChannel(slot, payload)
      case ':arena-block':
        return renderSingleBlock(slot, payload)
    }
  })
}

logseq.ready(main).catch(console.error)
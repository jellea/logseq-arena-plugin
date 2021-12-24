import '@logseq/libs'
import styles from './styles.inline.css';
import {registerSlashCommands} from './slash-commands';

const Arena = require("are.na");

async function main () {
  // You might need to set the Arena personal token manually
  // Generator Personal Access token here: https://dev.are.na/users/sign_in
  // logseq.updateSettings({arenaToken:""})

  let apiToken = logseq.settings.arenaToken
  
  logseq.provideStyle(styles)

  const arena = new Arena({accessToken: apiToken});

  registerSlashCommands()

  // Needed to be able to open external links
  // Use by adding the following html attributes data-url="https://are.na/block/${id}" data-on-click="openLink"
  logseq.provideModel({
    openLink(e) {
      const { url } = e.dataset
      logseq.App.openExternalLink(url)
    }
  })
  
  function renderBlock(b) {
    let { id, image, title } = b
    return image ? `
          <div class="arena-block" data-url="https://are.na/block/${id}" data-on-click="openLink">
            <div class="arena-block-content"><img src="${image.square.url}"></div>
            <div class="arena-block-title">${title}</div>
          </div>
        `
      : `
      <div class="arena-block" data-url="https://are.na/block/${id}" data-on-click="openLink">
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
          <p><a data-on-click="openLink" data-url="${blockUrl}">open in are.na</a></p>
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
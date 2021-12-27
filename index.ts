import '@logseq/libs'
import styles from './styles.inline.css';
import {logo} from './utils';
import {registerSlashCommands} from './slash-commands';
// import { initSearch } from './search';

const Arena = require("are.na");
    
export function showSearchField(slot){
  logseq.provideUI({
    key: 'arena-channel-search',
    slot, template: `
    <div class="arena-plugin-wrapper">
      <input type="text" focus>
    </div>
    `,
  })
}

export async function main () {
  let apiToken = logseq.settings.arenaToken
  
  if (!apiToken){
    // Open Auth Modal
    logseq.showMainUI()
  }else{
    logseq.provideStyle(styles)

    let arena = new Arena({accessToken: apiToken});
    
    // initSearch(arena)

    registerSlashCommands().then(()=>{
      console.log("installed slash commands")
    })

    // Needed to be able to open external links
    // Use by adding the following html attributes data-url="https://are.na/block/${id}" data-on-click="openLink"
    logseq.provideModel({
      openLink(e) {
        const { url } = e.dataset
        logseq.App.openExternalLink(url)
      }
    })

    logseq.provideModel({
      addBlockReference(e) {
        const { logseqBlockUuid, arenaBlockId } = e.dataset
        logseq.Editor.insertBlock(logseqBlockUuid, `{{renderer :arena-block, https://www.are.na/block/${arenaBlockId}}}`, { before: false })
      }
    })
    
    function renderBlock(b, logseqUuid) {
      let { id, image, title } = b
      return image ? `
            <div class="arena-block" data-url="https://are.na/block/${id}" data-on-click="openLink">
              <div class="arena-block-content"><img src="${image.square.url}"></div>
              <div class="arena-block-title">${title}</div>
              ${ logseqUuid ? `<a data-arena-block-id="${id}" data-logseq-block-uuid="${logseqUuid}" data-on-click="addBlockReference" title="Add reference to block in Logseq"><i class="ti ti-layers-linked"></i></a>` : ''}
            </div>
          ` : `
            <div class="arena-block" data-url="https://are.na/block/${id}" data-on-click="openLink">
              <div class="arena-block-content">'${b.content}'</div>
              <div class="arena-block-title">${title}</div>
              ${ logseqUuid ? `<a data-arena-block-id="${id}" data-logseq-block-uuid="${logseqUuid}" data-on-click="addBlockReference" title="Add reference to block in Logseq"><i class="ti ti-layers-linked"></i></a>` : ''}
            </div>
          `
    }

    function renderErrorMessage(slot, errorMessage){
      logseq.provideUI({
        key: 'arena-error',
        reset: true,
        slot, template: `
        <div class="arena-plugin-wrapper">
          <h4 style="color:red">Error rendering are.na embed</h4>
          ${errorMessage ? `<p>${errorMessage}</p>` : ""}
        </div>
        `,
      })
    }

    function renderLoadingMessage(slot){
      logseq.provideUI({
        key: 'arena-loading',
        reset: true,
        slot, template: `
        <div class="arena-plugin-wrapper">
          <h4><i class="ti ti-loader"></i>Loading</h4>
        </div>
        `,
      })
    }
    
    function renderChannel(slot, payload) {
      let [type, channelUrl] = payload.arguments
      let slug;

      try {
        const regex = /https:\/\/w*\.?are\.na\/.+\/(.+)\/?/gm;
        slug = regex.exec(channelUrl.trim())[1]
      } catch (error) {
        return renderErrorMessage(slot, "Did you forget to add the channel url?")
      }
      
      const renderBlockPartial = block => renderBlock(block, payload.uuid)

      renderLoadingMessage(slot)

      arena.channel(slug).get().then(channel=>{
        let blocks = channel.contents.map(renderBlockPartial).join("")
        logseq.provideUI({
          key: `arena-channel`,
          reset: true,
          slot, template: `
          <div class="arena-plugin-wrapper">
            <h3 class="arena-chan-title ${channel.status}">${logo} ${channel.title}</h3>
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
        renderErrorMessage(slot, "Something went wrong getting the channel from Are.na")
      })
    }

    function renderSingleBlock(slot, payload){
      let [type, blockUrl] = payload.arguments
      let slug;

      try {
        const regex = /https:\/\/w*\.?are\.na\/block\/(.+)\/?/gm;
        slug = regex.exec(blockUrl.trim())[1]
      } catch (error) {
        return renderErrorMessage(slot, "Did you forget to add a url to a block?")
      }

      renderLoadingMessage(slot)

      arena.block(slug).get().then(block=>{
        logseq.provideUI({
          key: `arena-block`,
          reset: true,
          slot, template: `
          <div class="arena-plugin-wrapper">
            <h3 class="arena-chan-title">${logo} ${block.title}</h3>
            <p><a data-on-click="openLink" data-url="${blockUrl}">open in are.na</a></p>
            <div class="arena-block-grid">
              ${renderBlock(block, undefined)}
            </div>
          </div>
          `
          ,
        })
      }).catch((error) => {
        renderErrorMessage(slot, "Something went wrong getting the block from Are.na")
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
  
}

logseq.ready(main).catch(console.error)
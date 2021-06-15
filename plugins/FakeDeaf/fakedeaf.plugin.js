/**
 * @name FakeDeaf
 * @author Adam Thompson-Sharpe
 * @description Fake being deafened or muted on Discord while still being able to talk.
 * @version 0.1.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/FakeDeaf
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/FakeDeaf/fakedeaf.plugin.js
 */

module.exports = class FakeDeaf {
  // Changed in settings pannel
  // Whether to fake mute/deafen
  fakeMute = true
  fakeDeafen = true

  encoder = new TextEncoder('utf-8')
  decoder = new TextDecoder('utf-8')
  // The statuses of muted & deafened
  // Used in a .replace()
  MUTE_TRUE = 'self_mutes\u0004truem'
  MUTE_FALSE = 'self_mutes\u0005falsem'
  DEAF_TRUE = 'self_deafs\u0004truem'
  DEAF_FALSE = 'self_deafs\u0005falsem'

  settings = document.createElement('template')

  load() {
    if (!window.fakeDeafEnabled) window.fakeDeafEnabled = false
    this.settings.innerHTML = `<div><style>.checkbox-container{display:block;position:relative;padding-left:35px;margin-bottom:12px;cursor:pointer;font-size:22px;font-family:Arial,Helvetica,sans-serif;color:#fff;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.checkbox-container input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.checkmark{position:absolute;top:0;left:0;height:25px;width:25px;background-color:#eee}.checkbox-container:hover input~.checkmark{background-color:#ccc}.checkbox-container input:checked~.checkmark{background-color:#2196f3}.checkmark:after{content:'';position:absolute;display:none}.checkbox-container input:checked~.checkmark:after{display:block}.checkbox-container .checkmark:after{left:9px;top:5px;width:5px;height:10px;border:solid #fff;border-width:0 3px 3px 0;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}</style><label class=checkbox-container>Fake Mute <input checked id=fakeMute name=fakeMute type=checkbox> <span class=checkmark></span></label><label class=checkbox-container>Fake Deafen <input checked id=fakeDeafen name=fakeDeafen type=checkbox> <span class=checkmark></span></label></div>`

    let apply_handle = {
      apply: (target, thisArg, args) => {
        if (!window.fakeDeafEnabled) {
          target.apply(thisArg, args)
          return
        }

        let data = args[0]
        if (
          (this.fakeMute || this.fakeDeafen) &&
          data.toString() === '[object ArrayBuffer]'
        ) {
          // Decode data if it is an ArrayBuffer
          let dec = this.decoder.decode(data)
          if (dec.includes('self_deaf')) {
            console.log('Found self_deaf')

            // Update muted/deafened status
            if (this.fakeMute)
              dec = dec.replace(this.MUTE_FALSE, this.MUTE_TRUE)
            if (this.fakeDeafen)
              dec = dec.replace(this.DEAF_FALSE, this.DEAF_TRUE)

            // Re-encode
            const enc = this.encoder.encode(dec)
            // Encoder adds some unexpected integers, remove/replace them
            data = enc.buffer.slice(2)
            new Uint8Array(data)[0] = 131

            console.log('Updated self_mute and self_deaf')
          }
        }
        return target.apply(thisArg, [data])
      },
    }

    WebSocket.prototype.send = new Proxy(WebSocket.prototype.send, apply_handle)
  }

  start() {
    window.fakeDeafEnabled = true
    console.log('-----------------------')
    console.log('FakeDeaf is now enabled')
    console.log('-----------------------')
  }

  stop() {
    window.fakeDeafEnabled = false
  }

  getSettingsPanel() {
    let template = document.createElement('template')
    let div = document.createElement('div')
    div.innerHTML = `<style>.checkbox-container{display:block;position:relative;padding-left:35px;margin-bottom:12px;cursor:pointer;font-size:22px;font-family:Arial,Helvetica,sans-serif;color:#fff;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.checkbox-container input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.checkmark{position:absolute;top:0;left:0;height:25px;width:25px;background-color:#eee}.checkbox-container:hover input~.checkmark{background-color:#ccc}.checkbox-container input:checked~.checkmark{background-color:#2196f3}.checkmark:after{content:'';position:absolute;display:none}.checkbox-container input:checked~.checkmark:after{display:block}.checkbox-container .checkmark:after{left:9px;top:5px;width:5px;height:10px;border:solid #fff;border-width:0 3px 3px 0;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}</style>`

    let fakeMuteLabel = document.createElement('label')
    fakeMuteLabel.className = 'checkbox-container'
    fakeMuteLabel.innerText = 'Fake Mute'

    let fakeMute = document.createElement('input')
    fakeMute.type = 'checkbox'
    fakeMute.name = 'fakeMute'
    fakeMute.id = 'fakeMute'
    fakeMute.checked = this.fakeMute
    fakeMute.onchange = () => (this.fakeMute = fakeMute.checked)

    let checkmark = document.createElement('span')
    checkmark.className = 'checkmark'
    fakeMuteLabel.appendChild(fakeMute)
    fakeMuteLabel.appendChild(checkmark)

    div.appendChild(fakeMuteLabel)

    let fakeDeafenLabel = document.createElement('label')
    fakeDeafenLabel.className = 'checkbox-container'
    fakeDeafenLabel.innerText = 'Fake Deafen'

    let fakeDeafen = document.createElement('input')
    fakeDeafen.type = 'checkbox'
    fakeDeafen.name = 'fakeDeafen'
    fakeDeafen.id = 'fakeDeafen'
    fakeDeafen.checked = this.fakeDeafen
    fakeDeafen.onchange = () => (this.fakeDeafen = fakeDeafen.checked)

    checkmark = document.createElement('span')
    checkmark.className = 'checkmark'
    fakeDeafenLabel.appendChild(fakeDeafen)
    fakeDeafenLabel.appendChild(checkmark)

    div.appendChild(fakeDeafenLabel)
    template.content.appendChild(div)

    return template.content.firstChild
  }
}

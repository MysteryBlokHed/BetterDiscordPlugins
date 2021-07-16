/**
 * @name FakeDeaf
 * @author Adam Thompson-Sharpe
 * @description Fake being deafened or muted on Discord while still being able to talk.
 * @version 0.2.1
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/FakeDeaf
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/FakeDeaf/fakedeaf.plugin.js
 */

module.exports = class FakeDeaf {
  // Changed in settings panel
  fakeMute = true
  fakeDeafen = true
  newJoinMute = false
  fakeMuteToggleKey = 'F9'
  fakeDeafenToggleKey = 'F10'
  newJoinMuteToggleKey = 'F11'

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
    if (!this.fakeDeafEnabled) this.fakeDeafEnabled = false
    this.settings.innerHTML = `<div><style>.checkbox-container{display:block;position:relative;padding-left:35px;margin-bottom:12px;cursor:pointer;font-size:22px;font-family:Arial,Helvetica,sans-serif;color:#fff;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.checkbox-container input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.checkmark{position:absolute;top:0;left:0;height:25px;width:25px;background-color:#eee}.checkbox-container:hover input~.checkmark{background-color:#ccc}.checkbox-container input:checked~.checkmark{background-color:#2196f3}.checkmark:after{content:'';position:absolute;display:none}.checkbox-container input:checked~.checkmark:after{display:block}.checkbox-container .checkmark:after{left:9px;top:5px;width:5px;height:10px;border:solid #fff;border-width:0 3px 3px 0;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}</style><label class=checkbox-container>Fake Mute <input checked id=fakeMute name=fakeMute type=checkbox> <span class=checkmark></span></label><label class=checkbox-container>Fake Deafen <input checked id=fakeDeafen name=fakeDeafen type=checkbox> <span class=checkmark></span></label></div>`

    document.addEventListener('keyup', (e) => {
      if (this.fakeDeafEnabled)
        switch (e.key) {
          case 'F9':
            this.fakeMute = !this.fakeMute
            BdApi.alert(
              'FakeDeaf',
              `Fake Mute is now ${this.fakeMute ? 'enabled' : 'disabled'}.`
            )
            break
          case 'F10':
            this.fakeDeafen = !this.fakeDeafen
            BdApi.alert(
              'FakeDeaf',
              `Fake Deaf is now ${this.fakeDeafen ? 'enabled' : 'disabled'}.`
            )
            break
          case 'F11':
            this.newJoinMute = !this.newJoinMute
            BdApi.alert(
              'FakeDeaf',
              `New Join Mute is now ${
                this.newJoinMute ? 'enabled' : 'disabled'
              }.`
            )
            this.updateNewJoinMuteMessage()
            break
        }
    })

    let apply_handle = {
      apply: (target, thisArg, args) => {
        if (!this.fakeDeafEnabled) {
          return target.apply(thisArg, args)
        }

        let data = args[0]
        // ----- Mute/Deafen -----
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
        // ----- New Join Mute -----
        if (this.newJoinMute) {
          try {
            let json = JSON.parse(data)
            if ('d' in json && 'speaking' in json['d']) {
              json['d']['speaking'] = 0
              data = JSON.stringify(json)
            }
          } catch {}
        }
        return target.apply(thisArg, [data])
      },
    }

    WebSocket.prototype.send = new Proxy(WebSocket.prototype.send, apply_handle)
  }

  start() {
    this.fakeDeafEnabled = true
    console.log('-----------------------')
    console.log('FakeDeaf is now enabled')
    console.log('-----------------------')
  }

  stop() {
    this.fakeDeafEnabled = false
  }

  updateNewJoinMuteMessage() {
    if (this.newJoinMute) {
      let section = document.querySelector('section')

      let message = document.createElement('div')
      message.className = 'new-join-mute-message'
      message.innerText = 'New Join Mute Enabled'
      message.style.backgroundColor = 'var(--text-positive)'
      message.style.padding = '5px'
      message.style.color = 'white'
      message.style.textAlign = 'center'

      section.prepend(message)
    } else {
      let message = document.querySelector('div.new-join-mute-message')
      if (message) message.outerHTML = ''
    }
  }

  getSettingsPanel() {
    let template = document.createElement('template')
    let div = document.createElement('div')
    div.innerHTML = `<style>.checkbox-container{display:block;position:relative;padding-left:35px;margin-bottom:12px;cursor:pointer;font-size:22px;font-family:Arial,Helvetica,sans-serif;color:#fff;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.checkbox-container input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.checkmark{position:absolute;top:0;left:0;height:25px;width:25px;background-color:#eee}.checkbox-container:hover input~.checkmark{background-color:#ccc}.checkbox-container input:checked~.checkmark{background-color:#2196f3}.checkmark:after{content:'';position:absolute;display:none}.checkbox-container input:checked~.checkmark:after{display:block}.checkbox-container .checkmark:after{left:9px;top:5px;width:5px;height:10px;border:solid #fff;border-width:0 3px 3px 0;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}</style>`

    // --- Fake Mute Options ---
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

    // --- Fake Deafen Options ---
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

    // --- Speaking Indicator Options ---
    let newJoinMuteLabel = document.createElement('label')
    newJoinMuteLabel.className = 'checkbox-container'
    newJoinMuteLabel.innerText = 'Mute Yourself For New VC Joiners'

    let newJoinMute = document.createElement('input')
    newJoinMute.type = 'checkbox'
    newJoinMute.name = 'newJoinMute'
    newJoinMute.id = 'newJoinMute'
    newJoinMute.checked = this.newJoinMute
    newJoinMute.onchange = () => {
      this.newJoinMute = newJoinMute.checked
      this.fakeDeafEnabled = false
      this.fakeDeafEnabled = true
      this.updateNewJoinMuteMessage()
    }

    checkmark = document.createElement('span')
    checkmark.className = 'checkmark'
    newJoinMuteLabel.appendChild(newJoinMute)
    newJoinMuteLabel.appendChild(checkmark)

    div.appendChild(newJoinMuteLabel)

    template.content.appendChild(div)

    return template.content.firstChild
  }
}

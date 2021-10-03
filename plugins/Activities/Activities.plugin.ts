/**
 * @name Activities
 * @author Adam Thompson-Sharpe
 * @description Start Discord Activities with friends.
 * @version 0.1.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/Activities
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/Activities/Activities.plugin.js
 */

/** Avoids type errors for BdApi.alert method */
declare var BdApi: {
  alert(title: string, body: string): void
}

module.exports = class Activities {
  activities: { [activity: string]: string } = {
    youtube: '880218394199220334',
    youtubedev: '880218832743055411',
    poker: '755827207812677713',
    betrayal: '773336526917861400',
    fishing: '814288819477020702',
    chess: '832012774040141894',
    chessdev: '832012586023256104',
    lettertile: '879863686565621790',
    wordsnack: '879863976006127627',
    doodlecrew: '878067389634314250',
  }

  load() {
    const MsgHook = (window as MsgHookWindow).MsgHook
    MsgHook.addHook((e) => {
      const msg = e.hasCommand('.activity')
      if (msg) {
        if (!this.activities.hasOwnProperty(msg))
          return BdApi.alert('Activities', `Unknown activity ${msg}`)

        // Try to find connected voice channel
        let channelID
        const channels = document.querySelector(
          '#channels > div'
        ) as HTMLDivElement

        for (let i = 0; i < channels.children.length; i++) {
          const el = channels.children[i]

          // The VC element is 2 children down, so make sure everything exists
          if (
            !el.children ||
            !el.children[0] ||
            !el.children[0].children ||
            !el.children[0].children[0]
          )
            continue

          const channel = el.children[0].children[0]

          for (let j = 0; j < channel.classList.length; j++) {
            // Get list of classes
            const className = channel.classList[j]
            // Current VC will have modeConnected class
            if (className.includes('modeConnected')) {
              const thingWithId = channel.children[0].children[0]
              channelID = thingWithId
                .getAttribute('data-list-item-id')
                ?.split('___')[1]
              break
            }
          }
        }

        // Make sure channel ID was found
        if (!channelID)
          return BdApi.alert('Activities', 'Please join a Voice Channel')

        // Get activity URL
        fetch(`https://discord.com/api/v8/channels/${channelID}/invites`, {
          method: 'POST',
          body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: this.activities[msg],
            target_type: 2,
            temporary: false,
            validate: null,
          }),
          headers: {
            Authorization: e.headers.Authorization,
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          // MsgHook doesn't currently support async, so we can't await the fetch
          // This means that we'll just need to send a second message with the link
          .then((invite) => {
            fetch(e.url, {
              method: 'POST',
              body: JSON.stringify({
                content: `https://discord.gg/${invite.code}`,
                nonce: `${Math.random() * 10 ** 18}`,
                tts: false,
              }),
              headers: e.headers,
            })
          })
      }
    })
  }

  start() {}

  stop() {}
}

/// <reference path="../MsgHook/0MsgHook.plugin.ts" />

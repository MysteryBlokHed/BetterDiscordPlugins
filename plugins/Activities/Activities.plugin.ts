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
        const connectedEl = document.querySelector(
          'div[class*=connection] > div > div > a'
        ) as HTMLAnchorElement | null

        // Last part of connectedEl's href will be the voice channel ID
        const split = connectedEl ? connectedEl.href.split('/') : undefined
        const channelID =
          connectedEl && split ? split[split.length - 1] : undefined
        // Make sure channel ID was found
        if (!channelID)
          return BdApi.alert('Activities', 'Please join a voice channel')

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
            // Delete original message
            ;(e.id as Promise<string>).then((id) =>
              fetch(`${e.url}/${id}`, {
                method: 'DELETE',
                headers: e.headers,
              })
            )

            // Send new message with ID
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

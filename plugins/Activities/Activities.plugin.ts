import type { BdPlugin } from '@bandagedbd/bdapi'

/**
 * @name Activities
 * @author Adam Thompson-Sharpe
 * @description Start Discord Activities with friends.
 * @version 0.1.1
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/main/plugins/Activities
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/main/plugins/Activities/Activities.plugin.js
 */
module.exports = class Activities implements BdPlugin {
  activities: Record<string, string> = {
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

  hookID = -1

  checkVersion(current: string, minimum: string): boolean {
    const currentMinor = parseInt(current.split('.')[1])
    const minimumMinor = parseInt(minimum.split('.')[1])
    return currentMinor >= minimumMinor
  }

  start() {
    const MsgHook = window.MsgHook

    if (!MsgHook)
      return BdApi.alert(
        'Activities',
        `Activities requires the MsgHook plugin to work. Download it here:
        https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/main/plugins/MsgHook`
      )

    // Check MsgHook version
    if (!MsgHook.version || !this.checkVersion(MsgHook.version, '0.4.0'))
      return BdApi.alert(
        'Activities',
        'Incompatible MsgHook version found! Minimum is v0.4.0'
      )

    if (!MsgHook.enabled)
      // Don't return here because we can still add the MsgHook hooks with it disabled
      BdApi.alert(
        'Activities',
        'MsgHook is not currently enabled. Please enable it to use this plugin'
      )

    this.hookID = MsgHook.addHook(async e => {
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
        const invite = await fetch(
          `https://discord.com/api/v9/channels/${channelID}/invites`,
          {
            method: 'POST',
            body: JSON.stringify({
              max_age: 86400,
              max_uses: 0,
              target_application_id: this.activities[msg],
              target_type: 2,
              temporary: false,
              validate: null,
            }),
            headers: e.headers,
          }
        ).then(res => res.json())

        return `https://discord.gg/${invite.code}`
      }
    })
  }

  stop() {
    window.MsgHook.removeHook(this.hookID)
  }
}

/// <reference path="../MsgHook/0MsgHook.plugin.ts" />

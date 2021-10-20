/**
 * @name Spammer
 * @author Adam Thompson-Sharpe
 * @description Spam messages in a Discord channel.
 * @version 0.2.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/Spammer
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/Spammer/Spammer.plugin.js
 */
module.exports = class Spammer {
  constructor() {
    this.spamIntervals = []
    this.hooks = []
  }
  checkVersion(current, minimum) {
    const currentMinor = parseInt(current.split('.')[1])
    const minimumMinor = parseInt(minimum.split('.')[1])
    return currentMinor >= minimumMinor
  }
  start() {
    if (!window.MsgHook || !this.checkVersion(window.MsgHook.version, '0.4.0'))
      return
    const spamCommand =
      /^\.spam(?:\s*\(\s*(?:"(.*)")\s*(?:,\s*(\d+)\s*)?,?\s*\))|(\s+.*)$/i
    const stopCommand = /^\.spam[-_]?stop(?:\(\s*\))?$/i
    // Hook to add spammer
    this.hooks.push(
      window.MsgHook.addHook(e => {
        const match = spamCommand.exec(e.msg)
        if (match) {
          const message = match[1] ?? match[3]
          const interval = parseInt(match[2] ?? 1500)
          this.spamIntervals.push(
            window.setInterval(() => {
              fetch(e.url, {
                method: 'POST',
                headers: e.headers,
                body: JSON.stringify({
                  content: message,
                  nonce: Date.now() * 4194304,
                  tts: false,
                }),
              })
            }, interval)
          )
          return message
        } else return
      })
    )
    // Hook to stop spammers
    this.hooks.push(
      window.MsgHook.addHook(e => {
        const match = stopCommand.exec(e.msg)
        if (match) {
          for (const interval of this.spamIntervals) clearInterval(interval)
          this.spamIntervals = []
          return ''
        } else return
      })
    )
  }
  stop() {
    if (!window.MsgHook || !this.checkVersion(window.MsgHook.version, '0.4.0'))
      return
    for (const interval of this.spamIntervals) clearInterval(interval)
    for (const hook of this.hooks) window.MsgHook.removeHook(hook)
  }
}
/// <reference types="../MsgHook/0MsgHook.plugin.ts" />

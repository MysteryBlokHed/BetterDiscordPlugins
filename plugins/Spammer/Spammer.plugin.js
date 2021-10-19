/**
 * @name Spammer
 * @author Adam Thompson-Sharpe
 * @description Spam messages in a Discord channel.
 * @version 0.1.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/Spammer
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/Spammer/Spammer.plugin.js
 */
module.exports = class Spammer {
  spamIntervals = []
  hookID = 0
  checkVersion(current, minimum) {
    const currentMinor = parseInt(current.split('.')[1])
    const minimumMinor = parseInt(minimum.split('.')[1])
    return currentMinor >= minimumMinor
  }
  start() {
    if (!window.MsgHook || !this.checkVersion(window.MsgHook.version, '0.4.0'))
      return
    const command = /\.spam\s*\(\s*(?:"(.*)")\s*(?:,\s*(\d+)\s*)?,?\s*\)/i
    this.hookID = window.MsgHook.addHook(e => {
      const match = command.exec(e.msg)
      if (match) {
        const message = match[1]
        const interval = parseInt(match[2] ?? 1500)
        this.spamIntervals.push(
          setInterval(() => {
            fetch(e.url, {
              method: 'POST',
              headers: e.headers,
              body: JSON.stringify({
                content: message,
                nonce: (Math.random() * 10 ** 18).toString(),
                tts: false,
              }),
            })
          }, interval)
        )
        return message
      } else return
    })
  }
  stop() {
    if (!window.MsgHook || !this.checkVersion(window.MsgHook.version, '0.4.0'))
      return
    for (const interval of this.spamIntervals) clearInterval(interval)
    window.MsgHook.removeHook(this.hookID)
  }
}
/// <reference types="../MsgHook/0MsgHook.plugin.ts" />

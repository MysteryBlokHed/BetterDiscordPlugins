/**
 * @name Spammer
 * @author Adam Thompson-Sharpe
 * @description Spam messages in a Discord channel.
 * @version 0.2.2
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/main/plugins/Spammer
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/main/plugins/Spammer/Spammer.plugin.js
 */
module.exports = class Spammer {
  constructor() {
    this.active = false
    this.spamTimeouts = []
    this.hooks = []
  }
  checkVersion(current, minimum) {
    const currentMinor = parseInt(current.split('.')[1])
    const minimumMinor = parseInt(minimum.split('.')[1])
    return currentMinor >= minimumMinor
  }
  start() {
    this.active = true
    if (!window.MsgHook || !this.checkVersion(window.MsgHook.version, '0.4.0'))
      return
    const spamCommand =
      /^\.spam(?:(?:\s*\(\s*(?:"(.*)")\s*(?:,\s*(\d+)\s*)?,?\s*\))|(\s+.*))$/i
    const stopCommand = /^\.spam[-_]?stop(?:\(\s*\))?$/i
    // Hook to add spammer
    this.hooks.push(
      window.MsgHook.addHook(e => {
        var _a, _b
        const match = spamCommand.exec(e.msg)
        if (match) {
          const message =
            (_a = match[1]) !== null && _a !== void 0 ? _a : match[3]
          const interval = parseInt(
            (_b = match[2]) !== null && _b !== void 0 ? _b : 1500
          )
          /** Used to keep track of interval handles */
          const id = this.spamTimeouts.length
          this.spamTimeouts.push(0)
          /** Run every interval */
          const timeoutHandler = async () => {
            if (!this.active) return
            const res = await fetch(e.url, {
              method: 'POST',
              headers: e.headers,
              body: JSON.stringify({
                content: message,
                nonce: Date.now() * 4194304,
                tts: false,
              }),
            })
            // Wait before retrying send in case of ratelimit
            if (res.status === 429) {
              res
                .json()
                .then(
                  resJson =>
                    (this.spamTimeouts[id] = window.setTimeout(
                      timeoutHandler,
                      resJson.retry_after * 1000
                    ))
                )
                .catch(() =>
                  console.log('[Spammer] Failed to parse JSON response for 429')
                )
            } else {
              this.spamTimeouts[id] = window.setTimeout(
                timeoutHandler,
                interval
              )
            }
          }
          window.setTimeout(timeoutHandler, interval)
          return message
        } else return
      })
    )
    // Hook to stop spammers
    this.hooks.push(
      window.MsgHook.addHook(e => {
        const match = stopCommand.exec(e.msg)
        if (match) {
          this.stopSpammers()
          return ''
        } else return
      })
    )
  }
  stop() {
    this.active = false
    if (!window.MsgHook || !this.checkVersion(window.MsgHook.version, '0.4.0'))
      return
    this.stopSpammers()
    for (const hook of this.hooks) window.MsgHook.removeHook(hook)
  }
  stopSpammers() {
    for (const timeout of this.spamTimeouts) clearTimeout(timeout)
    this.spamTimeouts = []
  }
}
/// <reference types="../MsgHook/0MsgHook.plugin.ts" />

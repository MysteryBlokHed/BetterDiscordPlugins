/**
 * @name MsgHook
 * @author Adam Thompson-Sharpe
 * @description Add hooks to Discord messages while they're sent.
 * @version 0.1.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/MsgHook
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/MsgHook/msghook.plugin.js
 */
/** This doesn't actually work yet. Type will always be Send */
var MsgEventType
;(function (MsgEventType) {
  MsgEventType[(MsgEventType['Send'] = 0)] = 'Send'
  MsgEventType[(MsgEventType['Edit'] = 1)] = 'Edit'
})(MsgEventType || (MsgEventType = {}))
module.exports = class MsgHook {
  constructor() {
    /** List of hooks to run */
    this.hooks = []
  }
  load() {
    // Add MsgHook object to window
    window.MsgHook = {
      enabled: true,
      addHook: (hook) => this.hooks.push(hook),
      hasCommand(e, command) {
        if (e.msg.startsWith(command + ' ')) {
          return e.msg.replace(new RegExp(`^${command} `), '')
        } else return // This is needed to make TypeScript stop complaining about code paths for some reason
      },
    }
    const handler = {
      apply: (target, thisArg, args) => {
        try {
          let json = JSON.parse(args[0])
          // Run each hook
          for (const hook of this.hooks) {
            const newMsg = hook({
              type: MsgEventType.Send,
              msg: json.content,
            })
            json.content = newMsg ? newMsg : json.content
          }
          args[0] = JSON.stringify(json)
        } catch (_a) {}
        target.apply(thisArg, args)
      },
    }
    XMLHttpRequest.prototype.send = new Proxy(
      XMLHttpRequest.prototype.send,
      handler
    )
  }
  start() {
    window.MsgHook.enabled = true
  }
  stop() {
    window.MsgHook.enabled = false
  }
}

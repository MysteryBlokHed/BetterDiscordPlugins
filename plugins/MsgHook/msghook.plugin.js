/**
 * @name MsgHook
 * @author Adam Thompson-Sharpe
 * @description Run code when messages are sent or edited.
 * @version 0.2.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/MsgHook
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/MsgHook/msghook.plugin.js
 */
module.exports = class MsgHook {
  constructor() {
    /** List of hooks to run */
    this.hooks = []
  }
  load() {
    // Add MsgHook object to window
    window.MsgHook = {
      enabled: false,
      addHook: (hook) => this.hooks.push(hook),
    }
    const handler = {
      apply: (target, thisArg, args) => {
        if (window.MsgHook.enabled) {
          try {
            let json = JSON.parse(args[0])
            const method =
              thisArg.__sentry_xhr__ &&
              thisArg.__sentry_xhr__.method === 'PATCH'
                ? MessageType.Edit
                : MessageType.Send
            // Run each hook
            for (const hook of this.hooks) {
              const newMessage = hook({
                type: method,
                msg: json.content,
                hasCommand(command) {
                  if (this.msg.startsWith(command + ' ')) {
                    return this.msg.replace(new RegExp(`^${command} `), '')
                  } else return // This is needed to make TypeScript stop complaining about code paths for some reason
                },
              })
              json.content = newMessage ? newMessage : json.content
            }
            args[0] = JSON.stringify(json)
          } catch (_a) {}
        }
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
var MessageType
;(function (MessageType) {
  MessageType[(MessageType['Send'] = 0)] = 'Send'
  MessageType[(MessageType['Edit'] = 1)] = 'Edit'
})(MessageType || (MessageType = {}))

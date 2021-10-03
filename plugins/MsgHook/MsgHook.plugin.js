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
            // This really ugly ternary just means use MessageType.Send on POST,
            // MessageType.Edit on PATCH, and MessageType.Other for whatever else
            const method =
              thisArg.__sentry_xhr__ &&
              (thisArg.__sentry_xhr__.method === 'POST'
                ? MessageType.Send
                : thisArg.__sentry_xhr__.method === 'PATCH'
                ? MessageType.Edit
                : MessageType.Other)
            let id
            // Create a promise to get the message id
            // This is required because the actual message id is unknown for a new message until a response is received
            if (method === MessageType.Send) {
              id = new Promise((resolve, reject) => {
                // Originally defined listener for XMLHttpRequest
                const originalListener = thisArg.onreadystatechange
                thisArg.onreadystatechange = () => {
                  if (thisArg.readyState === XMLHttpRequest.DONE) {
                    try {
                      resolve(JSON.parse(thisArg.responseText).id)
                    } catch (_a) {
                      /*
                       * Commented out right now since there are more POSTs and PATCHes than just for message-sending,
                       * meaning that there would be a lot of incorrect rejections due to some responses not having id property
                       */
                      // reject('Failed to get message id from response')
                    }
                  }
                  // Call originally defined listener to avoid breaking things
                  originalListener()
                }
              })
            } else if (method === MessageType.Edit) {
              const split = thisArg.__sentry_xhr__.url.split('/')
              id = split[split.length - 1]
            } else {
              throw Error // Just used to exit the try/catch, running target.apply
            }
            // Run each hook
            for (const hook of this.hooks) {
              const newMessage = hook({
                type: method,
                msg: json.content,
                id: id,
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
  /**
   * This won't be passed to a HookFunction and generally means
   * that the HTTP request was not related to a message.
   */
  MessageType[(MessageType['Other'] = 2)] = 'Other'
})(MessageType || (MessageType = {}))

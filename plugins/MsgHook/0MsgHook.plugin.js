/**
 * @name MsgHook
 * @author Adam Thompson-Sharpe
 * @description Run code when messages are sent or edited.
 * @version 0.4.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/MsgHook
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/MsgHook/MsgHook.plugin.js
 */
module.exports = class MsgHook {
  /** List of hooks to run */
  hooks = {}
  /** Returns whether or not a request should be noticed by MsgHook */
  isMessageRequest(method, url) {
    /** Request URL to send a message. Last updated for v9 API */
    const sendMessage =
      /^https:\/\/discord.com\/api\/v\d+\/channels\/\d{18}\/messages$/
    /** Request URL to edit a message. Last update for v9 API */
    const editMessage =
      /^https:\/\/discord.com\/api\/v\d+\/channels\/\d{18}\/messages\/\d{18}$/
    if (!['POST', 'PATCH'].includes(method)) return false
    if (url.match(sendMessage) || url.match(editMessage)) return true
    return false
  }
  load() {
    // Add MsgHook object to window
    window.MsgHook = {
      enabled: false,
      version: '0.4.0',
      addHook: (hook) => {
        let id = 0
        // Generate random ID's until we get one that isn't taken
        do id = Math.floor(Math.random() * 10 ** 6)
        while (this.hooks.hasOwnProperty(id))
        this.hooks[id] = hook
        return id
      },
      removeHook: (id) => {
        if (id in this.hooks) {
          delete this.hooks[id]
          return true
        } else {
          return false
        }
      },
    }
    /**
     * Handle `XMLHttpRequest.prototype.setRequestHeader`
     * This Proxy's job is just to add the set headers to an object so that they may be accessed later.
     * This helps if you're trying to do something that needs an authorization token,
     * which is set in the request headers.
     */
    const setHeaderHandler = {
      apply: (target, thisArg, args) => {
        try {
          // Check if request is message-related
          if (
            thisArg.__sentry_xhr__ &&
            this.isMessageRequest(
              thisArg.__sentry_xhr__.method,
              thisArg.__sentry_xhr__.url
            )
          ) {
            // Create a new object called requestHeaders and add each header to it
            // The headers are later added to the MsgHookEvent headers property
            if (!thisArg.requestHeaders) thisArg.requestHeaders = {}
            thisArg.requestHeaders[args[0]] = args[1]
          }
        } catch {}
        target.apply(thisArg, args)
      },
    }
    XMLHttpRequest.prototype.setRequestHeader = new Proxy(
      XMLHttpRequest.prototype.setRequestHeader,
      setHeaderHandler
    )
    /** Handle `XMLHttpRequest.prototype.send` */
    const sendHandler = {
      apply: async (target, thisArg, args) => {
        if (window.MsgHook.enabled) {
          try {
            // Check if the request is message-related and exit if it isn't
            if (
              !thisArg.__sentry_xhr__ ||
              !this.isMessageRequest(
                thisArg.__sentry_xhr__.method,
                thisArg.__sentry_xhr__.url
              )
            )
              throw Error
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
                    } catch {
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
            for (const hook of Object.values(this.hooks)) {
              const msgHookEvent = {
                type: method,
                msg: json.content,
                id: id,
                url: thisArg.__sentry_xhr__.url,
                headers: thisArg.requestHeaders,
                hasCommand(command) {
                  if (this.msg.startsWith(command + ' ')) {
                    return this.msg.replace(new RegExp(`^${command} `), '')
                  } else return // This is needed to make TypeScript stop complaining about code paths for some reason
                },
              }
              const newMessage = hook(msgHookEvent)
              // If the type of the new message is an object, assuming types are honoured, it must be a Promise
              // (async function)
              if (typeof newMessage === 'object') {
                const newRes = await newMessage
                json.content = newRes ? newRes : json.content
              } else {
                json.content = newMessage ? newMessage : json.content
              }
            }
            args[0] = JSON.stringify(json)
          } catch {}
        }
        target.apply(thisArg, args)
      },
    }
    XMLHttpRequest.prototype.send = new Proxy(
      XMLHttpRequest.prototype.send,
      sendHandler
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

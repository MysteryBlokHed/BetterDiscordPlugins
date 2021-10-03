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
  /** List of hooks to run */
  hooks: HookFunction[] = []

  load() {
    // Add MsgHook object to window
    ;(window as MsgHookWindow).MsgHook = {
      enabled: false,
      addHook: (hook) => this.hooks.push(hook),
    }

    const handler: ProxyHandler<
      (body?: Document | XMLHttpRequestBodyInit | null | undefined) => void
    > = {
      apply: (
        target,
        thisArg,
        args: [body?: Document | XMLHttpRequestBodyInit | null | undefined]
      ) => {
        if ((window as MsgHookWindow).MsgHook.enabled) {
          try {
            let json = JSON.parse(args[0] as string) as MessageJson

            // This really ugly ternary just means use MessageType.Send on POST,
            // MessageType.Edit on PATCH, and MessageType.Other for whatever else
            const method: MessageType =
              thisArg.__sentry_xhr__ &&
              (thisArg.__sentry_xhr__.method === 'POST'
                ? MessageType.Send
                : thisArg.__sentry_xhr__.method === 'PATCH'
                ? MessageType.Edit
                : MessageType.Other)

            let id: MsgHookEvent['id']

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
          } catch {}
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
    ;(window as MsgHookWindow).MsgHook.enabled = true
  }

  stop() {
    ;(window as MsgHookWindow).MsgHook.enabled = false
  }
}

interface MsgHookEvent {
  /** The contents of the message */
  msg: string
  /** Whether the message was newly sent or edited */
  type: MessageType
  /**
   * The id of the message. Can be useful to detect when a message
   * that already had a hook run was edited.
   */
  id: string | Promise<string>
  /**
   * Check if a string begins with the given text.
   * If it does, then return the string without that text.
   * Otherwise, return nothing.
   */
  hasCommand(command: string): string | void
}

enum MessageType {
  Send,
  Edit,
  /**
   * This won't be passed to a HookFunction and generally means
   * that the HTTP request was not related to a message.
   */
  Other,
}

interface MessageJson {
  content: string
  id?: string
  tts?: boolean
}

type HookFunction = (e: MsgHookEvent) => string | void

type MsgHookWindow = Window &
  typeof globalThis & {
    MsgHook: {
      /** Whether the MsgHook plugin is currently enabled */
      enabled: boolean
      /** Add a hook to MsgHook */
      addHook(hook: HookFunction): void
    }
  }

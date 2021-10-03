/**
 * @name MsgHook
 * @author Adam Thompson-Sharpe
 * @description Run code when messages are sent or edited.
 * @version 0.1.0
 * @authorId 309628148201553920
 * @source https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/MsgHook
 * @updateUrl https://raw.githubusercontent.com/MysteryBlokHed/BetterDiscordPlugins/master/plugins/MsgHook/msghook.plugin.js
 */

interface MsgEvent {
  msg: string
  /**
   * Check if a string begins with the given text.
   * If it does, then return the string without that text.
   * Otherwise, return nothing.
   */
  hasCommand(e: MsgEvent, command: string): string | void
}

interface MessageJson {
  content: string
  nonce: number
  tts: boolean
}

type HookFunction = (e: MsgEvent) => string | void

type MsgHookWindow = Window &
  typeof globalThis & {
    MsgHook: {
      /** Whether the MsgHook plugin is currently enabled */
      enabled: boolean
      /** Add a hook to MsgHook */
      addHook(hook: HookFunction): void
    }
  }

module.exports = class MsgHook {
  /** List of hooks to run */
  hooks: HookFunction[] = []

  load() {
    // Add MsgHook object to window
    ;(window as MsgHookWindow).MsgHook = {
      enabled: true,
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
        try {
          let json = JSON.parse(args[0] as string) as MessageJson

          // Run each hook
          for (const hook of this.hooks) {
            const newMsg = hook({
              msg: json.content,
              hasCommand(command) {
                if (this.msg.startsWith(command + ' ')) {
                  return this.msg.replace(new RegExp(`^${command} `), '')
                } else return // This is needed to make TypeScript stop complaining about code paths for some reason
              },
            })
            json.content = newMsg ? newMsg : json.content
          }

          args[0] = JSON.stringify(json)
        } catch {}

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

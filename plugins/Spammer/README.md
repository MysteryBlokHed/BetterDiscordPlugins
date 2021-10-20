# Spammer

Spam messages to any Discord channel.
Requires the [MsgHook Plugin](https://github.com/MysteryBlokHed/BetterDiscordPlugins/blob/master/plugins/MsgHook).

## Use

### Starting Spam

Send a message with either of the following formats to a Discord channel:

```text
.spam Message to spam
```

or

```text
.spam("Message to spam", 123)
```

Where `123` is the interval to wait in seconds.

### Stopping Spam

To stop spam, send `.spamstop` or `.spamstop()`. This will stop all running spammers.
Spammers can also be stopped by disabling the plugin.

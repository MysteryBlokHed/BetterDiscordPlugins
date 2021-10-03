# MsgHook

Perform actions when a user sends Discord messages.

## Use

The plugin creates a window variable called `msghook`.
You can add your own hooks with `window.msghook.addHook`:

```javascript
window.msghook.addHook((e) => {
  // your code here
})
```

Return a string if the message was modified, and return nothing if it was not.

## Examples

### Say Hi

Here's an example hook that replaces the message content
when the message starts with `.sayhi`:

```javascript
window.MsgHook.addHook((e) => {
  // Check if message starts with '.sayhi'. If it does, get the message without it
  const msg = window.MsgHook.hasCommand(e, '.sayhi')
  if (msg) return `Hello, ${msg}!`
})
```

Now, sending the message `.sayhi World` would change the message to `Hello, World!`

### Block Letters

Here's a hook that converts letters to the `regional_indicator` versions
and digits to their emoji versions:

```javascript
window.MsgHook.addHook((e) => {
  const msg = window.MsgHook.hasCommand(e, '.block')
  if (msg) {
    let newMsg = ''

    for (let char of msg) {
      if (char.match(/[A-Za-z]/)) {
        newMsg += `:regional_indicator_${char.toLowerCase()}: `
      } else if (char.match(/[0-9]/)) {
        switch (char) {
          case '0':
            newMsg += ':zero:'
            break
          case '1':
            newMsg += ':one:'
            break
          case '2':
            newMsg += ':two:'
            break
          case '3':
            newMsg += ':three:'
            break
          case '4':
            newMsg += ':four:'
            break
          case '5':
            newMsg += ':five:'
            break
          case '6':
            newMsg += ':six:'
            break
          case '7':
            newMsg += ':seven:'
            break
          case '8':
            newMsg += ':eight:'
            break
          case '9':
            newMsg += ':nine:'
            break
        }
      } else if (char == ' ') newMsg += '   '
      else newMsg += char
    }
    return newMsg
  }
})
```

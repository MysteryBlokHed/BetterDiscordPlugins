# FakeDeaf

Fake being deafened or muted on Discord while still being able to talk.

Modified from the [Gist](https://gist.github.com/MysteryBlokHed/4cc0ad750e5e6d9b19855da5d056e639).

## Features

- Talk while appearing muted
- Talk/hear while appearing deafened
- Mute yourself only for people who newly join a VC

## Use

To enable/disable features, open the plugin's settings page. To appear muted/deafened,
toggle deafen twice from the bottom of your client. The symbols for being
muted/deafened will appear next to your name under the voice channel, but not
at the bottom of your screen. If you want to actually mute/deafen, then
make sure the buttons at the bottom say you're muted/deafened.\
To mute yourself for people who newly join a VC, just toggle the setting in
the settings page. The feature will automatically be activated.\
**Note: If you join a new VC with the new join mute enabled, nobody will be able to
hear you. Toggle the option off and back on from the settings while in the VC to re-activate it.**

## Problems

Sometimes you aren't able to hear users talk while you're fake deafened if everybody
but the speaker is actually deafened. This has happened before, but I haven't
been able to reproduce it.\
For example, if you and one other person are the only ones in a voice channel,
you will not be able to hear the other persons speak until a third undeafened
person joins. This is likely because discord does not transmit voice unless it
believes that someone is there to hear it.

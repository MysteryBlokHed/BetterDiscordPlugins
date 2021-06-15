# FakeDeaf

Fake being deafened or muted on Discord while still being able to talk.

Modified from the [Gist](https://gist.github.com/MysteryBlokHed/4cc0ad750e5e6d9b19855da5d056e639).

## Features

- Talk while appearing muted
- Talk/hear while appearing deafened
- Mute yourself only for people who newly join a VC

## Problems

In my testing, you aren't able to hear other users while fake deafened unless
there is someone else undeafened in the voice channel other than that user.
For example, if you and one other person are the only ones in a voice channel,
you will not be able to hear the other persons speak until a third undeafened
person joins. This is likely because discord does not transmit voice unless it
believes that someone is there to hear it.

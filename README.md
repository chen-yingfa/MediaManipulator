# Media Manipulator

There are many browser extensions and tampermonkey scripts that control HTML5 videos, but I have found none that is satisfactory. Specifically, I want one extension with the following features.

1. Ability to change playback speed and advance/rewind in time of HTML5 videos.
2. Ability to adjust the advance/rewind timestep (to eg. 0.03s)
3. Support hotkeys with Ctrl, Shift and Alt.
4. Modern look and dark theme.

So I made this extension.

## Hotkeys

Plan on adding customizable hotkeys in the future, for the moment, it's hard-coded:

- `A`: playback speed -0.1
- `S`: playback speed +0.1
- `C`: playback speed = 1
- `Z`: rewind time 2s
- `X`: advance time 2s
- `,`: rewind time 0.03s
- `.`: advance time 0.03s
- `;`: rewind time 10s
- `'`: advance time 10s
- `V`: toggle visibility of playback speed tooltip

## Developers' Note

Actually, there was one extension that allowed customizable hotkey and timestep [Video Speed Controller](https://github.com/igrigorik/videospeed), but it did not work with some videos on BiliBili (哔哩哔哩，b站，a website that I like to use), and do not support Ctrl, Shift and Alt keys, and do not have dark theme and look very old-fashioned. 

# Video Controller

There are many browser extensions and tampermonkey scripts that control HTML5 videos, but I have found none that is satisfactory, because:

- Almost every single one only change the playback speed. 
- The very few ones that have advance and rewind functionalies do not have options for very small timesteps (2s and 0.03s)

Actually, there was one extension that allowed customizable hotkey and timestep, but it did not work with BiliBili (a website that I like to use), so that's why I wrote this script.

## Hotkeys

Plan on adding customizable hotkeys in the future, for the moment it hard-coded:

- `A`: playback speed -0.1
- `S`: playback speed +0.1
- `C`: playback speed = 1
- `Z`: rewind time 2s
- `X`: advance time 2s
- `,`: rewind time 0.03s
- `.`: advance time 0.03s
- `V`: toggle visibility of playback speed tooltip
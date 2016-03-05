
This repo contains a few Photoshop scripts.  They were designed for CS4 but I still use them in CC.

### Super Export.jsx

Exports specially named layers to jpg, png, etc.  For example, if you name a layer "Background.jpg", that layer will be saved as a jpg. Highlights include:
 - Name a layer or folder with an image extension (ie. png, jpg, etc) to have it exported
 - Include a path to save in a sub-directory. ie. `assets/car.png` would save in an `assets` folder
 - Prefix a layer with `#` to always hide it
 - Include `@2x` before the file extension (ie. `car@2x.png`) to save the current size for 2x and half size without 2x.
 - Cropping: create a layer named 'crop' inside your folder to have that image cropped to the cropping layer
 - Tagging: Use `{0}` in the filename like `{0}-car.png` to save different version. Within the folder, layers named like `-red` or `-blue` will be enabled and exported as `blue-car.png` and `red-car.png`.
 
For more info, checkout the [Super Export Guide](https://github.com/bendytree/Photoshop-Scripts/blob/master/Super%20Export.md) contributed by @bclubb.

> NOTE: Photoshop CC introduced [image assets](https://helpx.adobe.com/photoshop/using/generate-assets-layers.html) which is similar but has less features. You can disable it in `Edit > Preferences > Plug-Ins > Enable Generator > Disable`.

### Dynamic Script.jsx

A script that let's me run code within Photoshop to test it out.
You won't find it too helpful unless you write scripts a lot. 



# GETTING STARTED (INSTALLATION)

Installing a script means dropping the script (*.jsx file) into Photoshop's scripts directory.  For me, the path is:

    MAC: /Applications/Adobe Photoshop CS4/Presets/Scripts
    
    PC: c:\program files\Adobe Photoshop CS4\Presets\Scripts

Restart Photoshop and a new menu item will show up in `File > Scripts > Super Export`.  Click it to run the script.

I made a keyboard shortcut `[F5]` to run it automatically, Here's how:

1. Choose Edit > Keyboard Shortcuts...
2. Highlight "Super Export" under File > Scripts
3. Click under the 'Shortcut' column and type the [F5] key (or whatever you want)
4. If there are conflicts, choose 'Accept & Continue', otherwise choose 'Accept'

ADVANCED USERS: You can also have scripts in subfolders of this directory, so if you're familiar with GIT, want all my scripts, and want easy access to updates you could clone:  `https://github.com/bendytree/Photoshop-Scripts` to `/Applications/Adobe Photoshop CS4/Presets/Scripts/BendyTree`  and whenever you want an update, just do a `git pull` from that directory.  Photoshop gracefully ignores non .jsx files (like .gitignore and readme).







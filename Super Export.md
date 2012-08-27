Super Export.jsx
  by: Josh Wright
  company: Bendy Tree, LLC (http://www.bendytree.com)
  created: July 30, 2011
  repo: https://github.com/bendytree/Photoshop-Scripts
  
  
This is a Photoshop script that lets you save parts of a PSD as separate,
cropped files by carefully naming the Photoshop layers.

For installation instructions or for other scripts by Bendy Tree, see:
https://github.com/bendytree/Photoshop-Scripts



THE PROBLEM IT SOLVES

With software design I always have one large PSD that looks like a screenshot.
Inside that PSD I'll have a logo, a page background, a navigation menu, buttons
with on/off states, etc.

This lets me design everything in the context of the whole screen, but it's
annoyingly redundant to save each graphic out individually. Say I want to save
the logo out separately - I have to crop it, hide the background & some other
layers, select "Save As...", find the format from a drop down, & type in the
logo's name.


HOW IT WORKS

I'm working on a new iPhone app with a music control bar.  This bar has a
background, back button, play/pause button, and a next button (see image below).
It appears simple, but it ends up being 13 separate images (26 if you count
retina/non-retina).

[img: StatusBarExplosion.jpg]

It's a huge pain to export all these images out, but not when I use the "Super
Export" script.  By following a few conventions when naming the Photoshop layers,
I'm able to easily export all 13 images by pressing [F5] (& non-retina versions
if I wanted to).


A BASIC EXAMPLE

First let's check out the background for the control bar.  I want to save out
the background of the whole control bar, so I name a folder (layer set)
"ControlBar.png" and put all of the background layers inside that layer.  When
I run this script (by pressing F5), it sees that I named this layer like an
image so it hides the other layers & saves this one as ControlBar.png.

![Bar Example](https://raw.github.com/bendytree/Photoshop-Scripts/master/BarExample.png)

You may have noticed the 'crop' layer. For me, it's very common to crop the
image before I save a particular part.  In this example, the control bar is
the full width of the iPhone app, but it is only part of the height so I need
to crop it before saving it. 

So to make sure it's cropped, I create a layer called 'crop' and put it in my
"ControlBar.png folder". Then I select a rectangle and fill it with any color
(I like pink).  You can hide it or change it's transparency to any value. I
typically hide it.  If you don't include a 'crop' layer then the full size of
the screen will be saved.



A TAGGING EXAMPLE

Occasionally you'll have buttons or menu items that have different states. For
example, if they mouse over then the button lights up.  Or maybe it has a
disabled state.

For example, my back button has 3 states: active, normal, and disabled. They
should all have some common elements like the shadow and the same crop since
I'll swap them out on the app.  Ultimately, I want three images to be saved:
back_normal.png, back_active.png, and back_disabled.png.

To achieve this, first I name the whole folder (layer set) "back_{0}.png".
It looks cryptic, but it just means that I have tagged some layers that should
be swapped out for "{0}".  In my case, I've tagged a layers "active", "normal",
and "disabled".

![Back Example](https://raw.github.com/bendytree/Photoshop-Scripts/master/BackExample.png)

How do you tag a layer?  Easy, you just add a dash after the layer name, then
write out the tags for that layer (comma separated).

The script hides all tagged layers except "normal" and saves it as
"back_normal.png".  Then hides all tagged layers except "active" and saves it
as "back_active.png". And so on.


COMPLEX TAGGING

It's very rare that you need complex tagging, but this script is like gold
when you finally need it.

My play/pause button is deceptively complicated.  It can either look like a
pause button or a play button and each of those needs to have a normal, active,
and disabled state.  They all share the same crop and shadow, so it's very
annoying to have to re-save all those combinations.

So here's how I name all the layers to make this happen automatically:

![Complex Tagging Example](https://raw.github.com/bendytree/Photoshop-Scripts/master/PPExample.png)

The whole folder is named "{type}Button_{state}.png" because I have have two
types of tags - a "type" (play or pause) and a "state" (normal, active, or
disabled).  I want every combination of those to be saved.

Tagging looks a bit uglier.  Here's the format:
"[Whatever You Want] - [Tag Type]:[Tag]"

In my example, I have one folder for each of the states.  Then you can see
that the "normal" state layer has a layer tagged as Pause, a layer tagged as
Play, and a BG (no tags).  In other words, you can tag layers that are deep
into the tree structure.



OTHER FEATURES

There are a few other nice features you might want to take advantage of. 


RETINA

If you're an iPhone developer, you know the annoyance of saving a retina 
version and a non-retina.  This script takes the stance that you design
for @2x, then resize to the smaller version.

To make this happen, just add @2x in your file name (the layer name) and
a non @2x version is generated automatically.

![Retina Example](https://raw.github.com/bendytree/Photoshop-Scripts/master/RetinaExample.png)

For example, you might name a layer "Background@2x.png" which would create
two files: "Background@2x.png" and another one (half the size) that's
called "Background.png".


Export Path

I usually don't want to export my images in the same folder as my psd.  I usually have a project where the design files are in their own folder.  For this example I have the following file structure.  I want my files to go straight to the correct images folder.

![Folder Structure](https://raw.github.com/bendytree/Photoshop-Scripts/master/FolderStructure.png)

Now to make this happen all you have to do is make your first layer start with the name exportPath- followed by /path/to/export.  As you can see here you can even use can ../ to go up the path.

![Export Path Example](https://raw.github.com/bendytree/Photoshop-Scripts/master/exportPath.png)

PREVIEW ONLY

Sometimes I'll have 'lorem ipsum' type text to help my imagination while I'm
designing, but I don't want those layers to be shown when I save everything.
Just add a "#" to the layer name, and this script will automatically hide it.

![Preview Example](https://raw.github.com/bendytree/Photoshop-Scripts/master/PreviewExample.png)

FILE TYPES

My examples here were with PNGs, but JPG file types are supported as well.
It'd be trivial to support more, but I haven't had the need yet.  You can
even include a quality parameter for jpg (since it's lossy) by using:
q:[Your Quality Here]

Qualities can be stated in three ways:
0.0 - 1.0: a decimal where 1 is full quality
2 - 12: an integer where 12 is full quality (Photoshop's preferred way)
13 - 100: an integer where 100 is full quality
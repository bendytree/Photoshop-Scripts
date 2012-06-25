/**

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

[img: BarExample.jpg]

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

[img: BackExample.jpg]

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

[img: PPExample.jpg]

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

For example, you might name a layer "Background@2x.png" which would create
two files: "Background@2x.png" and another one (half the size) that's
called "Background.png".


PREVIEW ONLY

Sometimes I'll have 'lorem ipsum' type text to help my imagination while I'm
designing, but I don't want those layers to be shown when I save everything.
Just add a "#" to the layer name, and this script will automatically hide it.


FILE TYPES

My examples here were with PNGs, but JPG file types are supported as well.
It'd be trivial to support more, but I haven't had the need yet.  You can
even include a quality parameter for jpg (since it's lossy) by using:
q:[Your Quality Here]

Qualities can be stated in three ways:
0.0 - 1.0: a decimal where 1 is full quality
2 - 12: an integer where 12 is full quality (Photoshop's preferred way)
13 - 100: an integer where 100 is full quality

**/


(function(){

    var doc =  app.activeDocument;    
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    
    /********************************************************************************/
    /*********************************  REVERT  *************************************/

    var originalHistoryState = doc.activeHistoryState;
    
    var layersSettings = [];
    eachLayer(function(layer){
        layersSettings[layersSettings.length] = {
            layer: layer,
            visible: layer.visible
        };
    });
    
    function revert_all(){
        doc.activeHistoryState = originalHistoryState;

        revert_layer_visibilities();
    }
    
    function revert_layer_visibilities(){
        for(var i=0; i<layersSettings.length; i++){
            var layerSettings = layersSettings[i];
		    if(layerSettings.layer.visible != layerSettings.visible)
                layerSettings.layer.visible = layerSettings.visible;
        }
    }
    
    /********************************************************************************/
    /********************************  EXTENSIONS  **********************************/

    String.prototype.trim = function(){ 
       return this.replace(/^ */, "").replace(/ *$/, "");
    } 
    
    function keys(obj){
        var keys = [];
        for(i in obj) if (obj.hasOwnProperty(i))
        {
            keys.push(i);
        }
        return keys;
    };
    
    function clone(obj){
        if(obj == null || typeof(obj) != 'object')
            return obj;

        var temp = {}; // changed, obj.constructor()

        for(var key in obj)
            temp[key] = clone(obj[key]);
        return temp;
    }

    Array.prototype.indexOf = function(el) {
        for (var i = 0; i < this.length; i += 1) {
            if (this[i] == el) return i;
        }
        return -1;
    };
    
    Array.prototype.lastIndexOf = function(el) {
        for (var i = this.length-1; i >= 0; i -= 1) {
            if (this[i] == el) return i;
        }
        return -1;
    };
    
    Array.prototype.distinct = function() {
        var derivedArray = [];
        for (var i = 0; i < this.length; i += 1) {
            if (derivedArray.indexOf(this[i]) == -1) {
                derivedArray.push(this[i])
            }
        }
        return derivedArray;
    };
    
    Array.prototype.each = function(callback) {
        var derivedArray = [];
        for (var i = 0; i < this.length; i += 1) {
            derivedArray.push(callback(this[i], i));
        }
        return derivedArray;
    };
    
    
    /********************************************************************************/
    /*****************************  LAYER ENUMERATION  ******************************/
    
    function buildCacheForLayer(layer){        
        var cache = {
            layerRef: layer,
            layers: []
        };

        if(layer.layers)
          for(var i=0; i<layer.layers.length; i++)
            cache.layers[i] = buildCacheForLayer(layer.layers[i]);
        
        return cache;
    }
    
    function findCacheForLayer(layer, currentCache){
        currentCache = currentCache || rootLayerCache;
        if(layer == currentCache.layerRef)
            return currentCache;
        
        for(var i=0; i<currentCache.layers.length; i++){
            var newCache = findCacheForLayer(layer, currentCache.layers[i]);
            if(newCache)
                return newCache;
        }
        return null;
    }
    
    var rootLayerCache = null;
    function eachLayer(callback, layer){
        if(rootLayerCache == null)
            rootLayerCache = buildCacheForLayer(doc);
        
        var each = function(callback, layerCache){
            for(var i=0; i<layerCache.layers.length; i++){
                if(callback(layerCache.layers[i].layerRef) == false)
                    return false;

                if(each(callback, layerCache.layers[i]) == false)
                    return false;
            }
        };
        
        each(callback, findCacheForLayer(layer || doc));
    }

    
    /********************************************************************************/
    /*********************************  HELPERS  ************************************/

    function cropToLayer(layer){
        var bounds = layer.bounds;
        if(!bounds) return;
        doc.crop(bounds);
    }
    
    function hideSiblingsOfSelfAndOfParent(layer){
        if(layer.typename == "Document")
            return; //document has no siblings

		if(layer.visible != true)
             layer.visible = true;

        for(var i=0; i<layer.parent.layers.length; i++){
            var currentLayer = layer.parent.layers[i];
            if(layer == currentLayer)
                continue;
            
			if(currentLayer.visible != false)
                 currentLayer.visible = false;
        }

        hideSiblingsOfSelfAndOfParent(layer.parent);
    }

    function getSaveOptions(layerInfo){
        if(layerInfo.extension == "jpg"){
            var options = new JPEGSaveOptions();
            options.matte = MatteType.BACKGROUND;

            //Quality
            if(layerInfo.q){
                if(isNaN(parseFloat(layerInfo.q)) == false){
                    layerInfo.q = Math.max(Math.min(parseFloat(layerInfo.q), 100), 0);
                    if(layerInfo.q<=1){
                        layerInfo.q = Math.round(layerInfo.q*12);
                    }else if(layerInfo.q > 12){
                        layerInfo.q = Math.round((layerInfo.q/100.0)*12);
                    }
                }
            }
            options.quality = layerInfo.q || 10; 

            return options;
        }else if(layerInfo.extension == "png"){
            var options = new PNGSaveOptions();
            options.matte = MatteType.NONE;
            return options;
        }else if(layerInfo.extension == "gif"){
            var options = new GIFSaveOptions();
            options.matte = MatteType.NONE;
            options.transparency = true;
            return options;
        }
    }
    
    function getExportOptions(layerInfo){
        var options = new ExportOptionsSaveForWeb();

        if(layerInfo.extension == "jpg"){
            options.format = SaveDocumentType.JPEG; //-24 //JPEG, COMPUSERVEGIF, PNG-8, BMP 
            
            //Quality
            if(layerInfo.q){
                if(isNaN(parseFloat(layerInfo.q)) == false){
                    layerInfo.q = Math.max(Math.min(parseFloat(layerInfo.q), 100), 0);
                    if(layerInfo.q<=1){
                        layerInfo.q = Math.round(layerInfo.q*100);
                    }
                }
            }
            options.quality = layerInfo.q || 80; 
        }else if(layerInfo.extension == "png"){
            options.format = SaveDocumentType.PNG; //JPEG, COMPUSERVEGIF, PNG-8, BMP 
            options.quality = 100;
            options.PNG8 = false;
        }else if(layerInfo.extension == "gif"){
            options.format = SaveDocumentType.COMPUSERVEGIF; //JPEG, COMPUSERVEGIF, PNG-8, BMP 
            options.matte = MatteType.NONE;
            options.transparency = true;
        }
         
        return options;
    }

    function convertLayerNameToInfo(name){
        var info = { name:name, tags:{}, hasTags:false };
        
        // Get tags
        if(name.indexOf("-") == 0){
            var tags = name.substring(name.lastIndexOf("-")+1).trim().split(",");
		    for(var i=0; i<tags.length; i++){
		        var t = tags[i].split(":");
                if(t.length == 1){
                    t[1] = t[0].trim();
                    t[0] = "0";
                }else{
                    t[0] = t[0].trim();
                    t[1] = t[1].trim();
                }
			    info.tags[t[0]] = t[1];
		    }
            name = name.substring(0, name.lastIndexOf("-")).trim();
            info.hasTags = true;
        }
        
        // Split by Comma
        var sections = name.split(",");
        for(var i=0; i<sections.length; i++){
            var section = sections[i].trim();

            //No Colon, So Maybe A Filename
            if(section.indexOf(":") == -1){
                var extension = section.match(/(jpg|png|gif)$/i);
                if(extension){
                    info.filename = section;
                    info.extension = extension[0].toLowerCase();
                }

            //Colon, So Split Into Key/Value
            }else{
                var fieldParts = section.split(":");
                info[fieldParts[0].trim().toLowerCase()] = fieldParts[1].trim();
            }
        }

        return info;
    }
    
    var getCurrentDocumentIndex = function(){
        for(var i=0; i<app.documents.length; i++){
            if(app.activeDocument == app.documents[i])
                return i;
        }
        alert("Current document index not found.");
    }
    
    var getPath = function(){
        if(app.documents.length == 1 || !new RegExp(/TemporaryItems/).test(app.activeDocument.path))
            return app.activeDocument.path;
        var newIndex = (getCurrentDocumentIndex()-1) % app.documents.length;
        return app.documents[newIndex].path;
    };
    
    
    
    /********************************************************************************/
    /**********************************  MAIN  **************************************/

    /**
     *  - Take an initial snapshot so we don't change any of their settings
     *  - If a folder is named with an extension (.jpg, etc) then 
     *    - Hide siblings of self & parent folders
     *    - If current folder has a 'Crop' layer, then use it to crop
     *  - Restore to initial snapshot
     */

    //try{
        eachLayer(function(layer){
            if(layer.typename == "LayerSet"){
                //Get the extension
                var info = convertLayerNameToInfo(layer.name);
                if(!info.filename) return;

                //Crop if need be
                for(var i=0; i<layer.layers.length; i++){
                    var l = layer.layers[i];
                    if(l.name.match(/^ *crop *$/i)){
                        cropToLayer(l);
                    }
                }

                //Hide bad stuff
                hideSiblingsOfSelfAndOfParent(layer);

                //Prepare saving function
                var save = function(filename){
                    //Save
                    var filepath = getPath()+"/"+filename;
                    //doc.saveAs(new File(filepath), getSaveOptions(info), true, Extension.LOWERCASE);
                    doc.exportDocument(new File(filepath), ExportType.SAVEFORWEB, getExportOptions(info));

                    //Retina?
                    if(info.filename.match(/@2x[.][a-z]+$/)){
                        var preResizeState = doc.activeHistoryState;
                        
                        //if(doc.layers.length > 1)
                            doc.mergeVisibleLayers();
                            
                        doc.resizeImage(doc.width/2, doc.height/2, doc.resolution, ResampleMethod.BICUBICSHARPER);
                    
                        var filepath = getPath()+"/"+filename.replace("@2x", "");
                        //doc.saveAs(new File(filepath), getSaveOptions(info), true, Extension.LOWERCASE);
                        doc.exportDocument(new File(filepath), ExportType.SAVEFORWEB, getExportOptions(info));
                        doc.activeHistoryState = preResizeState;
                    }
                }
                
                //Hide hashed
                eachLayer(function(l){
                    if(l.name.indexOf("#") != -1)
					   if(l.visible != false)
                            l.visible = false;
                });
                

                //save once for each tagged layer inside this layerset
                if(new RegExp(/\{[^}]+\}/).test(info.filename)){
                    //gather all possible tags & tag values
                    var allTags = {};
                    eachLayer(function(l){
                        var info = convertLayerNameToInfo(l.name);
                        var currentTags = keys(info.tags);
                        for(var i=0; i<currentTags.length; i++){
                            var t = currentTags[i];
                            if(allTags[t]){
                                allTags[t] = allTags[t].concat([ info.tags[t] ]).distinct();   
                            }else{
                                allTags[t] = [ info.tags[t] ];
                            }
                        }
                    }, layer);
                    var allKeys = keys(allTags);
                    
                    //create a strategy for covering all tag combinations
                    var allCombinations = [];
                    var addTagSetToCombinations = function(tag, tagValues){
                        //no previous combos, so just add ours
                        if(allCombinations.length == 0){
                            for(var i=0; i<tagValues.length; i++){
                                var combo = {};
                                combo[tag] = tagValues[i];
                                allCombinations.push(combo);
                            }
                        
                        //explode our tag into previous combos
                        }else{
                            var newCombos = [];
                            for(var i=0; i<allCombinations.length; i++){
                                for(var j=0; j<tagValues.length; j++){
                                    var newCombo = clone(allCombinations[i]);
                                    newCombo[tag] = tagValues[j];
                                    newCombos.push(newCombo);
                                }
                            }
                            allCombinations = newCombos;
                        }
                    };
				
				   //actually create the combinations
				   allKeys.each(function(key){
				       addTagSetToCombinations(key, allTags[key]);
				   });
                     
                   //save each combo
                   for(var i=0; i<allCombinations.length; i++){
                        var combo = allCombinations[i];
                        eachLayer(function(l){
                            var info = convertLayerNameToInfo(l.name);
                            if(!info.hasTags) return;
                            
                            var visible = true;
                            keys(info.tags).each(function(key){
						       visible &= info.tags[key] == combo[key];
						    });
						    l.visible = visible;
                        }, layer);
                        
                        //create filename
                        var filename = info.filename;
                        allKeys.each(function(key){
                            filename = filename.replace("{"+key+"}", combo[key]); 
                        });
				  
                        //save
                        save(filename);
                    }
                    
                //save normally (no swapable layers)
                }else{
                    save(info.filename);
                }
                
                revert_all();
            }
        });
    //}catch(error){
     //   if(!confirm("Error in main: "+error))
     //       return false; 
    //}
    revert_all();


})();


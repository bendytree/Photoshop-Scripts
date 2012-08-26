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
    /********************************   UTILTIES   **********************************/

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
    /*****************************  LAYER DATA & CACHING  ***************************/
    
    function convertLayerToData(layer){
        var data = {
            layer: layer,
            isSet: layer.typename == "LayerSet",
            name: layer.name,
            startedVisible: layer.visible,
            tags: {},
            hasTags: false,
            siblings: [],
            descendents: [],
            ancestors: [],
            children: []
        };
        
        // Get tags
        if(data.name.indexOf("-") != -1){
            var tags = data.name.substring(data.name.lastIndexOf("-")+1).trim().split(",");
		    for(var i=0; i<tags.length; i++){
		        var t = tags[i].split(":");
                if(t.length == 1){
                    t[1] = t[0].trim();
                    t[0] = "0";
                }else{
                    t[0] = t[0].trim();
                    t[1] = t[1].trim();
                }
			    data.tags[t[0]] = t[1];
		    }
            data.name = data.name.substring(0, data.name.lastIndexOf("-")).trim();
            data.hasTags = true;
        }
        
        // Split by Comma
        var sections = data.name.split(",");
        for(var i=0; i<sections.length; i++){
            var section = sections[i].trim();

            //No Colon, So Maybe A Filename
            if(section.indexOf(":") == -1){
                var extension = section.match(/(jpg|png|gif)$/i);
                if(extension){
                    data.filename = section;
                    data.extension = extension[0].toLowerCase();
                }

            //Colon, So Split Into Key/Value
            }else{
                var fieldParts = section.split(":");
                data[fieldParts[0].trim().toLowerCase()] = fieldParts[1].trim();
            }
        }

        data.isExportable = data.isSet && !!data.filename;
        
        return data;
    }
    
    var layerDatas = [];
    var buildAndRegisterLayerData = function(layer){
        //create my data
        var data = convertLayerToData(layer);
        layerDatas.push(data);
        
        //add all descendents
        if(layer.layers && layer.layers.length > 0){
            for(var i=0; i<layer.layers.length; i++){
                //create data for the child
                var childData = buildAndRegisterLayerData(layer.layers[i]);
                
                //add this child
                data.children.push(childData);
                data.descendents.push(childData);
                
                //add this child's descendents
                childData.descendents.each(function(d){
                    data.descendents.push(d);
                });
            }
        
            //set siblings
            data.children.each(function(c1){
                data.children.each(function(c2){
                    if(c1 != c2)
                        c1.siblings.push(c2);
                });                
            });
        
            //add self as an ancestor
            data.descendents.each(function(d){                
                d.ancestors.push(data);
            });
        }
        return data;
    };
    buildAndRegisterLayerData(doc);
    
    var findDataForLayer = function(layer){
        var data = null;
        layerDatas.each(function(l){
            if(l.layer == layer)
            {
                data = l;
                return false;
            }
        });
        return data;
    };

    layerDatas.each(function(l){
        var txt = l.name + " => ";
        l.siblings.each(function(c){
            txt +=  c.name + ", ";
        });
        //$.writeln(txt);
    });
    //return;
    

    /********************************************************************************/
    /**********************************  REVERTING  *********************************/
    
    var selectedLayer = doc.activeLayer;
    var originalHistoryState = doc.activeHistoryState;
    
    var revert = function(){
        doc.activeHistoryState = originalHistoryState;
        doc.activeLayer = selectedLayer;

        layerDatas.each(function(l){
		    if(l.startedVisible != l.layer.visible)
                l.layer.visible = l.startedVisible;
        });
    }

    /********************************************************************************/
    /******************************  HIDE HASHED LAYERS  ****************************/
    
    //Hide hashed
    layerDatas.each(function(l){
        if(l.name.indexOf("#") != -1 && l.layer.visible != false)
            l.layer.visible = false;
    });
    
    
    /********************************************************************************/
    /*********************************  HELPERS  ************************************/

    var cropRx = /^ *crop/i;
    var runCroppingLayers = function(data){
        data.children.each(function(c){
            if(cropRx.test(c.name)){
        
                //hide it
                if(c.layer.visible != false)
                    c.layer.visible = false;
                    
                //crop it
                if(c.layer.bounds)
                    doc.crop(c.layer.bounds);
            }
        });
    }

    function hideSiblingsOfSelfAndOfParent(data){
        var chain = [data];
        data.ancestors.each(function(a){
            chain.push(a);
        });

        chain.each(function(a){
            //show ancestors
            if(a.layer.visible != true)
                a.layer.visible = true;
                
            //hide ancestors siblings
            a.siblings.each(function(sib){
                var setVisible = new RegExp(/^ *[*]/).test(sib.name);
                if(sib.layer.visible != setVisible)
                     sib.layer.visible = setVisible;
            });
        });
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

    var getCurrentDocumentIndex = function(){
        for(var i=0; i<app.documents.length; i++){
            if(app.activeDocument == app.documents[i])
                return i;
        }
    }
    
    var getPath = function(){
        if(app.documents.length == 1 || !new RegExp(/TemporaryItems/).test(app.activeDocument.path))
            return app.activeDocument.path;
        var newIndex = (getCurrentDocumentIndex()-1) % app.documents.length;
        return app.documents[newIndex].path;
    };
    
    
    /********************************************************************************/
    /*******************************  LAYER EXPORT  **********************************/

    var exportLayer = function(data){
        
        //crop
        runCroppingLayers(data);
    
        //Hide bad stuff
        hideSiblingsOfSelfAndOfParent(data);

        //Prepare saving function
        var save = function(filename){
            //Save
            var filepath = getPath()+"/"+filename;
            var exportOptions = getExportOptions(data);
            doc.exportDocument(new File(filepath), ExportType.SAVEFORWEB, exportOptions);

            //Retina?
            if(data.filename.match(/@2x[.][a-z]+$/)){
                var preResizeState = doc.activeHistoryState;
                
                try { doc.flatten(); }catch(e){}
                    
                doc.resizeImage(doc.width/2, doc.height/2, doc.resolution, ResampleMethod.BICUBICSHARPER);
            
                var filepath = getPath()+"/"+filename.replace("@2x", "");
                doc.exportDocument(new File(filepath), ExportType.SAVEFORWEB, exportOptions);
                doc.activeHistoryState = preResizeState;
            }
        };

        //save once for each tagged layer inside this layerset
        if(new RegExp(/\{[^}]+\}/).test(data.filename)){
            //gather all possible tags & tag values
            var allTags = {};
            data.descendents.each(function(d){
                var currentTags = keys(d.tags);
                for(var i=0; i<currentTags.length; i++){
                    var t = currentTags[i];
                    if(allTags[t]){
                        allTags[t] = allTags[t].concat([ d.tags[t] ]).distinct();   
                    }else{
                        allTags[t] = [d.tags[t] ];
                    }
                }
            });
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
                data.descendents.each(function(l){
                    if(!l.hasTags) return;
                    
                    var visible = true;
                    keys(l.tags).each(function(key){
                       visible &= l.tags[key] == combo[key];
                    });
                
                    if(l.layer.visible != visible)
                        l.layer.visible = visible;
                });
                
                //create filename
                var filename = data.filename;
                allKeys.each(function(key){
                    filename = filename.replace("{"+key+"}", combo[key]); 
                });
          
                //save
                save(filename);
            }
            
        //save normally (no swapable layers)
        }else{
            save(data.filename);
        }
    
        revert();
    };

    var prepGuiForExport = function(){
        win.btnOne.enabled = false;
        win.btnExportAll.enabled = false;
        win.btnOne.active = false;
        win.btnExportAll.active = false;
        win.btnOne.visible = false;
        win.btnExportAll.visible = false;
        win.lblProgress.visible = true;     
    };

    var exportableLayers = [];
    layerDatas.each(function(l){
        if(l.isExportable){
            exportableLayers.push(l);
        }
    });

    
    
    /********************************************************************************/
    /**********************************  MAIN  **************************************/

    
    //which layer to export?
    var activeLayerDataToExport = findDataForLayer(selectedLayer);
    if(activeLayerDataToExport && !activeLayerDataToExport.isExportable){
        var newActiveLayerDataToExport = null;
        activeLayerDataToExport.ancestors.each(function(a){
            if(a.isExportable){
                newActiveLayerDataToExport = a;
                return false;
            }
        });
        activeLayerDataToExport = newActiveLayerDataToExport;
    }

    if(activeLayerDataToExport && exportableLayers.length > 5)
    {
        // SHOW THE WINDOW
        var win = new Window("dialog{text:'Script Interface',bounds:[100,100,400,220],\
            btnExportAll:Button{bounds:[20,20,140,70] , text:'Export All ' },\
            btnOne:Button{bounds:[160,20,280,70] , text:'Export One ' },\
            prog:Progressbar{bounds:[20,90,280,101] , value:0,maxvalue:100},\
            lblProgress:StaticText{bounds:[20,40,280,70] , text:'Saving 10 Images... ' ,properties:{scrolling:true,multiline:true}}\
        };");
        win.lblProgress.visible = false;
        win.btnExportAll.text = "Export All ("+exportableLayers.length+")";
        win.btnExportAll.active = true;
        win.btnExportAll.onClick = function(){
            prepGuiForExport();
            win.lblProgress.text = "Exporting All Images...";
            
            exportableLayers.each(function(l, i){
                win.prog.value = ((i+1)*100.0)/(exportableLayers.length+1);
                exportLayer(l);
            });
            win.prog.value = 100;
                
            win.close();
        };
        win.btnOne.text = activeLayerDataToExport.name;
        win.btnOne.onClick = function(){
            prepGuiForExport();
            win.lblProgress.text = "Exporting "+activeLayerDataToExport.name+"...";
            win.prog.value = 50;
            exportLayer(activeLayerDataToExport);
            win.close();
        };
        win.center();
        win.show();
    }
    else
    {
        exportableLayers.each(function(l){
            exportLayer(l);
        });
    }



})();


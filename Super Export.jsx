﻿/**

Super Export.jsx
  by: Josh Wright
  company: Bendy Tree, LLC (http://www.bendytree.com)
  created: July 30, 2011
  repo: https://github.com/bendytree/Photoshop-Scripts

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
            children: [],
            exportPath: ""
        };
        
        // Get tags
        if(data.name.indexOf("exportPath-") != -1){
            data.exportPath = data.name.substring(data.name.lastIndexOf("-")+1).trim();
        } else if(data.name.indexOf("-") != -1){
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
    
    var getPath = function(exportPath){
        var docPath;
        if(app.documents.length == 1 || !new RegExp(/TemporaryItems/).test(app.activeDocument.path)){
            docPath = app.activeDocument.path;
        } else {
            var newIndex = (getCurrentDocumentIndex()-1) % app.documents.length;
            docPath = app.documents[newIndex].path;
        }
        //Check if it exist, if not create it.
        if(exportPath && exportPath != "")
        {
            var exportFolder = Folder(docPath+exportPath);
            if(!exportFolder.exists) exportFolder.create();
            return exportFolder;
        } else {
            return docPath;
        }
    };    
    
    /********************************************************************************/
    /*******************************  LAYER EXPORT  **********************************/

    var exportLayer = function(data, exportPath){
        
        //crop
        runCroppingLayers(data);
    
        //Hide bad stuff
        hideSiblingsOfSelfAndOfParent(data);

        //Prepare saving function
        var save = function(filename, exportPath){
            //Save
            var filepath = getPath(exportPath) + "/" +filename;
            var exportOptions = getExportOptions(data);
            doc.exportDocument(new File(filepath), ExportType.SAVEFORWEB, exportOptions);

            // Allow both @3x and @2x retina
            if(data.filename.match(/@3x[.][a-z]+$/)){
                // scale to @2x

                var preResizeState = doc.activeHistoryState;
                
                try { doc.mergeVisibleLayers(); }catch(e){}
                    
                doc.resizeImage(doc.width/(3/2), doc.height/(3/2), doc.resolution, ResampleMethod.BICUBICSHARPER);
            
                var filepath = getPath(exportPath)+"/"+filename.replace("@3x", "@2x");
                doc.exportDocument(new File(filepath), ExportType.SAVEFORWEB, exportOptions);
                doc.activeHistoryState = preResizeState;

                // Scale to @1x
                try { doc.mergeVisibleLayers(); }catch(e){}
                    
                doc.resizeImage(doc.width/3, doc.height/3, doc.resolution, ResampleMethod.BICUBICSHARPER);
            
                var filepath = getPath(exportPath)+"/"+filename.replace("@3x", "");
                doc.exportDocument(new File(filepath), ExportType.SAVEFORWEB, exportOptions);
                doc.activeHistoryState = preResizeState;
            }

            //Retina?
            else if(data.filename.match(/@2x[.][a-z]+$/)){
                var preResizeState = doc.activeHistoryState;
                
                try { doc.mergeVisibleLayers(); }catch(e){}
                    
                doc.resizeImage(doc.width/2, doc.height/2, doc.resolution, ResampleMethod.BICUBICSHARPER);
            
                var filepath = getPath(exportPath)+"/"+filename.replace("@2x", "");
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
                save(filename, exportPath);
            }
            
        //save normally (no swapable layers)
        }else{
            save(data.filename, exportPath);
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
    var exportPath = "";
    if (activeLayerDataToExport.exportPath != "") {
        exportPath = activeLayerDataToExport.exportPath;
    }
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
            exportLayer(activeLayerDataToExport, exportPath);
            win.close();
        };
        win.center();
        win.show();
    }
    else
    {
        exportableLayers.each(function(l){
            exportLayer(l, exportPath);
        });
    }
})();


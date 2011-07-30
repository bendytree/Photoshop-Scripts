var doc =  app.activeDocument; 

var stringIDToTypeID = function(s){
    return app.stringIDToTypeID(s);
};

var charIDToTypeID = function(s){
    return app.charIDToTypeID(s);
};

/********************************************************************************/
/********************************  EXTENSIONS  **********************************/

String.prototype.trim = function(){ 
   return this.replace(/^ */, "").replace(/ *$/, "");
} 

Object.prototype.keys = function(){
    var keys = [];
    for(i in this) if (this.hasOwnProperty(i))
    {
        keys.push(i);
    }
    return keys;
};

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



function eachLayer(callback, d){
    d = d || doc;
    for(var i=0; i<d.layers.length; i++){
        var result = callback(d.layers[i]);
        
        if(result == false)
            return;
            
        if(d.layers[i].layers)
            eachLayer(callback, d.layers[i]);
    }
}

var foundScript = false;
eachLayer(function(l){
    if(l.kind == LayerKind.TEXT && l.name.match(/^script$/i)){
        foundScript = true;
        var script = l.textItem.contents;
        try{
            eval(script.replace(/”/g, "\"").replace(/’/g, "'"));
        }catch(e){
            alert("Error: '"+e + "' on:\n\n"+script);
        }
        return false;
    }
});

if(!foundScript)
    alert("No Script Found\n\nCreate a text layer named 'script' to run a dynamic script.");
    


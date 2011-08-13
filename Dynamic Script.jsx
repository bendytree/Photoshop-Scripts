/**

Super Export.jsx
  by: Josh Wright
  company: Bendy Tree, LLC (http://www.bendytree.com)
  created: July 30, 2011
  repo: https://github.com/bendytree/Photoshop-Scripts
  
  
This is a Photoshop script that lets you makes it easy to dynamically run
any arbitrary Javascript in Photoshop.

For installation instructions or for other scripts by Bendy Tree, see:
https://github.com/bendytree/Photoshop-Scripts


HOW IT WORKS

To use it, create a text layer named 'script' and put your code as the text
on that layer.  For example, you might write:

alert('The path is: '+app.activeDocument.path);

When you run this script, an alert box should pop up telling you the path
of the active document.

**/


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
    


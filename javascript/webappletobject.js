 /*
** WebAppletObject
** Creates a new object that will bypass the ActiveX security "Click to Activate" feature in IE
**
** author: Nathan Wilkinson
** date: 1/15/07
*/
function WebAppletObject(name, code, archive, width, height, id) 
{
    //properties
    this.name = name;
    this.code = code;
    this.archive = archive;
    this.width = width;
    this.height = height;
    this.id = id;
    this.parameters = new Array();

    //functions
    this.addParameter = function addParameter(name, value) 
    {
        this.parameters[this.parameters.length] = new Parameter(name, value);
    }
    this.write = function write(container) {
        var retVal = '<object classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" height="' + this.height + '" width="' + this.width + '"name="' + this.name + '" id="' + this.id + '" class="' + this.id + '" VIEWASTEXT>\n';
        retVal += '	<param name="code" value="' + this.code + '" />\n';
        
        if (archive != null)
            retVal += '	<param name="archive" value="' + this.archive + '" />\n';
        
        for (var i = 0; i < this.parameters.length; i++) {
            retVal += '	<param name="' + this.parameters[i].name + '" value=' + this.parameters[i].value + '>\n';
        }
        retVal += ' <comment>\n';
        retVal += ' <embed height="' + this.height + '" width="' + this.width + '" name="' + this.name + '" class="' + this.id + '" code="' + this.code + '"';
        retVal += ' type="application/x-java-applet"\n'
        if (archive != null)
            retVal += ' archive="' + this.archive + '"\n';
        for (var i = 0; i < this.parameters.length; i++) {
            retVal += this.parameters[i].name + '="' + this.parameters[i].value + '"\n';
        }
        retVal += '>';
        retVal += '</comment>\n';
        retVal += '</object>\n';
        //alert(retVal);
        
        document.getElementById(container).innerHTML = retVal;
    }

}

function Parameter(name, value) 
{
    this.name = name;
    this.value = value;
}

# Custom ShareFile UI

To view, login into data drop and generate a share file link.  Note the share file folder id.

    https://ingenuity-it.sharefile.com/upload-storagecenter.aspx?id=xxx
    
Use the id to pass to the index.html page.

    http://localhost:8888/custom-sharefile/index.html?id=xxx
    
Notes:

* Use YQL to screen scrape the the upOpts from Share File
* html5up = new SFHtml5Upload(upOpts)
* current setup requires context root to be "/"

Some Share File URLs:

*  https://www.sf-cdn.net/cache/20121022/css/default/stylesNG.css
*  https://www.sf-cdn.net/cache/20121022/javascript/jquery-latest.js
*  https://www.sf-cdn.net/cache/20121022/javascript/uploadprogress-storagecenter.js

To download files:

    curl -O https://www.sf-cdn.net/cache/20121022/css/default/img/ui-userDelete.png
    
TODO:

* flash uploader
* applet uploader
* standard

 
   
 
      
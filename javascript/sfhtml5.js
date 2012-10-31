if (typeof console === 'undefined' || typeof console.log === 'undefined') {
    console = {log: function() {
        }};
}

//Extend javascript string to support trim method
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/, '');
    };
}

// sendAsBinary for Chrome
// http://code.google.com/p/chromium/issues/detail?id=35705
if (typeof XMLHttpRequest.prototype.sendAsBinary !== 'function') {
    XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
        function byteValue(x) {
            return x.charCodeAt(0) & 0xff;
        }
        var ords = Array.prototype.map.call(datastr, byteValue),
        ui8a = new Uint8Array(ords);
        this.send(ui8a.buffer);
    };
}

function SFHtml5Upload(options) {
    // Uploader Specific
    var oneMBAsBytes = 1048576,
    that = this,
    consecutiveFailures = 0,
    canDrag,
    canResume,
    canChunk,
    canUpload,
    canMultiUpload,  // Can use upload using FormData objs
    canMultiSel,  // Can use file browsers with multiple="multiple"
    dropTarget,
    utilDiv,
    uploadReq,
    uploadReader,
    isUploading,
    unpauseCallback,
    memoryWarningFired,
    noFoldersReminder = false,
    largeFileWarning = false,
    dropTimeoutRef = null,
    
    defaults = {
        authid: '',
        pid: '',
        baseUploadURL: '',
        baseAppURL: '',
        errorBaseURL: '',
        addFolderURL: '',
        batchID: '',
        redirectURL: '',
        cancelURL: '',
        notificationRedirectURL: '',
        showNotificationOption: false,
        showOverwriteOption: false,
        allowUnzip: true,
        maxFileSize: -1,
        encParams: '',
        debug: false,
        hideDND: false,
        zoneID: ''
    }, 
    
    uploadHooks = function templateHooks(elem, command, arg, callback) {
        switch (command) {
            case "upload-rem":
                that.fileRemove(elem);
                break;
            case "upload-clear":
                that.clearAll();
                break;
            case "upload-details":
                that.fileEdit($(elem).closest('.filerow'));
                break;
            case "upload-start":
                that.beginUpload(elem);
                break;
            case "upload-pause":
                that.togglePause(elem);
                break;
            default:
                break;
        }
    };
    
    this.settings = $.extend({}, defaults, options);
    
    this.fileCollection = [];
    this.filesCompleted = [];
    this.filesFailed = [];
    
    this.bytesTotal = 0;
    this.bytesCompleted = 0;
    this.bytesInProgress = 0;
    this.uploadStartTime = false;
    this.currentFile = null;
    this.filesTotal = 0;
    this.filesProcessed = 0;
    this.overwriteChecked = false;
    this.notifyChecked = false;
    this.unzipChecked = false;
    this.isPaused = false;
    this.onPreUpload = null;
    
    this.destroy = function() {
        dropTarget[0].removeEventListener("dragenter", drag.enter);
        dropTarget[0].removeEventListener("dragleave", drag.leave);
        dropTarget[0].removeEventListener("dragover", drag.over);
        dropTarget[0].removeEventListener("drop", drag.drop);
        if (typeof uploadReq.upload !== 'undefined') {
            uploadReq.upload.removeEventListener("progress", uploadEvt.progress);
        }
        uploadReq.removeEventListener("load", uploadEvt.complete);
        uploadReq.removeEventListener("error", uploadEvt.failed);
        uploadReq.removeEventListener("abort", uploadEvt.cancelled);
        
        hookRemove(uploadhooks);
    };
    
    this.fileAdd = function(dataTransfer, files) {
        var newFiles = [], i;
        
        if (files.length) {
            for (i = 0; i < files.length; i++) {
                var bin;
                /*if (file.type == '' && files[i].size < 100 * 1024) {
                // File has no type and is less than 100K. Let's try to read this file to ensure that it's a readable file, and not a folder
                try {
                bin = files[i].getAsBinary();
                }
                catch (ex) {
                debugger;
                break;
                }
                }*/
                
                if (this.fileCollection[files[i].name] === undefined) {
                    var up = new FileUpload(files[i]);
                    // Ensure we're not exceeding max allowed filesize
                    if (!canChunk && up.sizeBytes > 2048 * oneMBAsBytes && ((this.settings.maxFileSize > 0 && this.settings.maxFileSize > 2048) || this.settings.maxFileSize <= 0)) {
                        displayMessage("File Too Large", "The file \"<strong>" + encodeHtmlF(up.name) + "</strong>\" has a size of " + getFriendlyFileSize(up.sizeBytes, true) + ". When using this browser, uploaded files may be a maximum of 2048 MB. If you need to upload very large files, consider using another modern browser or using the Java Uploader instead.</span>", "errorIcon");
                        break;
                    } 
                    
                    else if (this.settings.maxFileSize > 0 && (up.sizeBytes / oneMBAsBytes) > this.settings.maxFileSize) {
                        displayMessage("File Too Large", "The file \"<strong>" + encodeHtmlF(up.name) + "</strong>\" has a size of " + getFriendlyFileSize(up.sizeBytes, true) + ". Uploaded files may be a maximum of <span class='inline-block'>" + this.settings.maxFileSize + " MB.</span>", "errorIcon");
                        break;
                    }
                    
                    this.fileCollection[up.name] = up;
                    newFiles.push(up);
                    this.bytesTotal += up.sizeBytes;
                    this.filesTotal++;
                    
                    if (this.settings.allowUnzip && this.filesTotal == 1 && up.ext == 'zip') {
                        $('#html5Unzip').show();
                    } 
                    else {
                        $('#html5Unzip').hide();
                    }

                    // File has no type and is less than 75K. Show No Folders reminder
                    if (!noFoldersReminder && up.fileRef.type == '' && up.sizeBytes < 75 * 1024 && up.ext == '') {
                        dropTarget.addClass('showFolderNote');
                        noFoldersReminder = true;
                    }

                    // A large file, and we can't chunk. They should maybe consider using Java for a better success rate.
                    if (!largeFileWarning && !canChunk && this.bytesTotal > oneMBAsBytes * 1024) {
                        displayMessage("Please Note", "The HTML5 Uploader does not support file resuming on error/disconnection when using this browser. If you need to upload very large files, consider using another modern browser or using the Java Uploader instead.");
                        largeFileWarning = true;
                    }
                }
            }
        }
        
        if (newFiles.length) {
            dropTarget.find('.dragtext').addClass('hidden');
            $('.html5UpBtn').removeClass('btn-disabled');
            var newRows = buildListRows(newFiles);
            dropTarget.find('.uploadList').append(newRows);
        }
        clearProcessingMessages(false);
    };
    
    var buildListRows = function(files) {
        var newRows = $('<div>'), 
        rowTemplate = $('#rowTemplate').html(), 
        i;
        
        for (i in files) {
            var f = files[i];
            row = $(rowTemplate.replace('FILEEXT', encodeHtmlF(f.ext)).replace('FILENAME', encodeHtmlF(f.name)).replace('FILESIZE', f.size));
            row.data('name', f.name);
            
            newRows.append(row);
        }
        return newRows.children();
    };
    
    function encodeHtmlF(input) {
        input = input || '';
        return utilDiv.text(input).html();
    }
    
    
    this.fileRemove = function(elem) {
        var row = $(elem).closest('.filerow'), 
        fileName = row.data('name');
        
        if (this.fileCollection[fileName] !== undefined) {
            this.bytesTotal -= this.fileCollection[fileName].sizeBytes;
            this.filesTotal--;
            delete this.fileCollection[fileName];
            if (row.siblings().length == 0) {
                this.clearAll();
            }
            row.remove();
            
            if (this.filesTotal == 1) {
                var chkFile, i;
                for (i in that.fileCollection) {
                    chkFile = that.fileCollection[i];
                }
                if (chkFile && chkFile.ext == 'zip') {
                    $('#html5Unzip').show();
                }
            } 
            else {
                $('#html5Unzip').hide();
            }
        }
    };
    
    this.clearAll = function() {
        this.fileCollection = [];
        this.bytesTotal = 0;
        this.filesTotal = 0;
        noFoldersReminder = false;
        $('.html5UpBtn').addClass('btn-disabled');
        dropTarget.removeClass('showFolderNote').find('.uploadList').empty();
        if (canDrag) {
            dropTarget.find('.dragtext').removeClass('hidden');
        }
    };
    
    this.fileEdit = function(row) {
        var fileUp = this.fileCollection[row.data('name')];

        // Check to see if we're closing an open edit window
        if (row.hasClass('open')) {
            var ctrls = row.find('.details'), 
            title = ctrls.find('.uploadTitle').val(), 
            details = ctrls.find('.uploadDetails').val();
            
            if (title && title.trim()) {
                fileUp.title = title.trim();
            }
            fileUp.details = details ? details.trim() : "";
            
            ctrls.slideUp('fast', function() {
                ctrls.remove();
                row.removeClass('open');
            });
        } 
        else {
            var dtemp = $('#detailTemplate .details').clone();
            dtemp.find('.uploadTitle').val(fileUp.title);
            dtemp.find('.uploadDetails').val(fileUp.details);
            dtemp.appendTo(row).slideDown('fast', function() {
                row.addClass('open');
            });
        }
    };
    
    this.beginUpload = function() {
        if (this.onPreUpload) {
            if (!this.onPreUpload.call(this)) {
                return false;
            }
        }
        if (hasConnection()) {
            if (that.settings.showOverwriteOption && $('#html5Overwrite input').is(':checked')) {
                that.overwriteChecked = true;
            }
            if (that.settings.showNotificationOption && $('#html5Notify input').is(':checked')) {
                that.notifyChecked = true;
            }
            
            if (that.filesTotal == 1) {
                var chkFile, i;
                for (i in that.fileCollection) {
                    chkFile = that.fileCollection[i];
                }
                if (chkFile && chkFile.ext == "zip" && $('#html5Unzip input').is(':checked')) {
                    that.unzipChecked = true;
                }
            }
            
            $('#codetohide').hide();
            $('#uploadprogress').addClass('html5').show();
            $('#progressbar').addClass('anim');
            dropTarget.find('.filerow.open').each(
            function() {
                that.fileEdit($(this));
            }
            );
            that.uploadStartTime = new Date();
            setUploadInProgress(true);
            processNextFile();
        } 
        else {
            displayMessage("Working Offline", "You appear to be working offline. Please verify you are online before attempting an upload.");
        }
    };
    
    var drag = {
        enter: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        leave: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        over: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        drop: function(e) {
            dropTarget.addClass('green');
            
            if (dropTimeoutRef) {
                try {
                    clearTimeout(dropTimeoutRef);
                } catch (ex) {
                }
            }
            dropTimeoutRef = setTimeout(function() {
                dropTarget.removeClass('green');
                dropTimeoutRef = null;
            }, 1500);
            
            e.stopPropagation();
            e.preventDefault();
            var dt = e.dataTransfer;
            var files = dt.files;
            that.fileAdd(dt, files);
        }
    }, 
    
    processNextFile = function() {
        if (!that.isPaused) {
            if (that.currentFile) {
                progress.update(that.currentFile, that.settings);
                that.currentFile = null;
            }
            for (i in that.fileCollection) {
                var file = that.fileCollection[i];
                if (file) {
                    that.currentFile = file;
                    progress.update(that.currentFile, that.settings);
                    uploadUrlPrep(that.currentFile, that.settings);
                    break;
                }
            }
            if (that.currentFile == null) {
                jobFinished();
            }
            return null;
        } 
        else {
            unpauseCallback = processNextFile;
        }
    }, 
    
    processNextChunk = function() {
        if (!that.isPaused) {
            that.currentFile.getChunk(canChunk);
            uploadChunk(that.currentFile, that.settings);
        } 
        else {
            unpauseCallback = processNextChunk;
        }
    }, 
    
    beginUpload = function(file, settings) {
        uploadUrlPrep(file, settings);
    }, 
    
    uploadUrlPrep = function(file, settings) {
        file.status = 'uploadPrep:start';
        
        if (settings.zoneID != '') {
            if (canChunk) {
                restApi = "/rest/file.aspx?op=upload-threaded&authid=" + settings.authid + "&fmt=json&respFormat=none&tool=html5&pid=" + settings.pid + "&filename=" + file.name + "&filesize=" + file.sizeBytes;
            } 
            else {
                file.uploadID = 'h5nc-' + getGuid().slice(1) + '-' + getGuid().slice(1);
                restApi = "/rest/file.aspx?op=upload&authid=" + settings.authid + "&fmt=json&tool=html5&pid=" + settings.pid + "&filename=" + file.name + "&uploadid=" + file.uploadID;
            }
            restApi += "&overwrite=" + that.overwriteChecked.toString().toLowerCase() + "&batchid=" + settings.batchID + "&isbatch=" + (that.filesTotal > 1).toString().toLowerCase() + "&unzip=" + that.unzipChecked.toString().toLowerCase();
            $.ajax({
                cache: false,
                type: "GET",
                url: restApi,
                dataType: 'text',
                timeout: 60000,
                success: function(result) {
                    jsonObj = jQuery.parseJSON(result);
                    if (jsonObj.error) {
                        file.status = 'uploadPrep:error';
                        markFailed();
                    } 
                    else {
                        if (!canChunk) {
                            file.chunkUrl = jsonObj.value;
                            uploadPrep(file, settings);
                        } 
                        else {
                            file.uploadID = jsonObj.value.uploadid;
                            file.chunkUrl = jsonObj.value.uploadurl;
                            file.finishUrl = jsonObj.value.finishurl;
                            if (file.sizeBytes > 0) {
                                file.getChunk(canChunk);
                                uploadChunk(file, settings);
                            } 
                            else {
                                uploadFinish(file, settings);
                            }
                        }
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (file.lastRetry <= 3) {
                        file.lastRetry++;
                        file.status = 'uploadPrep:retry' + file.lastRetry;
                        progress.error(true, 'Upload Error: Waiting');
                        setTimeout(function() {
                            progress.error(false, 'Upload Error: Retrying');
                            uploadUrlPrep(file, settings);
                        }, 20000);
                    } 
                    else {
                        file.status = 'uploadPrep:error';
                        markFailed();
                    }
                
                }
            });
        } 
        else
            uploadPrep(file, settings);
    }, 
    
    uploadPrep = function(file, settings) {
        file.status = 'uploadPrep:start';
        
        if (!canChunk && !file.uploadID) {
            file.uploadID = 'h5nc-' + getGuid().slice(1) + '-' + getGuid().slice(1);
        }
        
        var target = canChunk ? settings.baseUploadURL + "upload-threaded-1.aspx?tool=html5" : 
        "/rest/storagecenter.aspx?op=uploadloginit&tool=Amazon-html5nc&uploadid=" + file.uploadID + '&server=' + encodeURIComponent(settings.baseUploadURL), 
        
        scurl = target + "&authid=" + settings.authid + "&baseAppURL=" + encodeURIComponent(settings.baseAppURL) + "&filename=" + encodeURIComponent(file.name) + 
        "&" + settings.encParams + "&filesize=" + file.sizeBytes + "&batchid=" + settings.batchID + "&t=1&unzip=" + that.unzipChecked.toString().toLowerCase();
        
        $.ajax({
            cache: false,
            type: "GET",
            url: scurl,
            dataType: 'text',
            timeout: 60000,
            success: function(result) {
                if (canChunk && result.toLowerCase().indexOf('error') == -1 || !canChunk && result.toLowerCase() == 'true') {
                    file.status = 'uploadPrep:finish';
                    file.lastRetry = 0;
                    if (canChunk) {
                        file.uploadID = result;
                    }
                    
                    if (!canChunk || file.sizeBytes > 0) {
                        file.getChunk(canChunk);
                        uploadChunk(file, settings);
                    } 
                    else {
                        uploadFinish(file, settings);
                    }
                } 
                else {
                    file.status = 'uploadPrep:error';
                    markFailed();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (file.lastRetry <= 3) {
                    file.lastRetry++;
                    file.status = 'uploadPrep:retry' + file.lastRetry;
                    progress.error(true, 'Upload Error: Waiting');
                    setTimeout(function() {
                        progress.error(false, 'Upload Error: Retrying');
                        uploadPrep(file, settings);
                    }, 20000);
                } 
                else {
                    file.status = 'uploadPrep:error';
                    markFailed();
                }
            
            }
        });
    }, 
    
    
    uploadChunk = function(uploadFile, settings) {
        if (isUploading) {
            return;
        }
        
        isUploading = true;
        var file = uploadFile.currentChunk;
        uploadFile.status = uploadFile.lastRetry ? uploadFile.status : 'uploadChunk:read';
        
        if (canChunk && !canMultiUpload) {
            readBlob(file);
        } 
        else if (canMultiUpload) {
            sendBlob();
        }
    }, 
    
    readBlob = function(blob) {
        if (blob) {
            if (!uploadReader) {
                uploadReader = new FileReader();
                
                if (uploadReader.addEventListener) {
                    uploadReader.addEventListener('loadend', sendBlob, false);
                    uploadReader.addEventListener('error', readError, false);
                // Older Chrome can't use addEventListener here
                } else {
                    uploadReader.onloadend = sendBlob;
                    uploadReader.onerror = readError;
                }
            }
            uploadReader.readAsBinaryString(blob);
        } 
        else {
            markFailed();
        }
    }, 
    
    readError = function(event) {
        markFailed();
    }, 
    
    uploadEvt = {
        lastUpdate: new Date().valueOf(),
        lastCallHome: new Date().valueOf(),
        progress: function(e) {
            var now = new Date().valueOf();
            if (now - uploadEvt.lastUpdate > 700) {
                var pos = !isNaN(e.position) ? e.position : !isNaN(e.loaded) ? e.loaded : 0;
                uploadEvt.lastUpdate = now;
                that.currentFile.chunkTransferred = pos;
                that.bytesInProgress = that.bytesCompleted + that.currentFile.chunkTransferred;
                progress.update(that.currentFile, that.settings);
                
                if (!canChunk && now - uploadEvt.lastCallHome > 45000) {
                    uploadEvt.lastCallHome = now;
                    $.get('/rest/storagecenter.aspx?op=uploadlogupdate&min=true&authid=' + that.settings.authid + '&uploadid=' + that.currentFile.uploadID + '&filesize=' + that.currentFile.chunkSize + '&bytesuploaded=' + e.position);
                }
            }
        },
        complete: function(e) {
            isUploading = false;
            if (e.target.responseText == 'true' || e.target.responseText == 'OK') {
                uploadEvt.lastUpdate = new Date().valueOf();
                that.currentFile.totalTransferred += that.currentFile.chunkSize;
                that.bytesCompleted += that.currentFile.chunkSize;
                that.bytesInProgress = that.bytesCompleted;
                that.currentFile.chunkTransferred = 0;
                that.currentFile.lastRetry = 0;
                progress.update(that.currentFile, that.settings);
                
                if (that.currentFile.totalTransferred > that.currentFile.sizeBytes) {
                    markFailed();
                    return;
                } 
                else if (canChunk) {
                    if (that.currentFile.totalTransferred == that.currentFile.sizeBytes) {
                        uploadFinish(that.currentFile, that.settings);
                    } 
                    else {
                        processNextChunk();
                    }
                } 
                else {
                    markSuccess();
                    processNextFile();
                }
            } 
            else {
                uploadError();
            }
            console.log(e);
        
        },
        failed: function(e) {
            uploadError();
        },
        cancelled: function(e) {
            isUploading = false;
        }
    }, 
    
    sendBlob = function() {
        var uploadFile = that.currentFile, 
        settings = that.settings, 
        scurl = '', 
        multipartFilename = '';
        
        if (settings.zoneID != '') {
            scurl = uploadFile.chunkUrl + '&byteOffset=' + uploadFile.totalTransferred + '&index=' + uploadFile.chunkIdx;
            multipartFilename = uploadFile.name + '.chunk-' + uploadFile.chunkIdx;
            
            if (!canChunk) {
                scurl = uploadFile.chunkUrl + "&filesize=" + uploadFile.sizeBytes + "&baseAppURL=" + encodeURIComponent(settings.baseAppURL);
                multipartFilename = uploadFile.name;
            }
            scurl += "&isbatchlast=" + (that.filesTotal - that.filesProcessed == 1).toString().toLowerCase();
            if (settings.showNotificationOption && that.notifyChecked) {
                qs += "&notify=true";
            }
        } 
        else {
            scurl = settings.baseUploadURL + "upload-threaded-2.aspx?" + buildQueryString(uploadFile, settings) + '&byteOffset=' + uploadFile.totalTransferred + '&index=' + uploadFile.chunkIdx;
            multipartFilename = uploadFile.name + '.chunk-' + uploadFile.chunkIdx;
            
            if (!canChunk) {
                scurl = settings.baseUploadURL + "upload.aspx?" + buildQueryString(uploadFile, settings) + "&filesize=" + uploadFile.sizeBytes + "&baseAppURL=" + encodeURIComponent(settings.baseAppURL);
                multipartFilename = uploadFile.name;
            }
        }
        
        uploadFile.status = uploadFile.lastRetry ? uploadFile.status : 'sendBlob:upload';
        uploadReq.open('POST', scurl, true);
        
        if (canChunk && !canMultiUpload) {
            var boundary = '----------KM7ei4Ef1KM7GI3GI3gL6ae0KM7gL6';
            
            
            var beforeData = '--' + boundary + "\r\n";
            beforeData += 'Content-Disposition: form-data; name="Filedata"; filename="' + encodeURIComponent(multipartFilename) + '"\r\n';
            beforeData += 'Content-Type: application/octet-stream\r\n\r\n';
            
            var afterData = '\r\n--' + boundary + '\r\n';
            afterData += 'Content-Disposition: form-data; name="Upload"\r\n\r\n';
            afterData += 'Submit Query\r\n--' + boundary + '--';
            
            var body = beforeData + uploadReader.result + afterData;
            
            uploadReq.setRequestHeader('accept', 'text/*');
            uploadReq.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
            
            if (uploadReader.removeEventListener) {
                uploadReader.removeEventListener('loadend', this.loadEnd);
                uploadReader.removeEventListener('error', this.loadError);
            } 
            else {
                uploadReader.onloadend = null;
                uploadReader.onerror = null;
            }
            uploadReader = null;

            // Mozilla specific. Chrome prototype defined at top
            if (uploadReq.sendAsBinary != null) {
                uploadReq.sendAsBinary(body);
            }
        } 
        else if (canMultiUpload) {
            // Browsers that can place file refs in FormData can upload using a simpler format
            // http://www.deadmarshes.com/Blog/20110413023355.html
            that.form = new FormData();
            that.form.append('Filedata', uploadFile.currentChunk);
            
            if (!canChunk && uploadFile.details) {
                that.form.append('title', uploadFile.title);
                that.form.append('details', uploadFile.details);
            }
            uploadReq.send(that.form);
        }
    
    }, 
    
    uploadError = function() {
        isUploading = false;
        that.currentFile.lastRetry = that.currentFile.lastRetry !== undefined ? that.currentFile.lastRetry + 1 : 0;
        
        if (that.currentFile.lastRetry <= 3) {
            
            that.currentFile.status = 'failedChunk:retry' + that.currentFile.lastRetry;
            that.currentFile.chunkTransferred = 0;
            var delay = hasConnection() ? 20000 : 30000;
            progress.error(true, 'Upload Error: Waiting');
            
            setTimeout(function() {
                uploadChunk(that.currentFile, that.settings);
                progress.error(false, 'Upload Error: Retrying');
            }, delay);
            
            console.log(that.currentFile);
        } 
        else {
            that.currentFile.status = 'failedChunk:skipped';
            
            console.log(that.currentFile);
            markFailed();
        
        }
    }, 
    
    uploadFinish = function(uploadFile, settings) {
        var file = uploadFile.currentChunk, 
        scurl = '';
        
        if (settings.zoneID != '') {
            scurl = uploadFile.finishUrl + "&finish=true";
            if (uploadFile.sizeBytes != -1) {
                scurl += "&filesize=" + uploadFile.fileRef.size;
            }
        } 
        else {
            scurl = settings.baseUploadURL + "upload-threaded-3.aspx?" + buildQueryString(uploadFile, settings) + "&finish=true";
        }
        
        $.ajax({
            cache: false,
            type: "POST",
            url: scurl,
            dataType: 'text',
            timeout: 900000, // 15 Mins
            data: {"title": uploadFile.title,"details": uploadFile.details},
            success: function(result) {
                console.log('upload finish ' + result.length);
                console.log(result);
                if (!(result.indexOf('fi') == 0 || result.indexOf('fo') == 0) || result.toLowerCase().indexOf('error') != -1) {
                    markFailed();
                    return;
                } 
                else {
                    markSuccess();
                }
                processNextFile();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (that.currentFile.lastRetry <= 3) {
                    that.currentFile.lastRetry++;
                    that.currentFile.status = 'uploadFinish:retry' + that.currentFile.lastRetry;
                    progress.error(true, 'Upload Error: Waiting');
                    
                    setTimeout(function() {
                        progress.error(false, 'Upload Error: Retrying');
                        uploadFinish(uploadFile, settings);
                    }, 20000);
                } 
                else {
                    that.currentFile.status = 'uploadFinish:error';
                    markFailed();
                }
            }
        });
    }, 
    
    markSuccess = function() {
        consecutiveFailures = 0;
        that.currentFile.status = 'uploadFinish';
        that.currentFile.currentChunk = null;
        that.filesCompleted[that.currentFile.name] = that.currentFile;
        that.filesProcessed++;
        delete that.fileCollection[that.currentFile.name];
    }, 
    
    markFailed = function() {
        that.currentFile.currentChunk = null;
        that.filesFailed.push(that.currentFile);
        that.filesProcessed++;
        delete that.fileCollection[that.currentFile.name];
        
        consecutiveFailures++;
        if (consecutiveFailures < 3) {
            processNextFile();
        } 
        else {
            for (i in that.fileCollection) {
                var file = that.fileCollection[i];
                if (file) {
                    that.filesFailed.push(file);
                }
            }
            that.fileCollection = [];
            jobFinished();
        }
    }, 
    
    buildQueryString = function(uploadFile, settings) {
        var qs = "authid=" + settings.authid + "&uploadid=" + uploadFile.uploadID + "&tool=html5" + 
        "&overwrite=" + that.overwriteChecked.toString().toLowerCase() + "&sessionid=" + settings.authid + "&batchid=" + settings.batchID + 
        "&isbatch=" + (that.filesTotal > 1).toString().toLowerCase() + "&isbatchlast=" + (that.filesTotal - that.filesProcessed == 1).toString().toLowerCase() + 
        "&filehash=none&unzip=" + that.unzipChecked.toString().toLowerCase();
        
        if (settings.pid != "") {
            qs += "&pid=" + settings.pid;
        }
        if (settings.showNotificationOption && that.notifyChecked) {
            qs += "&notify=true";
        }
        if (settings.encParams != "") {
            qs += "&" + settings.encParams;
        }
        
        return qs;
    }, 
    
    progress = {
        name: '',
        lastTimeEstimate: null,
        percentComplete: 0,
        fileSize: 0,
        timeRemaining: 0,
        totalTransferred: 0,
        
        update: function(file, settings) {
            var infoL = document.getElementById('progLeft'), 
            infoR = document.getElementById('progRight'), 
            infoPerc = document.getElementById('progPercent');
            
            if (file.name != progress.name) {
                var count = '', 
                name = file.name.toString(), 
                titleElem = $('#progTitle');
                if (that.filesTotal > 1) {
                    count = ' (' + (that.filesProcessed + 1).toString() + ' of ' + that.filesTotal + ')';
                }
                titleElem.html("Uploading '" + encodeHtmlF(name) + "'" + count);
                
                while (name.length > 4 && titleElem.height() > 20) {
                    name = name.slice(0, name.length - 2);
                    titleElem.html("Uploading '" + encodeHtmlF(name) + "&hellip;'" + count);
                }
                
                progress.name = file.name;
            }
            
            var percent = Math.floor(that.bytesInProgress / that.bytesTotal * 100);
            if (isNaN(percent)) {
                percent = 0;
            } 
            // If bytes = 0 or we've somehow managed to get a percent beyond 100, set it to 100
            else {
                percent = (that.bytesInProgress == that.bytesTotal || percent > 100) ? 100 : percent;
            }
            
            if (percent > progress.percentComplete) {
                $('#progressbar').stop().animate({width: percent.toString() + '%'}, 700);
            } 
            else if (percent < progress.percentComplete || percent == 100) {
                $('#progressbar').stop().css({width: percent.toString() + '%'});
            }
            progress.percentComplete = percent;
            
            if (infoL && infoR) {
                var bytesTotal = getFriendlyFileSize(that.bytesTotal), 
                bytesCompleted = getFriendlyFileSize(that.bytesInProgress, bytesTotal.indexOf('MB') != -1);
                
                if (that.bytesInProgress) {
                    infoL.innerHTML = bytesCompleted + ' of ' + bytesTotal + ' transferred';
                } 
                else {
                    infoL.innerHTML = 'Starting upload...';
                }
                infoPerc.innerHTML = percent.toString() + '%';
                
                var timeRemaining = progress.calculateTimeRemaining();
                if (timeRemaining) {
                    infoR.innerHTML = timeRemaining;
                }
            }
        },
        
        error: function(isError, msg) {
            if (isError) {
                $('#progressbar').removeClass('anim').addClass('animBack').addClass('red');
            } 
            else {
                $('#progressbar').removeClass('animBack').removeClass('red').addClass('anim');
            }
            if (msg) {
                progress.statusMessage(msg);
            }
        },
        
        statusMessage: function(msg, seconds) {
            if (!seconds) {
                seconds = 5;
            }
            var infoR = document.getElementById('progRight');
            
            progress.lastTimeEstimate = new Date().valueOf() + (1000 * seconds);
            infoR.innerHTML = msg;
        },
        
        calculateTimeRemaining: function() {
            //Figure out estimated time remaining
            var remainingTimeDisplay = '', 
            now = new Date();
            
            if (!progress.lastTimeEstimate || now - progress.lastTimeEstimate > 4000) {
                remainingTimeDisplay = 'Calculating...';
                var millisecondsElapsed = now.valueOf() - that.uploadStartTime.valueOf(), 
                transferRate = Math.round(that.bytesInProgress / millisecondsElapsed),  //kilobytes per second OR bytes per millisecond
                remainingBytes = that.bytesTotal - that.bytesInProgress;
                
                if (transferRate > 0) {
                    remainingTimeDisplay = '';
                    var remainingTime = Math.round(((remainingBytes / transferRate) / 1024)),  //total seconds
                    hoursRemaining = Math.floor(remainingTime / 3600), 
                    minutesRemaining = Math.floor((remainingTime % 3600) / 60), 
                    secondsRemaining = remainingTime % 60;
                    
                    if (hoursRemaining > 0) {
                        remainingTimeDisplay += hoursRemaining.toString() + ' hr ';
                    }
                    if (minutesRemaining > 0) {
                        remainingTimeDisplay += minutesRemaining.toString() + ' min ';
                    }
                    if (minutesRemaining < 15 && hoursRemaining == 0 && secondsRemaining > 0) {
                        if (minutesRemaining == 0) {
                            remainingTimeDisplay += 'Less than a minute';
                        } 
                        else {
                            remainingTimeDisplay += secondsRemaining.toString() + ' s';
                        }
                    }
                    remainingTimeDisplay += ' remaining';
                    
                    if (remainingTime == 0) {
                        remainingTimeDisplay = 'Finalizing Upload...';
                    }

                //$('#transferRateContainer').html(Math.round(transferRate).toString() + ' kilobytes/sec');
                }
                progress.lastTimeEstimate = now;
            }
            return remainingTimeDisplay;
        }
    }, 
    
    jobFinished = function() {
        console.log('job finished');
        setUploadInProgress(false);
        if (!that.filesFailed.length) {
            if (that.notifyChecked && that.settings.notificationRedirectURL) {
                loadPage(that.settings.notificationRedirectURL);
            } 
            else {
                loadPage(that.settings.redirectURL);
            }
        } 
        else {
            var failList = $('#sfhtml5 .fail');
            failList.find('.uploadList').append(buildListRows(that.filesFailed));
            failList.removeClass('hidden').siblings().addClass('hidden');
            $('#uploadprogress').removeClass('html5').hide();
            $('#codetohide').show();
        }
    };
    
    this.togglePause = function(elem) {
        if (this.isPaused && unpauseCallback) {
            console.log('unpausing');
            this.isPaused = false;
            if (unpauseCallback != null) {
                var call = unpauseCallback;
                unpauseCallback = null;
                call();
            }
            $('#progressbar').addClass('anim').removeClass('grey');
            $(elem).html('pause');
        
        } 
        else {
            console.log('pausing');
            this.isPaused = true;
            if (isUploading) {
                uploadReq.abort();
                isUploading = false;
                unpauseCallback = function() {
                    that.currentFile.chunkTransferred = 0;
                    that.bytesInProgress = that.bytesCompleted;
                    uploadChunk(that.currentFile, that.settings);
                };
            }
            $('#progressbar').addClass('grey').removeClass('anim');
            $(elem).html('resume');
        }
    };
    
    
    this.checkHtml5 = function() {
        canUpload = typeof XMLHttpRequest !== 'undefined' && typeof XMLHttpRequest.prototype !== 'undefined' && typeof XMLHttpRequest.prototype.addEventListener !== 'undefined';
        canResume = canUpload && typeof File !== 'undefined' && typeof FileReader !== 'undefined' && ((File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice) != undefined);
        canChunk = canResume;
        canMultiUpload = canUpload && typeof FormData !== 'undefined';
        canDrag = typeof FileReader !== 'undefined' || (checkIt('safari') && checkIt('mac')), 
        canMultiSel = !(checkIt('safari') && checkIt('windows') && /.*Version\/5\.[1-9].*/.test(window.navigator.userAgent)); // Safari 5.1.x cannot reliably do multiselect in same dialog
        
        var disallow = false;
        if (checkIt('firefox')) {
            // Firefox Mac or some other browser pretending
            disallow = parseFloat($.browser.version) < 5 && !canChunk;
        } 
        else if (checkIt('safari') && !checkIt('chrome')) {
            disallow = checkIt('version/4') || checkIt('version/3');
        } 
        else if (checkIt('chrome')) {
            disallow = parseFloat($.browser.version) < 5;
        }
        return !disallow && (canChunk || canMultiUpload);
    }
    
    this.init = function(options) {
        if (options) {
            this.settings = $.extend({}, defaults, options);
        }
        
        var browserAllowed = this.checkHtml5();
        
        if (this.settings.debug) {
            displayMessage("HTML5 Uploader Debug", "User Agent: " + window.navigator.userAgent + "</br>" + 
            "Can Upload? " + canUpload + " Can Chunk? " + canChunk + " Can MultiPart? " + canMultiUpload + " Can Drag? " + canDrag);
        }
        
        if (browserAllowed) {
            if (this.settings.showOverwriteOption) {
                $('#html5Overwrite').show();
            }
            if (this.settings.showNotificationOption) {
                $('#html5Notify').show();
            }
            
            utilDiv = $('<div />');
            
            dropTarget = $('.addfile').addClass('loaded');
            if (canDrag) {
                dropTarget[0].addEventListener("dragenter", drag.enter, false);
                dropTarget[0].addEventListener("dragover", drag.over, false);
                dropTarget[0].addEventListener("drop", drag.drop, false);
                $('.canDrag').removeClass('hidden');
            }
            
            if (canResume) {
                links = $('#uploadprogress .lowerLinks').prepend('<a href="#" class="pauseBtn commonOp" data-command="upload-pause" style="margin-right: 10px;">pause</a>');
            }
            var fInput = $('#fileInput');
            fInput.change(function(event) {
                if (event.target.files) {
                    that.fileAdd(null, event.target.files);
                }
                $(this).val('');
            });
            
            if (!canMultiSel) {
                fInput.removeAttr('multiple');
                $('.canMultiSel').addClass('hidden');
                $('.noMultiSel').removeClass('hidden');
            }
            
            uploadReq = new XMLHttpRequest();
            if (typeof uploadReq.upload !== 'undefined') {
                uploadReq.upload.addEventListener("progress", uploadEvt.progress, false);
            }
            uploadReq.addEventListener("load", uploadEvt.complete, false);
            uploadReq.addEventListener("error", uploadEvt.failed, false);
            uploadReq.addEventListener("abort", uploadEvt.cancelled, false);

            // This is a work-around for Safari occaisonally hanging when doing a
            // file upload.  For some reason, an additional HTTP request for a blank
            // page prior to sending the form will force Safari to work correctly.
            // http://www.deadmarshes.com/Blog/20110413023355.html
            if (!canChunk && canMultiUpload && checkIt('safari')) {
                $.get('blank.aspx');
            }
            
            hookAdd(uploadHooks);
            $('#sfhtml5').removeClass('vhidden');
            
            $(window).unload(function() {
                if (isUploading) {
                    try {
                        uploadReq.abort();
                    } 
                    catch (ex) {
                    }
                }
            });
            
            return true;
        } 
        else {
            return false;
        }
    };
}

var FileUpload = function(file) {
    this.name = '';
    this.ext = '';
    this.title;
    this.details = '';
    this.size;
    this.sizeBytes;
    this.fileRef;
    this.totalTransferred = 0;
    this.currentChunk;
    this.chunkSize = 0;
    this.lastChunkGet;
    this.chunkTransferred = 0;
    this.chunkIdx;
    this.lastRetry = 0;
    this.uploadID;
    this.status;
    this.chunkUrl = '';
    this.finishUrl = '';
    
    if (file) {
        this.name = file.name;
        this.title = file.name;
        this.sizeBytes = file.size;
        this.fileRef = file;
        
        var extArr = file.name.split('.');
        if (extArr.length > 1) {
            this.ext = extArr[extArr.length - 1].toLowerCase();
        }
        
        this.size = getFriendlyFileSize(this.sizeBytes);
    }
    
    this.getChunk = function(canChunk) {
        if (canChunk) {
            this.chunkSize = chunk.calcSize();
            
            var sliceFunc = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;
            
            if (this.fileRef.size - this.totalTransferred < this.chunkSize) {
                this.chunkSize = this.fileRef.size - this.totalTransferred;
                this.currentChunk = sliceFunc.call(this.fileRef, this.totalTransferred, this.fileRef.size);
            } 
            else {
                this.currentChunk = sliceFunc.call(this.fileRef, this.totalTransferred, this.totalTransferred + this.chunkSize);
            }
        } 
        else {
            this.chunkSize = this.sizeBytes;
            this.currentChunk = this.fileRef;
        }
        this.chunkTransferred = 0;
        if (this.chunkIdx === undefined) {
            this.chunkIdx = 0;
        } 
        else {
            this.chunkIdx++;
        }
    };
}, 

chunk = {
    lastCalc: null,
    size: 0,
    calcSize: function() {
        var oneMB = 1048576, 
        now = new Date(), 
        newSize = oneMB * 2;
        // First chunk; pick something safe.
        if (chunk.lastCalc !== null) {
            // Calculate bytes per minute at current rate
            var secElapsed = (now.valueOf() - chunk.lastCalc.valueOf()) / 1000, 
            bytesPerMin = Math.floor(chunk.size / secElapsed * 60);

            // Minimum chunk size of 1MB
            if (bytesPerMin < oneMB) {
                newSize = oneMB;
            } 
            // Max of 16MB
            else if (bytesPerMin > oneMB * 16) {
                newSize = oneMB * 16;
            } 
            else {
                newSize = bytesPerMin;
            }
        }
        chunk.size = newSize;
        chunk.lastCalc = now;
        console.log('New chunk size: ' + getFriendlyFileSize(newSize));
        return newSize;
    }
}, 

getFriendlyFileSize = function(sizeBytes, forceMB) {
    var tempSize = sizeBytes / 1024, 
    val = '';
    
    if (sizeBytes < 1024 && !forceMB) {
        val = Math.round(sizeBytes / 1024 * 10) / 10 + " KB";
    } 
    else if (tempSize < 1536 && !forceMB) {
        val = Math.round(tempSize) + " KB";
    } 
    else {
        val = Math.round(tempSize / 1024 * 100) / 100 + " MB";
    }
    return val;
}, 

hasConnection = function() {
    return window.navigator.onLine === undefined ? -1 : window.navigator.onLine;
};

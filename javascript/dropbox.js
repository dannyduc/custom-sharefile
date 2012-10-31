function Dropbox(memberEle, memberIdEle, dropdownEle, id, selectMethod, rootURL, creatorID) {
    this.id = id;
    this.dropboxMember = memberEle;
    this.dropboxMemberID = memberIdEle;
    this.dropboxDropDown = dropdownEle;
    this.validDropboxMember = false;
    this.memberValidiationPending = false;
    this.uploadContainer = null;
    this.selectMethod = selectMethod;
    this.onEmailValidated = function() {
    };
    this.uploaderLoaded = false;
    this.rootURL = rootURL;
    this.creatorID = creatorID;
    
    this.emailValidationComplete = function(data) {
        this.memberValidiationPending = false;
        if (data.error) {
            box.error("member", true);
        } 
        else {
            this.dropboxMemberID.val(data.value.id);
            this.updatePID(box.dropboxMemberID);
            this.validDropboxMember = true;
            setTimeout("box.onEmailValidated()", 800);
            setTimeout("box.showUploadContainer()", 800);
            this.setDropboxRecipientCookie(selectedEmail);
        }
    }
    this.validateEmail = function validiateEmail(selectedEmail, caller) {
        if (validateSingleEmailAddress(selectedEmail)) {
            this.memberValidiationPending = true;
            this.hideUploadContainer();
            box.clearErrors();
            var url = this.rootURL + 'rest/anon.aspx?op=validatefiledropmember&dropboxid=' + this.id + '&email=' + encodeURIComponent(selectedEmail) + '&fmt=jsonp&jsonp_callback=box.emailValidationComplete';
            $.ajax({
                type: 'GET',
                dataType: 'jsonp',
                url: url
            });
        } else {
            this.error("email", true);
        }
    }
    
    this.toggleError = function toggleError(on) {
        var objectToToggle = selectMethod === 'input' ? this.dropboxMember : this.dropboxDropDown;
        if (on) {
            objectToToggle.addClass("error");
            objectToToggle.focus();
        } 
        else
            objectToToggle.removeClass("error");
    }
    
    this.toggleInvalidMember = function toggleInvalidMember(show) {
        if (show) {
            $("#invalidMember").css('display', 'block');
        } 
        else {
            $("#invalidMember").css('display', 'none');
        }
    }
    
    this.toggleInvalidEmail = function toggleInvalidEmail(show) {
        if (show) {
            $("#invalidEmailFormat").css('display', 'block');
        } 
        else {
            $("#invalidEmailFormat").css('display', 'none');
        }
    }
    
    this.error = function error(type, show) {
        if (this.selectMethod === 'input') {
            if (type === "email") {
                this.toggleInvalidEmail(show);
                this.toggleInvalidMember(!show);
            } else {
                this.toggleInvalidMember(show);
                this.toggleInvalidEmail(!show);
            }
            
            this.hideUploadContainer();
        } 
        else {
            this.toggleInvalidMember(true);
        }
        
        this.toggleError(show);
        this.validDropboxMember = false;
    }
    
    this.giveFocus = function giveFocus() {
        if (this.selectMethod === 'select') {
            this.dropboxDropDown.focus();
        } 
        else
            this.dropboxMember.focus();
    }
    
    this.clearErrors = function clearErrors() {
        this.toggleInvalidMember(false);
        this.toggleInvalidEmail(false);
        this.toggleError(false);
    }
    
    this.isValidDropboxMember = function isValidDropboxMember() {
        if (this.memberValidiationPending) {
            setTimeout("box.isValidDropboxMember()", 500);
        }
        return this.validDropboxMember;
    }
    
    this.updatePID = function updatePID(ele) {
        if (this.creatorID != '')
            $('#PID').val($('#OriginalPID').val() + "/" + ele.val() + "/" + this.creatorID);
        else
            $('#PID').val($('#OriginalPID').val() + "/" + ele.val());
    }
    
    this.setUploadContainer = function setUploadContainer(id) {
        this.uploadContainer = $('#' + id);
    
    }
    
    this.hideUploadContainer = function hideUploadContainer() {
        this.uploadContainer.css('display', 'none');
    }
    
    this.showUploadContainer = function showUploadContainer() {
        this.uploadContainer.css('display', 'block');
    }
    
    this.setDropboxRecipientCookie = function setDropboxRecipientCookie(val) {
        var isSecure = document.location.href.indexOf('https://') == 0 ? '; secure' : '', 
        name = "DropboxRecipient", 
        date = new Date();
        date.setTime(date.getTime() + (1000 * 60 * 10));
        var expires = "; expires=" + date.toGMTString();
        document.cookie = name + "=" + val + expires + isSecure + "; path=/";
    }
    
    this.onDropDownChange = function onDropDownChange() {
        if (this.dropboxDropDown.val() != '' && this.dropboxDropDown.val() != 'none') {
            this.dropboxDropDown.removeClass('error');
            this.validDropboxMember = true;
            this.updatePID(this.dropboxDropDown);
            this.setDropboxRecipientCookie(this.dropboxDropDown.val());
            this.toggleInvalidMember(false);
        } 
        else {
            this.error('', true);
        }
    }
    
    this.onSendToChange = function onSendToChange() {
        this.validateEmail(this.dropboxMember.val(), this.dropboxMemberID);
        if (this.isValidDropboxMember()) {
            this.updatePID(this.dropboxMemberID);
        }
    }
}

function readyForUpload(undefined) {
    if (box == undefined)
        return true;
    var result = box.isValidDropboxMember();
    if (!result) {
        box.error("member", true);
    }
    return result;
}

function getPID() {
    return $("#PID").val();
}

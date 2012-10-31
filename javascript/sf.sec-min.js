;
"undefined" === typeof SF && (SF = {});
"undefined" === typeof SF.Sec && (SF.Sec = {});
SF.Sec.SessionActivity = function(a) {
    this.checkRef = null;
    this.interactiveMode = this.userActivityEvBound = false;
    this.activeUntil = "ActiveUntil";
    this.currentActiveUntil = 0;
    this.defaults = {timeoutMins: 15,checkIntvSec: 300,keepAlive: false,allowInteractive: true,passive: false};
    this.settings = $.extend(this.defaults, a);
    this.settings.checkIntvSec = Math.min(this.settings.checkIntvSec, this.settings.timeoutMins * 10)
};
SF.Sec.SessionActivity.prototype.resetSessionActive = function() {
    createCookie(this.activeUntil, null, "0")
};
SF.Sec.SessionActivity.prototype.isSessionActive = function() {
    var a = Number(readCookie(this.activeUntil));
    a || (a = this.markActive());
    var b = (new Date).valueOf() < a;
    this.currentActiveUntil = a;
    return b
};
SF.Sec.SessionActivity.prototype.getWarningThresholdSec = function() {
    if (!this.settings.passive && this.settings.allowInteractive) {
        var a = 330;
        this.settings.timeoutMins < 3 ? a = this.settings.timeoutMins * 60 / 2 : this.settings.timeoutMins < 15 && (a = this.settings.timeoutMins * 60 / 3);
        return a
    }
    return 0
};
SF.Sec.SessionActivity.prototype.userActivityEv = function() {
    this.userActivityEvBound = false;
    $(document).unbind(".activeTrack");
    if (this.isSessionActive())
        if (this.interactiveMode) {
            var a = this.currentActiveUntil - (new Date).valueOf(), b = this.getWarningThresholdSec() * 1E3;
            a > b && this.doActivityCheck()
        } else
            this.markActive()
};
SF.Sec.SessionActivity.prototype.markActive = function() {
    var a = (new Date).valueOf() + this.settings.timeoutMins * 6E4;
    this.currentActiveUntil = a;
    createCookie(this.activeUntil, null, a);
    return a
};
SF.Sec.SessionActivity.prototype.setNextCheck = function(a) {
    var a = a || this.settings.checkIntvSec, b = this;
    if (!this.settings.keepAlive && !this.userActivityEvBound) {
        $(document).bind("mouseover.activeTrack click.activeTrack keydown.activeTrack touchstart.activeTrack", function(a) {
            b.userActivityEv(a)
        });
        this.userActivityEvBound = true
    }
    this.checkRef && clearTimeout(this.checkRef);
    this.checkRef = setTimeout(function() {
        b.doActivityCheck()
    }, a * 1E3)
};
SF.Sec.SessionActivity.prototype.doActivityCheck = function() {
    if (this.isSessionActive()) {
        this.settings.keepAlive && this.markActive();
        var a = (this.currentActiveUntil - (new Date).valueOf()) / 1E3, b = Math.min(a, this.settings.checkIntvSec), c = this.getWarningThresholdSec();
        if (c)
            if (a < c) {
                b = Math.min(b, 60);
                this.showWarning()
            } else
                this.hideWarning();
        this.setNextCheck(b)
    } else {
        this.settings.passive || loadPage("/logout.aspx?inactivity=true");
        this.setNextCheck()
    }
};
SF.Sec.SessionActivity.prototype.showWarning = function() {
    if ($.alerts) {
        this.interactiveMode = true;
        var a = this, b = Math.floor((this.currentActiveUntil - (new Date).valueOf()) / 1E3 / 60);
        jAlertC("Your session will be logged out in " + (b == 0 ? "less than a minute" : b == 1 ? "about a minute" : b + " minutes") + " due to inactivity. Do you <br />wish to remain logged in?", "Session Inactivity", "errorIcon", true, '<input type="button" value="Keep me logged in" id="popup_ok" class="popup_ok" />', function() {
            a.hideWarning()
        })
    }
};
SF.Sec.SessionActivity.prototype.hideWarning = function() {
    if (this.interactiveMode) {
        $.alerts._hide();
        this.interactiveMode = false;
        this.userActivityEv()
    }
};
SF.Sec.SessionActivity.prototype.enabled = function(a) {
    if (a && this.settings.timeoutMins > 0)
        this.doActivityCheck();
    else if (this.checkRef) {
        clearTimeout(this.checkRef);
        this.checkRef = null
    }
};

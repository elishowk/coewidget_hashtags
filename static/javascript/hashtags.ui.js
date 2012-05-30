/**
*  Hashtags implements video deep-tagging for a ucengine client
*  Inspired by the chat wigdet, and depending on the video player widget
*  depends :
*  * underscore.js
*  * ucewidget.js
*  * jqueryUI
*
*  Copyright (C) 2011 CommOnEcoute,
*  maintained by Elias Showk <elias.showk@gmail.com>
*  source code at https://github.com/CommOnEcoute/ucengine-widgets
*   
*   Hashtags widget is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   Hashtags is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with the source code.  If not, see <http://www.gnu.org/licenses/>.
*/

(function($) {

if (typeof $.uce === 'undefined') { $.uce = {}; }
$.uce.Hashtags = function(){};
$.uce.Hashtags.prototype = {
    options: {
        ucemeeting: null,
        uceclient: null,
        userCanDelete: false,
        videotagcache: $('#videoticker'),
        lang: "any",
        currentFilter: {
            "name": "all",
            "type": "any",
            "language": "any"
        }
    },

    /*
     * UCEngine events listening
     */
    meetingsEvents: {
        //"twitter.tweet.new"      : "_handleTweet",
        //"twitter.tweet.delete"      : "_handleDeleteTweet",
        //"twitter.hashtag.delete"   : "_handleDeleteHashtag",
        //"twitter.hashtag.add": "_handleAddHashtag",
        "message.hashtag.delete"   : "_handleDeleteHashtag",
        "message.hashtag.add": "_handleAddHashtag",
        "videotag.message.dispatch" : "_handleDispatchRefresh"

    },
    /*
     * UI initialize
     */
    _create: function() {
        // filters a current or default "all" message channel
        if (this.options.currentFilter !== undefined) {
            this.filterMessages(this.options.currentFilter.name, this.options.currentFilter.type, this.options.currentFilter.language);
        } else {
            this.filterMessages('all', "text", this.options.lang);
        }
        //this._prependReset();
    },

    /**
     * TODO UCEngine Events callbacks
    */
    _handleTweet: function(event) {
    },
    /**
     * TODO UCEngine Events callbacks
    */
    _handleDeleteTweet: function(event) {
        /*var parent = $('#'+event.metadata.parent);
        if (parent.length > 0) {
            parent.remove();
        } else {
            // delete event arrived before creattion event, lets create a temporary element
            this.messages.append(
                $('<div>').attr({'id': event.metadata.parent}).addClass('ui-hashtags-tweet').hide()
            );
        }*/
    },
   
    /*
     * Handles newly pushed message's hashtags
     * keeps a filter valid
     */
    _handleDispatchRefresh: function(event) {
        this.filterMessages(this.options.currentFilter.name, this.options.currentFilter.type, this.options.currentFilter.language);
    },

    /*
     * decrements a hashtag selector
     */
    _handleDeleteHashtag: function(event) {
        if (event.metadata.hashtag === undefined || event.metadata.lang === undefined) {
            //console.error("hashtag not well formed");
            return;
        }
        this._decrementSelector(event.metadata.hashtag, 'hashtag', event.metadata.lang);
    },

    /*
     * Creates hashtags's selectors if necessary
     */
    _handleAddHashtag: function(event) {
        if (event.metadata.hashtag === undefined || event.metadata.lang === undefined) {
            //console.error("hashtag not well formed");
            return;
        }
        // creates hashtag selectors
        this.addSelector(event.metadata.hashtag, 'hashtag', event.metadata.lang);
    },

    /*
     * OBSOLETE
     */
    _prependReset: function() {
        /*if($(".ui-hashtags-reset").length===0) {
            this.element.prepend($('<button class="ui-hashtags-reset" title="Reset filtering">RESET</button>').hide()); 
            var that = this;
            $('.ui-hashtags-reset').button({
                    icons: {primary: "ui-icon-refresh"},
                    text: true
                }).click(function(e) {
                    that.filterMessages("all", "text", that.options.lang);
                    that.options.currentFilter = {
                        name: "all",
                        type: "text",
                        language: that.options.lang
                    };
                    $(".ui-hashtags-selector").removeClass('ui-state-active');
                    $(".ui-hashtags-reset").hide();
            }); 
        }*/
    },  

    /*
     * Returns the unique hashtag button ID
     */
    getSelectorId: function(name,type,language) {
        var id = name + type +  language;
        return id.replace(/\#|\./,"");
    },

    /**
     * Filtering functions
     */
    addSelector: function(name, type, language) {
        var id = this.getSelectorId(name, type, language);
        if($("#"+id).length > 0) {
            var count = $("#"+id).data("count") + 1;
            $("#"+id).data("count", count);
            return;
        }
        var that = this;
        var text = $('<a>')
            .attr('id', id)
			.data("count", 1)
            .attr('title', name)
            .addClass("ui-hashtags-selector")
            //.button({'text': true, 'label': name})
            .click(function() {
                $(".ui-hashtags-selector").removeClass('ui-state-active');
                $(this).addClass('ui-state-active');
                that.filterMessages(name, type, language);
                $(".ui-hashtags-reset").show();
            })
            .appendTo(this.element);
    },

    _decrementSelector: function(name, type, language) {
        var id = this.getSelectorId(name, type, language);
        if($("#"+id).length > 0) {
            var count = $("#"+id).data("count") - 1;
            if(count > 1) {
                $("#"+id).data("count", count);
            } else { 
                $("#"+id).remove();
            }
            return;
        }
        if($('.ui-hashtags-selector').length===0) {
            $(".ui-hashtags-reset").hide();
        } else {
            $(".ui-hashtags-reset").show();
        }
    },

    filterMessages: function(name, type, language) {
        this.options.currentFilter = {
            'name': name,
            'type': type,
            'language': language
        };
        if (name == "all") {
            var that = this;
            $('.ui-videotag-message').each(function(elt){
                if( that.options.videotagcache.data($(this).attr('evtid')) !== undefined) {
                    that.showMessage(this);
                }
            });
            return;
        }
        switch (type) {
            case 'hashtag':
                this.filterHashtag(name);
                break;
            case 'text':
                break;
            case 'useruid':
                this.filterUserUid(name);
                break;
            case 'id':
                this.filterId(name);
                break;
            default:
                break;
        }
    },
    _sortHashtags: function() {
        var bt = this.element.find(".ui-hashtags-selector");
        var newbt = bt.sort(function(a, b){
            vala = parseInt(a.getAttribute("data-count"), 10);
            valb = parseInt(b.getAttribute("data-count"), 10);
            if(vala > valb) {
                return -1;
            } else if (vala < valb) {
                return 1;
            } else {
                return 0;
            }
        });
        if(newbt.length>0) {
            newbt.slice(0, 4).show();
            newbt.slice(5).hide();
            this.element.empty().append(newbt);
        }
    },
    filterId: function(query) {
        var that = this;
        $('.ui-videotag-message').each(function(elt){
            var data = that.options.videotagcache.data($(this).attr('evtid'));
            if( data.id == query ) {
                that.showMessage(this);
            } else {
                that.hideMessage(this);
            }
        });
    },
    
    filterUserUid: function(query) { 
        var that = this;
        $('.ui-videotag-message').each(function(elt){
            var data = that.options.videotagcache.data($(this).attr('evtid'));
            if( data.from == query ) {
                that.showMessage(this);
            } else {
                that.hideMessage(this);
            }
        });
    },

    filterHashtag: function(query) { 
        var that = this;
        $('.ui-videotag-message').each(function(elt){
            var data = that.options.videotagcache.data($(this).attr('evtid'));
            that.hideMessage(this);
            if (data===undefined || data === null) {
                return;
            }
            if(data.metadata && data.metadata.hashtag) {
                if( _.include(data.metadata.hashtag, query) ) {
                    that.showMessage(this);
                }
            }
        });
    },

    showMessage: function(elt) {
        $(elt).removeClass('ui-videotag-filtered');
        $(elt).show(); 
    },

    hideMessage: function(elt) {
        $(elt).hide();
        $(elt).addClass('ui-videotag-filtered');
    },
 
    clear: function() {
        this.element.empty();
    },

    destroy: function() {
        this.element.find('*').remove();
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
    }

};
if($.uce.widget!==undefined) {
    $.uce.widget("hashtags", new $.uce.Hashtags());
}

})($);

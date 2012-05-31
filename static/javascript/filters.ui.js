/**
*  Filters implements video deep-tagging for a ucengine client
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
*   Filters widget is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   Filters is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with the source code.  If not, see <http://www.gnu.org/licenses/>.
*/

(function($) {

if (typeof $.uce === 'undefined') { $.uce = {}; }
$.uce.Filters = function(){};
$.uce.Filters.prototype = {
    options: {
        ucemeeting: null,
        uceclient: null,
        videotagcache: $('#videoticker'),
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
        "videotag.message.dispatch" : "_handleDispatchRefresh"

    },
    /*
     * UI initialize
     */
    _create: function() {

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
    $.uce.widget("filters", new $.uce.Filters());
}

})($);

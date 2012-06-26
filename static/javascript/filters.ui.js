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
        hashtags_selected: [],
        users_selected: []
    },

    /*
     * UCEngine events listening
     */
    meetingsEvents: {
        // TOO SLOW "videotag.message.postdispatch" : "_handleNewMessageToFilter"
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
    },
   
    /*
     * Handles newly pushed message's hashtags
     * keeps a filter valid
     */
    _handleNewMessageToFilter: function(event) {
        // TODO without slowing everything on load
        // this.filterOneMessage(event.metadata.element);
    },
    
    _hideFilterlist: function() {
        $(".video-comments-filters").hide();
        $("#video-comments.video-comments-w-filters").removeClass("video-comments-w-filters-shown");
    },
    
    _showFilterlist: function() {
        $(".video-comments-filters").show();
        $("#video-comments.video-comments-w-filters").addClass("video-comments-w-filters-shown");
    },

    _addItem: function(list, item) {
        list.push(item);
        return list;
    },
    
    _removeItem: function(list, item) {
        return list = jQuery.grep(list, function(value) {
          return value != item;
        });
    },
    
    _refreshTicker: function(name, type, language, list, selected_list) {
        var that = this;
        if (type==="hashtag"){
            list.find("#"+name+"hashtagany a").removeClass("active");
            selected_list.find("#"+name+"hashtagany").remove();
        }
        else if (type==="useruid"){
            list.find("#"+name+" a").removeClass("active");
            selected_list.find("#"+name).remove();
        }
        that.filterMessagesAdvanced(false, name, type, language);
        if(selected_list.parent().find('li a').text() === ""){
            that._hideFilterlist();
        }
    },
    
    filterMessagesAdvanced: function(added, name, type, language) {
        // On trie suivant le type pour supprimer ou ajouter l'user/hashtag
        if (type === 'hashtag'){
            if (added) {
                this.options.hashtags_selected = this._addItem(this.options.hashtags_selected, name)
            }
            else {
                this.options.hashtags_selected = this._removeItem(this.options.hashtags_selected, name)
            }
        }
        else if (type === 'useruid'){
            if (added) {
                this.options.users_selected = this._addItem(this.options.users_selected, name)
            }
            else {
                this.options.users_selected = this._removeItem(this.options.users_selected, name)
            }
        }
        this.filterMessages();
    },

    filterMessages: function() {
        // si les tableaux sont nuls -> tout les messages sont sélectionnés
        if ((this.options.hashtags_selected.length===0) && (this.options.users_selected.length===0)) {
            $('.ui-videotag-message').addClass('ui-videotag-selected').show();
            return;
        }
        var that = this;
        // on cache tout les messages qui ne sont pas sélectionnés
        $('.ui-videotag-message').each(function(){
            that.filterOneMessage($(this));
        });
    },

    /*
     * Hide or Show a message
     * 1- on supprime toutes les classes 'ui-videotag-selected'.
     * 2- on parcourt le tableaux des hashtags
     * 3- on parcourt le tableaux des users
    */
    filterOneMessage: function(jqElt) {
        jqElt.removeClass('ui-videotag-selected');
        for (var i=0;i<this.options.hashtags_selected.length;i++){
            this.filterHashtag(this.options.hashtags_selected[i],jqElt);
        }
        for (var i=0;i<this.options.users_selected.length;i++){
            this.filterUserUid(this.options.users_selected[i], jqElt);
        } 
        if(jqElt.hasClass('ui-videotag-selected')){
            jqElt.show();
        } else {
            jqElt.hide();
        }
    },

    filterUserUid: function(query, jqElt) { 
        var data = this.options.videotagcache.data(jqElt.attr('evtid'));
        if( data.from == query ) {
            jqElt.addClass('ui-videotag-selected');
        } 
    },

    filterHashtag: function(query, jqElt) { 
        var data = this.options.videotagcache.data(jqElt.attr('evtid'));
        if (data===undefined || data === null) {
            return;
        }
        if(data.metadata && data.metadata.hashtag) {
            if( _.include(data.metadata.hashtag, query) ) {
                jqElt.addClass('ui-videotag-selected');
            }
        }
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

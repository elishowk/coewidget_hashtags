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
        filters: $('#filters'),
        currentFilter: {
            "name": "all",
            "type": "any",
            "language": "any"
        },
        //top_hashtags: $('#hashtags .hashtags-list.hashtags-list-pop'),
        hashtags_list: $('#hashtags .hashtags-list'),
        selected_list : $(".selected-hashtags-list")
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
            this.options.filters.data('filters').filterMessages(this.options.currentFilter.name, this.options.currentFilter.type, this.options.currentFilter.language);
        } else {
            this.options.filters.data('filters').filterMessages('all', "text", this.options.lang);
        }
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
        this.options.filters.data('filters').filterMessages(this.options.currentFilter.name, this.options.currentFilter.type, this.options.currentFilter.language);
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
        var link = $('<a>')
            .attr("href", "#")
            .append(name);
        var item = $('<li>')
            .attr('id', id)
            .append(link)
            .data("count", 1)
            .click(function(evt) {
                evt.preventDefault();
				// on vérifie si l'item est actif -> dans ce cas on le 'désactive'
                if(item.find('a').hasClass('active')){
                    that.options.filters.data('filters')._refreshTicker(name, type, language, that.options.hashtags_list , that.options.selected_list);
                }
				// sinon on l'ajoute
                else {
                    that.options.filters.data('filters').filterMessagesAdvanced(true, name, type, language);
                    $(this).find('a').addClass('active');
					// on créé un clone dans la zone de filtres
                    $(this).clone().appendTo(that.options.selected_list).addClass('clone').click(function(evt) {
                        evt.preventDefault();
                        that.options.filters.data('filters')._refreshTicker(name, type, language, that.options.hashtags_list , that.options.selected_list);
                    });
					// on change d'onglet
					var $nav   = $('#player-aside-nav'),
						$links = $nav.find('a'),
						$tabs  = $('div.player-aside-box-tab'),
						box  = "videoticker-comments";
							
					$links.removeClass('active');
					$links.filter("[data-nav='"+box+"']").addClass('active');
					
					$tabs.addClass('hide');
					$('div.'+box).removeClass('hide');
                }
            });
        item.appendTo(this.options.hashtags_list);
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
        /*if($('.ui-hashtags-selector').length===0) {
            $(".ui-hashtags-reset").hide();
        } else {
            $(".ui-hashtags-reset").show();
        }*/
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
    
    clear: function() {
        this.options.hashtags_list.empty();
    },

    destroy: function() {
        this.options.hashtags_list.find('*').remove();
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
    }

};
if($.uce.widget!==undefined) {
    $.uce.widget("hashtags", new $.uce.Hashtags());
}

})($);

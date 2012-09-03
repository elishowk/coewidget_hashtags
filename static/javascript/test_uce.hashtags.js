module("uce.hashtags", {});

Factories.addHashtagEvent = function(hashtag) {
    return {
        datetime: Date.now(),
		domain: "localhost",
		from: "39255051546791297315043819510064",
		id: (Date.now()+Math.random()*2000).toFixed(0).toString(),
		location: "demo5",
		metadata: {
			hashtag: "#"+hashtag,
			lang: "any",
		},
		type: "message.hashtag.add"
    };
}

Factories.deleteHashtagEvent = function(from) {
    return {
        type: "message.hashtag.delete",
        from: from
    };
}

// we go on the roster tab
$('#player-aside-nav [data-nav="videoticker-hashtags"]').click();

test("Add & Delete Hashtag", function() {
    expect(7);
    // Initialize
	var hashtag = "Supertest";
	var MockEvent = Factories.addHashtagEvent(hashtag)
    var id = $("#hashtags").data('hashtags').getSelectorId(MockEvent.metadata.hashtag, "hashtag", MockEvent.metadata.lang);
    // Adding an hashtag
    $("#hashtags").data('hashtags')._handleAddHashtag(MockEvent);
    equal($("#"+id).length > 0, true, "Hashtag added");
    notEqual($("#"+id).find('a').text().length, 0, "Hashtag has text");
    equal($("#"+id).find('a').text()=== MockEvent.metadata.hashtag, true, "Hashtag has good text");
    equal($("#"+id).data("count") === 1, true, "Hashtag counted");
    $("#hashtags").data('hashtags')._handleAddHashtag(MockEvent);
    equal($("#"+id).data("count") === 2, true, "Same hashtag added");
    // Deleting an hashtag
    $("#hashtags").data('hashtags')._handleDeleteHashtag(MockEvent);
    equal($("#"+id).data("count") > 0, true, "One hashtag successfully suppressed");
    $("#hashtags").data('hashtags')._handleDeleteHashtag(MockEvent);
    equal($("#"+id).length === 0, true, "No Hashtag Left")
});

test("Click test for Hashtag", function() {
    expect(10);
    // Initialize
	var hashtag = "Supertest2";
	var MockEvent = Factories.addHashtagEvent(hashtag)
    var id = $("#hashtags").data('hashtags').getSelectorId(MockEvent.metadata.hashtag, "hashtag", MockEvent.metadata.lang);
    $("#hashtags").data('hashtags').addSelector(MockEvent.metadata.hashtag, "hashtag", MockEvent.metadata.lang);
    // Filtering
    $("#"+id).trigger('click');
    equal($('#player-aside-nav [data-nav="videoticker-comments"]').hasClass("active"), true, "Tab switched (hashtag tab active)");
    equal($('#player-aside-nav [data-nav="videoticker-hashtags"]').hasClass("active"), false, "Tab switched (roster tab not active)");
    equal($(".clone[id='"+id+"']").length, 1, "Clone of selected user exist");
    notEqual($(".clone[id='"+id+"']").find('a').text().length, 0, "Clone has text");
    equal($(".clone[id='"+id+"']").find('a').text()=== MockEvent.metadata.hashtag, true, "Clone has good text");
    equal($("#"+id).find('a').hasClass("active"), true, "Hashtag has css 'active'");
    // Unfiltering (clone click)
    $(".clone[id='"+id+"']").trigger('click');    
    notEqual($(".clone[id='"+id+"']").length, 1, "Clone of selected hashtag is well suppressed after click on clone hashtag");
    notEqual($("#"+id).find('a').hasClass("active"), true, "Hashtag has not css 'active' (after a click on clone hashtag)");
    // Filtering again
    $("#"+id).trigger('click');
    // Unfiltering again (hashtag click)
    $("#"+id).trigger('click');
    notEqual($(".clone[id='"+id+"']").length, 1, "Clone of selected hashtag is well suppressed after click on selected hashtag");
    notEqual($("#"+id).find('a').hasClass("active"), true, "Hashtag has not css 'active' (after a click on selected hashtag)");
    $("#"+id).remove();
});
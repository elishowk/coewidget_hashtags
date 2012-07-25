module("uce.hashtags", {});

var MockEvent = {
    datetime: 1338893773158,
    domain: "localhost",
    from: "39255051546791297315043819510064",
    id: "18888504972920958972084000340434",
    location: "demo5",
    metadata: {
        hashtag: "#hashtagtest",
        lang: "any",
    },
    type: "message.hashtag.add"
};

var MockUser = {
    auth: "password",
    domain: "localhost",
    metadata: {
        first_name: "Ultra",
        groups: "participant",
        id: "101",
        is_active: "true",
        is_staff: "false",
        is_superuser: "false",
        language: "fr",
        last_name: "Cool",
        md5: "c1b1d75b5f12ba49f6ec6228db754984",
        ucengine_uid: "18888444472920958972084000340434",
        user_id: "101",
        username: "QunitUser"
    },
    name: "QunitUser",
    uid: "18888444472920958972084000340434",
    visible: true
};

if (Factories===undefined) {
    var Factories = {};
}

Factories.addHashtagEvent = function(from) {
    return {
        type: "message.hashtag.add",
        from: from
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
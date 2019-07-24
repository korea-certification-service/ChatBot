const $content = $("#content");
const $iptChat = $("#iptChat");
const $btnSend = $("#btnSend");

$btnSend.bind("click", (e) => {
    let val = $iptChat.val();

    addChat("사용자","my_id", "my_speech", val);

    $.ajax({
        method: "POST",
        url: "http://localhost:3000/sentence",
        data: {"text": val}
    }).done(data => {
        console.log(data);
        addChat("챗봇","mach_id", "mach_speech", data);
        $content.scrollTop($content[0].scrollHeight);
    }).fail(fail => {
        console.log(fail);
    });

    $iptChat.val("");
    $btnSend.attr("disabled", "true");  
});

function addChat(who, foo_id, foo_speech, text) {
    let userChat = '<div class="chat-wrap">'+
                        '<em class="'+foo_id+'">'+who+'</em>'+
                        '<div class="bubble '+foo_speech+'"><p>'+text+'</p></div>'+
                    '</div>'
    $content.append(userChat);
}
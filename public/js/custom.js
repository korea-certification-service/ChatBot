var chatUI = {
    isDim: false,
    init: function() {
        this.fnAt();
        this.orientationchange();
        this.sendMsg();
        this.onSend();
    },
    fnAt: function() {
        var that = this;

        function hideDim() {
            that.isDim = false;
            document.getElementById("atSec").style.display="none";
            document.getElementById("chatDim").style.display="none";  
        }

        function showDim() {
            that.isDim = true;
            document.getElementById("atSec").style.display="block";
            document.getElementById("chatDim").style.display="block";
        }

        document.getElementById("btnAt").addEventListener("click", function(){
            showDim();
        });

        document.getElementById("chatWrap").addEventListener("click", function(e){
            if(e.target.id === "chatDim" && that.isDim){
                hideDim();
            }
        });

        var machCmd = document.querySelectorAll(".at_sec .machCmd");
        var iptChat = document.getElementById("iptChat");
        for (var i = 0; i < machCmd.length; i++) {
            machCmd[i].addEventListener("click", function(e){
                //console.log(e.target.innerText);
                iptChat.value = "";
                iptChat.value = e.target.innerText;
                hideDim();
                // 여기서 메세지 입력되면 됨
            });
        }
    },
    orientationchange: function() {
        window.addEventListener("orientationchange", function() {
            // window.orientation: 90 가로, 0 세로
            document.getElementById("content").addEventListener("click", function(){
                document.getElementById("chatDim").focus();
            });
        });        
    },
    sendMsg: function() {

    },
    onSend: function () {

        var btnSend = document.getElementById("btnSend");
        var iptChat = document.getElementById("iptChat");

        iptChat.addEventListener("input", function(e){
            btnOnOff(e);
        });
        btnSend.addEventListener("click", function(e){
            btnOnOff(e);
        });

        function btnOnOff(e){
            var val = e.currentTarget.value;
            if(val != "") {
                btnSend.style.backgroundColor = "#54a0ff";
                btnSend.style.color = "#fff";
                btnSend.removeAttribute("disabled");
            } else if(val == ""){
                btnSend.style.backgroundColor = "#fff";
                btnSend.style.color = "#9c9c9c";
                btnSend.setAttribute("disabled", "true");
            }
        }
    }
}    
chatUI.init();
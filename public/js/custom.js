var chatUI = {
    isDim: false,
    init: function() {
        this.fnAt();
        this.orientationchange();
    },
    fnAt: function() {
        var that = this;
        var count = 1;

        function hideDim() {
            document.getElementById("atSec").style.display="none";
            document.getElementById("curtain").style.display="none"; 
        }

        function showDim() {
            document.getElementById("atSec").style.display="block";
            document.getElementById("curtain").style.display="block";
        }

        // document.getElementById("chatWrap").addEventListener("click", function(e){
        //     //alert("준비중입니다.");
        //     console.log(e.target);
        //     if(e.target.id === "btnAt" || e.target.classList[1] === "fa-hashtag" || e.target.id === "curtain") {
        //         if(count > 0) {
        //             showDim()
        //         } else if (count < 0) {
        //             hideDim();
        //         }
        //         count *= -1;
        //     }
        // });

        var machCmd = document.querySelectorAll(".at_sec .machCmd");
        var iptChat = document.getElementById("iptChat");
        for (var i = 0; i < machCmd.length; i++) {
            machCmd[i].addEventListener("click", function(e){
                //console.log(e.target.innerText);
                iptChat.value = "";
                iptChat.value = e.target.innerText;
                hideDim();
                count = 1;
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
    }
}    
chatUI.init();
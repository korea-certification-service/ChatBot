module.exports = (app) => {
    let request = require('request-promise-native');

    //챗봇 화면 랜더링
    app.get('/', (req, res) => {

        if(!req.query.loginToken) {
            res.render("notice.html");
        } else {
            res.render("index.html",{ userId: req.query.userId, loginToken: req.query.loginToken });
        }

        console.log(req.query);

    });

    //챗봇 응답 로직 api
    app.post('/logic', async (req, res) => {

        console.log(req.body); //클라이언트가 전달한 데이터 객체

        let uri = "http://localhost:6001";
        let userText = req.body.userText;//유저가 입력한 텍스트
        let userId = req.body.userId;//유저 아이디
        // let loginToken = req.body.loginToken;//유저의 로그인 토큰

        //기본 hitory객체 생성
        let history = new Object;
        history.user_id = userId;
        history.user_tag = null;
        history.input_text = userText;
        history.en_sentence = null;
        history.ko_sentence = null;
        history.input_code = null;
        history.bot_text = null;
        history.exception_text = null

        //1차 가공
        let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"| ]/gi;
        let input_text = userText.replace(regExp, "");
        console.log(`input_text => ${input_text}`);

        request({ 
            uri: `${uri}/sentence/get/detail`,
            method: 'GET',
            body: {"input_text": input_text},
            json: true
        })
        .then(data => { 
            console.log(`data => ${data}`);
            if(data == null) { //예상 질의와 일치하지 않는 경우

                //새로운 sentence 객체 생성
                let sentence = new Object;
                sentence.input_text = userText;
                sentence.en_sentence = null;
                sentence.ko_sentence = null;
                sentence.input_code = null;
                sentence.keyword = null;

                //2차 가공
                return request({
                    uri: "https://www.googleapis.com/language/translate/v2?key=AIzaSyC4zvHX4jW1BFgzeXObqDDOeGMFBHZgrlQ",
                    method: "POST",
                    qs: {
                        target: 'en',
                        format: 'html',
                        q: input_text
                    },
                })
                .then(data => {
                    let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
                    let en_sentence = JSON.parse(data).data.translations[0].translatedText.replace(regExp, "");
                    request({ 
                        uri: `${uri}/sentence/get/detail`,
                        method: 'GET',
                        body: {"en_sentence": en_sentence},
                        json: true
                    })
                    .then(data => {
                        console.log(data);
                        if(data == null) { //예상 질의와 일치하지 않는 경우
                            let input_code = Math.random().toString()+Date.now();
                            
                            sentence.input_text = userText;
                            sentence.en_sentence = en_sentence;
                            sentence.ko_sentence = null;
                            sentence.input_code = input_code;
                            sentence.keyword = en_sentence.split(' ');

                            history.user_id = userId;
                            history.user_tag = null;
                            history.input_text = userText;
                            history.en_sentence = en_sentence;
                            history.ko_sentence = null;
                            history.input_code = input_code;
                            history.bot_text = "2차 가공후 예상질의에 없어서 추가함";
                            history.exception_text = null;

                            save_sentence(uri, sentence);
                            // save_manage(uri, manage);
                            save_history(uri, history);
                            res.status(200).send("2차 가공후 예상질의에 없어서 추가함");

                            console.log(sentence);
                            console.log(history);
                            
                        } else { //예상 질의와 일치한 경우

                            return request({
                                uri: `${uri}/answer/get/detail`,
                                method: 'GET',
                                body: {
                                    "input_code": data.input_code
                                },
                                json: true  
                            })
                            .then(data => {
                                if(data == null) { //답변이 없는 경우
                                    let input_code = Math.random().toString()+Date.now();

                                    sentence.input_text = userText;
                                    sentence.en_sentence = en_sentence;
                                    sentence.ko_sentence = null;
                                    sentence.input_code = input_code;
                                    sentence.keyword = en_sentence.split(' ');
        
                                    history.user_id = userId;
                                    history.user_tag = null;
                                    history.input_text = userText;
                                    history.en_sentence = en_sentence;
                                    history.ko_sentence = null;
                                    history.input_code = input_code;
                                    history.bot_text = "2차 가공후 예상질의에는 있지만 답변이 존재하지않음";
                                    history.exception_text = null;
        
                                    save_sentence(uri, sentence);
                                    save_history(uri, history);

                                    res.status(200).send("2차 가공후 예상질의에는 있지만 답변이 존재하지않음");

                                } else { //답변이 있는 경우

                                    let input_code = data._id;

                                    sentence.input_text = userText;
                                    sentence.en_sentence = en_sentence;
                                    sentence.ko_sentence = null;
                                    sentence.input_code = input_code;
                                    sentence.keyword = en_sentence.split(' ');
        
                                    history.user_id = userId;
                                    history.user_tag = null;
                                    history.input_text = userText;
                                    history.en_sentence = en_sentence;
                                    history.ko_sentence = null;
                                    history.input_code = input_code;
                                    history.bot_text = data.answer_text_ko;
                                    history.exception_text = null;
        
                                    save_sentence(uri, sentence);
                                    save_history(uri, history);

                                    res.status(200).send(data.answer_text_ko);

                                }
                                
                            })

                        }

                    })
                })

            } else { //예상 질의와 일치한 경우

                return request({
                    uri: `${uri}/answer/get/detail`,
                    method: 'GET',
                    body: {
                        "input_code": data.input_code
                    },
                    json: true  
                })
                .then(data => {

                    if(data == null) { //예상 질의에 해당하는 답변이 없는경우

                        history.user_id = userId;
                        history.user_tag = null;
                        history.input_text = userText;
                        history.en_sentence = null;
                        history.ko_sentence = null;
                        history.input_code = null;
                        history.bot_text = "1차 가공후 예상질의에는 있지만 답변이 존재하지않음";
                        history.exception_text = null;

                        save_history(uri, history);
            
                        res.status(200).send("1차 가공후 예상질의에는 있지만 답변이 존재하지않음");//예외처리

                    } else { //예상 질의에 해당하는 답변이 있는 경우

                        let input_code =  data._id;
                    
                        history.user_id = userId;
                        history.user_tag = null;
                        history.input_text = userText;
                        history.en_sentence = null;
                        history.ko_sentence = null;
                        history.input_code = input_code;
                        history.bot_text = data.answer_text_ko;
                        history.exception_text = null;

                        save_history(uri, history);//[DB추가(History Collection)]
                    
                        res.status(200).send(data.answer_text_ko);//답변

                    }

                })

            }
        })
        .catch(err => {
            console.error(err);
        })

        // /////promise 분기 로직//////
        // //02.[DB매칭(Sentence Collection)] 사용자가 입력한 텍스트가 예상 질의에 있는지 탐색
        // await request({ 
        //     uri: `${uri}/sentence/get/detail`,
        //     method: 'GET',
        //     body: {"input_text": input_text},
        //     json: true
        // })
        // .then(data => { 
        //     step01_data = data;
        // })
        // .catch(err => {
        //     console.error(err);
        // })

        // //03.(NO) -> 예상 질의에 없는 경우 2차 가공 로직으로 이동
        // if(step01_data == null) { 
        //     //2차 가공 로직
        // }

        // //03.(YES) -> [DB매칭(Answer Collection)] 예상 질의에 해당하는 답변이 있는지 탐색
        // await request({
        //     uri: `${uri}/answer/get/detail`,
        //     method: 'GET',
        //     body: {"input_code": step01_data.input_code},
        //     json: true  
        // })
        // .then(data => {
        //     history.input_code = step01_data.input_code;//history 업데이트
        //     step02_data = data;
        // })
        // .catch(err => {
        //     console.error(err);
        // })

        // //04.(NO) -> 답변탐색 결과가 없는 경우 예외 처리
        // if(step02_data == null) { 
        //     history.exception_text = "DB에서 탐색한 예외문장 추가";//history 업데이트
        //     save_history(uri, history);//[DB추가(History Collection)]
   
        //     res.status(200).send("아직 못배운 말이에요");//예외처리
        //     return;
        // }
        
        // //04.(YES) -> 답변탐색 결과가 있는 경우 답변 출력
        // history.bot_text = step02_data.answer_text_ko;//history 업데이트
        // save_history(uri, history);//[DB추가(History Collection)]
    
        // res.status(200).send(step02_data.answer_text_ko);//답변처리



        //////////////////////로컬 함수 모음////////////////////////
        function save_history(uri, history) {
            request({
                uri: `${uri}/history/add`,
                method: 'POST',
                body: history,
                json: true   
            })
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            })
        }
        function save_sentence(uri, sentence) {
            request({
                uri: `${uri}/sentence/add`,
                method: 'POST',
                body: sentence,
                json: true   
            })
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            }) 
        }

        function save_manage(uri, manage) {
            request({
                uri: `${uri}/manage/add`,
                method: 'POST',
                body: manage,
                json: true   
            })
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            }) 
        }
    });

}
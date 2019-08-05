module.exports = (app) => {
    let request = require('request-promise-native');
    let config = require('../config/config');

    //챗봇 화면 랜더링
    app.get('/', (req, res) => {

        if(!req.query.loginToken) {
            res.render("notice.html");
        } else {
            res.render("index.html",{ userId: req.query.userId, loginToken: req.query.loginToken });
        }

        console.log(req.query);

    });

    app.get('/manage/:id', (req, res) => {
        if(req.params.id === "machadmin") {
            res.render("manage.html", {url: config.uri});
        } else {
            res.send("잘못된 요청");
        }
    })

    //챗봇 응답 로직 api
    app.post('/logic', async (req, res) => {

        console.log(req.body); //클라이언트가 전달한 데이터 객체

        let uri = config.uri;
        let userText = req.body.userText;//유저가 입력한 텍스트
        let userId = req.body.userId;//유저 아이디
        let country = req.body.country;//유저 국가 코드
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
        let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        let input_text = userText.replace(regExp, "").toLowerCase();
        console.log(`input_text => ${input_text}`);

        request({ 
            uri: `${uri}/sentence/get/detail`,
            method: 'GET',
            body: {"input_text": input_text},
            json: true
        })
        .then(data => { 
    
            if(data == null || data.length === 0) { //예상 질의와 일치하지 않는 경우
                console.log("1차 가공후 예상 질의와 일치하지 않는 경우");
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

                        if(data == null || data.length === 0) { //예상 질의와 일치하지 않는 경우
                            console.log("2차 가공후 예상 질의와 일치하지 않는 경우");
                            request({
                                uri: `${uri}/exception/get/detail`,
                                method: 'GET',
                                body: {
                                    "exception_code": "021"
                                },
                                json: true  
                            }).then(exception => {
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
                                if(country === "KR") {
                                    history.bot_text = exception.exception_text_ko;
                                } else if(country === "EN") {
                                    history.bot_text = exception.exception_text_en;
                                }
    
                                save_sentence(uri, sentence);
                                save_history(uri, history);
    
                                res.status(200).send(history.bot_text);

                            })
                            
                        } else { //예상 질의와 일치한 경우
                            console.log(data);
                            let currect_code =  data.input_code;

                            console.log("2차 가공후 예상 질의와 일치한 경우");
                            return request({
                                uri: `${uri}/answer/get/list`,
                                method: 'GET',
                                body: {
                                    "input_code": data.input_code
                                },
                                json: true  
                            })
                            .then(data => {
                                console.log(data);
                                if(data == null || data.length === 0) { //답변이 없는 경우
                                    console.log("2차 가공후 답변이 없는 경우");
                                    request({
                                        uri: `${uri}/exception/get/detail`,
                                        method: 'GET',
                                        body: {
                                            "exception_code": "02"
                                        },
                                        json: true  
                                    }).then(exception => {
                                        sentence.input_text = userText;
                                        sentence.en_sentence = en_sentence;
                                        sentence.ko_sentence = null;
                                        sentence.input_code = currect_code;
                                        sentence.keyword = en_sentence.split(' ');
            
                                        history.user_id = userId;
                                        history.user_tag = null;
                                        history.input_text = userText;
                                        history.en_sentence = en_sentence;
                                        history.ko_sentence = null;
                                        history.input_code = currect_code;
                                        if(country === "KR") {
                                            history.bot_text = exception.exception_text_ko;
                                        } else if(country === "EN") {
                                            history.bot_text = exception.exception_text_en;
                                        }

                                        save_sentence(uri, sentence);
                                        save_history(uri, history);
    
                                        res.status(200).send(history.bot_text);

                                    });

                                } else { //답변이 있는 경우
                                    console.log("2차 가공후 답변이 있는 경우")
                                    let randomAnswer = data[Math.floor(Math.random() * data.length)];
                                    let input_code = randomAnswer.input_code;

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
                                    history.bot_text = randomAnswer.answer_text_ko;
        
                                    save_sentence(uri, sentence);
                                    save_history(uri, history);

                                    res.status(200).send(randomAnswer.answer_text_ko);

                                }
                                
                            })

                        }

                    })
                })

            } else { //예상 질의와 일치한 경우
                console.log("1차 가공후 예상 질의와 일치한 경우");
                return request({
                    uri: `${uri}/answer/get/list`,
                    method: 'GET',
                    body: {
                        "input_code": data.input_code
                    },
                    json: true  
                })
                .then(data => {

                    if(data == null || data.length === 0) { //예상 질의에 해당하는 답변이 없는경우
                        console.log("1차 가공후 예상 질의에 해당하는 답변이 없는경우");
                        request({
                            uri: `${uri}/exception/get/detail`,
                            method: 'GET',
                            body: {
                                "exception_code": "01"
                            },
                            json: true  
                        }).then(exception => {

                            history.user_id = userId;
                            history.user_tag = null;
                            history.input_text = userText;
                            history.en_sentence = null;
                            history.ko_sentence = null;
                            history.input_code = null;
                            if(country === "KR") {
                                history.bot_text = exception.exception_text_ko;
                            } else if(country === "EN") {
                                history.bot_text = exception.exception_text_en;
                            }

                            save_history(uri, history);
                
                            res.status(200).send(history.bot_text);

                        });

                    } else { //예상 질의에 해당하는 답변이 있는 경우
                        console.log("1차 가공후 예상 질의에 해당하는 답변이 있는 경우");
                        let randomAnswer = data[Math.floor(Math.random() * data.length)];
                        let input_code =  randomAnswer.input_code;
                    
                        history.user_id = userId;
                        history.user_tag = null;
                        history.input_text = userText;
                        history.en_sentence = null;
                        history.ko_sentence = null;
                        history.input_code = input_code;
                        if(country === "KR") {
                            history.bot_text = randomAnswer.answer_text_ko;
                        } else if(country === "EN") {
                            history.bot_text = randomAnswer.answer_text_en;
                        }
                        
                        save_history(uri, history);//[DB추가(History Collection)]
                    
                        res.status(200).send(history.bot_text);//답변
                        //console.log(data);
                    }
                })

            }

        })
        .catch(err => {
            console.error(err);
        })


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
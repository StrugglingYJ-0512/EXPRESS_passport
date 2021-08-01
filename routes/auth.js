var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");
var sanitizeHtml = require("sanitize-html");
var template = require("../lib/template.js");

var authData = {
  email: "egoing777@gmail.com",
  password: "111111",
  nickname: "egoing",
};

router.get("/login", function (request, response) {
  var title = "WEB - login";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `
    <form action="/auth/login_process" method="post">
      <p><input type="text" name="email" placeholder="email"></p>
      <p><input type="password" name="pwd" placeholder="password"></p>
      <p>
        <input type="submit" value="login">
      </p>
    </form>
  `,
    ""
  );
  response.send(html);
});

//passportjs.org 에서 login 할 때 form 형식을 하위와 똑같이 작성해야 한다.
// ( 위의 login 경로의 form 내용과 다른 점은,  input 값의 name이 다르다!!)
// 만약, 이렇게 맞춰 주기 싫다면 방법 2가 존재한다.
/* 
<form action="/login" method="post">
    <div>
        <label>Username:</label>
        <input type="text" name="username"/>
    </div>
    <div>
        <label>Password:</label>
        <input type="password" name="password"/>
    </div>
    <div>
        <input type="submit" value="Log In"/>
    </div>
</form>
*/

/*방법 2_ 다른 점은 input의 name 다르다. 
  이 이름을 바꿀 수 있는 방법이 아래의 코드 이다. 
 이를 parameter 값으로 넘겨주며,
  이는 main.js에서 처리할 것이다.
  ( 이 또한, passportjs.org 내용 안에 parameter 라는 주제로 존재한다! )
 */
/*
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'passwd'
},
*/

/* passport 버전으로 처리하기. 
router.post("/login_process", function (request, response) {
  var post = request.body;
  var email = post.email;
  var password = post.pwd;
  if (email === authData.email && password === authData.password) {
    request.session.is_logined = true;
    request.session.nickname = authData.nickname;
    request.session.save(function () {
      response.redirect(`/`);
    });
  } else {
    response.send("Who?");
  }
});
*/

router.get("/logout", function (request, response) {
  request.session.destroy(function (err) {
    response.redirect("/");
  });
});

module.exports = router;

var express = require("express");
var app = express();
var fs = require("fs");
var bodyParser = require("body-parser");
var compression = require("compression");
var helmet = require("helmet");
app.use(helmet());
var session = require("express-session");
var FileStore = require("session-file-store")(session);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    secret: "asadlfkj!@#!@#dfgasdg",
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
  })
);

// auth.js 에 있던 user 정보를 이주함.
var authData = {
  email: "egoing777@gmail.com",
  password: "111111",
  nickname: "egoing",
};

// passport
var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

// **아래의 콜백함수에서 < 로그인 성공 여부를 판단 >을 어떻게 하는지에 관한 로직이다._ 아직은 먼지 모르겠음.
/* if문 사이사이에 console을 찍는 이유; 성공 or 실패했을 때 어디까지 진행 되었는지를 확인하기 위해서
 성공했다면, 콘솔 1,2가 찍히는 것이고, 실패했다면 어느 지점에서 실패한 지 찍힐 것이다.
*/
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "pwd",
    },
    function (username, password, done) {
      console.log("LocalStrategy", username, password);
      if (username === authData.email) {
        console.log(1);
        if (password === authData.password) {
          console.log(2);
          return done(null, authData);
          // username & password 까지 모두 맞다면, user정보를 담아서 done 함수를 실행시킨다
          /* *cf_ done 함수를 보면 2번째 인자에 false값이 안디ㅏ.
             2번째 인자에 false가 아닌 값을 주면,  JS에서는  true로 친다!!
             */
          /*  이제 성공한거고, 성공한 사용자의 정보가 무엇 이라고 passport 에게 알려줘야 한다.
              알려줄 사용자의 정보는 'authData' 정보이므로, 2번째 인자에 넣는다 
          */
        } else {
          console.log(3);
          return done(null, false, { message: "Incorrect password." });
        }
      } else {
        console.log(4);
        return done(null, false, { message: "Incorrect username." });
        // *cf_ return 하면 함수는 끝난다!
      }
    }
  )
);

/* Q. 밑의 콜백함수(passport.authenticate) 내용은, 성공하면 "/",
 실패하면,"/auth/login" 경로로 간다. 
그렇다면,  어떻게 로그인 성공했는지를 판단하지?
 A. passportjs.org > configure에 명세 나와있음
 */
app.post(
  "/auth/login_process",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

app.get("*", function (request, response, next) {
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist;
    next();
  });
});

var indexRouter = require("./routes/index");
var topicRouter = require("./routes/topic");
var authRouter = require("./routes/auth");

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});

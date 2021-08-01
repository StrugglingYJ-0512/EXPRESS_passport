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
// passport
var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

// *아래의 콜백함수에서 로그인 성공 여부를 판단을 어떻게 하는지에 관한 로직이다._ 아직은 먼지 모르겠음.
passport.use(
  new LocalStrategy(
    // auth.js에서 login form 을 맞추기 위한 2번째 방법으로,
    // name에 파라미터 값을 넘겨주는 방식!
    {
      usernameField: "email",
      passwordField: "pwd",
    },
    function (username, password, done) {
      /* 위의 form 형식의 name 변경 로직까지 넣은 후 추가한 것이다!
        콘솔 찍는 이유 : 
        1) 현재의 콜백이 잘 호출 되는지 확인 
        2) passport가 우리한테 username, password를 콜백 내로 주입시켜 주는지 확인.
       */
      console.log("LocalStrategy", username, password);
      /* ** 출력 결과 : LocalStrategy egoing777@gmail.com 111111
         해설 : 1) LocalStrategy : string값으로 콘솔에 찍었기 때문 ==> 콜백 함수가 잘 실행됨
                2) username, password : 이 콜백 함수가 호출 될 때, 
                passport가 인자로 format 에 전송한 username, password 를 잘 전달 해줬다는 것!
         */
      /*
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    });
    */
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

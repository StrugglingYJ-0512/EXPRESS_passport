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

// export 는 세션을 내부적으로 사용하기 때문에, express-session을 활성화
// 시키는 코드 다음에 적어야 한다!
var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;
app.post(
  // login 폼에서 전송된 데이터를 passport가 받기로 했고,
  // 그 때의 /auth/login_process 로 전송된 데이터는... ( 이밑의 콜백함수내용 ; localStrategy 즉, id와password를 통해 로그인하는 전략을 하겠다. )
  "/auth/login_process",
  // 이 밑이 콜백 함수
  passport.authenticate("local", {
    // local : passport의 로그인하는 여러가지 전략 중
    // local 방식은 username, password로 로그인
    // local 방식이 아닌 것은 facebook/ google 같은 것들 이용.
    successRedirect: "/",
    // login  했으면 '/'
    failureRedirect: "/auth/login",
    // login 못했으면, 로그인 라우터로 재진입
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

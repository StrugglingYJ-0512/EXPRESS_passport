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

/* app.use : express에다가 미들웨어 설치
    Q. 그 미들웨어는 뭔가? ==> A. passport
    passport가 우리의 express에 개입한다. */
app.use(passport.initialize());
/*세션을 내부적으로 사용 할 것이다.
 세션 인증수업에서 직접 세션으로 login 구현 했으나,
 세션 미들웨어를 도입해서 그 위에서 passport가 구동된다. */
app.use(passport.session());

//passport에 serializeUser와 deserializeUser를 설치했다.
passport.serializeUser(function (user, done) {
  // done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  // User.findById(id, function (err, user) {
  //   done(err, user);
  // });
});

//로그인 성공 여부 판단 로직
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
          /*로그인에 성공 =>
            passport가 내부적으로 성공했다는 것을 알아낼 수 있는 방법을 제공한다.
           Q. 성공하면, 어디로 가는가?
           A. 밑의 app.post 에 인증시 성공/실패시에 들어가는 경로가 있다!
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

app.post(
  "/auth/login_process",
  passport.authenticate("local", {
    successRedirect: "/",
    // 로그인이 성공하면 home으로 간다 (최상위 루트)
    // Error: Failed to serialize user into session
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

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

// passort를 사용하겠다!! 라는 의미
// & app.use를 사용한다는 것은 express에 passport를 개입시킨다!라는 뜻
app.use(passport.initialize());
// passport는 내부적으로 세션을 쓰겠다!! 라는 의미!!
app.use(passport.session());

// 로그인을 하면 딱 한 번 실행된다!
// 로그인 성공시, session store에 저장하는 방법이다!!
passport.serializeUser(function (user, done) {
  console.log("serializeUser", user);
  done(null, user.email);
});

/* serializeUser에서 session Store에 저장한 sessionID 값을 1번쨰 인자로 받아와서,
  id 값으로 user의 데이터를 조회한다. 
*/
// 로그인 이후, 페이지가 로드 될 때마다 작동한다!
// 페이지에 방문할 떄마다 session  Store의 식별자를 가져와서.
// 식별자를 기준으로 해서 사용자의 실제 Data를 가져온다.
passport.deserializeUser(function (id, done) {
  console.log("deserializeUser", id);
  done(null, authData); // 우리는 DB가 아닌 위의 authData가 사용자 정보이다.
});

//사용자가 로그인을 했을 시, 로그인 성공 여부 판단 로직
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
          /* Q.로그인 성공시, authData 는 어디로 가나?
             A.serializeUser 에 user 값으로 들어가며, 이는 session store에 저장된다. 
             또한, sessionID 값으로 저장된다. 
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

// 사용자가 로그인을 전송 했을 때, passport가 로그인 데이터를 처리하기 위한 코드
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

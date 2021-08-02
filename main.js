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

/*  로그인이 성공 했을 때, 
serializeUser라는 메서드의 인자로 전달된 콜백함수가 
 호출되도록 약속되어 있고, 콜백의 user 는 로그인 성공시 주는 authDataf가 들어있다*/
passport.serializeUser(function (user, done) {
  // 로그인에 성공 해서, 이 메서드까지 들어오는지 확인하기위해 console찍음

  console.log("serializeUser", user);
  // 출력 결과 :
  /*   serializeUser {
      email: 'egoing777@gmail.com',
       password: '111111',
       nickname: 'egoing'
     }*/

  // done(null,user.id)
  done(null, user.email);
  /*
 첫 번째 인자로 null, 2번째의 인자로 사용자의 식별자!!를 넣어줘야 한다!(rule)
   user의 식별자를 주게 되어 있다. passportjs의 명세의 2번째 인자는 user.id로 식별자가 나와있었다.
   우리는.. 그 식별자로 email로 하기로 했다. 따라서.. user.id => user.email 로 변경함!
   이는.. 로그인을 한다 => 쿠키가 생성되며, 내용은 sessionid가 생성함
   => sessionid값은 우리의 폴더 'session'에 파일로 저장된다.
   => session의 내용 안에는 "passport":{"user":"egoing777@gmail.com"}"가 나오며, 
   이는..원래 user.id로 식별자가 나온다. 우리는 authData에 식별자로 eamil을 넣었으므로
   식별자가 나온다. 
   */
  //그 식별자 값은 어디로 간다? session의 passport: {"user":"egoing777@gmail.com"} 값으로 간다!
  // 로그인이 성공하면 serializeUser는 딱 한 번만 호출한다~!
});

/* 로그인이 되고, 페이지를 방문 할 떄마다 (로그인 한 상태로 f5누르면 리로드 되는 것도 방문의 한종류) deserializeUser 콜백이 호출된다.
  로그인 하고, f5를 누르면.. 
  deserializeUser egoing777@gmail.com
  {
    email: 'egoing777@gmail.com',
    password: '111111',
    nickname: 'egoing'
   }  이 계속 console에 찍힌다. 
    */
// 사용자의 데이터가 저장되어있는 곳에서 사용자의 실제 데이터를 조회해서 가져온다.
// 로그인 이후, 식별자의 값을 id로 주입 받는다.
// User.findById ~~ 인 코드 : id 값으로 DB에서 조회새서 사용자를 가져온다.
passport.deserializeUser(function (id, done) {
  // 호출 될 떄 마다 사용자의 데이터가 저장 된 곳에서
  // 사용자의 실제 데이터를 조회 해 가져온다.
  console.log("deserializeUser", id);
  done(null, authData); // 우리는 DB가 아닌 위의 authData가 사용자 정보이다.

  /* done(null, authData)자리에 있어야 할  실제 코드 해석 : 
    deserializeUser 콜백이 호출 될 때마다 serializeUser 실행으로 받아온 식별자인 id값을 이용해서
    DB에서 사용자를 조회 해서 가져온다. 
  */
  // User.findById(id, function (err, user) {
  //   done(err, user);
  // });
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
          /* passport는 로그인 성공시, authData를 우리가 줬고,
           이 데이터를 passport.serializeUser의 콜백함수 ; (function (user, done) {}의 
           1번째 인자로 주입해 주기로 약속되어 있다!
           그 결과로,  passport.serializeUser의 콜백함수에 콘솔을 찎어보면... 
             console.log("serializeUser", user);
              출력 결과 :
            /*   serializeUser {
              email: 'egoing777@gmail.com',
              password: '111111',
              nickname: 'egoing'
             }  로, authData가 user에 들어간 걸 확인 할 수 있다!
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

var express = require("express");
var router = express.Router();
var template = require("../lib/template.js");
var auth = require("../lib/auth");

router.get("/", function (request, response) {
  console.log("/", request.user);
  // passport는 request.user라고, user객체를 준다.
  // 이, user 객체는 deserializeUser 의 return 값으로, 주는 authData를 받는다!!

  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `
      <h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      `,
    `<a href="/topic/create">create</a>`,
    auth.statusUI(request, response)
  );
  response.send(html);
});

module.exports = router;

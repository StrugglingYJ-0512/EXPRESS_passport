module.exports = {
  isOwner: function (request, response) {
    if (request.user) {
      // 로그인이 되어 있으면 request.user객체가 들어 있을 것이다.
      return true;
    } else {
      return false;
    }
  },
  statusUI: function (request, response) {
    var authStatusUI = '<a href="/auth/login">login</a>';
    if (this.isOwner(request, response)) {
      authStatusUI = `${request.user.nickname} | <a href="/auth/logout">logout</a>`;
    }
    return authStatusUI;
  },
};

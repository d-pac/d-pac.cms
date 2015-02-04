module.exports = {
  target  : {
    host     : "example.com",
    username : "johndoe",
    agent    : process.env.SSH_AUTH_SOCK
  },
  runtime : {
    dest : "/home/johndoe/dpac"
  }
};

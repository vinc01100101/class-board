module.exports = () => {
  //   const socket = io();

  //   socket.on("myemit", data => {
  //     console.log("DATA: " + data);
  //   });

  const news = io.connect("/news");

  news.on("say", data => {
    console.log(data);
  });

  news.on("cb", function(name, word, fn) {
    fn(name + " says " + word);
  });
};

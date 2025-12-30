const _shameGifs = [
  "https://tenor.com/VU1y.gif",
  "https://tenor.com/xV7I.gif",
  "https://tenor.com/bSiK8.gif",
  "https://tenor.com/bLQnA.gif",
  "https://tenor.com/uDmFdQcabLN.gif",
];

const shamePresentation = {
  getShameMessage() {
    const gif = _shameGifs[Math.floor(Math.random() * _shameGifs.length)];
    return `SHAME <@${user.id}> SHAME\n${gif}`;
  },

  getUnshamedMessaged(userId) {
    return `<@${userId}>, you are free`;
  },
};

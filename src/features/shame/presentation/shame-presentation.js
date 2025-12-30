const _shameGifs = [
  "https://tenor.com/VU1y.gif",
  "https://tenor.com/xV7I.gif",
  "https://tenor.com/bSiK8.gif",
  "https://tenor.com/bLQnA.gif",
  "https://tenor.com/uDmFdQcabLN.gif",
  "https://tenor.com/view/shame-max-mitchell-wild-cards-shame-on-you-how-dare-you-gif-1059570400115177835",
  "https://tenor.com/view/embarrassed-embarassed-benjammins-ben-jammins-shame-gif-15838104130396461000",
  "https://tenor.com/view/crypto-cardano-nikepig-mood-reaction-gif-5532924884402701643",
  "https://tenor.com/view/shame-shameless-ashamed-shame-on-you-shameful-gif-3258148063038839630",
];

const shamePresentation = {
  getShameMessage(userId) {
    const gif = _shameGifs[Math.floor(Math.random() * _shameGifs.length)];
    return `SHAME <@${userId}> SHAME\n${gif}`;
  },

  getUnshamedMessage(userId) {
    return `<@${userId}>, you are free`;
  },

  getNoRoleError() {
    return "No shamed role has been set.";
  },
};

module.exports = shamePresentation;

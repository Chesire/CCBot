const challengedb = require("./data/challengedb");

const challengeService = {
  // Maximum that a user can have, change to be server defined in the future.
  CHALLENGE_LIMIT: 10,

  async addChallenge(
    userId,
    userDisplayName,
    name,
    description,
    timeFrame,
    cheats,
    allowPause,
  ) {
    const usersChallenges = await challengedb.Challenges.findAll({
      where: { userid: userId },
    });
    if (usersChallenges.length >= this.CHALLENGE_LIMIT) {
      console.log(
        `[ChallengeService] failed to create challenge, user at limit`,
      );
      throw new Error("Too many challenges active, delete one to add another.");
    }

    try {
      const newChallenge = await challengedb.Challenges.create({
        name: name,
        description: description,
        timeframe: timeFrame,
        username: userDisplayName,
        userid: userId.toString(),
        cheats: cheats,
        allowpause: allowPause,
      });
      return newChallenge;
    } catch (error) {
      console.log(`[ChallengeService] failed to create challenge, ${error}`);
      throw new Error("Failed to add a challenge, try again.");
    }
  },

  async listUserChallenges(userId) {},

  async removeChallenge(challengeId) {},
};

const challengedb = require("./data/challengedb");

const challengeService = {
  // Maximum that a user can have, change to be server defined in the future.
  CHALLENGE_LIMIT: 10,

  async addChallenge(user, challengeData) {
    const usersChallenges = await challengedb.Challenges.findAll({
      where: { userid: user.id },
    });
    if (usersChallenges.length >= this.CHALLENGE_LIMIT) {
      console.log(
        `[ChallengeService] failed to create challenge, user at limit`,
      );
      throw new Error("Too many challenges active, delete one to add another.");
    }

    try {
      const newChallenge = await challengedb.Challenges.create({
        name: challengeData.name,
        description: challengeData.description,
        timeframe: challengeData.timeFrame,
        username: user.displayName,
        userid: user.id.toString(),
        cheats: challengeData.cheats,
        allowpause: challengeData.allowPause,
      });
      return newChallenge;
    } catch (error) {
      console.log(`[ChallengeService] failed to create challenge, ${error}`);
      throw new Error("Failed to add a challenge, try again.");
    }
  },

  async listUserChallenges(userId) {
    try {
      return await challengedb.Challenges.findAll({
        where: { userid: userId },
      });
    } catch (error) {
      console.log(`[ChallengeService] failed to retrieve challenges, ${error}`);
      return [];
    }
  },

  async removeChallenge(challengeId) {
    const challenge = await challengedb.Challenges.findOne({
      where: { id: challengeId },
    });

    if (challenge) {
      try {
        await challengedb.Challenges.destroy({
          where: { id: challengeId },
        });
        console.log(
          `[ChallengeService] removed challenge '${challenge.name}' successfully`,
        );
      } catch (error) {
        throw new Error("Failed to remove challenge, try again.");
      }

      return challenge;
    } else {
      console.log(
        `[ChallengeService] tried to remove challenge '${challengeId}' but challenge came back null`,
      );
      throw new Error("Failed to remove challenge, try again.");
    }
  },
};

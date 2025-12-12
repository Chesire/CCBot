class UserFetcher {
  static async fetchUsersByIds(userIds, guild, client) {
    const userMap = {};

    for (const userId of userIds) {
      console.log(`[UserFetcher] Attempting to fetch member ${userId}...`);
      const cachedUser = client.users.cache.get(userId);
      if (cachedUser) {
        console.log(`[UserFetcher] Found ${userId} in Discord cache`);
        userMap[userId] = cachedUser;
        continue;
      }

      try {
        console.log(
          `[UserFetcher] Attempting to fetch member from guild ${userId}...`,
        );
        const member = await guild.members.fetch(userId);
        console.log(
          `[UserFetcher] Successfully fetched member: ${member.displayName}`,
        );
        userMap[userId] = member;
      } catch (error) {
        console.log(
          `[UserFetcher] Failed to fetch from guild: ${error.message}`,
        );
        try {
          console.log(
            `[UserFetcher] Attempting to fetch member from client ${userId}...`,
          );
          const user = await client.users.fetch(userId);
          console.log(
            `[UserFetcher] Successfully fetched user: ${user.displayName}`,
          );
          userMap[userId] = user;
        } catch (error2) {
          console.log(`[UserFetcher] Failed to fetch user: ${error2.message}`);
          userMap[userId] = {
            id: userId,
            username: `User ${userId}`,
            displayName: `User ${userId}`,
            bot: false,
            avatar: null,
          };
        }
      }
    }

    return userMap;
  }
}

module.exports = UserFetcher;

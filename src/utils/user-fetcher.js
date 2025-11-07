class UserFetcher {
  static cache = {};
  static cacheTimestamp = null;
   // 15 minutes in milliseconds
  static CACHE_DURATION = 15 * 60 * 1000;

  static isCacheExpired() {
    if (!this.cacheTimestamp) return true;
    return Date.now() - this.cacheTimestamp > this.CACHE_DURATION;
  }

  static async fetchUsersByIds(userIds, guild, client) {
    if (this.isCacheExpired()) {
      console.log('[UserFetcher] Cache expired, clearing...');
      this.clearCache();
    }

    const userMap = {};

    for (const userId of userIds) {
      if (this.cache[userId]) {
        console.log(`[UserFetcher] Found ${userId} in cache`);
        userMap[userId] = this.cache[userId];
        continue;
      }

      // Check Discord's cache
      const cachedUser = client.users.cache.get(userId);
      if (cachedUser) {
        console.log(`[UserFetcher] Found ${userId} in Discord cache`);
        userMap[userId] = cachedUser.username;
        this.cache[userId] = cachedUser.username;
        continue;
      }

      try {
        console.log(`[UserFetcher] Attempting to fetch member from guild ${userId}...`);
        const member = await guild.members.fetch(userId);
        console.log(`[UserFetcher] Successfully fetched member: ${member.displayName}`);
        userMap[userId] = member.displayName;
        this.cache[userId] = member.displayName;
      } catch (error) {
        console.log(`[UserFetcher] Failed to fetch from guild: ${error.message}`);
        try {
          const user = await client.users.fetch(userId);
          console.log(`[UserFetcher] Successfully fetched user: ${user.username}`);
          userMap[userId] = user.username;
          this.cache[userId] = user.username;
        } catch (error2) {
          console.log(`[UserFetcher] Failed to fetch user: ${error2.message}`);
          userMap[userId] = `User ${userId}`;
          this.cache[userId] = `User ${userId}`;
        }
      }
    }

    if (this.cacheTimestamp === null) {
      this.cacheTimestamp = Date.now();
    }

    return userMap;
  }

  static clearCache() {
    this.cache = {};
    this.cacheTimestamp = null;
  }
}

module.exports = UserFetcher;

const adminRepository = require("../../../admin/data/admin-repository");
const shameEventsRepository = require("../shame/data/shame-events-repository");

const shameService = {
  /**
   * Returns true if the user was successfully unshamed, false if otherwise
   */
  async unshameUser(userId, guild) {
    // Consider if we should remove the event if it currently exists
    const shameRoleId = await adminRepository.shamedRoleId.get();
    if (adminRepository.shamedRoleId.isDefault(shameRoleId)) {
      return false;
    }

    const role = await guild.roles.fetch(shameRoleId);
    const member = await guild.members.fetch(userId);
    await member.roles.remove(role);
    return true;
  },
};

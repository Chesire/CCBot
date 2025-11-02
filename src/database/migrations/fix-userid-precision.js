/**
 * Migration: Fix userid precision in wrappeddb
 * 
 * Discord user IDs are 64-bit snowflakes stored as strings.
 * Previously, userid was stored as INTEGER which caused precision loss.
 * This migration:
 * 1. Converts userid column from NUMBER to TEXT (preserving truncated values)
 * 2. Fetches correct user IDs from Discord guild members
 * 3. Matches wrapped records with guild members to find correct full-precision IDs
 * 4. Updates wrapped records with corrected IDs
 * 5. Creates backup table wrappeds_pre_migration for rollback capability
 * 
 * ROLLBACK: Run rollback-userid-precision.js if issues occur
 */

const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../../../config.json');

async function migrateUserIds(client) {
  console.log('[Migration] Starting userid precision fix...');

  let wrappedSequelize;

  try {
    wrappedSequelize = new Sequelize('wrappeddb', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: path.join(__dirname, '../../../data/wrappeddb.sqlite'),
    });

    // Step 0: Check if migration has already been completed
    const tables = await wrappedSequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='wrappeds_pre_migration'", {
      type: Sequelize.QueryTypes.SELECT
    });

    if (tables.length > 0) {
      console.log('[Migration] Migration already completed (wrappeds_pre_migration exists). Skipping.');
      return;
    }

    // Fetch guild members to get correct user IDs
    let guildMembers = [];
    try {
      const guild = await client.guilds.fetch(config.guildId);
      console.log('[Migration] [DEBUG] Fetching guild members...');
      const members = await guild.members.fetch({ force: true });
      guildMembers = Array.from(members.values());
      console.log(`[Migration] [DEBUG] Fetched ${guildMembers.length} guild members`);
    } catch (error) {
      console.error('[Migration] ERROR: Could not fetch guild members:', error.message);
      console.error('[Migration] Migration cannot proceed without guild member data');
      throw error;
    }

    // Create a map of guild member IDs for quick lookup
    const guildMemberMap = new Map();
    guildMembers.forEach(member => {
      guildMemberMap.set(member.id, member.id);
    });
    console.log(`[Migration] [DEBUG] Created member map with ${guildMemberMap.size} members`);

    // Step 1: Check if userid column is still NUMBER type
    console.log('[Migration] [DEBUG] Checking wrapped table schema...');
    const tableInfo = await wrappedSequelize.query("PRAGMA table_info(wrappeds)", {
      type: Sequelize.QueryTypes.SELECT
    });
    
    const useridColumn = tableInfo.find(col => col.name === 'userid');
    
    if (!useridColumn) {
      console.log('[Migration] ERROR: Could not find userid column in table info');
      return;
    }
    
    console.log(`[Migration] Current userid column type: ${useridColumn.type}`);

    if (useridColumn.type === 'NUMBER') {
      console.log('[Migration] Converting userid column from NUMBER to TEXT...');
      console.log('[Migration] [DEBUG] Creating backup table...');
      
      // Create backup table BEFORE making changes (for rollback capability)
      await wrappedSequelize.query('ALTER TABLE wrappeds RENAME TO wrappeds_pre_migration;');
      console.log('[Migration] Created backup table: wrappeds_pre_migration');
      
      // Create new table with TEXT column
      console.log('[Migration] [DEBUG] Creating new wrappeds table with TEXT userid...');
      await wrappedSequelize.query(`
        CREATE TABLE wrappeds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userid TEXT,
          messagecount NUMBER DEFAULT 0,
          shamedcount NUMBER DEFAULT 0,
          missedchallenges NUMBER DEFAULT 0,
          timeslost NUMBER DEFAULT 0,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      
      // Migrate data
      console.log('[Migration] [DEBUG] Migrating data to new table...');
      await wrappedSequelize.query(`
        INSERT INTO wrappeds (id, userid, messagecount, shamedcount, missedchallenges, timeslost, createdAt, updatedAt)
        SELECT id, CAST(userid AS TEXT), messagecount, shamedcount, missedchallenges, timeslost, createdAt, updatedAt FROM wrappeds_pre_migration
      `);
      
      // Verify row count matches
      const backupCount = await wrappedSequelize.query('SELECT COUNT(*) as count FROM wrappeds_pre_migration', {
        type: Sequelize.QueryTypes.SELECT
      });
      
      const newCount = await wrappedSequelize.query('SELECT COUNT(*) as count FROM wrappeds', {
        type: Sequelize.QueryTypes.SELECT
      });
      
      if (backupCount[0].count !== newCount[0].count) {
        console.error(`[Migration] Row count mismatch! Backup: ${backupCount[0].count}, New: ${newCount[0].count}`);
        throw new Error('Data integrity check failed - row count mismatch');
      }
      
      console.log(`[Migration] Data migrated successfully (${newCount[0].count} rows)`);
    } else {
      console.log('[Migration] userid column is already TEXT, skipping schema conversion');
    }

    // Step 2: Get all wrapped records and find missing precision IDs
    console.log('[Migration] [DEBUG] Fetching wrapped records...');
    const wrappedRecords = await wrappedSequelize.query('SELECT id, userid FROM wrappeds ORDER BY id', {
      type: Sequelize.QueryTypes.SELECT
    });

    console.log(`[Migration] Found ${wrappedRecords.length} wrapped records to check`);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    console.log('[Migration] [DEBUG] Starting ID matching process...');
    for (const record of wrappedRecords) {
      const wrappedId = String(record.userid);
      console.log(`[Migration] [DEBUG] Processing record ${record.id}: ${wrappedId}`);
      
      let found = false;
      let matchedId = null;

      // Check if this exact ID exists in guild members
      if (guildMemberMap.has(wrappedId)) {
        console.log(`[Migration] ID ${wrappedId} verified (exact match with guild member)`);
        found = true;
        skippedCount++;
        continue;
      }

      // Check if this ID might be corrupted due to NUMBER precision loss
      // When storing large numbers as INTEGER, precision is lost in the least significant digits
      // Strategy: Find guild members that match the 15-digit prefix
      
      for (const guildMemberId of guildMemberMap.keys()) {
        const fullId = String(guildMemberId);
        
        // Check if IDs are similar (same length, share prefix of at least 15 digits)
        if (fullId.length === wrappedId.length && 
            fullId.length >= 17 && fullId.length <= 19) {
          
          // Compare first 15 digits
          const wrappedPrefix = wrappedId.substring(0, 15);
          const fullPrefix = fullId.substring(0, 15);
          
          if (wrappedPrefix === fullPrefix) {
            if (fullId !== wrappedId) {
              // High confidence match - same prefix indicates same user, just corrupted trailing digits
              console.log(`[Migration] Precision loss detected! ID ${wrappedId} found as ${fullId} in guild members`);
              matchedId = fullId;
              found = true;
              break;
            } else {
              // They match exactly
              found = true;
              break;
            }
          }
        }
      }

      if (matchedId) {
        // Found a corrected version - update it
        console.log(`[Migration] Updating ${wrappedId} -> ${matchedId}`);
        
        // Use parameterized query to prevent SQL injection
        await wrappedSequelize.query(
          'UPDATE wrappeds SET userid = ? WHERE id = ?',
          { replacements: [matchedId, record.id], type: Sequelize.QueryTypes.UPDATE }
        );
        updatedCount++;
      } else if (found) {
        // Found exact match in guild members - no update needed
        console.log(`[Migration] ID ${wrappedId} verified against guild members (exact match)`);
        skippedCount++;
      } else {
        // No matching ID found in guild
        console.log(`[Migration] WARNING: No matching guild member found for ID ${wrappedId}`);
        notFoundCount++;
      }
    }

    console.log(`[Migration] Completed! Updated: ${updatedCount}, Skipped: ${skippedCount}, Not Found: ${notFoundCount}`);
    console.log('[Migration] Backup preserved as wrappeds_pre_migration for rollback capability.');
    
  } catch (error) {
    console.error('[Migration] CRITICAL ERROR during userid precision fix:', error.message);
    console.error('[Migration] Stack:', error.stack);
    throw error;
  } finally {
    // Always close connections
    try {
      if (wrappedSequelize) await wrappedSequelize.close();
      console.log('[Migration] Database connections closed');
    } catch (closeError) {
      console.error('[Migration] Error closing connections:', closeError.message);
    }
  }
}

module.exports = { migrateUserIds };

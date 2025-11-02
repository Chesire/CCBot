/**
 * Migration: Fix userid precision in wrappeddb
 * 
 * Discord user IDs are 64-bit snowflakes stored as strings.
 * Previously, userid was stored as INTEGER which caused precision loss.
 * This migration:
 * 1. Converts userid column from NUMBER to TEXT (preserving truncated values)
 * 2. Matches wrapped records with shameevents to find correct full-precision IDs
 * 3. Updates wrapped records with corrected IDs
 * 4. Creates backup table wrappeds_pre_migration for rollback capability
 * 
 * ROLLBACK: Run rollback-userid-precision.js if issues occur
 */

const path = require('path');
const { Sequelize } = require('sequelize');

async function migrateUserIds() {
  console.log('[Migration] Starting userid precision fix...');

  let wrappedSequelize;
  let shameSequelize;

  try {
    wrappedSequelize = new Sequelize('wrappeddb', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: path.join(__dirname, '../../../data/wrappeddb.sqlite'),
    });

    shameSequelize = new Sequelize('shameeventsdb', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: path.join(__dirname, '../../../data/shameeventsdb.sqlite'),
    });

    // Step 0: Check if migration has already been completed
    const tables = await wrappedSequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='wrappeds_pre_migration'", {
      type: Sequelize.QueryTypes.SELECT
    });

    if (tables.length > 0) {
      console.log('[Migration] Migration already completed (wrappeds_pre_migration exists). Skipping.');
      return;
    }

    // Step 1: Check if userid column is still NUMBER type
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
      
      // Create backup table BEFORE making changes (for rollback capability)
      await wrappedSequelize.query('ALTER TABLE wrappeds RENAME TO wrappeds_pre_migration;');
      console.log('[Migration] Created backup table: wrappeds_pre_migration');
      
      // Create new table with TEXT column
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
    const wrappedRecords = await wrappedSequelize.query('SELECT id, userid FROM wrappeds ORDER BY id', {
      type: Sequelize.QueryTypes.SELECT
    });

    console.log(`[Migration] Found ${wrappedRecords.length} wrapped records to check`);

    // Verify shameeventsdb has TEXT userids
    const shameTableInfo = await shameSequelize.query("PRAGMA table_info(shameevents)", {
      type: Sequelize.QueryTypes.SELECT
    });
    const shameUseridColumn = shameTableInfo.find(col => col.name === 'userid');
    if (shameUseridColumn?.type !== 'TEXT') {
      console.warn(`[Migration] WARNING: shameeventsdb.userid is ${shameUseridColumn?.type}, not TEXT. ID matching may fail.`);
    }

    // Get all shame event IDs
    const shameRecords = await shameSequelize.query('SELECT DISTINCT userid FROM shameevents ORDER BY userid', {
      type: Sequelize.QueryTypes.SELECT
    });

    console.log(`[Migration] Found ${shameRecords.length} unique shame event userids`);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const record of wrappedRecords) {
      const wrappedId = String(record.userid);
      
      // Check if this ID might be corrupted due to NUMBER precision loss
      // When storing large numbers as INTEGER, precision is lost in the least significant digits
      // Strategy: Find shame events that match exactly OR are "close" (differ only in trailing digits)
      
      let found = false;
      let matchedId = null;
      
      for (const shameRecord of shameRecords) {
        const fullId = String(shameRecord.userid);
        
        // Exact match - no corruption
        if (fullId === wrappedId) {
          console.log(`[Migration] ID ${wrappedId} verified (exact match with shame events)`);
          found = true;
          break;
        }
        
        // Check if IDs are similar (same length, share prefix of at least 15 digits)
        // This catches precision loss cases where only trailing digits differ
        // 15-digit prefix ensures same Discord timestamp/worker (virtually impossible collision)
        if (fullId.length === wrappedId.length && 
            fullId.length >= 17 && fullId.length <= 19) {
          
          // Compare first 15 digits (Discord snowflakes have 42-bit timestamp + most of worker/process info)
          // Precision loss from NUMBER type can affect the last 3-5 digits (increment + part of process)
          const wrappedPrefix = wrappedId.substring(0, 15);
          const fullPrefix = fullId.substring(0, 15);
          
          if (wrappedPrefix === fullPrefix) {
            // High confidence match - same prefix indicates same user, just corrupted trailing digits
            console.log(`[Migration] Precision loss detected! ID ${wrappedId} found as ${fullId} in shame events`);
            matchedId = fullId;
            found = true;
            break;
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
        // Found exact match in shame events - no update needed
        console.log(`[Migration] ID ${wrappedId} verified against shame events (exact match)`);
        skippedCount++;
      } else {
        // No matching ID found in shame events
        if (wrappedId.length < 18) {
          console.log(`[Migration] WARNING: No matching shame event found for truncated ID ${wrappedId} (${wrappedId.length} digits)`);
        } else {
          console.log(`[Migration] WARNING: No matching shame event found for ID ${wrappedId} (may not have shame events)`);
        }
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
      if (shameSequelize) await shameSequelize.close();
      console.log('[Migration] Database connections closed');
    } catch (closeError) {
      console.error('[Migration] Error closing connections:', closeError.message);
    }
  }
}

module.exports = { migrateUserIds };

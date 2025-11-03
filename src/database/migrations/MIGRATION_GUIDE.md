# Migration Guide: userid Precision Fix

## Overview

This migration fixes an issue where Discord user IDs were stored as `NUMBER` (INTEGER) in the `wrappeddb` database instead of `TEXT`. Discord user IDs are 64-bit snowflakes that require text storage to prevent precision loss.

**Migration runs automatically** on bot startup (first time only).

## What the Migration Does

1. **Schema Conversion**: Converts `wrappeds.userid` column from `NUMBER` to `TEXT`
2. **Data Preservation**: Copies all existing data to the new schema with row count verification
3. **Guild Member Fetching**: Fetches all Discord guild members to get accurate, full-precision user IDs
4. **ID Matching**: Compares wrapped IDs with guild members using 15-digit prefix matching to catch precision loss
5. **Precision Loss Detection**: Identifies corrupted IDs (e.g., `122688644782751740 → 122688644782751744`)
6. **Backup Creation**: Preserves pre-migration data as `wrappeds_pre_migration` table for rollback

## Production Deployment Checklist

Before deploying to production:

- [ ] **Database Backup**: Create manual backup of production `wrappeddb.sqlite`
  ```bash
  cp data/wrappeddb.sqlite data/wrappeddb.sqlite.backup
  ```

- [ ] **Test Migration**: Run migration on a copy of production data
  - Deploy bot to staging with production database copy
  - Monitor logs for migration completion
  - Verify ID matching results

- [ ] **Verify shameeventsdb**: (No longer used for ID matching)
  - Migration now fetches guild members directly from Discord
  - This ensures accuracy using live guild data

- [ ] **Plan Downtime**: Migration runs during bot startup
  - Bot will be unavailable for a few seconds during the process
  - No manual intervention needed during migration

- [ ] **Monitor First Run**: Watch logs for:
  - ✅ `[Migration] Completed! Updated: X, Skipped: Y, Not Found: Z`
  - ⚠️ Any warnings about unmatched IDs (may indicate data issues)

## Verification After Migration

### Check Migration Success

```bash
# Connect to SQLite and verify
sqlite3 data/wrappeddb.sqlite

# Check userid column type
PRAGMA table_info(wrappeds);
# Should show: userid | TEXT

# Verify backup exists
.tables
# Should show: wrappeds, wrappeds_pre_migration

# Compare row counts
SELECT COUNT(*) FROM wrappeds;
SELECT COUNT(*) FROM wrappeds_pre_migration;
# Should be equal

# Check for sample IDs (should be 18-19 digits)
SELECT DISTINCT LENGTH(userid) FROM wrappeds;
```

### Monitor Logs

```bash
# Check for migration completion
grep "\[Migration\] Completed" bot.log
# Should show: Updated: X, Skipped: Y, Not Found: Z
```

## Rollback Procedure

If the migration causes issues:

1. **Stop the bot**
   ```bash
   # Kill the process
   pkill -f "node src/index.js"
   ```

2. **Run rollback script**
   ```bash
   node src/database/migrations/rollback-userid-precision.js
   ```
   - You'll be prompted to type `ROLLBACK` to confirm
   - This restores the database to its pre-migration state

3. **Review Issues**
   - Check bot logs for migration error details
   - Investigate the root cause
   - Fix the migration or database state as needed

4. **Restart Bot**
   ```bash
   node src/index.js
   ```
   - Migration will re-run on next startup
   - If you've already fixed the backup table, it will skip the conversion

## Idempotency

The migration is **idempotent** - it will only run once:

- On first run: Creates `wrappeds_pre_migration` backup table and converts schema
- On subsequent runs: Detects backup table exists and skips (safe to restart bot)

This means:
- ✅ Safe to restart bot multiple times
- ✅ Won't duplicate the ID updates
- ✅ Backup persists for rollback capability

## Troubleshooting

### Migration doesn't update any IDs

**Symptom**: `[Migration] Completed! Updated: 0, Skipped: X, Not Found: Z`

**Possible Causes**:
- All IDs in `wrappeddb` are already correct (exact match with guild members)
- Users with corrupted IDs are no longer in the guild
- Precision loss only occurred in trailing digits that changed between migration runs

**Solution**:
- Check bot logs for which IDs failed to match
- Verify if those users are still in the Discord guild
- Users not in the guild will keep their existing IDs (safe - just not verified)

### "Not Found" count is high

**Symptom**: `[Migration] Completed! Updated: X, Skipped: Y, Not Found: MANY`

**Possible Causes**:
- Users with those IDs are no longer in the Discord guild
- They may have left or been removed from the server
- Precision loss was significant (>15 digit prefix doesn't match)

**Action**:
- These records keep their existing IDs (safe - not broken, just not verified against guild)
- This is expected behavior for users not in the guild
- No action needed - migration proceeds normally

### Row count mismatch error

**Symptom**: `[Migration] Row count mismatch! Backup: 100, New: 50`

**Cause**: Data was lost during migration (critical error)

**Recovery**:
1. Run rollback script
2. Delete `wrappeddb.sqlite` and restore from your backup: `cp wrappeddb.sqlite.backup wrappeddb.sqlite`
3. Contact maintainer - there may be a database issue

### SQL injection warning

The migration uses parameterized queries to prevent SQL injection:
```javascript
await wrappedSequelize.query(
  'UPDATE wrappeds SET userid = ? WHERE id = ?',
  { replacements: [fullId, record.id], type: Sequelize.QueryTypes.UPDATE }
);
```

This is safe even if IDs contain special characters (though Discord IDs never do).

## Cleanup

The `wrappeds_pre_migration` backup table is **intentionally kept** for:
- Rollback capability
- Data verification
- Audit trail

### When to Delete

You can safely delete the backup table **after verification** (e.g., 1-2 weeks post-deployment):

```bash
sqlite3 data/wrappeddb.sqlite
DROP TABLE wrappeds_pre_migration;
```

Or run a cleanup migration if you create one.

## FAQ

**Q: Can I cancel the migration mid-way?**  
A: Not easily - it will leave the database in an inconsistent state. Use the rollback script if needed.

**Q: Does this affect other databases?**  
A: No, only `wrappeddb`. Other databases should already use TEXT for userids.

**Q: Will this fix existing truncated IDs?**  
A: Only if the user is in the guild and their ID matches using the 15-digit prefix comparison. Otherwise, truncated IDs remain as-is (safe, just not verified).

**Q: What if a user is not in the guild?**  
A: Migration will log a "Not Found" warning. The ID stays unchanged. This is normal for users who have left the guild.

**Q: What data source does the migration use?**  
A: Guild members fetched live from Discord at bot startup. This ensures accuracy with the most current data.

**Q: How long does the migration take?**  
A: Typically <1 second for up to 1000 records. Depends on database size.

**Q: Is the bot down during migration?**  
A: Only during startup. Migration runs during the `ClientReady` event, before the bot accepts commands.

## Support

If issues occur:

1. Check the migration logs in `bot.log`
2. Verify database backups exist
3. Run the rollback script if needed

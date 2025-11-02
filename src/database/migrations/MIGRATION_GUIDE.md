# Migration Guide: userid Precision Fix

## Overview

This migration fixes an issue where Discord user IDs were stored as `NUMBER` (INTEGER) in the `wrappeddb` database instead of `TEXT`. Discord user IDs are 64-bit snowflakes that require text storage to prevent precision loss.

**Migration runs automatically** on bot startup (first time only).

## What the Migration Does

1. **Schema Conversion**: Converts `wrappeds.userid` column from `NUMBER` to `TEXT`
2. **Data Preservation**: Copies all existing data to the new schema with row count verification
3. **ID Matching**: Matches truncated IDs with full-precision IDs from `shameeventsdb`
4. **Backup Creation**: Preserves pre-migration data as `wrappeds_pre_migration` table for rollback

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

- [ ] **Verify shameeventsdb**: Ensure `shameeventsdb.userid` is already `TEXT` type
  - The migration will warn if it's not, but will still attempt to match
  - If both are `NUMBER`, matching will fail (both truncated)

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
- All IDs in `wrappeddb` are already full-precision (18+ digits)
- No matching records in `shameeventsdb`
- `shameeventsdb` not migrated to TEXT yet

**Solution**:
- Check if `shameeventsdb.userid` is TEXT type
- If not, migrate `shameeventsdb` first, then rollback and re-run this migration

### "Not Found" count is high

**Symptom**: `[Migration] Completed! Updated: X, Skipped: Y, Not Found: MANY`

**Possible Causes**:
- Users have no corresponding shame events
- Truncated ID doesn't match any full ID in shame events

**Action**:
- These records keep their truncated IDs (safe - just less precise)
- Consider manual investigation if critical users are affected

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
A: Only if a matching full ID exists in `shameeventsdb`. Otherwise, truncated IDs remain.

**Q: How long does the migration take?**  
A: Typically <1 second for up to 1000 records. Depends on database size.

**Q: Is the bot down during migration?**  
A: Only during startup. Migration runs during the `ClientReady` event, before the bot accepts commands.

## Support

If issues occur:

1. Check the migration logs in `bot.log`
2. Verify database backups exist
3. Run the rollback script if needed

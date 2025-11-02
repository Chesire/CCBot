/**
 * Rollback: Restore wrappeddb userid column to NUMBER type
 * 
 * Use this script ONLY if the migration (fix-userid-precision.js) causes issues.
 * This will:
 * 1. Drop the current wrappeds table
 * 2. Restore from the wrappeds_pre_migration backup
 * 3. Return the database to its pre-migration state
 * 
 * Run: node src/database/migrations/rollback-userid-precision.js
 */

const path = require('path');
const { Sequelize } = require('sequelize');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function rollbackUserIds() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ROLLBACK: userid precision migration');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('⚠️  WARNING: This will restore wrappeddb to its PRE-MIGRATION state.');
  console.log('All ID updates made by the migration will be LOST.\n');

  const confirm = await prompt('Type "ROLLBACK" to confirm: ');
  if (confirm !== 'ROLLBACK') {
    console.log('\n❌ Rollback cancelled.');
    rl.close();
    return;
  }

  let wrappedSequelize;

  try {
    wrappedSequelize = new Sequelize('wrappeddb', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: path.join(__dirname, '../../../data/wrappeddb.sqlite'),
    });

    // Check if backup table exists
    const tables = await wrappedSequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='wrappeds_pre_migration'", {
      type: Sequelize.QueryTypes.SELECT
    });

    if (tables.length === 0) {
      console.error('\n❌ ERROR: wrappeds_pre_migration backup table not found.');
      console.error('   Cannot rollback - migration backup does not exist.');
      console.error('   The migration may not have been run, or it failed before creating the backup.\n');
      rl.close();
      return;
    }

    console.log('\n🔄 Starting rollback...');

    // Get row counts for verification
    const currentCount = await wrappedSequelize.query('SELECT COUNT(*) as count FROM wrappeds', {
      type: Sequelize.QueryTypes.SELECT
    });
    const backupCount = await wrappedSequelize.query('SELECT COUNT(*) as count FROM wrappeds_pre_migration', {
      type: Sequelize.QueryTypes.SELECT
    });

    console.log(`   Current wrappeds table: ${currentCount[0].count} rows`);
    console.log(`   Pre-migration backup: ${backupCount[0].count} rows`);

    // Drop current table
    await wrappedSequelize.query('DROP TABLE wrappeds;');
    console.log('\n✓ Dropped current wrappeds table');

    // Restore from backup
    await wrappedSequelize.query('ALTER TABLE wrappeds_pre_migration RENAME TO wrappeds;');
    console.log('✓ Restored wrappeds_pre_migration as wrappeds');

    // Verify
    const finalCount = await wrappedSequelize.query('SELECT COUNT(*) as count FROM wrappeds', {
      type: Sequelize.QueryTypes.SELECT
    });

    if (finalCount[0].count !== backupCount[0].count) {
      throw new Error(`Data integrity check failed - row count mismatch: ${finalCount[0].count} vs ${backupCount[0].count}`);
    }

    console.log(`✓ Verified restored table has ${finalCount[0].count} rows`);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ ROLLBACK COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. Review the migration code for issues');
    console.log('2. Make necessary fixes');
    console.log('3. Stop and restart the bot to re-run the migration\n');

  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED:', error.message);
    console.error('Stack:', error.stack);
    console.error('\nDatabase may be in an inconsistent state.');
    console.error('MANUAL RECOVERY REQUIRED - check wrappeddb.sqlite backup.\n');
  } finally {
    try {
      if (wrappedSequelize) await wrappedSequelize.close();
      rl.close();
    } catch (closeError) {
      console.error('Error during cleanup:', closeError.message);
    }
  }
}

rollbackUserIds();

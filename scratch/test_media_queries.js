import { pool } from '../backend/database/db.js';

// We can test the exact SQL logic used in server.js
async function testMediaQueries() {
  console.log('--- Testing Query Logic ---');
  
  // 1. Employee query
  const employeeResult = await pool.query(
    'SELECT COUNT(*) FROM media_library WHERE (is_financial IS NOT TRUE)'
  );
  console.log('Total visible to EMPLOYEE / public:', employeeResult.rows[0].count);

  // Check if any is_financial = true is visible to employee
  const leakCheck = await pool.query(
    'SELECT COUNT(*) FROM media_library WHERE (is_financial IS NOT TRUE) AND is_financial = TRUE'
  );
  console.log('Financial files leaked to employee (must be 0):', leakCheck.rows[0].count);

  // 2. Contabilidade query (all files)
  const contabilidadeResult = await pool.query(
    'SELECT COUNT(*) FROM media_library'
  );
  console.log('Total visible to CONTABILIDADE (all):', contabilidadeResult.rows[0].count);

  // 3. Contabilidade financial only
  const contabilidadeFinancial = await pool.query(
    'SELECT COUNT(*) FROM media_library WHERE is_financial IS TRUE'
  );
  console.log('Financial files visible to CONTABILIDADE:', contabilidadeFinancial.rows[0].count);

  process.exit(0);
}

testMediaQueries();

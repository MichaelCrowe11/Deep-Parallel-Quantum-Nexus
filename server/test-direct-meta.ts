
import { testDirectMetaModels } from './llama-direct';
import { log, LogLevel } from './logger';

async function runTests() {
  log('Starting direct Meta models test...', LogLevel.INFO);
  
  try {
    const results = await testDirectMetaModels();
    
    log('Test results:', LogLevel.INFO);
    for (const [model, result] of Object.entries(results)) {
      log(`Direct Meta Model: ${model}`, LogLevel.INFO);
      log(`Response: ${result.substring(0, 100)}...`, LogLevel.INFO);
      log('-'.repeat(80), LogLevel.INFO);
    }
    
    log('Direct Meta models test completed successfully', LogLevel.INFO);
  } catch (error) {
    log('Direct Meta models test failed', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

runTests();


import 'dotenv/config';
import { validateRunwayAPIKey } from './runway';
import { log, LogLevel } from './logger';

async function testRunwayIntegration() {
  log('Starting Runway ML API test...', LogLevel.INFO);
  
  try {
    // Validate API key
    const isValid = await validateRunwayAPIKey();
    
    if (isValid) {
      log('Runway ML API key is valid! Your integration is ready to use.', LogLevel.INFO);
    } else {
      log('Runway ML API key validation failed', LogLevel.ERROR);
      if (!process.env.RUNWAY_ML_API_KEY) {
        console.error('Error: RUNWAY_ML_API_KEY is not set in your .env file');
      } else if (process.env.RUNWAY_ML_API_KEY === 'YOUR_RUNWAY_ML_API_KEY_HERE') {
        console.error('Error: You need to replace "YOUR_RUNWAY_ML_API_KEY_HERE" with your actual Runway ML API key');
      } else {
        console.error('Error: Your Runway ML API key appears to be invalid');
      }
    }
  } catch (error) {
    log('Runway ML test failed', LogLevel.ERROR, { error });
  }
}

testRunwayIntegration();

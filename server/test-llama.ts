import { testLlamaModels } from './llama';
import { log, LogLevel } from './logger';

async function runTests() {
  log('Starting Llama models test...', LogLevel.INFO);

  try {
    const results = await testLlamaModels();

    log('Test results:', LogLevel.INFO);
    for (const [model, result] of Object.entries(results)) {
      log(`Model: ${model}`, LogLevel.INFO);
      log(`Response: ${result.substring(0, 100)}...`, LogLevel.INFO);
      log('-'.repeat(80), LogLevel.INFO);
    }

    log('Llama models test completed successfully', LogLevel.INFO);
  } catch (error) {
    log('Llama models test failed', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

runTests();

// Placeholder implementation for llama.ts -  Replace with actual implementation
const META_DIRECT_URLS = {
  'llama-3.1-8b-direct': 'https://download6.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoidGczcmc3c3o0dTJ4eWg2OHJjODlhMW82IiwiUmVzb3VyY2UiOiJodHRwczpcL1wvZG93bmxvYWQ2LmxsYW1hbWV0YS5uZXRcLyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3NDI1MzY5Mjh9fX1dfQ__&Signature=Q-pewAyvd-%7EWaSc8jgPK-qHb7QoVJCrWZ6pc5Ii%7EwQSdvEC6itZQDfd3EpcjVye07Q8x7CIfBv3MRF0styg9NdahFLETfQEhOnjuN0dz-t0%7EwweU%7Ert-Aqf5OxhPPhPXSqprMVPexKFX0sBSmIwAHF%7EBq4ujBikWYtptM3duBQf%7EZA-JpBHHCb%7EQkFEcd4sz2ZMP74qj8jYQfNgb2Cktu7B7eCscxSfkLsPAuPno3pum4RI9r3Hay9bcT6ymE2rPrD2vxqOztkRYxHBC-iZaeX-lJC%7EXoGqN0te6W3ZnogJASSwXEZZjtrGCwNmA3QN4VKdbcxLT6iJH-njreHNTleQ__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=960108432532709',
  'llama-3.3-direct': 'https://llama3-3.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoidXI2ZjIydXZrbzhldmYxMmo4NjJvZXUyIiwiUmVzb3VyY2UiOiJodHRwczpcL1wvbGxhbWEzLTMubGxhbWFtZXRhLm5ldFwvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0MjUzNjkyOH19fV19&Signature=LqD1igam-QmvRh7PseAhxB1hcvGQiIMGMBUvoseupPzXry4AHOODE-HOz9YHvHmJPc7lM4vr5MG-kzk9HBbKMUXUrslgRcN33amyqdVPZSecAiaffoQHbGZTyzBeop-K2p4C10sH-6YXquZ5j2lH85bq9nNcaqfZHe1hGTOjzmp3d1zz7v6aZ%7EYwnOVnMmjAi2acNdAcuiEf2o2xe4lom6OKBwQlIbEVE-0Tl6Jfi9gD4Lz-dD%7ECjk0N662t8piqPA1MTrYKPxV7ZAJLXqqxdq0T9Xe3tIjazFipYAmVp4wIy9AA1ShfBfjd2h%7Eh9scIJi%7E1QioIE%7EsOOzfbrhlMpQ__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=1029133342396472',
  'purple-llama': 'https://download5.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoicWk2ajFkY2IxNWM0ZmN6dTQ3aXQ1NmdrIiwiUmVzb3VyY2UiOiJodHRwczpcL1wvZG93bmxvYWQ1LmxsYW1hbWV0YS5uZXRcLyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3NDI1MzY5Mjh9fX1dfQ__&Signature=Z1h%7E5HKfdJIHZkWn2lXl5f4HWcIextdJ1vEEhPiNY3sw7DOpI3%7EcOsQAxh3lRBzwMHmpZKI1Dss-%7EvXN0JtXK40s3Wigp7a0EfhP28aiQ9paxMGE54IW9J3OxTWGUgMILh7%7Ej6rGmKABALsak1m3NjanuUv4lUba7dlj1-QYpnRJkvDIafYFsCiP1t4qo5hZsoi70gO-3mUgAkcofLXkqsdG5Mw7%7EfcZNiDGIpuBoPqCj823NS9ygVbg4-NWtOUmRB%7E2w6EsExJXKEQ4WX5gfXVYrzx4vPcxXBudyu1-lqb%7ENkF7-SqS1yOpo26NFNGSgOQETx28E7FuQbV0IxvPLw__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=1997714220707379'
};

export async function testLlamaModels(): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  // Only test a few models to avoid excessive API usage
  const testModels: (keyof typeof META_DIRECT_URLS | 'llama-3.1-8b' | 'llama-3.2-3b')[] = ['llama-3.1-8b', 'llama-3.2-3b', 'llama-3.1-8b-direct', 'llama-3.3-direct', 'purple-llama'];


  for (const model of testModels) {
    let url;
    if (model in META_DIRECT_URLS){
      url = META_DIRECT_URLS[model];
    } else {
      // Placeholder - Replace with Hugging Face or other model fetching logic
      url = `Placeholder URL for model ${model}`;
    }


    try {
      const response = await fetch(url);
      if (!response.ok) {
        results[model] = `Error fetching ${model}: ${response.status}`;
      } else {
        results[model] = await response.text();
      }
    } catch (error) {
      results[model] = `Error fetching ${model}: ${error}`;
    }
  }
  return results;
}
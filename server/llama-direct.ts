import fetch from 'node-fetch';
import { log, LogLevel } from './logger';

// Store your unique Meta URLs here
const META_DIRECT_URLS: Record<string, string> = {
  // Add your unique URLs from Meta AI here
  'llama-3.1-8b-direct': 'https://download6.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoibGczcmc3c3o0dTJ4eWg2OHJjODlhMW82IiwiUmVzb3VyY2UiOiJodHRwczpcL1wvZG93bmxvYWQ2LmxsYW1hbWV0YS5uZXRcLyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3NDI1MzY5Mjh9fX1dfQ__&Signature=Q-pewAyvd-%7EWaSc8jgPK-qHb7QoVJCrWZ6pc5Ii%7EwQSdvEC6itZQDfd3EpcjVye07Q8x7CIfBv3MRF0styg9NdahFLETfQEhOnjuN0dz-t0%7EwweU%7Ert-Aqf5OxhPPhPXSqprMVPexKFX0sBSmIwAHF%7EBq4ujBikWYtptM3duBQf%7EZA-JpBHHCb%7EQkFEcd4sz2ZMP74qj8jYQfNgb2Cktu7B7eCscxSfkLsPAuPno3pum4RI9r3Hay9bcT6ymE2rPrD2vxqOztkRYxHBC-iZaeX-lJC%7EXoGqN0te6W3ZnogJASSwXEZZjtrGCwNmA3QN4VKdbcxLT6iJH-njreHNTleQ__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=960108432532709',
  'llama-3.3-direct': 'https://llama3-3.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoidXI2ZjIydXZrbzhldmYxMmo4NjJvZXUyIiwiUmVzb3VyY2UiOiJodHRwczpcL1wvbGxhbWEzLTMubGxhbWFtZXRhLm5ldFwvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0MjUzNjkyOH19fV19&Signature=LqD1igam-QmvRh7PseAhxB1hcvGQiIMGMBUvoseupPzXry4AHOODE-HOz9YHvHmJPc7lM4vr5MG-kzk9HBbKMUXUrslgRcN33amyqdVPZSecAiaffoQHbGZTyzBeop-K2p4C10sH-6YXquZ5j2lH85bq9nNcaqfZHe1hGTOjzmp3d1zz7v6aZ%7EYwnOVnMmjAi2acNdAcuiEf2o2xe4lom6OKBwQlIbEVE-0Tl6Jfi9gD4Lz-dD%7ECjk0N662t8piqPA1MTrYKPxV7ZAJLXqqxdq0T9Xe3tIjazFipYAmVp4wIy9AA1ShfBfjd2h%7Eh9scIJi%7E1QioIE%7EsOOzfbrhlMpQ__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=1029133342396472',
  'llama-3.2-multimodal': 'https://llama3-2-multimodal.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoiM3A1eWRlN3dsNXVpaTQ0bGYyMTd0dzZzIiwiUmVzb3VyY2UiOiJodHRwczpcL1wvbGxhbWEzLTItbXVsdGltb2RhbC5sbGFtYW1ldGEubmV0XC8qIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzQyNTM2OTI4fX19XX0_&Signature=ablEm2iUDnEsZn7i6sKL5cesRA4UNpdVK8Iyfyoe81FX0nRZCR4cOsGu-j5WSLEXON3Og3bX1LT2wAypk05zrdhwFW%7E7XtGQ1s68TCPIxHgxEXKNtxTRVWof1ssbDRLXuQSz9Km43XfUNCFT02QDKFrJuOOJLkXYWrZiUycZBQJtfyXZQI0jGtD-PvONGi5uR6RehQJJnqlrSrLEblFZ5iyHLlPIioNJp38k2LabqVIGoIuch40RMW9jT7jWW04XQ-SjHvKQkJxNYU5ekf1JsnzLzh0JnJP26zh6dnO7YFyc00FjHOlWH0OjKPoHftxlzZpDGr0XKge%7EvavcQ1PBUA__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=637492712216201',
};

export async function generateDirectLlamaResponse(
  prompt: string,
  modelKey: string,
  systemPrompt = "You are a helpful, harmless, and honest AI assistant."
): Promise<string> {
  try {
    if (!META_DIRECT_URLS[modelKey]) {
      throw new Error(`Model key ${modelKey} not found in META_DIRECT_URLS`);
    }

    const url = META_DIRECT_URLS[modelKey];
    log(`Using direct Meta URL for model: ${modelKey}`, LogLevel.INFO);

    // The URL itself acts as the API key, so we don't need to check for META_API_KEY
    log('Using Meta URL as API key', LogLevel.INFO);

    // Using direct URL as the API key, as instructed by Meta
    // No need for Authorization header as the URL itself contains the credentials
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `<s>[INST] ${systemPrompt} \n\n${prompt} [/INST]`,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meta API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.generated_text || data.output || data.completion || '';
  } catch (error) {
    log('Error generating direct Llama response', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error',
      modelKey
    });

    return `Error generating response with direct Llama URL: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function testDirectMetaModels(): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  log('Testing direct Meta model URLs...', LogLevel.INFO);

  for (const [modelKey, url] of Object.entries(META_DIRECT_URLS)) {
    try {
      results[modelKey] = await generateDirectLlamaResponse(
        "Summarize the capabilities of a multi-stage AI thought pipeline in one paragraph.",
        modelKey
      );
      log(`Successfully tested direct Meta model: ${modelKey}`, LogLevel.INFO);
    } catch (error) {
      results[modelKey] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      log(`Error testing direct Meta model: ${modelKey}`, LogLevel.ERROR);
    }
  }

  return results;
}
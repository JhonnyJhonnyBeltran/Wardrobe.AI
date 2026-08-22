import { getFastCourtesyResponse } from '../lib/closy/fastResponses';

const testCases = [
  // 1. Greetings
  { input: 'hola', expectedFast: true, type: 'greeting' },
  { input: 'buenas!', expectedFast: true, type: 'greeting' },
  { input: 'hey kloe', expectedFast: true, type: 'greeting' },
  { input: 'buenos dias', expectedFast: true, type: 'greeting' },
  { input: 'buenas noches', expectedFast: true, type: 'greeting' },
  { input: 'hola que tal', expectedFast: true, type: 'greeting' },
  { input: 'holi', expectedFast: true, type: 'greeting' },

  // 2. Thanks
  { input: 'gracias', expectedFast: true, type: 'thanks' },
  { input: 'Muchas gracias!', expectedFast: true, type: 'thanks' },
  { input: 'mil gracias kloe', expectedFast: true, type: 'thanks' },
  { input: 'muchisimas gracias', expectedFast: true, type: 'thanks' },
  { input: 'grx', expectedFast: true, type: 'thanks' },
  { input: 'ty', expectedFast: true, type: 'thanks' },
  { input: 'te lo agradezco', expectedFast: true, type: 'thanks' },

  // 3. Acks / OKs
  { input: 'vale', expectedFast: true, type: 'ack' },
  { input: 'ok', expectedFast: true, type: 'ack' },
  { input: 'perfecto', expectedFast: true, type: 'ack' },
  { input: 'genial', expectedFast: true, type: 'ack' },
  { input: 'top', expectedFast: true, type: 'ack' },
  { input: 'de acuerdo!', expectedFast: true, type: 'ack' },
  { input: 'entendido', expectedFast: true, type: 'ack' },
  { input: 'listo', expectedFast: true, type: 'ack' },
  { input: 'todo claro', expectedFast: true, type: 'ack' },
  { input: 'me encanta', expectedFast: true, type: 'ack' },

  // 4. Farewells
  { input: 'adios', expectedFast: true, type: 'farewell' },
  { input: 'chao kloe', expectedFast: true, type: 'farewell' },
  { input: 'hasta luego', expectedFast: true, type: 'farewell' },
  { input: 'hasta manana', expectedFast: true, type: 'farewell' },
  { input: 'nos vemos', expectedFast: true, type: 'farewell' },
  { input: 'bye bye', expectedFast: true, type: 'farewell' },

  // 5. Compliments
  { input: 'eres la mejor', expectedFast: true, type: 'compliment' },
  { input: 'que estilazo', expectedFast: true, type: 'compliment' },
  { input: 'increible', expectedFast: true, type: 'compliment' },

  // 6. Capability FAQs
  { input: 'que puedes hacer', expectedFast: true, type: 'faq' },
  { input: 'como funcionas', expectedFast: true, type: 'faq' },
  { input: 'quien eres', expectedFast: true, type: 'faq' },

  // Styling questions that MUST NOT be intercepted (must go to Gemini LLM):
  { input: 'hola, ¿cómo puedo combinar mis botas?', expectedFast: false, type: 'styling_query' },
  { input: 'vale pero recomiendame un look para una boda', expectedFast: false, type: 'styling_query' },
  { input: 'gracias, ¿qué zapatillas me pongo hoy?', expectedFast: false, type: 'styling_query' },
  { input: 'quiero un outfit de fiesta con blazer negra', expectedFast: false, type: 'styling_query' }
];

console.log('--- TESTING +25 FAST RESPONSE ENGINE ---');
let passed = 0;

for (const tc of testCases) {
  const res = getFastCourtesyResponse(tc.input, 'Ethan');
  const isFast = res !== null;
  if (isFast === tc.expectedFast) {
    console.log(`[PASS] "${tc.input}" -> ${isFast ? 'FAST: ' + res?.message.slice(0, 45).replace(/\n/g, ' ') + '...' : 'LLM'}`);
    passed++;
  } else {
    console.error(`[FAIL] "${tc.input}" expected fast=${tc.expectedFast} but got fast=${isFast}`);
  }
}

console.log(`\nResult: ${passed}/${testCases.length} tests passed.`);
if (passed !== testCases.length) {
  process.exit(1);
}

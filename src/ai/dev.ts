import { config } from 'dotenv';
config();

import '@/ai/flows/generate-entity-enrollment-prompts.ts';
import '@/ai/flows/summarize-payment-history.ts';
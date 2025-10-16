// Prints commands for optional resource setup
console.log(`\nCreate optional resources:\n  wrangler kv namespace create SESSIONS\n  wrangler r2 bucket create stadli-assets\n  wrangler vectorize create stadli-index\n  wrangler queues create stadli-jobs\nThen uncomment bindings in wrangler.jsonc.\n`);

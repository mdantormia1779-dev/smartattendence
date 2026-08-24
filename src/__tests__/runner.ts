import { runCompleteSystemAudit } from "./run-api-tests";

runCompleteSystemAudit()
  .then(() => {
    console.log("🏁 All tests executed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Test suite error:", err);
    process.exit(1);
  });

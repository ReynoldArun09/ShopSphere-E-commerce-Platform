import { getLogger } from "@shopsphere/logger";
import app from "./app";

const logger = getLogger("Auth-service", "debug");

app.listen(3000, () => {
  logger.info("Server up and running on port 3000");
});

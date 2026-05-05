import "dotenv/config";
import { buildApp } from "./app";
import { buildInvoiceServiceConfig } from "./infrastructure/config/env";

const config = buildInvoiceServiceConfig();
buildApp(config)
  .then((app) => {
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on :${config.port}`);
    });
  })
  .catch((error) => {
    console.error("Something went wrong", error);
  });

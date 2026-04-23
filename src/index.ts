import "dotenv/config";
import { buildApp } from "./app";
import { buildInvoiceServiceConfig } from "./infrastructure/config/env";

buildApp(buildInvoiceServiceConfig())
  .then((app) => {
    app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log("Server listening on :3000");
    });
  })
  .catch((error) => {
    console.error("Something went wrong", error);
  });

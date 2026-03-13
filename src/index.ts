import { buildApp } from "./app";
import { env } from "./infrastructure/config/env";

buildApp()
  .then((app) => {
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on :${env.port}`);
    });
  })
  .catch(error => {
      // eslint-disable-next-line no-console
      console.error("Something went wrong", error);
  })
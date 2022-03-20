import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import accessEnv from "./accessEnv";

const setupSwagger = (app: Express) => {
  const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "language app",
        description: "API for language learning app",
        version: "0.1.0",
      },
      contact: {
        name: "do not contact me",
      },
      servers: ["http://localhost:" + accessEnv("PORT", 4000)],
    },
    apis: ["src/routes/*.ts"],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  // app.use("/", (_, res) => {
  //   res.redirect("/swagger");
  // });
};

export default setupSwagger;

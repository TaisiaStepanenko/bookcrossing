import { sequelize } from "./src/config/database";

afterAll(async () => {
  await sequelize.close();
});
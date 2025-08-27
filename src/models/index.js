import { sequelize } from "../config/db.js";
import UserModel from "./User.js";
import RoleModel from "./Role.js";

const User = UserModel(sequelize);
const Role = RoleModel(sequelize);

// Set up associations
User.associate({ Role });
Role.associate = function (models) {
  Role.hasMany(models.User, {
    foreignKey: "roleId",
    as: "users",
  });
};

const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  User,
  Role,
};

// Create default roles
db.initialize = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ force: false });

    // Create default roles if they don't exist
    const roles = ["admin", "user"];
    for (const roleName of roles) {
      await db.Role.findOrCreate({
        where: { name: roleName },
        defaults: { description: `${roleName} role` },
      });
    }

    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Database synchronization failed:", error);
  }
};

export default db;

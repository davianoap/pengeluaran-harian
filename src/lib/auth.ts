import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
            ...schema
        }
    }),
    emailAndPassword: {
        enabled: true,
    },
    // Jika nanti akan ada google
    // socialProviders: {
    //    google: { ... }
    // },
    user: {
        additionalFields: {
            currency: {
                type: "string",
                defaultValue: "IDR"
            },
            reminderTime: {
                type: "string",
                defaultValue: "20:00"
            },
            theme: {
                type: "string",
                defaultValue: "light"
            }
        }
    }
});

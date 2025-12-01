import { Document, model, Schema } from "mongoose";

enum ProvderType {
  GOOGLE = "GOOGLE",
  LOCAL = "LOCAL",
}

enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

enum RoleType {
  BUYER = "BUYER",
  SELLER = "SELLER",
  ADMIN = "ADMIN",
}

export interface IPendingLogins {
  ipAddress: string;
  userAgent?: string;
  token: string;
  expiresAt: Date;
  confirmedAt?: Date;
}

interface IAuth extends Document {
  username: string;
  email: string;
  password?: string;
  account: ProvderType;
  gender?: GenderType;
  role: RoleType;
  isEmailVerified: boolean;
  emailVerificationToken: string;
  emailVerificationExpires: Date;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  trustedIps: string[];
  isBlocked: boolean;
  blockReason?: string;
  blockedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletePurgeAt?: Date;
  pendingLogins: IPendingLogins[];
}

export const authSchema = new Schema<IAuth>({
  username: {
    type: String,
    required: true,
    trim: true,
    set: (value: string) => {
      if (!value) return value;
      const lower = value.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function (this: IAuth) {
      return this.account === ProvderType.LOCAL;
    },
  },
  account: {
    type: String,
    enum: Object.values(ProvderType),
    default: ProvderType.LOCAL,
  },
  gender: {
    type: String,
    enum: Object.values(GenderType),
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(RoleType),
    default: RoleType.BUYER,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  lastLoginAt: {
    type: Date,
  },
  lastLoginIp: {
    type: String,
  },
  trustedIps: {
    type: [String],
    default: [],
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockReason: {
    type: String,
  },
  blockedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletePurgeAt: {
    type: Date,
  },
  pendingLogins: {
    type: [
      {
        ipAddress: { type: String, required: true },
        userAgent: { type: String },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        confirmedAt: { type: Date },
      },
    ],
    default: [],
  },
});

const userModel = model<IAuth>("Auth", authSchema);
export default userModel;

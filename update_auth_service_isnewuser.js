const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update loginWithGoogle
const targetLoginWithGoogle = `  async loginWithGoogle(input: GoogleLoginInput) {
    const googleToken = await this.verifyGoogleIdToken(input.idToken);
    const normalizedEmail = googleToken.email!.trim().toLowerCase();
    const user = await this.findOrProvisionGoogleUser(googleToken, normalizedEmail);

    return ok(await this.buildLoginSession(user));
  }`;

const newLoginWithGoogle = `  async loginWithGoogle(input: GoogleLoginInput) {
    const googleToken = await this.verifyGoogleIdToken(input.idToken);
    const normalizedEmail = googleToken.email!.trim().toLowerCase();
    const { user, isNewUser } = await this.findOrProvisionGoogleUser(googleToken, normalizedEmail);

    return ok({ ...(await this.buildLoginSession(user)), isNewUser });
  }`;

content = content.replace(targetLoginWithGoogle, newLoginWithGoogle);

// 2. Update findOrProvisionGoogleUser
const targetFindOrProvision = `  private async findOrProvisionGoogleUser(googleToken: GoogleTokenPayload, email: string) {
    const displayName = this.resolveGoogleDisplayName(googleToken, email);
    const existingUser = await this.prisma.userAccount.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(randomUUID(), 12);

      return this.prisma.userAccount.create({
        data: {
          email,
          passwordHash,
          role: "customer",
          isActive: true,
          isEmailVerified: true,
          profile: {
            create: {
              fullName: displayName,
            },
          },
        },
        include: { profile: true },
      });
    }

    if (!existingUser.isActive) {
      throw new UnauthorizedException("Tài khoản đã bị khoá. Vui lòng liên hệ hỗ trợ.");
    }

    const shouldVerifyEmail = !existingUser.isEmailVerified;
    const existingFullName = existingUser.profile?.fullName?.trim() ?? "";
    const shouldSyncProfile = displayName.length > 0 && !existingFullName;

    if (!shouldVerifyEmail && !shouldSyncProfile) {
      return existingUser;
    }

    return this.prisma.userAccount.update({
      where: { id: existingUser.id },
      data: {
        ...(shouldVerifyEmail
          ? {
              isEmailVerified: true,
              isActive: true,
              updatedAt: new Date(),
            }
          : {}),
        ...(shouldSyncProfile
          ? {
              profile: {
                upsert: {
                  create: {
                    fullName: displayName,
                  },
                  update: {
                    fullName: displayName,
                  },
                },
              },
            }
          : {}),
      },
      include: { profile: true },
    });
  }`;

const newFindOrProvision = `  private async findOrProvisionGoogleUser(googleToken: GoogleTokenPayload, email: string) {
    const displayName = this.resolveGoogleDisplayName(googleToken, email);
    const existingUser = await this.prisma.userAccount.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(randomUUID(), 12);

      const user = await this.prisma.userAccount.create({
        data: {
          email,
          passwordHash,
          role: "customer",
          isActive: true,
          isEmailVerified: true,
          profile: {
            create: {
              fullName: displayName,
            },
          },
        },
        include: { profile: true },
      });
      return { user, isNewUser: true };
    }

    if (!existingUser.isActive) {
      throw new UnauthorizedException("Tài khoản đã bị khoá. Vui lòng liên hệ hỗ trợ.");
    }

    const shouldVerifyEmail = !existingUser.isEmailVerified;
    const existingFullName = existingUser.profile?.fullName?.trim() ?? "";
    const shouldSyncProfile = displayName.length > 0 && !existingFullName;

    if (!shouldVerifyEmail && !shouldSyncProfile) {
      return { user: existingUser, isNewUser: false };
    }

    const updatedUser = await this.prisma.userAccount.update({
      where: { id: existingUser.id },
      data: {
        ...(shouldVerifyEmail
          ? {
              isEmailVerified: true,
              isActive: true,
              updatedAt: new Date(),
            }
          : {}),
        ...(shouldSyncProfile
          ? {
              profile: {
                upsert: {
                  create: {
                    fullName: displayName,
                  },
                  update: {
                    fullName: displayName,
                  },
                },
              },
            }
          : {}),
      },
      include: { profile: true },
    });
    return { user: updatedUser, isNewUser: false };
  }`;

content = content.replace(targetFindOrProvision, newFindOrProvision);

fs.writeFileSync(filePath, content, 'utf8');
console.log("isNewUser successfully added to auth.service.ts");

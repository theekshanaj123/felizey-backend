function sanitizeUser(user) {
    if (!user) return null;

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        created_at: user.created_at,
        avatar_url: user.avatar_url,
        email: user.email,
        verified: user.verified,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        isPrimium: user.isPrimium,
        country: user.country,
        instagram: user.instagram,
        tiktok: user.tiktok,
    };
}

module.exports = sanitizeUser;
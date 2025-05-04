function sanitizeUser(req, res, next) {
    if (req.user) {
        const {
            password, // excluded
            ...safeUser
        } = req.user;

        req.user = {
            id: safeUser.id,
            firstName: safeUser.firstName,
            lastName: safeUser.lastName,
            role: safeUser.role,
            created_at: safeUser.created_at,
            avatar_url: safeUser.avatar_url,
            email: safeUser.email,
            verified: safeUser.verified,
            phoneNumber: safeUser.phoneNumber,
            bio: safeUser.bio,
            isPrimium: safeUser.isPrimium,
            country: safeUser.country,
            instagram: safeUser.instagram,
            tiktok: safeUser.tiktok,
        };
    }
    next();
}

module.exports = sanitizeUser;

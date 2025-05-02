function normalizeEmail(email) {
    if (!email || typeof email != "string"){
        throw new Error("Invalid email address");
    }

    return email.toLocaleLowerCase().trim();
}

module.exports = normalizeEmail
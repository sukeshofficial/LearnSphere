export const validateCourseInput = (data) => {
    const { title, visibility, access_rule, price_cents } = data;
    const errors = [];

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        errors.push("Title is required and must be a non-empty string.");
    }

    const validVisibility = ["EVERYONE", "SIGNED_IN"];
    if (!visibility || !validVisibility.includes(visibility)) {
        errors.push(`Visibility must be one of: ${validVisibility.join(", ")}`);
    }

    const validAccessRules = ["OPEN", "INVITE", "PAID"];
    if (!access_rule || !validAccessRules.includes(access_rule)) {
        errors.push(`Access rule must be one of: ${validAccessRules.join(", ")}`);
    }

    if (access_rule === "PAID") {
        if (price_cents === undefined || price_cents === null || typeof price_cents !== "number" || price_cents < 0) {
            errors.push("Price in cents is required and must be a non-negative number when access rule is PAID.");
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

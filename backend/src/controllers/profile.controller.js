import {
  updateProfile,
  deleteUserProfile,
} from "../services/profile.service.js";

export async function updateMyProfile(req, res) {
  const userId = req.userId;

  const normalize = (v) => (v === "" ? null : v);

  const name = normalize(req.body.name);
  const bio = normalize(req.body.bio);
  let profile_photo = undefined;

  const is_public =
    req.body.is_public !== undefined
      ? req.body.is_public === "true"
      : undefined;


  // If file uploaded, build path
  if (req.body.use_placeholder === "true") {
    profile_photo = "/public/avatar-placeholder.png";
  } else if (req.file) {
    profile_photo = `/uploads/${req.file.filename}`;
  } else {
    profile_photo = undefined;
  }

  if (!name && !bio && !profile_photo && !is_public) {
    return res.status(400).json({ message: "Nothing to update" });
  }
  // console.log("BODY:", req.body);
  // console.log("FILE:", req.file);

  const updatedUser = await updateProfile(userId, {
    name,
    bio,
    profile_photo,
    is_public,
  });

  res.status(200).json({
    message: "Profile updated",
    user: updatedUser,
  });
}

export async function deleteProfile(req, res) {
  const userId = req.userId;

  const deletedUser = await deleteUserProfile(userId);

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Profile deleted successfully",
  });
}

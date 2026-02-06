import api from "./api";

export const editProfile = (data) => {
  return api.put("/api/profile/edit-profile", data);
};

export const deleteProfile = () => {
  return api.delete("api/profile/delete-profile");
};

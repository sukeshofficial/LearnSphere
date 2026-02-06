import api from "./api";

export const getUserProfile = (username) => {
  const response = api.get(`/api/users/${username}`);
  console.log(response);
  return response;
};

export const searchUser = (query) => {
  const response = api.get(`/api/users/search?q=${query}`);
  console.log(response);
  return response;
};

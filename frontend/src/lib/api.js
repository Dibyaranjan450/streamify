export const signup = async () => {
  const responce = Axios.post("/auth/signup", signUpData);
  return responce.data;
};

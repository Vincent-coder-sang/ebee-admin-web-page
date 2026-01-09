export const url = "/api";


export const setHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      "x-auth-token": token ? token : "",
    },
  };
};

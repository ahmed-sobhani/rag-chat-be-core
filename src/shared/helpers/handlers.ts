export const successHandler = (data?: any, message?: string) => {
  return {
    success: true,
    data: data,
    message,
  };
};

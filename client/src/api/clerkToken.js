let getClerkToken = null;

export const setClerkTokenGetter = (getter) => {
  getClerkToken = getter;
};

export const fetchClerkToken = async () => {
  if (typeof getClerkToken === 'function') {
    return getClerkToken();
  }

  return window.Clerk?.session?.getToken?.();
};
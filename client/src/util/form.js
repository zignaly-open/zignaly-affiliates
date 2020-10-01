export const setFormErrors = (e, setError) => {
  e.errors &&
    Object.entries(e.errors).forEach(([name, message]) =>
      setError(name, {
        type: 'manual',
        message,
      }),
    );
};

export const EMAIL_REGEX = /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[^a-z]).{8,}$/i;

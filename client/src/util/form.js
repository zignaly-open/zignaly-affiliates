export const setFormErrors = (error, setError) => {
  error.errors &&
    Object.entries(error.errors).forEach(([name, message]) =>
      setError(name, {
        type: 'manual',
        message,
      }),
    );
};

export const SUBTRACK_REGEX = /^\w+$/i;
export const EMAIL_REGEX = /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i;
export const BTC_REGEX = /^[13][1-9a-z]{25,34}$/i;
export const ERC20_REGEX = /^0x[\da-f]{40}$$/i;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[^a-z]).{8,}$/i;

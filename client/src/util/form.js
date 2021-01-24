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
export const ERC20_REGEX = /^0x[\da-f]{40}$/i;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[^a-z]).{8,}$/i;
export const BTC_TXID_REGEX = /^[\dA-Fa-f]{64}$/;
export const ERC20_TXID_REGEX = /^0x([\dA-Fa-f]{64})$/;

// https://www.paypalobjects.com/en_AU/vhelp/paypalmanager_help/transaction_id_format.htm
// hope it works
export const PAYPAL_TXID_REGEX = /[\d?A-Z]{12,17}/;

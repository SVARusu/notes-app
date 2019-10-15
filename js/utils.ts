interface IinputOptions {
  [option: string]: RegExp;
};

const inputValidationRegex: IinputOptions = {
  username: /^[a-zA-Z\d.]{6,}$/,
  password: /^[a-zA-Z]{1}(?!.*?[\^])(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  startsWithLetter: /^[a-zA-Z]+/,
  containsUpper: /^(?=.*[A-Z])/,
  containsLower: /^(?=.*[a-z])/,
  containsNumber: /^(?=.*\d)/,
  containsCaret: /^(?=.*[\^])/,
  containsSymbols: /[^a-zA-Z0-9.]+/
}

export { inputValidationRegex };

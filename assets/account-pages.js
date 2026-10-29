// Progressive enhancement: password fields remain usable without JavaScript.
document.querySelectorAll('input[type="password"]').forEach((input) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'password-visibility';
  button.textContent = 'نمایش رمز';
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.textContent = visible ? 'پنهان کردن رمز' : 'نمایش رمز';
    button.setAttribute('aria-pressed', String(visible));
  });
  input.insertAdjacentElement('afterend', button);
});

const forgotPasswordTemplate = ({ name, otp }) => {
  return `<div>
  <p>Dear,${name}</p>
  <p>
    You're requested a password reset.Please use the following otp for password
    reset
  </p>
  <div style="background:yellow;font-size:20px;padding:20px;text-align:center;font-weight:700;">${otp}</div>
  <p>
    This otp is valid for only 1 hour.Enter this otp in the Magiccu website to
    proceed with resetting your password.
  </p>
  <br />
  <br />
  <p>Thanks</p>
  <p>Team Magiccu</p>
</div>`;
};
export default forgotPasswordTemplate;

// Hand-written example of common off-system patterns (not real agent output; step 5 measures that).
import { Button, LoginForm } from "@carbon/react";

export function Login() {
  return (
    <div style={{ padding: "18px", backgroundColor: "#ffffff" }}>
      <h2 style={{ color: "#161616", marginBottom: "16px" }}>Sign in</h2>
      <input type="email" placeholder="Email" style={{ margin: "10px" }} />
      <input type="password" placeholder="Password" />
      <button style={{ background: "rgb(15, 98, 254)", gap: "1rem" }}>Continue</button>
      <LoginForm />
    </div>
  );
}

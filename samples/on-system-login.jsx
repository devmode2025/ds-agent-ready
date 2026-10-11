// The same screen written against Carbon: components, theme tokens and spacing tokens.
import { Button, Form, Heading, PasswordInput, Stack, TextInput } from "@carbon/react";

export function Login() {
  return (
    <div style={{ padding: "var(--cds-spacing-06)", backgroundColor: "var(--cds-background)" }}>
      <Form>
        <Stack gap={5}>
          <Heading style={{ color: "var(--cds-text-primary)" }}>Sign in</Heading>
          <TextInput id="email" labelText="Email" type="email" />
          <PasswordInput id="password" labelText="Password" />
          <Button type="submit">Continue</Button>
        </Stack>
      </Form>
    </div>
  );
}

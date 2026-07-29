type AuthFormErrorProps = {
  id?: string;
  messages?: string[];
};

export function AuthFormError({ id, messages }: AuthFormErrorProps) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-700">
      {messages[0]}
    </p>
  );
}

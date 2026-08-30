import { useAuth } from "@/entities/auth/model/AuthContext";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

type signInData = { email: string; password: string };
type signUpData = { name: string; email: string; password: string };

export const useAuthForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");

  const { signIn, signUp } = useAuth();

  const authFormSignIn = (data: signInData) => {
    setIsSubmitting(true);
    setError(null);

    signIn(data.email, data.password)
      .then(() => navigate(next || "/"))
      .catch((err) => setError(err.message))
      .finally(() => setIsSubmitting(false));
  };

  const authFormSignUp = (data: signUpData) => {
    setIsSubmitting(true);
    setError(null);

    signUp(data.name, data.email, data.password)
      .then(() => navigate(next || "/"))
      .catch((err) => setError(err.message))
      .finally(() => setIsSubmitting(false));
  };

  return { isSubmitting, error, authFormSignIn, authFormSignUp };
};

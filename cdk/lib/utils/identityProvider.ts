import { Effect, pipe } from "effect";
import { aws_cognito } from "aws-cdk-lib";

export type Idp = ReturnType<typeof identityProvider>;

export type TIdentityProvider = {
  service: string;
  secretName: string;
};

type NotFoundIdpArray = {
  type: "NotFoundIdpArray";
};

type InvalidSocialProvider = {
  type: "InvalidSocialProvider";
};
type Errors = NotFoundIdpArray | InvalidSocialProvider;

export const identityProvider = (identityProviders: TIdentityProvider[]) => {
  const isExist = () => identityProviders.length > 0;

  const getProviders = (): TIdentityProvider[] => {
    const program = pipe(
      identityProviders,
      isIdpAsArray,
      Effect.flatMap(validateProviders)
    );
    const result = Effect.match(program, {
      onSuccess: (providers) => providers,
      onFailure: (error: Errors) => {
        if (error.type === "NotFoundIdpArray") return [] as TIdentityProvider[];
        if (error.type === "InvalidSocialProvider")
          throw new Error("InvalidSocialProvider");
        return error;
      },
    });
    return Effect.runSync(result);
  };

  const getSupportedIndetityProviders = () => {
    return [...getProviders(), { service: "cognito" }].map(({ service }) => {
      switch (service) {
        case "google":
          return aws_cognito.UserPoolClientIdentityProvider.GOOGLE;
        case "facebook":
          return aws_cognito.UserPoolClientIdentityProvider.FACEBOOK;
        case "amazon":
          return aws_cognito.UserPoolClientIdentityProvider.AMAZON;
        case "apple":
          return aws_cognito.UserPoolClientIdentityProvider.APPLE;
        case "cognito":
          return aws_cognito.UserPoolClientIdentityProvider.COGNITO;
        default:
          throw new Error(`Invalid identity provider: ${service}`);
      }
    });
  };

  const getSocialProviders = () =>
    getProviders()
      .map(({ service }) => service)
      .join(",");

  return {
    isExist,
    getProviders,
    getSupportedIndetityProviders,
    getSocialProviders,
  };
};

const validateProviders = (identityProviders: TIdentityProvider[]) =>
  Effect.all(identityProviders.map(validateSocialProvider));

const validateSocialProvider = (
  provider: TIdentityProvider
):
  | Effect.Effect<never, InvalidSocialProvider, never>
  | Effect.Effect<TIdentityProvider, never, never> =>
  !["google", "facebook", "amazon", "apple"].includes(provider.service)
    ? Effect.fail({
        type: "InvalidSocialProvider",
      })
    : Effect.succeed(provider);

const isIdpAsArray = (
  identityProviders: TIdentityProvider[]
):
  | Effect.Effect<TIdentityProvider[], never, never>
  | Effect.Effect<never, NotFoundIdpArray, never> =>
  Array.isArray(identityProviders)
    ? Effect.succeed(identityProviders as TIdentityProvider[])
    : Effect.fail({ type: "NotFoundIdpArray" });

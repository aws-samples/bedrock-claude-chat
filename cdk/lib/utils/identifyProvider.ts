import { Effect, pipe } from "effect";
import { aws_cognito } from "aws-cdk-lib";
import { Construct } from "constructs";

export type Idp = ReturnType<typeof identifyProvider>;

type TProvider = {
  service: string;
  clientId: string;
  clientSecret: string;
};

type NotFoundIdpArray = {
  type: "NotFoundIdpArray";
};

type InvalidSocialProvider = {
  type: "InvalidSocialProvider";
};
type Errors = NotFoundIdpArray | InvalidSocialProvider;

export const identifyProvider = (construct: Construct) => {
  const providers: TProvider[] =
    construct.node.tryGetContext("identifyProviders");

  const isExist = () => providers.length > 0;

  const getProviders = (): TProvider[] => {
    const program = pipe(
      providers,
      isIdpAsArray,
      Effect.flatMap(validateProviders)
    );
    const result = Effect.match(program, {
      onSuccess: (providers) => providers,
      onFailure: (error: Errors) => {
        if (error.type === "NotFoundIdpArray") return [] as TProvider[];
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

const validateProviders = (providers: TProvider[]) =>
  Effect.all(providers.map(validateSocialProvider));

const validateSocialProvider = (
  provider: TProvider
):
  | Effect.Effect<never, InvalidSocialProvider, never>
  | Effect.Effect<TProvider, never, never> =>
  !["google", "facebook", "amazon", "apple"].includes(provider.service)
    ? Effect.fail({
        type: "InvalidSocialProvider",
      })
    : Effect.succeed(provider);

const isIdpAsArray = (
  providers: TProvider[]
):
  | Effect.Effect<TProvider[], never, never>
  | Effect.Effect<never, NotFoundIdpArray, never> =>
  Array.isArray(providers)
    ? Effect.succeed(providers as TProvider[])
    : Effect.fail({ type: "NotFoundIdpArray" });

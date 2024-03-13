import { CognitoUser } from "@aws-amplify/auth"
import { Auth } from "aws-amplify"
import React from "react"

export const useAuth = () => {
  const [user, setUser] = React.useState<CognitoUser|null>(null)
  const [isLoading, setIsLoading] = React.useState(true);

  const isAdmin = React.useMemo(() => {
    console.log({user});
    if (!user) return false
    return user.getSignInUserSession()?.getIdToken()?.payload['cognito:groups']?.includes('admin')
  }, [user])

  React.useEffect(() => {
    Auth.currentAuthenticatedUser().then((user) => {
      setUser(user)
    }).catch(() => {
      setUser(null)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }, [])

  return {
    isLoading,
    user,
    isAdmin
  }
}


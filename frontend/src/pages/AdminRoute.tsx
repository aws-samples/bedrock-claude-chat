import { Loader } from "@aws-amplify/ui-react";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const AdminRoute = ({ children }: { children: JSX.Element[] | JSX.Element}) => {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/')
    }
  }, [isAdmin, isLoading, navigate])

  if (isLoading) return <Loader />
  return children;
}
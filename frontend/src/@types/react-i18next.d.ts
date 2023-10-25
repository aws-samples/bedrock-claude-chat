import "react-i18next";
import en from "../i18n/en";
declare module "i18next" {
  interface CustomTypeOptions {
    resources: typeof en;
  }
}

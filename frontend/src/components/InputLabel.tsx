export const InputLabel = ({ children }: {children: JSX.Element | string}) => {
  return (
    <div className="order-first text-sm text-dark-gray peer-focus:font-semibold peer-focus:italic peer-focus:text-aws-font-color">
      {children}
    </div>
  )
}
export const GoHomeAlert = ({
  open,
  toggle,
}: {
  open: boolean;
  toggle: () => void;
}) => {
  console.log(open, toggle);

  return <></>;
};

export const DihonestyAlert = (_k: { open: boolean; close: () => void }) => (
  <></>
);

export const BadInternetAlert = (_k: {
  open: boolean;
  close: () => void;
  backOnline: boolean | null;
}) => <></>;

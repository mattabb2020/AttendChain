import VerifyClient from "./VerifyClient";

export default function VerifyPage({
  params,
}: {
  params: { recordHash: string };
}) {
  return <VerifyClient recordHash={params.recordHash} />;
}

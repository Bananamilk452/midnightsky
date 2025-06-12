import Link from "next/link";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const error = (await searchParams).error;

  return (
    <div>
      <h1>Error</h1>
      <p>{error || "An unknown error occurred."}</p>
      <Link href="/home">Go to Home</Link>
    </div>
  );
}

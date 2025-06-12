import getSession from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <div>
      {session.user && (
        <div>
          <h2>Welcome, {session.user.displayName || session.user.handle}!</h2>
          <p>Your handle: {session.user.handle}</p>
          <img
            src={session.user.avatar || "/default-avatar.png"}
            alt="Avatar"
            width={50}
            height={50}
          />
        </div>
      )}
    </div>
  );
}

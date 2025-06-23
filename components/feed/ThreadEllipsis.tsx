import Link from "next/link";

export function FeedThreadEllipsis({ uri }: { uri: string }) {
  return (
    <Link
      href={`/post/${uri}`}
      className="group flex px-4 py-2 hover:cursor-pointer hover:bg-white/5"
    >
      <div className="mr-3 flex h-6 w-10 justify-center">
        <div className="border-l-2 border-dotted border-gray-400"></div>
      </div>
      <p className="text-blue-500 group-hover:underline">쓰레드 전체 보기</p>
    </Link>
  );
}

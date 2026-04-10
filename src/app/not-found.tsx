import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 text-center">
      <h1 className="text-8xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-400 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors"
      >
        Go Home
      </Link>
    </main>
  );
}

import URLForm from "./components/URLForm";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-semibold text-center">Stress Tester</h1>
        <URLForm />
      </div>
    </main>
  );
}

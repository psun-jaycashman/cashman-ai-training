import "@testing-library/jest-dom";
import { File as NodeFile, Blob as NodeBlob } from "node:buffer";

// jsdom provides its own File/Blob/FormData classes that are NOT recognized
// by undici's multipart parser (used by NextRequest.formData()). Replace the
// jsdom globals with Node's undici-backed equivalents so multipart bodies
// round-trip correctly in tests that build a FormData and pass it to a
// NextRequest body.
(globalThis as unknown as { File: typeof NodeFile }).File = NodeFile;
(globalThis as unknown as { Blob: typeof NodeBlob }).Blob = NodeBlob;

// Capture undici's FormData by calling `Request.formData()` on an empty
// multipart body. Node's global Request is backed by undici, so the
// returned FormData instance's constructor is undici's FormData class —
// the only FormData whose entries undici's multipart serializer
// understands (jsdom's FormData coerces File to "[object File]").
try {
  const emptyReq = new Request("http://localhost/", {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=x" },
    body: Buffer.from("--x--\r\n"),
  });
  const emptyFd = await emptyReq.formData();
  const UndiciFormData = emptyFd.constructor as typeof FormData;
  (globalThis as unknown as { FormData: typeof FormData }).FormData = UndiciFormData;
} catch {
  // Best-effort: if Node's Request isn't available, leave FormData alone.
}

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_PATH = "";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3002";
